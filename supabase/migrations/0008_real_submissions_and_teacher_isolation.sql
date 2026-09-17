-- ==============================================================================
-- AssignTracker (D3adline) - Migration 0008: Real Submissions & Teacher Isolation
-- 1. Adds submission_text column to assignment_submissions.
-- 2. Strictly enforces real deliverables: submitted_at requires non-empty
--    written submission_text OR at least one attached file.
-- 3. Locks teacher display_name and role from non-admin modification via database trigger.
-- 4. Auto-synchronizes courses.instructor from profiles.display_name.
-- 5. Hardens teacher demotion safety: prevents demoting teachers who own active classes.
-- 6. Eliminates permissive RLS policies and strictly isolates teachers to own classes,
--    enrolled students, assignments, submissions, and storage files.
-- 7. Explicitly preserves global admin access across all entities.
-- ==============================================================================

-- ==============================================================================
-- 1. Schema Extensions: submission_text column
-- ==============================================================================
ALTER TABLE public.assignment_submissions
  ADD COLUMN IF NOT EXISTS submission_text TEXT;

-- Migrate any existing submission_note content to submission_text
UPDATE public.assignment_submissions
SET submission_text = submission_note
WHERE submission_text IS NULL AND submission_note IS NOT NULL;

-- ==============================================================================
-- 2. Real Submission Invariant Enforced at Database Layer
-- ==============================================================================
-- A submission is officially submitted ONLY if submitted_at IS NOT NULL AND
-- (trim(submission_text) <> '' OR at least one valid attachment exists).
CREATE OR REPLACE FUNCTION public.check_assignment_submission_deliverable()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- When marking as submitted (submitted_at is not null)
  IF NEW.submitted_at IS NOT NULL THEN
    IF TRIM(COALESCE(NEW.submission_text, '')) = '' AND NOT EXISTS (
      SELECT 1 FROM public.assignment_attachments
      WHERE assignment_id = NEW.assignment_id AND user_id = NEW.student_id
    ) THEN
      RAISE EXCEPTION 'A valid submission requires a non-empty written response or at least one attached deliverable.';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_check_assignment_submission_deliverable ON public.assignment_submissions;
CREATE TRIGGER tr_check_assignment_submission_deliverable
  BEFORE INSERT OR UPDATE ON public.assignment_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.check_assignment_submission_deliverable();

-- Integrity guard: If an attachment is deleted and leaves the submission with no deliverables,
-- reset submitted_at to null so invalid empty submissions cannot persist.
CREATE OR REPLACE FUNCTION public.check_attachment_deletion_submission_integrity()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.assignment_submissions
    WHERE assignment_id = OLD.assignment_id
      AND student_id = OLD.user_id
      AND submitted_at IS NOT NULL
      AND TRIM(COALESCE(submission_text, '')) = ''
  ) THEN
    -- Check if other attachments exist for this student and assignment
    IF NOT EXISTS (
      SELECT 1 FROM public.assignment_attachments
      WHERE assignment_id = OLD.assignment_id
        AND user_id = OLD.user_id
        AND id <> OLD.id
    ) THEN
      UPDATE public.assignment_submissions
      SET submitted_at = NULL,
          status = CASE WHEN progress > 0 THEN 'In Progress' ELSE 'Not Started' END,
          updated_at = NOW()
      WHERE assignment_id = OLD.assignment_id
        AND student_id = OLD.user_id;
    END IF;
  END IF;
  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS tr_check_attachment_deletion_submission_integrity ON public.assignment_attachments;
CREATE TRIGGER tr_check_attachment_deletion_submission_integrity
  AFTER DELETE ON public.assignment_attachments
  FOR EACH ROW
  EXECUTE FUNCTION public.check_attachment_deletion_submission_integrity();

-- ==============================================================================
-- 3. Student Grading Protection Trigger
-- ==============================================================================
-- Prevents students from tampering with grade or feedback columns
CREATE OR REPLACE FUNCTION public.protect_submission_grading()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (OLD.grade IS DISTINCT FROM NEW.grade OR OLD.feedback IS DISTINCT FROM NEW.feedback) THEN
    IF NOT (public.is_assignment_course_owner(NEW.assignment_id, auth.uid()) OR public.is_admin(auth.uid())) THEN
      RAISE EXCEPTION 'Access denied. Only the course teacher or an administrator can assign grades or feedback.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_protect_submission_grading ON public.assignment_submissions;
CREATE TRIGGER tr_protect_submission_grading
  BEFORE UPDATE ON public.assignment_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_submission_grading();

-- ==============================================================================
-- 4. Teacher Profile Name Lock & Role Modification Trigger
-- ==============================================================================
-- Non-admins CANNOT modify a teacher's display_name or any user's role.
CREATE OR REPLACE FUNCTION public.check_profile_teacher_name_lock()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If invoked in an authenticated user context
  IF auth.uid() IS NOT NULL THEN
    -- If user is a teacher (or becoming a teacher), lock display_name against non-admins
    IF (OLD.role = 'teacher' OR NEW.role = 'teacher') AND OLD.display_name IS DISTINCT FROM NEW.display_name THEN
      IF NOT public.is_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Your teacher name is managed by the administrator because it is associated with your classes.';
      END IF;
    END IF;

    -- Prevent non-admins from changing roles
    IF OLD.role IS DISTINCT FROM NEW.role THEN
      IF NOT public.is_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Access denied. Only administrators are authorized to change user roles.';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_check_profile_role_update ON public.profiles;
DROP TRIGGER IF EXISTS tr_check_profile_teacher_name_lock ON public.profiles;
CREATE TRIGGER tr_check_profile_teacher_name_lock
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_profile_teacher_name_lock();

-- ==============================================================================
-- 5. Keep courses.instructor Synchronized with profiles.display_name
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.sync_course_instructor_name()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_display_name TEXT;
BEGIN
  -- Always derive instructor from the course owner's profile display_name
  SELECT display_name INTO v_display_name
  FROM public.profiles
  WHERE id = NEW.user_id;

  NEW.instructor := COALESCE(v_display_name, 'Instructor');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_sync_course_instructor_name ON public.courses;
CREATE TRIGGER tr_sync_course_instructor_name
  BEFORE INSERT OR UPDATE OF user_id, instructor ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_course_instructor_name();

-- When teacher display_name is updated by admin, sync all courses owned by that teacher
CREATE OR REPLACE FUNCTION public.sync_teacher_courses_on_profile_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.display_name IS DISTINCT FROM NEW.display_name THEN
    UPDATE public.courses
    SET instructor = NEW.display_name
    WHERE user_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_sync_teacher_courses_on_profile_update ON public.profiles;
CREATE TRIGGER tr_sync_teacher_courses_on_profile_update
  AFTER UPDATE OF display_name ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_teacher_courses_on_profile_update();

-- ==============================================================================
-- 6. Teacher Demotion Safety in RPC
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.admin_set_user_role(target_user_id uuid, target_role user_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_role user_role;
  v_active_courses_count integer;
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied. Only administrators can change user roles.';
  END IF;

  -- Check current role of target user
  SELECT role INTO v_current_role FROM public.profiles WHERE id = target_user_id;

  -- If demoting/changing role of a teacher, ensure they have no active classes
  IF v_current_role = 'teacher' AND target_role <> 'teacher' THEN
    SELECT COUNT(*) INTO v_active_courses_count
    FROM public.courses
    WHERE user_id = target_user_id AND is_archived = false;

    IF v_active_courses_count > 0 THEN
      RAISE EXCEPTION 'Cannot demote teacher who currently owns % active class(es). Please reassign or archive their classes first.', v_active_courses_count;
    END IF;
  END IF;

  UPDATE public.profiles
  SET role = target_role, updated_at = NOW()
  WHERE id = target_user_id;
END;
$$;

-- ==============================================================================
-- 7. Clean & Strict Row Level Security (RLS) Policies
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 7.1 PROFILES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view classmate and instructor profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles visibility policy" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles select policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles insert policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles update policy" ON public.profiles;
DROP POLICY IF EXISTS "Profiles delete policy" ON public.profiles;

CREATE POLICY "Profiles select policy"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id
    OR public.is_admin(auth.uid())
    OR (
      public.is_teacher(auth.uid()) AND (
        EXISTS (
          SELECT 1 FROM public.course_enrollments ce
          JOIN public.courses c ON c.id = ce.course_id
          WHERE ce.student_id = profiles.id AND c.user_id = auth.uid()
        )
        OR profiles.role = 'student'
      )
    )
    OR (
      public.is_student(auth.uid()) AND EXISTS (
        SELECT 1 FROM public.course_enrollments ce
        JOIN public.courses c ON c.id = ce.course_id
        WHERE (ce.student_id = auth.uid() AND c.user_id = profiles.id)
           OR (ce.student_id = profiles.id AND ce.course_id IN (
                SELECT course_id FROM public.course_enrollments WHERE student_id = auth.uid() AND status = 'active'
              ))
      )
    )
  );

CREATE POLICY "Profiles insert policy"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id OR public.is_admin(auth.uid()));

CREATE POLICY "Profiles update policy"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin(auth.uid()))
  WITH CHECK (auth.uid() = id OR public.is_admin(auth.uid()));

CREATE POLICY "Profiles delete policy"
  ON public.profiles FOR DELETE
  USING (public.is_admin(auth.uid()));

-- ------------------------------------------------------------------------------
-- 7.2 COURSES POLICIES (STRICT TEACHER ISOLATION & STUDENT SCOPE)
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own courses" ON public.courses;
DROP POLICY IF EXISTS "Users can insert own courses" ON public.courses;
DROP POLICY IF EXISTS "Users can update own courses" ON public.courses;
DROP POLICY IF EXISTS "Users can delete own courses" ON public.courses;
DROP POLICY IF EXISTS "Students can view enrolled courses" ON public.courses;
DROP POLICY IF EXISTS "Users can view accessible courses" ON public.courses;
DROP POLICY IF EXISTS "Courses select policy" ON public.courses;
DROP POLICY IF EXISTS "Courses insert policy" ON public.courses;
DROP POLICY IF EXISTS "Courses update policy" ON public.courses;
DROP POLICY IF EXISTS "Courses delete policy" ON public.courses;

-- SELECT: Teacher sees only own courses; Student sees only enrolled courses; Admin sees all
CREATE POLICY "Courses select policy"
  ON public.courses FOR SELECT
  USING (
    auth.uid() = user_id
    OR public.is_enrolled_in_course(id, auth.uid())
    OR public.is_admin(auth.uid())
  );

-- INSERT: Only teachers (for themselves) or admins can insert courses. Students cannot insert courses.
CREATE POLICY "Courses insert policy"
  ON public.courses FOR INSERT
  WITH CHECK (
    (auth.uid() = user_id AND public.is_teacher(auth.uid()))
    OR public.is_admin(auth.uid())
  );

-- UPDATE: Only course owner (teacher) or admin
CREATE POLICY "Courses update policy"
  ON public.courses FOR UPDATE
  USING (
    (auth.uid() = user_id AND public.is_teacher(auth.uid()))
    OR public.is_admin(auth.uid())
  )
  WITH CHECK (
    (auth.uid() = user_id AND public.is_teacher(auth.uid()))
    OR public.is_admin(auth.uid())
  );

-- DELETE: Only course owner (teacher) or admin
CREATE POLICY "Courses delete policy"
  ON public.courses FOR DELETE
  USING (
    (auth.uid() = user_id AND public.is_teacher(auth.uid()))
    OR public.is_admin(auth.uid())
  );

-- ------------------------------------------------------------------------------
-- 7.3 COURSE ENROLLMENTS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Students can view own enrollments" ON public.course_enrollments;
DROP POLICY IF EXISTS "Students can enroll in courses" ON public.course_enrollments;
DROP POLICY IF EXISTS "Students can leave or teachers can remove enrollments" ON public.course_enrollments;
DROP POLICY IF EXISTS "Users can view relevant enrollments" ON public.course_enrollments;
DROP POLICY IF EXISTS "Users can insert relevant enrollments" ON public.course_enrollments;
DROP POLICY IF EXISTS "Users can update relevant enrollments" ON public.course_enrollments;
DROP POLICY IF EXISTS "Users can delete relevant enrollments" ON public.course_enrollments;
DROP POLICY IF EXISTS "Enrollments select policy" ON public.course_enrollments;
DROP POLICY IF EXISTS "Enrollments insert policy" ON public.course_enrollments;
DROP POLICY IF EXISTS "Enrollments update policy" ON public.course_enrollments;
DROP POLICY IF EXISTS "Enrollments delete policy" ON public.course_enrollments;

CREATE POLICY "Enrollments select policy"
  ON public.course_enrollments FOR SELECT
  USING (
    auth.uid() = student_id
    OR public.is_course_owner(course_id, auth.uid())
    OR public.is_admin(auth.uid())
  );

CREATE POLICY "Enrollments insert policy"
  ON public.course_enrollments FOR INSERT
  WITH CHECK (
    auth.uid() = student_id
    OR public.is_course_owner(course_id, auth.uid())
    OR public.is_admin(auth.uid())
  );

CREATE POLICY "Enrollments update policy"
  ON public.course_enrollments FOR UPDATE
  USING (
    public.is_course_owner(course_id, auth.uid())
    OR public.is_admin(auth.uid())
  )
  WITH CHECK (
    public.is_course_owner(course_id, auth.uid())
    OR public.is_admin(auth.uid())
  );

CREATE POLICY "Enrollments delete policy"
  ON public.course_enrollments FOR DELETE
  USING (
    auth.uid() = student_id
    OR public.is_course_owner(course_id, auth.uid())
    OR public.is_admin(auth.uid())
  );

-- ------------------------------------------------------------------------------
-- 7.4 ASSIGNMENTS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own assignments" ON public.assignments;
DROP POLICY IF EXISTS "Users can insert own assignments" ON public.assignments;
DROP POLICY IF EXISTS "Users can update own assignments" ON public.assignments;
DROP POLICY IF EXISTS "Users can delete own assignments" ON public.assignments;
DROP POLICY IF EXISTS "Enrolled students can view course assignments" ON public.assignments;
DROP POLICY IF EXISTS "Teachers can insert assignments" ON public.assignments;
DROP POLICY IF EXISTS "Users can view course assignments" ON public.assignments;
DROP POLICY IF EXISTS "Assignments select policy" ON public.assignments;
DROP POLICY IF EXISTS "Assignments insert policy" ON public.assignments;
DROP POLICY IF EXISTS "Assignments update policy" ON public.assignments;
DROP POLICY IF EXISTS "Assignments delete policy" ON public.assignments;

CREATE POLICY "Assignments select policy"
  ON public.assignments FOR SELECT
  USING (
    auth.uid() = user_id
    OR public.is_enrolled_in_course(course_id, auth.uid())
    OR public.is_admin(auth.uid())
  );

CREATE POLICY "Assignments insert policy"
  ON public.assignments FOR INSERT
  WITH CHECK (
    (auth.uid() = user_id AND public.is_course_owner(course_id, auth.uid()))
    OR public.is_admin(auth.uid())
  );

CREATE POLICY "Assignments update policy"
  ON public.assignments FOR UPDATE
  USING (
    (auth.uid() = user_id AND public.is_course_owner(course_id, auth.uid()))
    OR public.is_admin(auth.uid())
  )
  WITH CHECK (
    (auth.uid() = user_id AND public.is_course_owner(course_id, auth.uid()))
    OR public.is_admin(auth.uid())
  );

CREATE POLICY "Assignments delete policy"
  ON public.assignments FOR DELETE
  USING (
    (auth.uid() = user_id AND public.is_course_owner(course_id, auth.uid()))
    OR public.is_admin(auth.uid())
  );

-- ------------------------------------------------------------------------------
-- 7.5 ASSIGNMENT SUBMISSIONS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Students can view own submissions" ON public.assignment_submissions;
DROP POLICY IF EXISTS "Students can create own submissions" ON public.assignment_submissions;
DROP POLICY IF EXISTS "Students and teachers can update submissions" ON public.assignment_submissions;
DROP POLICY IF EXISTS "Users can view relevant submissions" ON public.assignment_submissions;
DROP POLICY IF EXISTS "Users can update relevant submissions" ON public.assignment_submissions;
DROP POLICY IF EXISTS "Teachers can insert submissions for grading" ON public.assignment_submissions;
DROP POLICY IF EXISTS "Submissions select policy" ON public.assignment_submissions;
DROP POLICY IF EXISTS "Submissions insert policy" ON public.assignment_submissions;
DROP POLICY IF EXISTS "Submissions update policy" ON public.assignment_submissions;
DROP POLICY IF EXISTS "Submissions delete policy" ON public.assignment_submissions;

CREATE POLICY "Submissions select policy"
  ON public.assignment_submissions FOR SELECT
  USING (
    auth.uid() = student_id
    OR public.is_assignment_course_owner(assignment_id, auth.uid())
    OR public.is_admin(auth.uid())
  );

CREATE POLICY "Submissions insert policy"
  ON public.assignment_submissions FOR INSERT
  WITH CHECK (
    (auth.uid() = student_id AND public.is_enrolled_in_assignment_course(assignment_id, auth.uid()))
    OR public.is_assignment_course_owner(assignment_id, auth.uid())
    OR public.is_admin(auth.uid())
  );

CREATE POLICY "Submissions update policy"
  ON public.assignment_submissions FOR UPDATE
  USING (
    auth.uid() = student_id
    OR public.is_assignment_course_owner(assignment_id, auth.uid())
    OR public.is_admin(auth.uid())
  )
  WITH CHECK (
    auth.uid() = student_id
    OR public.is_assignment_course_owner(assignment_id, auth.uid())
    OR public.is_admin(auth.uid())
  );

CREATE POLICY "Submissions delete policy"
  ON public.assignment_submissions FOR DELETE
  USING (
    auth.uid() = student_id
    OR public.is_admin(auth.uid())
  );

-- ------------------------------------------------------------------------------
-- 7.6 ASSIGNMENT ATTACHMENTS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own attachments" ON public.assignment_attachments;
DROP POLICY IF EXISTS "Users can insert own attachments" ON public.assignment_attachments;
DROP POLICY IF EXISTS "Users can update own attachments" ON public.assignment_attachments;
DROP POLICY IF EXISTS "Users can delete own attachments" ON public.assignment_attachments;
DROP POLICY IF EXISTS "Users can view relevant attachments" ON public.assignment_attachments;
DROP POLICY IF EXISTS "Users can delete relevant attachments" ON public.assignment_attachments;
DROP POLICY IF EXISTS "Attachments select policy" ON public.assignment_attachments;
DROP POLICY IF EXISTS "Attachments insert policy" ON public.assignment_attachments;
DROP POLICY IF EXISTS "Attachments delete policy" ON public.assignment_attachments;

CREATE POLICY "Attachments select policy"
  ON public.assignment_attachments FOR SELECT
  USING (
    auth.uid() = user_id
    OR public.is_assignment_course_owner(assignment_id, auth.uid())
    OR public.is_admin(auth.uid())
    OR (
      public.is_enrolled_in_assignment_course(assignment_id, auth.uid())
      AND (
        public.is_assignment_course_owner(assignment_id, assignment_attachments.user_id)
        OR EXISTS (
          SELECT 1 FROM public.assignments a
          WHERE a.id = assignment_attachments.assignment_id AND a.user_id = assignment_attachments.user_id
        )
      )
    )
  );

CREATE POLICY "Attachments insert policy"
  ON public.assignment_attachments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND (
      public.is_assignment_course_owner(assignment_id, auth.uid())
      OR public.is_enrolled_in_assignment_course(assignment_id, auth.uid())
      OR public.is_admin(auth.uid())
    )
  );

CREATE POLICY "Attachments delete policy"
  ON public.assignment_attachments FOR DELETE
  USING (
    auth.uid() = user_id
    OR public.is_assignment_course_owner(assignment_id, auth.uid())
    OR public.is_admin(auth.uid())
  );

-- ------------------------------------------------------------------------------
-- 7.7 ASSIGNMENT SUBTASKS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own subtasks" ON public.assignment_subtasks;
DROP POLICY IF EXISTS "Users can insert own subtasks" ON public.assignment_subtasks;
DROP POLICY IF EXISTS "Users can update own subtasks" ON public.assignment_subtasks;
DROP POLICY IF EXISTS "Users can delete own subtasks" ON public.assignment_subtasks;
DROP POLICY IF EXISTS "Users can read own subtasks" ON public.assignment_subtasks;
DROP POLICY IF EXISTS "Subtasks select policy" ON public.assignment_subtasks;
DROP POLICY IF EXISTS "Subtasks insert policy" ON public.assignment_subtasks;
DROP POLICY IF EXISTS "Subtasks update policy" ON public.assignment_subtasks;
DROP POLICY IF EXISTS "Subtasks delete policy" ON public.assignment_subtasks;

CREATE POLICY "Subtasks select policy"
  ON public.assignment_subtasks FOR SELECT
  USING (
    auth.uid() = user_id
    OR public.is_assignment_course_owner(assignment_id, auth.uid())
    OR public.is_enrolled_in_assignment_course(assignment_id, auth.uid())
    OR public.is_admin(auth.uid())
  );

CREATE POLICY "Subtasks insert policy"
  ON public.assignment_subtasks FOR INSERT
  WITH CHECK (
    (auth.uid() = user_id AND public.is_assignment_course_owner(assignment_id, auth.uid()))
    OR public.is_admin(auth.uid())
  );

CREATE POLICY "Subtasks update policy"
  ON public.assignment_subtasks FOR UPDATE
  USING (
    auth.uid() = user_id
    OR public.is_assignment_course_owner(assignment_id, auth.uid())
    OR public.is_enrolled_in_assignment_course(assignment_id, auth.uid())
    OR public.is_admin(auth.uid())
  )
  WITH CHECK (
    auth.uid() = user_id
    OR public.is_assignment_course_owner(assignment_id, auth.uid())
    OR public.is_enrolled_in_assignment_course(assignment_id, auth.uid())
    OR public.is_admin(auth.uid())
  );

CREATE POLICY "Subtasks delete policy"
  ON public.assignment_subtasks FOR DELETE
  USING (
    (auth.uid() = user_id AND public.is_assignment_course_owner(assignment_id, auth.uid()))
    OR public.is_admin(auth.uid())
  );

-- ------------------------------------------------------------------------------
-- 7.8 SUPABASE STORAGE POLICIES (bucket: 'assignment-files')
-- Strict isolation: Teachers only view files for assignments in their own classes.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can read assignment files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload assignment files" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own assignment files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own assignment files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own assignment files" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload files into own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own uploaded files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own uploaded files" ON storage.objects;
DROP POLICY IF EXISTS "Storage upload into own folder" ON storage.objects;
DROP POLICY IF EXISTS "Storage select accessible files" ON storage.objects;
DROP POLICY IF EXISTS "Storage delete files" ON storage.objects;

-- Upload files into /{user_id}/* folder only
CREATE POLICY "Storage upload into own folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'assignment-files'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Select files: Uploader, Admin, Course Owner for that assignment, or Enrolled Student
CREATE POLICY "Storage select accessible files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'assignment-files'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR public.is_admin(auth.uid())
      OR EXISTS (
        SELECT 1 FROM public.assignment_attachments aa
        JOIN public.assignments a ON a.id = aa.assignment_id
        JOIN public.courses c ON c.id = a.course_id
        WHERE c.user_id = auth.uid() AND aa.file_path = name
      )
      OR EXISTS (
        SELECT 1 FROM public.assignment_attachments aa
        JOIN public.assignments a ON a.id = aa.assignment_id
        JOIN public.course_enrollments ce ON ce.course_id = a.course_id
        WHERE ce.student_id = auth.uid() AND ce.status = 'active' AND aa.file_path = name
      )
    )
  );

-- Delete files: Uploader or Admin
CREATE POLICY "Storage delete files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'assignment-files'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR public.is_admin(auth.uid())
    )
  );

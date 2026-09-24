-- ==============================================================================
-- AssignTracker (Deadline) - Migration 0007: Production-Grade RBAC Hardening
-- Enforces strictly 3 roles: student, teacher, admin.
-- Eliminates broad RLS bypasses, prevents unauthorized role escalation,
-- introduces security-definer helper functions and RPC actions,
-- secures file storage, and provides complete Admin oversight.
-- ==============================================================================

-- 1. Helper Functions (SECURITY DEFINER with fixed search_path to prevent recursion & escalation)
CREATE OR REPLACE FUNCTION public.is_admin(lookup_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = lookup_user_id AND role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_teacher(lookup_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = lookup_user_id AND role = 'teacher'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_student(lookup_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = lookup_user_id AND role = 'student'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_teacher_or_admin(lookup_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = lookup_user_id AND role IN ('teacher', 'admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_course_owner(lookup_course_id uuid, lookup_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.courses
    WHERE id = lookup_course_id AND user_id = lookup_user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_enrolled_in_course(lookup_course_id uuid, lookup_student_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.course_enrollments
    WHERE course_id = lookup_course_id
      AND student_id = lookup_student_id
      AND status = 'active'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_assignment_course_owner(lookup_assignment_id uuid, lookup_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.assignments a
    JOIN public.courses c ON c.id = a.course_id
    WHERE a.id = lookup_assignment_id AND c.user_id = lookup_user_id
  );
$$;

CREATE OR REPLACE FUNCTION public.is_enrolled_in_assignment_course(lookup_assignment_id uuid, lookup_student_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.assignments a
    JOIN public.course_enrollments ce ON ce.course_id = a.course_id
    WHERE a.id = lookup_assignment_id
      AND ce.student_id = lookup_student_id
      AND ce.status = 'active'
  );
$$;

-- ==============================================================================
-- 2. Auth Trigger Hardening: Prevent Admin Escalation from Signup Metadata
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role user_role := 'student';
  v_raw_role TEXT;
BEGIN
  -- Extract raw requested role
  v_raw_role := LOWER(COALESCE(NEW.raw_user_meta_data->>'role', 'student'));

  -- SECURITY CONSTRAINT: Public registration can NEVER request 'admin' role.
  -- Only 'student' or 'teacher' can be chosen during initial signup.
  IF v_raw_role = 'teacher' THEN
    v_role := 'teacher'::user_role;
  ELSE
    v_role := 'student'::user_role;
  END IF;

  INSERT INTO public.profiles (
    id,
    email,
    display_name,
    avatar_url,
    role,
    institution,
    bio,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1),
      CASE WHEN v_role = 'teacher' THEN 'Instructor' ELSE 'Student' END
    ),
    NEW.raw_user_meta_data->>'avatar_url',
    v_role,
    NEW.raw_user_meta_data->>'institution',
    NEW.raw_user_meta_data->>'bio',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    institution = COALESCE(EXCLUDED.institution, profiles.institution),
    bio = COALESCE(EXCLUDED.bio, profiles.bio),
    -- Keep current role if already set; do not downgrade or overwrite via metadata
    role = COALESCE(profiles.role, EXCLUDED.role),
    updated_at = NOW();

  RETURN NEW;
END;
$$;

-- Ensure trigger exists on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 3. Trigger: Prevent Non-Admins from Modifying Role in profiles
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.check_profile_role_update()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If role column is being changed
  IF OLD.role IS DISTINCT FROM NEW.role THEN
    -- Only admin can modify user roles
    IF NOT public.is_admin(auth.uid()) THEN
      RAISE EXCEPTION 'Access denied. Only administrators are authorized to change user roles.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_check_profile_role_update ON public.profiles;
CREATE TRIGGER tr_check_profile_role_update
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.check_profile_role_update();

-- ==============================================================================
-- 4. RPC Security-Definer Functions for Controlled Actions
-- ==============================================================================

-- 4.1 Join class with code (Students)
CREATE OR REPLACE FUNCTION public.enroll_course_by_join_code(p_join_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_course record;
  v_user_id uuid := auth.uid();
  v_existing_id uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to join a class.';
  END IF;

  -- Clean join code input
  p_join_code := UPPER(TRIM(p_join_code));

  -- Lookup course
  SELECT * INTO v_course
  FROM public.courses
  WHERE UPPER(join_code) = p_join_code;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No course found with code "%"', p_join_code;
  END IF;

  IF v_course.is_archived THEN
    RAISE EXCEPTION 'This course is archived and cannot accept new enrollments.';
  END IF;

  IF v_course.user_id = v_user_id THEN
    RAISE EXCEPTION 'You are the teacher/owner of this course.';
  END IF;

  -- Check existing enrollment
  SELECT id INTO v_existing_id
  FROM public.course_enrollments
  WHERE course_id = v_course.id AND student_id = v_user_id;

  IF FOUND THEN
    RAISE EXCEPTION 'You are already enrolled in "%"', v_course.name;
  END IF;

  -- Enroll student
  INSERT INTO public.course_enrollments (course_id, student_id, status, enrolled_at)
  VALUES (v_course.id, v_user_id, 'active', NOW());

  RETURN to_jsonb(v_course);
END;
$$;

-- 4.2 Admin Set User Role
CREATE OR REPLACE FUNCTION public.admin_set_user_role(target_user_id uuid, target_role user_role)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied. Only administrators can change user roles.';
  END IF;

  UPDATE public.profiles
  SET role = target_role, updated_at = NOW()
  WHERE id = target_user_id;
END;
$$;

-- 4.3 Teacher / Admin: Regenerate Course Join Code
CREATE OR REPLACE FUNCTION public.regenerate_course_join_code(p_course_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_code text;
BEGIN
  IF NOT (public.is_course_owner(p_course_id, auth.uid()) OR public.is_admin(auth.uid())) THEN
    RAISE EXCEPTION 'Access denied. Only the course instructor or an admin can regenerate join codes.';
  END IF;

  v_new_code := public.generate_course_join_code();

  UPDATE public.courses
  SET join_code = v_new_code, updated_at = NOW()
  WHERE id = p_course_id;

  RETURN v_new_code;
END;
$$;

-- 4.4 Teacher / Admin: Toggle Course Archive State
CREATE OR REPLACE FUNCTION public.toggle_course_archived(p_course_id uuid, p_is_archived boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (public.is_course_owner(p_course_id, auth.uid()) OR public.is_admin(auth.uid())) THEN
    RAISE EXCEPTION 'Access denied. Only the course instructor or an admin can archive courses.';
  END IF;

  UPDATE public.courses
  SET is_archived = p_is_archived, updated_at = NOW()
  WHERE id = p_course_id;
END;
$$;

-- 4.5 Teacher / Admin: Remove Student from Course Roster
CREATE OR REPLACE FUNCTION public.remove_student_from_course(p_course_id uuid, p_student_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT (public.is_course_owner(p_course_id, auth.uid()) OR public.is_admin(auth.uid())) THEN
    RAISE EXCEPTION 'Access denied. Only the course instructor or an admin can remove students.';
  END IF;

  DELETE FROM public.course_enrollments
  WHERE course_id = p_course_id AND student_id = p_student_id;
END;
$$;

-- ==============================================================================
-- 5. Hardened Row Level Security (RLS) Policies
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 5.1 PROFILES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Profiles visibility policy" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- SELECT: Admin sees all; Teachers see students enrolled in their classes and self;
-- Students see their teachers, enrolled classmates, and self.
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
-- 5.2 COURSES POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view accessible courses" ON public.courses;
DROP POLICY IF EXISTS "Users can insert own courses" ON public.courses;
DROP POLICY IF EXISTS "Users can update own courses" ON public.courses;
DROP POLICY IF EXISTS "Users can delete own courses" ON public.courses;

-- SELECT: Only course owner, enrolled students, or Admin.
-- Removed the previous broad lookup that exposed all courses via join_code IS NOT NULL.
CREATE POLICY "Courses select policy"
  ON public.courses FOR SELECT
  USING (
    auth.uid() = user_id
    OR public.is_enrolled_in_course(id, auth.uid())
    OR public.is_admin(auth.uid())
  );

-- INSERT: Only teachers or admins can create courses, and teacher must own it.
CREATE POLICY "Courses insert policy"
  ON public.courses FOR INSERT
  WITH CHECK (
    (auth.uid() = user_id AND public.is_teacher(auth.uid()))
    OR public.is_admin(auth.uid())
  );

-- UPDATE: Only course owner or Admin can update courses.
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

-- DELETE: Only course owner or Admin can delete courses.
CREATE POLICY "Courses delete policy"
  ON public.courses FOR DELETE
  USING (
    (auth.uid() = user_id AND public.is_teacher(auth.uid()))
    OR public.is_admin(auth.uid())
  );

-- ------------------------------------------------------------------------------
-- 5.3 COURSE ENROLLMENTS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view relevant enrollments" ON public.course_enrollments;
DROP POLICY IF EXISTS "Users can insert relevant enrollments" ON public.course_enrollments;
DROP POLICY IF EXISTS "Users can delete relevant enrollments" ON public.course_enrollments;

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
-- 5.4 ASSIGNMENTS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view course assignments" ON public.assignments;
DROP POLICY IF EXISTS "Teachers can insert assignments" ON public.assignments;
DROP POLICY IF EXISTS "Users can update own assignments" ON public.assignments;
DROP POLICY IF EXISTS "Users can delete own assignments" ON public.assignments;

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
-- 5.5 ASSIGNMENT SUBMISSIONS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view relevant submissions" ON public.assignment_submissions;
DROP POLICY IF EXISTS "Users can update relevant submissions" ON public.assignment_submissions;
DROP POLICY IF EXISTS "Teachers can insert submissions for grading" ON public.assignment_submissions;
DROP POLICY IF EXISTS "Students can create own submissions" ON public.assignment_submissions;

-- SELECT: Student reads own submission, Teacher reads submissions for courses they teach, Admin reads all
CREATE POLICY "Submissions select policy"
  ON public.assignment_submissions FOR SELECT
  USING (
    auth.uid() = student_id
    OR public.is_assignment_course_owner(assignment_id, auth.uid())
    OR public.is_admin(auth.uid())
  );

-- INSERT: Student can only submit if actively enrolled in that assignment's course!
CREATE POLICY "Submissions insert policy"
  ON public.assignment_submissions FOR INSERT
  WITH CHECK (
    (auth.uid() = student_id AND public.is_enrolled_in_assignment_course(assignment_id, auth.uid()))
    OR public.is_assignment_course_owner(assignment_id, auth.uid())
    OR public.is_admin(auth.uid())
  );

-- UPDATE: Student can update their own submission; Teacher/Admin can grade and give feedback
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

-- DELETE: Student can delete unfinalized submission draft; Admin can delete
CREATE POLICY "Submissions delete policy"
  ON public.assignment_submissions FOR DELETE
  USING (
    auth.uid() = student_id
    OR public.is_admin(auth.uid())
  );

-- ------------------------------------------------------------------------------
-- 5.6 ASSIGNMENT ATTACHMENTS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view relevant attachments" ON public.assignment_attachments;
DROP POLICY IF EXISTS "Users can delete relevant attachments" ON public.assignment_attachments;
DROP POLICY IF EXISTS "Users can insert own attachments" ON public.assignment_attachments;

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
          SELECT 1 FROM public.assignments a WHERE a.id = assignment_attachments.assignment_id AND a.user_id = assignment_attachments.user_id
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
-- 5.7 ASSIGNMENT SUBTASKS POLICIES
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can read own subtasks" ON public.assignment_subtasks;
DROP POLICY IF EXISTS "Users can insert own subtasks" ON public.assignment_subtasks;
DROP POLICY IF EXISTS "Users can update own subtasks" ON public.assignment_subtasks;
DROP POLICY IF EXISTS "Users can delete own subtasks" ON public.assignment_subtasks;

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
-- 5.8 SUPABASE STORAGE POLICIES (bucket: 'assignment-files')
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can upload files into own folder" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read assignment files" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own uploaded files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own uploaded files" ON storage.objects;

-- INSERT: Upload into /{user_id}/* folder only
CREATE POLICY "Storage upload into own folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'assignment-files'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- SELECT: Accessible by uploader, course instructor, or Admin
CREATE POLICY "Storage select accessible files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'assignment-files'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR public.is_admin(auth.uid())
      OR public.is_teacher(auth.uid())
    )
  );

-- DELETE: Uploader or Admin can delete file
CREATE POLICY "Storage delete files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'assignment-files'
    AND (
      auth.uid()::text = (storage.foldername(name))[1]
      OR public.is_admin(auth.uid())
    )
  );

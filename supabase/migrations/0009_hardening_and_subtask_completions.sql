-- ==============================================================================
-- AssignTracker (D3adline) - Migration 0009: Hardening & Subtask Completions
-- 1. Create assignment_subtask_completions table for per-student subtask tracking.
-- 2. Add database check constraint for submission grades (0 - 100).
-- 3. Enforce submission enrollment invariant (only enrolled students can submit).
-- 4. Harden protect_submission_grading trigger (reject grading unsubmitted students,
--    prevent teacher tampering with student deliverables/timestamps).
-- 5. Harden assignment_submissions RLS (prevent teachers from creating fake submissions).
-- 6. RPC: grade_assignment_submission for atomic, secure grading.
-- 7. Add automatic storage cleanup trigger on assignment_attachments deletion.
-- ==============================================================================

-- ==============================================================================
-- 1. Per-Student Subtask Completions Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.assignment_subtask_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subtask_id UUID NOT NULL REFERENCES public.assignment_subtasks(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT uq_subtask_student UNIQUE(subtask_id, student_id),
  CONSTRAINT fk_subtask_completions_student_profile FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE
);

-- Index for fast lookup by subtask_id and student_id
CREATE INDEX IF NOT EXISTS idx_subtask_completions_student ON public.assignment_subtask_completions(student_id);
CREATE INDEX IF NOT EXISTS idx_subtask_completions_subtask ON public.assignment_subtask_completions(subtask_id);

-- Enable RLS
ALTER TABLE public.assignment_subtask_completions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Subtask completions select policy" ON public.assignment_subtask_completions;
DROP POLICY IF EXISTS "Subtask completions insert policy" ON public.assignment_subtask_completions;
DROP POLICY IF EXISTS "Subtask completions update policy" ON public.assignment_subtask_completions;
DROP POLICY IF EXISTS "Subtask completions delete policy" ON public.assignment_subtask_completions;

-- SELECT: Student sees own; Teacher sees completions for their course assignments; Admin sees all
CREATE POLICY "Subtask completions select policy"
  ON public.assignment_subtask_completions FOR SELECT
  USING (
    auth.uid() = student_id
    OR public.is_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.assignment_subtasks ast
      JOIN public.assignments a ON a.id = ast.assignment_id
      JOIN public.courses c ON c.id = a.course_id
      WHERE ast.id = assignment_subtask_completions.subtask_id AND c.user_id = auth.uid()
    )
  );

-- INSERT: Student can insert only their own completion if enrolled in the assignment course; or Admin
CREATE POLICY "Subtask completions insert policy"
  ON public.assignment_subtask_completions FOR INSERT
  WITH CHECK (
    (
      auth.uid() = student_id
      AND EXISTS (
        SELECT 1 FROM public.assignment_subtasks ast
        JOIN public.assignments a ON a.id = ast.assignment_id
        WHERE ast.id = subtask_id AND public.is_enrolled_in_assignment_course(a.id, auth.uid())
      )
    )
    OR public.is_admin(auth.uid())
  );

-- UPDATE: Student can update only their own completion; or Admin
CREATE POLICY "Subtask completions update policy"
  ON public.assignment_subtask_completions FOR UPDATE
  USING (
    auth.uid() = student_id
    OR public.is_admin(auth.uid())
  )
  WITH CHECK (
    auth.uid() = student_id
    OR public.is_admin(auth.uid())
  );

-- DELETE: Student can delete own; Teacher of course can delete; or Admin
CREATE POLICY "Subtask completions delete policy"
  ON public.assignment_subtask_completions FOR DELETE
  USING (
    auth.uid() = student_id
    OR public.is_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.assignment_subtasks ast
      JOIN public.assignments a ON a.id = ast.assignment_id
      JOIN public.courses c ON c.id = a.course_id
      WHERE ast.id = assignment_subtask_completions.subtask_id AND c.user_id = auth.uid()
    )
  );

-- ==============================================================================
-- 2. Database Check Constraints on Submissions
-- ==============================================================================
-- Enforce grade between 0 and 100
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_submission_grade'
  ) THEN
    ALTER TABLE public.assignment_submissions
      ADD CONSTRAINT chk_submission_grade CHECK (grade IS NULL OR (grade >= 0 AND grade <= 100));
  END IF;
END $$;

-- ==============================================================================
-- 3. Student Enrollment Invariant on Submissions
-- ==============================================================================
-- Students can only submit if actively enrolled in the assignment's course
CREATE OR REPLACE FUNCTION public.check_assignment_submission_enrollment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Bypass check for admin
  IF public.is_admin(auth.uid()) THEN
    RETURN NEW;
  END IF;

  IF NOT public.is_enrolled_in_assignment_course(NEW.assignment_id, NEW.student_id) THEN
    RAISE EXCEPTION 'Cannot record submission: student is not enrolled in this course.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_check_assignment_submission_enrollment ON public.assignment_submissions;
CREATE TRIGGER tr_check_assignment_submission_enrollment
  BEFORE INSERT OR UPDATE OF student_id, assignment_id ON public.assignment_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.check_assignment_submission_enrollment();

-- ==============================================================================
-- 4. Harden protect_submission_grading Trigger
-- ==============================================================================
-- Teachers can only grade submissions that have valid student deliverables and submitted_at!
-- Teachers cannot modify student deliverables (submission_text, submission_note) or submitted_at timestamp!
CREATE OR REPLACE FUNCTION public.protect_submission_grading()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_has_deliverable BOOLEAN;
BEGIN
  -- Check if grade or feedback is being added or modified
  IF (OLD.grade IS DISTINCT FROM NEW.grade OR OLD.feedback IS DISTINCT FROM NEW.feedback) THEN
    -- 1. Authorization: Only course teacher or admin can assign grade/feedback
    IF NOT (public.is_assignment_course_owner(NEW.assignment_id, auth.uid()) OR public.is_admin(auth.uid())) THEN
      RAISE EXCEPTION 'Access denied. Only the course teacher or an administrator can assign grades or feedback.';
    END IF;

    -- 2. Invariant: Submission must be officially submitted and have a deliverable
    IF NEW.submitted_at IS NULL THEN
      RAISE EXCEPTION 'Cannot grade an assignment that has not been submitted yet.';
    END IF;

    v_has_deliverable := (TRIM(COALESCE(NEW.submission_text, '')) <> '') OR EXISTS (
      SELECT 1 FROM public.assignment_attachments
      WHERE assignment_id = NEW.assignment_id AND user_id = NEW.student_id
    );

    IF NOT v_has_deliverable THEN
      RAISE EXCEPTION 'Cannot grade an assignment without valid submitted deliverables.';
    END IF;
  END IF;

  -- Protect student deliverables & submission timestamp from teacher modification
  IF (OLD.submitted_at IS DISTINCT FROM NEW.submitted_at OR
      OLD.submission_text IS DISTINCT FROM NEW.submission_text OR
      OLD.submission_note IS DISTINCT FROM NEW.submission_note) THEN
    IF NOT (auth.uid() = NEW.student_id OR public.is_admin(auth.uid())) THEN
      RAISE EXCEPTION 'Teachers cannot modify a student''s deliverable text or submission timestamp.';
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
-- 5. Harden assignment_submissions RLS Policies
-- ==============================================================================
-- Eliminate teacher INSERT permission on assignment_submissions:
-- Teachers cannot manufacture fake submissions for unsubmitted students.
DROP POLICY IF EXISTS "Submissions insert policy" ON public.assignment_submissions;
CREATE POLICY "Submissions insert policy"
  ON public.assignment_submissions FOR INSERT
  WITH CHECK (
    (auth.uid() = student_id AND public.is_enrolled_in_assignment_course(assignment_id, auth.uid()))
    OR public.is_admin(auth.uid())
  );

-- ==============================================================================
-- 6. RPC: Atomic and Secure Grading
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.grade_assignment_submission(
  p_submission_id uuid,
  p_grade numeric,
  p_feedback text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sub record;
  v_user_id uuid := auth.uid();
  v_has_deliverable boolean;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required.';
  END IF;

  SELECT s.*, a.course_id INTO v_sub
  FROM public.assignment_submissions s
  JOIN public.assignments a ON a.id = s.assignment_id
  WHERE s.id = p_submission_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Submission not found.';
  END IF;

  -- Verify teacher owns course or admin
  IF NOT (public.is_assignment_course_owner(v_sub.assignment_id, v_user_id) OR public.is_admin(v_user_id)) THEN
    RAISE EXCEPTION 'Access denied. You do not have permission to grade this assignment.';
  END IF;

  -- Verify student is enrolled in course
  IF NOT public.is_enrolled_in_course(v_sub.course_id, v_sub.student_id) THEN
    RAISE EXCEPTION 'Cannot grade student who is not enrolled in this course.';
  END IF;

  -- Verify grade range
  IF p_grade IS NOT NULL AND (p_grade < 0 OR p_grade > 100) THEN
    RAISE EXCEPTION 'Grade must be a number between 0 and 100.';
  END IF;

  -- Verify valid submission
  IF v_sub.submitted_at IS NULL THEN
    RAISE EXCEPTION 'This student has not submitted the assignment yet.';
  END IF;

  v_has_deliverable := (TRIM(COALESCE(v_sub.submission_text, '')) <> '') OR EXISTS (
    SELECT 1 FROM public.assignment_attachments
    WHERE assignment_id = v_sub.assignment_id AND user_id = v_sub.student_id
  );

  IF NOT v_has_deliverable THEN
    RAISE EXCEPTION 'Cannot grade an assignment without valid deliverables.';
  END IF;

  -- Update grade and feedback, preserve submitted_at and deliverables
  UPDATE public.assignment_submissions
  SET grade = p_grade,
      feedback = TRIM(p_feedback),
      updated_at = NOW()
  WHERE id = p_submission_id;

  -- Return updated record
  SELECT * INTO v_sub FROM public.assignment_submissions WHERE id = p_submission_id;
  RETURN to_jsonb(v_sub);
END;
$$;

-- ==============================================================================
-- 7. Automatic Storage Cleanup on Attachment Deletion
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.cleanup_storage_on_attachment_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
BEGIN
  -- Delete matching object from storage.objects
  DELETE FROM storage.objects
  WHERE bucket_id = 'assignment-files' AND name = OLD.file_path;
  RETURN OLD;
EXCEPTION
  WHEN OTHERS THEN
    -- If storage schema or object is locked/error, do not fail the attachment delete
    RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS tr_cleanup_storage_on_attachment_delete ON public.assignment_attachments;
CREATE TRIGGER tr_cleanup_storage_on_attachment_delete
  BEFORE DELETE ON public.assignment_attachments
  FOR EACH ROW
  EXECUTE FUNCTION public.cleanup_storage_on_attachment_delete();

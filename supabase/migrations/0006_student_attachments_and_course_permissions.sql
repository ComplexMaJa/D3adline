-- ==============================================================================
-- 0006_student_attachments_and_course_permissions.sql
-- Enables students to attach files and view instructor files,
-- and allows teachers to view and delete student-submitted deliverables.
-- ==============================================================================

-- 1. assignment_attachments SELECT policy
DROP POLICY IF EXISTS "Users can read own attachments" ON public.assignment_attachments;
DROP POLICY IF EXISTS "Users can view relevant attachments" ON public.assignment_attachments;

CREATE POLICY "Users can view relevant attachments"
  ON public.assignment_attachments
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR public.is_assignment_course_owner(assignment_id, auth.uid())
    OR (
      EXISTS (
        SELECT 1 FROM public.assignments a
        WHERE a.id = assignment_attachments.assignment_id
          AND public.is_enrolled_in_course(a.course_id, auth.uid())
          AND (
            public.is_assignment_course_owner(a.id, assignment_attachments.user_id)
            OR a.user_id = assignment_attachments.user_id
          )
      )
    )
  );

-- 2. assignment_attachments DELETE policy
DROP POLICY IF EXISTS "Users can delete own attachments" ON public.assignment_attachments;
DROP POLICY IF EXISTS "Users can delete relevant attachments" ON public.assignment_attachments;

CREATE POLICY "Users can delete relevant attachments"
  ON public.assignment_attachments
  FOR DELETE
  USING (
    auth.uid() = user_id
    OR public.is_assignment_course_owner(assignment_id, auth.uid())
  );

-- ==============================================================================
-- AssignTracker (Deadline) - Migration 0003: Complete Schema & Role Alignment
-- Aligns join_code constraints, profiles foreign keys for PostgREST embedding,
-- course discoverability RLS, attachment RLS, updated_at triggers, and auth triggers.
-- ==============================================================================

-- 1. Backfill course join_codes and enforce NOT NULL with default generator
UPDATE public.courses
SET join_code = public.generate_course_join_code()
WHERE join_code IS NULL;

ALTER TABLE public.courses 
  ALTER COLUMN join_code SET DEFAULT public.generate_course_join_code(),
  ALTER COLUMN join_code SET NOT NULL;

-- 2. Add foreign keys from student_id to public.profiles(id)
-- This allows PostgREST to automatically resolve 'student:profiles(*)' resource embedding
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'course_enrollments_student_id_profiles_fkey'
  ) THEN
    ALTER TABLE public.course_enrollments
      ADD CONSTRAINT course_enrollments_student_id_profiles_fkey
      FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'assignment_submissions_student_id_profiles_fkey'
  ) THEN
    ALTER TABLE public.assignment_submissions
      ADD CONSTRAINT assignment_submissions_student_id_profiles_fkey
      FOREIGN KEY (student_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- 3. Update Courses SELECT Policy: Allow lookup by join_code for course enrollment
DROP POLICY IF EXISTS "Students can view enrolled courses" ON public.courses;
DROP POLICY IF EXISTS "Users can view own courses" ON public.courses;
DROP POLICY IF EXISTS "Users can view accessible courses" ON public.courses;

CREATE POLICY "Users can view accessible courses"
  ON public.courses FOR SELECT
  USING (
    auth.uid() = user_id
    OR
    EXISTS (
      SELECT 1 FROM public.course_enrollments ce
      WHERE ce.course_id = courses.id
      AND ce.student_id = auth.uid()
      AND ce.status = 'active'
    )
    OR
    (join_code IS NOT NULL AND is_archived = false)
  );

-- 4. Update Attachments SELECT Policy: Allow enrolled students to view course assignment files
DROP POLICY IF EXISTS "Users can view own attachments" ON public.assignment_attachments;
DROP POLICY IF EXISTS "Users can view relevant attachments" ON public.assignment_attachments;

CREATE POLICY "Users can view relevant attachments"
  ON public.assignment_attachments FOR SELECT
  USING (
    auth.uid() = user_id
    OR
    EXISTS (
      SELECT 1 FROM public.assignments a
      JOIN public.course_enrollments ce ON ce.course_id = a.course_id
      WHERE a.id = assignment_attachments.assignment_id
        AND ce.student_id = auth.uid()
        AND ce.status = 'active'
    )
  );

-- 5. Storage Policy: Authenticated users can read assignment attachments
DROP POLICY IF EXISTS "Users can read own assignment files" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read assignment files" ON storage.objects;

CREATE POLICY "Authenticated users can read assignment files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'assignment-files');

-- 6. Trigger on assignment_submissions to update updated_at timestamp
DROP TRIGGER IF EXISTS tr_assignment_submissions_updated_at ON public.assignment_submissions;
CREATE TRIGGER tr_assignment_submissions_updated_at
  BEFORE UPDATE ON public.assignment_submissions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 7. Ensure auth.users trigger executes the multi-role handle_new_user() function
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

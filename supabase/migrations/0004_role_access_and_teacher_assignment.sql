-- ==============================================================================
-- AssignTracker (Deadline) - Migration 0004: Role-Based Access & Teacher Assignment
-- Allows teachers to assign students to their courses, restricts assignment creation
-- to teachers for their courses, and allows teachers to view student profiles for enrollment.
-- ==============================================================================

-- 1. Allow teachers who own the course to enroll students directly
DROP POLICY IF EXISTS "Students can enroll in courses" ON public.course_enrollments;
DROP POLICY IF EXISTS "Students or teachers can create enrollments" ON public.course_enrollments;

CREATE POLICY "Students or teachers can create enrollments"
  ON public.course_enrollments FOR INSERT
  WITH CHECK (
    auth.uid() = student_id OR
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_enrollments.course_id
        AND c.user_id = auth.uid()
    )
  );

-- 2. Restrict assignment creation strictly to teachers for their own courses
DROP POLICY IF EXISTS "Users can insert own assignments" ON public.assignments;
DROP POLICY IF EXISTS "Teachers can insert assignments" ON public.assignments;

CREATE POLICY "Teachers can insert assignments"
  ON public.assignments FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = assignments.course_id
        AND c.user_id = auth.uid()
    )
  );

-- 3. Allow teachers to view student profiles to search & assign them to courses
DROP POLICY IF EXISTS "Users can view classmate and instructor profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles visibility policy" ON public.profiles;

CREATE POLICY "Profiles visibility policy"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id
    OR
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role IN ('teacher', 'admin'))
    OR
    EXISTS (
      SELECT 1 FROM public.course_enrollments ce
      JOIN public.courses c ON c.id = ce.course_id
      WHERE (ce.student_id = profiles.id AND c.user_id = auth.uid())
         OR (c.user_id = profiles.id AND ce.student_id = auth.uid())
    )
  );

-- Migration: 0005_fix_rls_infinite_recursion.sql
-- Description: Replace mutual RLS subqueries between courses, course_enrollments, and profiles with SECURITY DEFINER helpers to eliminate infinite recursion.

-- 1. Helper to check if a user is the owner of a course (bypasses RLS on courses)
CREATE OR REPLACE FUNCTION public.is_course_owner(lookup_course_id uuid, lookup_user_id uuid)
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

-- 2. Helper to check if a student is actively enrolled in a course (bypasses RLS on course_enrollments)
CREATE OR REPLACE FUNCTION public.is_enrolled_in_course(lookup_course_id uuid, lookup_student_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.course_enrollments
    WHERE course_id = lookup_course_id AND student_id = lookup_student_id AND status = 'active'
  );
$$;

-- 3. Helper to check if a user is a teacher or admin (bypasses RLS on profiles)
CREATE OR REPLACE FUNCTION public.is_teacher_or_admin(lookup_user_id uuid)
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

-- 4. Helper to check if a user owns the course of an assignment (bypasses RLS on assignments and courses)
CREATE OR REPLACE FUNCTION public.is_assignment_course_owner(lookup_assignment_id uuid, lookup_user_id uuid)
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

-- 5. Update courses policy
DROP POLICY IF EXISTS "Users can view accessible courses" ON public.courses;
CREATE POLICY "Users can view accessible courses"
  ON public.courses
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR public.is_enrolled_in_course(id, auth.uid())
    OR (join_code IS NOT NULL AND is_archived = false)
  );

-- 6. Update course_enrollments policies
DROP POLICY IF EXISTS "Students can view own enrollments" ON public.course_enrollments;
DROP POLICY IF EXISTS "Users can view relevant enrollments" ON public.course_enrollments;
CREATE POLICY "Users can view relevant enrollments"
  ON public.course_enrollments
  FOR SELECT
  USING (
    auth.uid() = student_id
    OR public.is_course_owner(course_id, auth.uid())
  );

DROP POLICY IF EXISTS "Students or teachers can create enrollments" ON public.course_enrollments;
DROP POLICY IF EXISTS "Users can insert relevant enrollments" ON public.course_enrollments;
CREATE POLICY "Users can insert relevant enrollments"
  ON public.course_enrollments
  FOR INSERT
  WITH CHECK (
    auth.uid() = student_id
    OR public.is_course_owner(course_id, auth.uid())
  );

DROP POLICY IF EXISTS "Students can leave or teachers can remove enrollments" ON public.course_enrollments;
DROP POLICY IF EXISTS "Users can delete relevant enrollments" ON public.course_enrollments;
CREATE POLICY "Users can delete relevant enrollments"
  ON public.course_enrollments
  FOR DELETE
  USING (
    auth.uid() = student_id
    OR public.is_course_owner(course_id, auth.uid())
  );

-- 7. Update profiles policies
DROP POLICY IF EXISTS "Profiles visibility policy" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Profiles visibility policy"
  ON public.profiles
  FOR SELECT
  USING (
    auth.uid() = id
    OR public.is_teacher_or_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM public.course_enrollments ce
      WHERE (ce.student_id = profiles.id AND public.is_course_owner(ce.course_id, auth.uid()))
         OR (ce.student_id = auth.uid() AND public.is_course_owner(ce.course_id, profiles.id))
    )
  );

-- 8. Update assignments policies
DROP POLICY IF EXISTS "Enrolled students can view course assignments" ON public.assignments;
DROP POLICY IF EXISTS "Users can view course assignments" ON public.assignments;
CREATE POLICY "Users can view course assignments"
  ON public.assignments
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR public.is_enrolled_in_course(course_id, auth.uid())
  );

DROP POLICY IF EXISTS "Teachers can insert assignments" ON public.assignments;
CREATE POLICY "Teachers can insert assignments"
  ON public.assignments
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND (
      public.is_teacher_or_admin(auth.uid())
      OR public.is_course_owner(course_id, auth.uid())
    )
  );

-- 9. Update assignment_submissions policies
DROP POLICY IF EXISTS "Students and teachers can update submissions" ON public.assignment_submissions;
DROP POLICY IF EXISTS "Students can view own submissions" ON public.assignment_submissions;
DROP POLICY IF EXISTS "Teachers can insert submissions for grading" ON public.assignment_submissions;
DROP POLICY IF EXISTS "Users can view relevant submissions" ON public.assignment_submissions;
DROP POLICY IF EXISTS "Users can update relevant submissions" ON public.assignment_submissions;

CREATE POLICY "Users can view relevant submissions"
  ON public.assignment_submissions
  FOR SELECT
  USING (
    auth.uid() = student_id
    OR public.is_assignment_course_owner(assignment_id, auth.uid())
  );

CREATE POLICY "Users can update relevant submissions"
  ON public.assignment_submissions
  FOR UPDATE
  USING (
    auth.uid() = student_id
    OR public.is_assignment_course_owner(assignment_id, auth.uid())
  )
  WITH CHECK (
    auth.uid() = student_id
    OR public.is_assignment_course_owner(assignment_id, auth.uid())
  );

CREATE POLICY "Teachers can insert submissions for grading"
  ON public.assignment_submissions
  FOR INSERT
  WITH CHECK (
    public.is_assignment_course_owner(assignment_id, auth.uid())
  );

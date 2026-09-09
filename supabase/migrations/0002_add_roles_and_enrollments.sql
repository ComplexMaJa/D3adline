-- ==============================================================================
-- AssignTracker (Deadline) - Migration 0002: Add Roles & Course Enrollments
-- Introduces user_role ('student', 'teacher', 'admin'), course join codes,
-- student course enrollments, assignment submissions, and updated RLS policies.
-- ==============================================================================

-- 1. Create Role Enum
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('student', 'teacher', 'admin');
  END IF;
END $$;

-- 2. Enhance Profiles with Role & Academic Fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role user_role NOT NULL DEFAULT 'student',
  ADD COLUMN IF NOT EXISTS institution TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT;

-- 3. Enhance Courses for Teacher / Class Sharing
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS join_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT false;

-- Function to generate an alphanumeric 6-character course join code
CREATE OR REPLACE FUNCTION public.generate_course_join_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_code TEXT := '';
  v_i INTEGER;
BEGIN
  FOR v_i IN 1..6 LOOP
    v_code := v_code || substr(v_chars, floor(random() * length(v_chars) + 1)::integer, 1);
  END LOOP;
  RETURN v_code;
END;
$$;

-- 4. Update handle_new_user() trigger function to extract role & institution
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
  v_raw_role := LOWER(COALESCE(NEW.raw_user_meta_data->>'role', 'student'));
  IF v_raw_role IN ('student', 'teacher', 'admin') THEN
    v_role := v_raw_role::user_role;
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
    role = EXCLUDED.role,
    institution = COALESCE(EXCLUDED.institution, profiles.institution),
    updated_at = NOW();

  RETURN NEW;
END;
$$;

-- 5. Course Enrollments Table (Students joining Teacher's Courses)
CREATE TABLE IF NOT EXISTS public.course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'dropped')),
  UNIQUE (course_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_student_id ON public.course_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON public.course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_courses_join_code ON public.courses(join_code);

-- 6. Student Assignment Submissions & Progress Tracking
CREATE TABLE IF NOT EXISTS public.assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'Not Started' CHECK (status IN ('Not Started', 'In Progress', 'Completed', 'Overdue')),
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  submission_note TEXT,
  submitted_at TIMESTAMPTZ,
  grade NUMERIC(5,2),
  feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE (assignment_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_submissions_assignment_id ON public.assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_student_id ON public.assignment_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.assignment_submissions(status);

-- ==============================================================================
-- 7. Updated & New Row Level Security (RLS) Policies
-- ==============================================================================

-- Enable RLS
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;

-- Profiles: Allow enrolled teachers & students to view basic profile info (name, avatar, institution)
DROP POLICY IF EXISTS "Users can view classmate and instructor profiles" ON public.profiles;
CREATE POLICY "Users can view classmate and instructor profiles"
  ON public.profiles FOR SELECT
  USING (
    -- Can view own profile
    auth.uid() = id
    OR
    -- Is a teacher whose course this student is enrolled in
    EXISTS (
      SELECT 1 FROM public.course_enrollments ce
      JOIN public.courses c ON c.id = ce.course_id
      WHERE ce.student_id = profiles.id AND c.user_id = auth.uid()
    )
    OR
    -- Is a student enrolled in this teacher's course
    EXISTS (
      SELECT 1 FROM public.course_enrollments ce
      JOIN public.courses c ON c.id = ce.course_id
      WHERE c.user_id = profiles.id AND ce.student_id = auth.uid()
    )
  );

-- Courses: Allow students to view courses they are enrolled in
DROP POLICY IF EXISTS "Students can view enrolled courses" ON public.courses;
CREATE POLICY "Students can view enrolled courses"
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
  );

-- Course Enrollments Policies
DROP POLICY IF EXISTS "Students can view own enrollments" ON public.course_enrollments;
CREATE POLICY "Students can view own enrollments"
  ON public.course_enrollments FOR SELECT
  USING (
    auth.uid() = student_id
    OR
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_enrollments.course_id
      AND c.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Students can enroll in courses" ON public.course_enrollments;
CREATE POLICY "Students can enroll in courses"
  ON public.course_enrollments FOR INSERT
  WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Students can leave or teachers can remove enrollments" ON public.course_enrollments;
CREATE POLICY "Students can leave or teachers can remove enrollments"
  ON public.course_enrollments FOR DELETE
  USING (
    auth.uid() = student_id
    OR
    EXISTS (
      SELECT 1 FROM public.courses c
      WHERE c.id = course_enrollments.course_id
      AND c.user_id = auth.uid()
    )
  );

-- Assignments: Allow enrolled students to view assignments for their courses
DROP POLICY IF EXISTS "Enrolled students can view course assignments" ON public.assignments;
CREATE POLICY "Enrolled students can view course assignments"
  ON public.assignments FOR SELECT
  USING (
    auth.uid() = user_id
    OR
    EXISTS (
      SELECT 1 FROM public.course_enrollments ce
      WHERE ce.course_id = assignments.course_id
      AND ce.student_id = auth.uid()
      AND ce.status = 'active'
    )
  );

-- Submissions Policies
DROP POLICY IF EXISTS "Students can view own submissions" ON public.assignment_submissions;
CREATE POLICY "Students can view own submissions"
  ON public.assignment_submissions FOR SELECT
  USING (
    auth.uid() = student_id
    OR
    EXISTS (
      SELECT 1 FROM public.assignments a
      JOIN public.courses c ON c.id = a.course_id
      WHERE a.id = assignment_submissions.assignment_id
      AND c.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Students can create own submissions" ON public.assignment_submissions;
CREATE POLICY "Students can create own submissions"
  ON public.assignment_submissions FOR INSERT
  WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Teachers can insert submissions for grading" ON public.assignment_submissions;
CREATE POLICY "Teachers can insert submissions for grading"
  ON public.assignment_submissions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.assignments a
      JOIN public.courses c ON c.id = a.course_id
      WHERE a.id = assignment_submissions.assignment_id
      AND c.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Students and teachers can update submissions" ON public.assignment_submissions;
CREATE POLICY "Students and teachers can update submissions"
  ON public.assignment_submissions FOR UPDATE
  USING (
    auth.uid() = student_id
    OR
    EXISTS (
      SELECT 1 FROM public.assignments a
      JOIN public.courses c ON c.id = a.course_id
      WHERE a.id = assignment_submissions.assignment_id
      AND c.user_id = auth.uid()
    )
  )
  WITH CHECK (
    auth.uid() = student_id
    OR
    EXISTS (
      SELECT 1 FROM public.assignments a
      JOIN public.courses c ON c.id = a.course_id
      WHERE a.id = assignment_submissions.assignment_id
      AND c.user_id = auth.uid()
    )
  );

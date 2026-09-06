-- ==============================================================================
-- AssignTracker (Deadline) - Database Schema Migration
-- Complete PostgreSQL schema, constraints, indexes, RLS policies, triggers,
-- and Supabase Storage bucket configurations.
-- ==============================================================================

-- 1. Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. Profiles Table (linked to Supabase Auth)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Trigger to automatically create a profile entry when a user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, avatar_url, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1),
      'Student'
    ),
    NEW.raw_user_meta_data->>'avatar_url',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    display_name = COALESCE(EXCLUDED.display_name, profiles.display_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url),
    updated_at = NOW();

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 3. Courses Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  instructor TEXT,
  description TEXT,
  color TEXT NOT NULL DEFAULT '#8B5CF6',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_courses_user_id ON public.courses(user_id);
CREATE INDEX IF NOT EXISTS idx_courses_name ON public.courses(name);

-- ==============================================================================
-- 4. Assignments Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'Not Started' CHECK (status IN ('Not Started', 'In Progress', 'Completed', 'Overdue')),
  priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  due_date DATE NOT NULL,
  due_time TIME DEFAULT '23:59:00',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_assignments_user_id ON public.assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_assignments_course_id ON public.assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON public.assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON public.assignments(status);
CREATE INDEX IF NOT EXISTS idx_assignments_user_due ON public.assignments(user_id, due_date ASC);

-- ==============================================================================
-- 5. Subtasks Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.assignment_subtasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  position INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_subtasks_assignment_id ON public.assignment_subtasks(assignment_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_user_id ON public.assignment_subtasks(user_id);
CREATE INDEX IF NOT EXISTS idx_subtasks_order ON public.assignment_subtasks(assignment_id, position ASC);

-- ==============================================================================
-- 6. Attachments Table
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.assignment_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  file_type TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_attachments_assignment_id ON public.assignment_attachments(assignment_id);
CREATE INDEX IF NOT EXISTS idx_attachments_user_id ON public.assignment_attachments(user_id);

-- ==============================================================================
-- 7. Row Level Security (RLS) Policies
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_subtasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_attachments ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Courses Policies
DROP POLICY IF EXISTS "Users can read own courses" ON public.courses;
CREATE POLICY "Users can read own courses"
  ON public.courses FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own courses" ON public.courses;
CREATE POLICY "Users can insert own courses"
  ON public.courses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own courses" ON public.courses;
CREATE POLICY "Users can update own courses"
  ON public.courses FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own courses" ON public.courses;
CREATE POLICY "Users can delete own courses"
  ON public.courses FOR DELETE
  USING (auth.uid() = user_id);

-- Assignments Policies
DROP POLICY IF EXISTS "Users can read own assignments" ON public.assignments;
CREATE POLICY "Users can read own assignments"
  ON public.assignments FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own assignments" ON public.assignments;
CREATE POLICY "Users can insert own assignments"
  ON public.assignments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own assignments" ON public.assignments;
CREATE POLICY "Users can update own assignments"
  ON public.assignments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own assignments" ON public.assignments;
CREATE POLICY "Users can delete own assignments"
  ON public.assignments FOR DELETE
  USING (auth.uid() = user_id);

-- Subtasks Policies
DROP POLICY IF EXISTS "Users can read own subtasks" ON public.assignment_subtasks;
CREATE POLICY "Users can read own subtasks"
  ON public.assignment_subtasks FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own subtasks" ON public.assignment_subtasks;
CREATE POLICY "Users can insert own subtasks"
  ON public.assignment_subtasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own subtasks" ON public.assignment_subtasks;
CREATE POLICY "Users can update own subtasks"
  ON public.assignment_subtasks FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own subtasks" ON public.assignment_subtasks;
CREATE POLICY "Users can delete own subtasks"
  ON public.assignment_subtasks FOR DELETE
  USING (auth.uid() = user_id);

-- Attachments Policies
DROP POLICY IF EXISTS "Users can read own attachments" ON public.assignment_attachments;
CREATE POLICY "Users can read own attachments"
  ON public.assignment_attachments FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own attachments" ON public.assignment_attachments;
CREATE POLICY "Users can insert own attachments"
  ON public.assignment_attachments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own attachments" ON public.assignment_attachments;
CREATE POLICY "Users can delete own attachments"
  ON public.assignment_attachments FOR DELETE
  USING (auth.uid() = user_id);

-- ==============================================================================
-- 8. Supabase Storage Bucket & Storage RLS
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('assignment-files', 'assignment-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage object policies (users can only access files in their own folder /{user_id}/*)
DROP POLICY IF EXISTS "Users can upload files into own folder" ON storage.objects;
CREATE POLICY "Users can upload files into own folder"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'assignment-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can view own uploaded files" ON storage.objects;
CREATE POLICY "Users can view own uploaded files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'assignment-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Users can delete own uploaded files" ON storage.objects;
CREATE POLICY "Users can delete own uploaded files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'assignment-files' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

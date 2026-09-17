-- ==============================================================================
-- D3ADLINE SEED SCRIPT & TEST DATA
-- ==============================================================================
-- This script provisions realistic sample data for local testing and verification
-- of the 3 roles: admin, teacher, and student.
--
-- Roles:
-- 1. admin@example.test   (Role: admin)
-- 2. teacher@example.test (Role: teacher)
-- 3. student.a@example.test (Role: student)
-- 4. student.b@example.test (Role: student)
--
-- Password for all seed accounts:
-- TestPass123!
-- ==============================================================================

DO $$
DECLARE
  v_admin_id uuid := 'a0000000-0000-0000-0000-000000000001'::uuid;
  v_teacher_id uuid := 'a0000000-0000-0000-0000-000000000002'::uuid;
  v_student_a_id uuid := 'a0000000-0000-0000-0000-000000000003'::uuid;
  v_student_b_id uuid := 'a0000000-0000-0000-0000-000000000004'::uuid;

  v_course_math_id uuid := 'c0000000-0000-0000-0000-000000000001'::uuid;
  v_course_cs_id uuid := 'c0000000-0000-0000-0000-000000000002'::uuid;

  v_assign_math_1 uuid := 'd0000000-0000-0000-0000-000000000001'::uuid;
  v_assign_math_2 uuid := 'd0000000-0000-0000-0000-000000000002'::uuid;
  v_assign_cs_1 uuid := 'd0000000-0000-0000-0000-000000000003'::uuid;
BEGIN
  -- 1. Ensure auth.users accounts exist
  -- Admin
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_admin_id) THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      v_admin_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'admin@example.test',
      crypt('TestPass123!', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"display_name":"System Administrator","role":"admin"}',
      now(),
      now()
    );
  END IF;

  -- Teacher
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_teacher_id) THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      v_teacher_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'teacher@example.test',
      crypt('TestPass123!', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"display_name":"Prof. Alan Turing","role":"teacher"}',
      now(),
      now()
    );
  END IF;

  -- Student A
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_student_a_id) THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      v_student_a_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'student.a@example.test',
      crypt('TestPass123!', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"display_name":"Ada Lovelace","role":"student"}',
      now(),
      now()
    );
  END IF;

  -- Student B
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_student_b_id) THEN
    INSERT INTO auth.users (
      id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
      raw_app_meta_data, raw_user_meta_data, created_at, updated_at
    ) VALUES (
      v_student_b_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'student.b@example.test',
      crypt('TestPass123!', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"display_name":"Grace Hopper","role":"student"}',
      now(),
      now()
    );
  END IF;

  -- 2. Upsert Profiles with verified roles
  INSERT INTO public.profiles (id, email, display_name, role, institution, created_at, updated_at)
  VALUES
    (v_admin_id, 'admin@example.test', 'System Administrator', 'admin', 'D3adline Academy', now(), now()),
    (v_teacher_id, 'teacher@example.test', 'Prof. Alan Turing', 'teacher', 'Faculty of Computer Science', now(), now()),
    (v_student_a_id, 'student.a@example.test', 'Ada Lovelace', 'student', 'Department of Mathematics', now(), now()),
    (v_student_b_id, 'student.b@example.test', 'Grace Hopper', 'student', 'Department of Computing', now(), now())
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    display_name = EXCLUDED.display_name,
    institution = EXCLUDED.institution,
    updated_at = now();

  -- 3. Create Courses owned by the Teacher
  INSERT INTO public.courses (id, user_id, name, code, description, color, join_code, is_archived, created_at, updated_at)
  VALUES
    (
      v_course_math_id,
      v_teacher_id,
      'Linear Algebra & Calculus',
      'MATH101',
      'Fundamental matrix operations, vector spaces, and multivariate calculus foundations.',
      '#8B5CF6',
      'MTH101',
      false,
      now(),
      now()
    ),
    (
      v_course_cs_id,
      v_teacher_id,
      'Intro to Algorithms & Data Structures',
      'CS101',
      'Algorithm analysis, asymptotic complexity, sorting algorithms, and fundamental abstract data types.',
      '#3B82F6',
      'CS101X',
      false,
      now(),
      now()
    )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    code = EXCLUDED.code,
    join_code = EXCLUDED.join_code,
    is_archived = EXCLUDED.is_archived,
    updated_at = now();

  -- 4. Enroll Students into Courses
  -- Math 101: Student A and Student B
  INSERT INTO public.course_enrollments (course_id, student_id, status, enrolled_at)
  VALUES
    (v_course_math_id, v_student_a_id, 'active', now() - interval '3 days'),
    (v_course_math_id, v_student_b_id, 'active', now() - interval '2 days'),
    -- CS 101: Student A
    (v_course_cs_id, v_student_a_id, 'active', now() - interval '1 day')
  ON CONFLICT (course_id, student_id) DO NOTHING;

  -- 5. Create Teacher Assignments
  INSERT INTO public.assignments (id, course_id, user_id, title, description, status, priority, progress, due_date, due_time, created_at, updated_at)
  VALUES
    (
      v_assign_math_1,
      v_course_math_id,
      v_teacher_id,
      'Problem Set 1: Matrix Inversion & Eigenvalues',
      'Solve exercises 1-10 on page 42. Show all row reduction steps and calculate determinants.',
      'In Progress',
      'High',
      50,
      (current_date + interval '4 days')::date::text,
      '23:59:00',
      now(),
      now()
    ),
    (
      v_assign_math_2,
      v_course_math_id,
      v_teacher_id,
      'Essay: Orthogonal Projections and Least Squares',
      'Write a 2-page brief on how orthogonal projection minimizes euclidean distance error in regression.',
      'Not Started',
      'Medium',
      0,
      (current_date + interval '9 days')::date::text,
      '23:59:00',
      now(),
      now()
    ),
    (
      v_assign_cs_1,
      v_course_cs_id,
      v_teacher_id,
      'Implementation: QuickSort vs MergeSort Benchmark',
      'Implement in TypeScript or Python and generate comparative benchmarks with 10k random elements.',
      'In Progress',
      'High',
      30,
      (current_date + interval '6 days')::date::text,
      '23:59:00',
      now(),
      now()
    )
  ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    due_date = EXCLUDED.due_date,
    updated_at = now();

  -- 6. Create Submissions
  -- Student A submitted Assignment 1 and has been graded
  INSERT INTO public.assignment_submissions (
    assignment_id, student_id, status, progress, submission_note, submitted_at, grade, feedback, created_at, updated_at
  ) VALUES (
    v_assign_math_1,
    v_student_a_id,
    'Completed',
    100,
    'Finished all 10 problem sets. Determinant steps verified with reduced row echelon form.',
    now() - interval '1 day',
    95.00,
    'Exceptional mathematical proof formatting and clear eigenbasis derivations. Well done!',
    now() - interval '1 day',
    now()
  )
  ON CONFLICT (assignment_id, student_id) DO UPDATE SET
    status = EXCLUDED.status,
    progress = EXCLUDED.progress,
    grade = EXCLUDED.grade,
    feedback = EXCLUDED.feedback,
    updated_at = now();

  -- Student B submitted Assignment 1 and is awaiting grade
  INSERT INTO public.assignment_submissions (
    assignment_id, student_id, status, progress, submission_note, submitted_at, grade, feedback, created_at, updated_at
  ) VALUES (
    v_assign_math_1,
    v_student_b_id,
    'Completed',
    100,
    'Submitted solution document for PS1. Included matrix factorization diagrams.',
    now() - interval '4 hours',
    NULL,
    NULL,
    now() - interval '4 hours',
    now()
  )
  ON CONFLICT (assignment_id, student_id) DO UPDATE SET
    status = EXCLUDED.status,
    progress = EXCLUDED.progress,
    submitted_at = EXCLUDED.submitted_at,
    updated_at = now();

  RAISE NOTICE 'D3adline RBAC Test Seed Data inserted successfully!';
END $$;

-- ==============================================================================
-- HELPER: PROMOTING AN EXISTING USER MANUALLY
-- ==============================================================================
-- If you registered an account through the UI and want to make it an Admin or Teacher:
--
-- To promote to Admin:
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your-email@example.com';
--
-- To promote to Teacher:
-- UPDATE public.profiles SET role = 'teacher' WHERE email = 'your-email@example.com';
-- ==============================================================================

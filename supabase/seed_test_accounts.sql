-- ==============================================================================
-- D3ADLINE FRESH SEED SCRIPT & TEST DATA
-- ==============================================================================
-- This script resets and provisions clean sample data conforming to the hardened
-- 3-role RBAC schema with strict teacher isolation and real deliverable requirements.
--
-- Standard Accounts:
-- 1. admin@deadline.app       (Role: admin)   - System Administrator (Global access)
-- 2. teacher@deadline.app     (Role: teacher) - Prof. Robert Hoffman (Teacher A: CS-301 & MATH-202)
-- 3. sarah.chen@deadline.app  (Role: teacher) - Dr. Sarah Chen (Teacher B: SE-201)
-- 4. student@deadline.app     (Role: student) - Alex Rivera (Student in Teacher A's classes)
-- 5. maya.lin@deadline.app    (Role: student) - Maya Lin (Student in Teacher A's classes)
-- 6. katherine@deadline.app   (Role: student) - Katherine Johnson (Student in Teacher B's class)
--
-- Password for all accounts:
-- TestPass123!
-- ==============================================================================

DO $$
DECLARE
  v_admin_id uuid := 'a0000000-0000-0000-0000-000000000001'::uuid;
  v_teacher_a_id uuid := '11111111-1111-4111-8111-111111111111'::uuid;
  v_teacher_b_id uuid := '22222222-2222-4222-8222-222222222222'::uuid;
  v_student_1_id uuid := '33333333-3333-4333-8333-333333333333'::uuid;
  v_student_2_id uuid := '44444444-4444-4444-8444-444444444444'::uuid;
  v_student_3_id uuid := '55555555-5555-4555-8555-555555555555'::uuid;

  v_course_cs_id uuid := 'c1111111-1111-4111-8111-111111111111'::uuid;
  v_course_math_id uuid := 'c2222222-2222-4222-8222-222222222222'::uuid;
  v_course_se_id uuid := 'c3333333-3333-4333-8333-333333333333'::uuid;

  v_assign_cs_1 uuid := 'd1111111-1111-4111-8111-111111111111'::uuid;
  v_assign_cs_2 uuid := 'd2222222-2222-4222-8222-222222222222'::uuid;
  v_assign_math_1 uuid := 'd3333333-3333-4333-8333-333333333333'::uuid;
  v_assign_se_1 uuid := 'd4444444-4444-4444-8444-444444444444'::uuid;
BEGIN
  -- 0. Clean out previous application data
  DELETE FROM public.assignment_subtasks;
  DELETE FROM public.assignment_attachments;
  DELETE FROM public.assignment_submissions;
  DELETE FROM public.assignments;
  DELETE FROM public.course_enrollments;
  DELETE FROM public.courses;

  -- 1. Ensure auth.users accounts exist with password TestPass123!
  -- Admin
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_admin_id) THEN
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES (v_admin_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@deadline.app', crypt('TestPass123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"display_name":"System Administrator","role":"admin"}', now(), now());
  ELSE
    UPDATE auth.users SET encrypted_password = crypt('TestPass123!', gen_salt('bf')), raw_user_meta_data = '{"display_name":"System Administrator","role":"admin"}' WHERE id = v_admin_id;
  END IF;

  -- Teacher A (Prof. Robert Hoffman)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_teacher_a_id) THEN
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES (v_teacher_a_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'teacher@deadline.app', crypt('TestPass123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Prof. Robert Hoffman","role":"teacher"}', now(), now());
  ELSE
    UPDATE auth.users SET encrypted_password = crypt('TestPass123!', gen_salt('bf')), raw_user_meta_data = '{"display_name":"Prof. Robert Hoffman","role":"teacher"}' WHERE id = v_teacher_a_id;
  END IF;

  -- Teacher B (Dr. Sarah Chen)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_teacher_b_id) THEN
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES (v_teacher_b_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sarah.chen@deadline.app', crypt('TestPass123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Dr. Sarah Chen","role":"teacher"}', now(), now());
  ELSE
    UPDATE auth.users SET encrypted_password = crypt('TestPass123!', gen_salt('bf')), raw_user_meta_data = '{"display_name":"Dr. Sarah Chen","role":"teacher"}' WHERE id = v_teacher_b_id;
  END IF;

  -- Student 1 (Alex Rivera)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_student_1_id) THEN
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES (v_student_1_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'student@deadline.app', crypt('TestPass123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Alex Rivera","role":"student"}', now(), now());
  ELSE
    UPDATE auth.users SET encrypted_password = crypt('TestPass123!', gen_salt('bf')), raw_user_meta_data = '{"display_name":"Alex Rivera","role":"student"}' WHERE id = v_student_1_id;
  END IF;

  -- Student 2 (Maya Lin)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_student_2_id) THEN
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES (v_student_2_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'maya.lin@deadline.app', crypt('TestPass123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Maya Lin","role":"student"}', now(), now());
  ELSE
    UPDATE auth.users SET encrypted_password = crypt('TestPass123!', gen_salt('bf')), raw_user_meta_data = '{"display_name":"Maya Lin","role":"student"}' WHERE id = v_student_2_id;
  END IF;

  -- Student 3 (Katherine Johnson)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_student_3_id) THEN
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
    VALUES (v_student_3_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'katherine@deadline.app', crypt('TestPass123!', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Katherine Johnson","role":"student"}', now(), now());
  ELSE
    UPDATE auth.users SET encrypted_password = crypt('TestPass123!', gen_salt('bf')), raw_user_meta_data = '{"display_name":"Katherine Johnson","role":"student"}' WHERE id = v_student_3_id;
  END IF;

  -- 2. Upsert Profiles
  INSERT INTO public.profiles (id, email, display_name, role, institution, created_at, updated_at)
  VALUES
    (v_admin_id, 'admin@deadline.app', 'System Administrator', 'admin', 'D3adline Academy', now(), now()),
    (v_teacher_a_id, 'teacher@deadline.app', 'Prof. Robert Hoffman', 'teacher', 'Faculty of Computer Science', now(), now()),
    (v_teacher_b_id, 'sarah.chen@deadline.app', 'Dr. Sarah Chen', 'teacher', 'Faculty of Software Engineering', now(), now()),
    (v_student_1_id, 'student@deadline.app', 'Alex Rivera', 'student', 'School of Computing', now(), now()),
    (v_student_2_id, 'maya.lin@deadline.app', 'Maya Lin', 'student', 'School of Computing', now(), now()),
    (v_student_3_id, 'katherine@deadline.app', 'Katherine Johnson', 'student', 'School of Engineering', now(), now())
  ON CONFLICT (id) DO UPDATE SET
    role = EXCLUDED.role,
    display_name = EXCLUDED.display_name,
    institution = EXCLUDED.institution,
    updated_at = now();

  -- 3. Create Courses
  -- Teacher A Course 1: CS-301
  INSERT INTO public.courses (id, user_id, name, code, description, color, join_code, is_archived, created_at, updated_at)
  VALUES (
    v_course_cs_id,
    v_teacher_a_id,
    'Data Structures & Algorithms',
    'CS-301',
    'Balanced search trees, graph pathfinding, algorithmic asymptotic complexity, and dynamic programming.',
    '#8B5CF6',
    'DSA301',
    false,
    now(),
    now()
  );

  -- Teacher A Course 2: MATH-202
  INSERT INTO public.courses (id, user_id, name, code, description, color, join_code, is_archived, created_at, updated_at)
  VALUES (
    v_course_math_id,
    v_teacher_a_id,
    'Linear Algebra & Calculus III',
    'MATH-202',
    'Vector spaces, matrix decomposition, eigenvalues, and multivariable optimization.',
    '#3B82F6',
    'MTH202',
    false,
    now(),
    now()
  );

  -- Teacher B Course 1: SE-201 (Strict Isolation)
  INSERT INTO public.courses (id, user_id, name, code, description, color, join_code, is_archived, created_at, updated_at)
  VALUES (
    v_course_se_id,
    v_teacher_b_id,
    'Software Architecture & Scalable Systems',
    'SE-201',
    'Domain-driven design, microservices boundaries, distributed tracing, and event-driven patterns.',
    '#10B981',
    'ARC201',
    false,
    now(),
    now()
  );

  -- 4. Course Enrollments
  -- CS-301 (Teacher A): Alex Rivera, Maya Lin
  INSERT INTO public.course_enrollments (course_id, student_id, status, enrolled_at)
  VALUES
    (v_course_cs_id, v_student_1_id, 'active', now() - interval '5 days'),
    (v_course_cs_id, v_student_2_id, 'active', now() - interval '4 days'),
    -- MATH-202 (Teacher A): Alex Rivera
    (v_course_math_id, v_student_1_id, 'active', now() - interval '5 days'),
    -- SE-201 (Teacher B): Katherine Johnson only
    (v_course_se_id, v_student_3_id, 'active', now() - interval '4 days');

  -- 5. Assignments
  -- CS-301: Assignment 1
  INSERT INTO public.assignments (id, course_id, user_id, title, description, status, priority, progress, due_date, due_time, created_at, updated_at)
  VALUES (
    v_assign_cs_1,
    v_course_cs_id,
    v_teacher_a_id,
    'Red-Black Trees & Balancing Benchmark',
    'Implement self-balancing binary search trees (AVL and Red-Black rotations). Benchmark rotation memory and lookup efficiency.',
    'In Progress',
    'High',
    50,
    (current_date + interval '4 days')::date,
    '23:59:00',
    now(),
    now()
  );

  -- CS-301: Assignment 2
  INSERT INTO public.assignments (id, course_id, user_id, title, description, status, priority, progress, due_date, due_time, created_at, updated_at)
  VALUES (
    v_assign_cs_2,
    v_course_cs_id,
    v_teacher_a_id,
    'Dijkstra & A* Pathfinding Benchmark',
    'Implement shortest-path algorithms on Euclidean grid maps. Analyze runtime and memory complexity with admissible heuristics.',
    'Not Started',
    'Medium',
    0,
    (current_date + interval '7 days')::date,
    '23:59:00',
    now(),
    now()
  );

  -- MATH-202: Assignment 3
  INSERT INTO public.assignments (id, course_id, user_id, title, description, status, priority, progress, due_date, due_time, created_at, updated_at)
  VALUES (
    v_assign_math_1,
    v_course_math_id,
    v_teacher_a_id,
    'Problem Set 1: Matrix Inversion & Eigenvalues',
    'Solve exercises 1-10 on page 42. Show all row reduction steps, determinant calculations, and eigenspace bases.',
    'In Progress',
    'High',
    50,
    (current_date + interval '5 days')::date,
    '23:59:00',
    now(),
    now()
  );

  -- SE-201: Assignment 4 (Teacher B)
  INSERT INTO public.assignments (id, course_id, user_id, title, description, status, priority, progress, due_date, due_time, created_at, updated_at)
  VALUES (
    v_assign_se_1,
    v_course_se_id,
    v_teacher_b_id,
    'Sprint 1 Architecture Design Document',
    'Decompose the monolith system into bounded contexts. Produce C4 container diagrams and OpenAPI contracts.',
    'In Progress',
    'High',
    40,
    (current_date + interval '6 days')::date,
    '23:59:00',
    now(),
    now()
  );

  -- 6. Subtasks for Assignments
  INSERT INTO public.assignment_subtasks (assignment_id, user_id, title, completed, position, created_at, updated_at)
  VALUES
    (v_assign_cs_1, v_teacher_a_id, 'Define AVL tree rotation primitives', true, 1, now(), now()),
    (v_assign_cs_1, v_teacher_a_id, 'Implement Red-Black tree insertion color fixes', true, 2, now(), now()),
    (v_assign_cs_1, v_teacher_a_id, 'Benchmark throughput against standard std::map', false, 3, now(), now()),
    (v_assign_math_1, v_teacher_a_id, 'Compute determinants for 4x4 matrix set', true, 1, now(), now()),
    (v_assign_math_1, v_teacher_a_id, 'Solve characteristic polynomials for eigenvalues', false, 2, now(), now());

  -- 7. Submissions demonstrating Real Deliverables and Personal Progress Invariants
  -- Case 1: Alex Rivera on CS-301 Assignment 1 (Submitted + Graded)
  INSERT INTO public.assignment_submissions (
    assignment_id, student_id, status, progress, submission_text, submission_note, submitted_at, grade, feedback, created_at, updated_at
  ) VALUES (
    v_assign_cs_1,
    v_student_1_id,
    'Completed',
    100,
    'Implemented AVL and Red-Black balancing tree rotations in C++ with memory benchmarks and unit test suite.',
    'Implemented AVL and Red-Black balancing tree rotations in C++ with memory benchmarks and unit test suite.',
    now() - interval '1 day',
    95.00,
    'Exceptional benchmark methodology and clean rotation pointers! Well done.',
    now() - interval '1 day',
    now()
  );

  -- Case 2: Maya Lin on CS-301 Assignment 1 (Submitted, Awaiting Grade)
  INSERT INTO public.assignment_submissions (
    assignment_id, student_id, status, progress, submission_text, submission_note, submitted_at, grade, feedback, created_at, updated_at
  ) VALUES (
    v_assign_cs_1,
    v_student_2_id,
    'Completed',
    100,
    'Completed self-balancing AVL & Red-Black tree benchmarks with memory profiler results and complexity graphs.',
    'Completed self-balancing AVL & Red-Black tree benchmarks with memory profiler results and complexity graphs.',
    now() - interval '4 hours',
    NULL,
    NULL,
    now() - interval '4 hours',
    now()
  );

  -- Case 3: Alex Rivera on MATH-202 Assignment 3 (Submitted + Graded)
  INSERT INTO public.assignment_submissions (
    assignment_id, student_id, status, progress, submission_text, submission_note, submitted_at, grade, feedback, created_at, updated_at
  ) VALUES (
    v_assign_math_1,
    v_student_1_id,
    'Completed',
    100,
    'Completed exercises 1 through 10 with verified determinant calculations and row reduction steps.',
    'Completed exercises 1 through 10 with verified determinant calculations and row reduction steps.',
    now() - interval '2 days',
    98.00,
    'Flawless mathematical proof formatting and clear eigenbasis derivations.',
    now() - interval '2 days',
    now()
  );

  -- Case 4: Katherine Johnson on SE-201 Assignment 4 (Teacher B's Class - Submitted, Awaiting Grade)
  INSERT INTO public.assignment_submissions (
    assignment_id, student_id, status, progress, submission_text, submission_note, submitted_at, grade, feedback, created_at, updated_at
  ) VALUES (
    v_assign_se_1,
    v_student_3_id,
    'Completed',
    100,
    'System decomposition document submitted with C4 container diagrams and OpenAPI contracts.',
    'System decomposition document submitted with C4 container diagrams and OpenAPI contracts.',
    now() - interval '5 hours',
    NULL,
    NULL,
    now() - interval '5 hours',
    now()
  );

  RAISE NOTICE 'D3adline RBAC Test Seed Data inserted successfully!';
END $$;

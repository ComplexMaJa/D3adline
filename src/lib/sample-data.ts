import { createClient } from "@/lib/supabase/client";
import { addDays, format, subDays } from "date-fns";

function generateJoinCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export async function seedSampleData() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in to seed sample data.");
  }

  // Fetch user profile to determine role
  const { data: profile, error: profError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profError && profError.code !== "PGRST116") {
    console.warn("Could not fetch profile during seeding:", profError.message);
  }

  const role = profile?.role || (user.user_metadata?.role as string) || "student";
  const isTeacher = role === "teacher" || role === "admin";
  const today = new Date();

  // =========================================================================
  // TEACHER SEEDING FLOW
  // =========================================================================
  if (isTeacher) {
    const teacherName = profile?.display_name || "Instructor";

    const sampleCourses = [
      {
        user_id: user.id,
        name: "Data Structures & Algorithms",
        code: "CS-301",
        instructor: teacherName,
        description: "Balanced trees, graph algorithms, asymptotic analysis, and dynamic programming.",
        color: "#8B5CF6", // Purple
        join_code: generateJoinCode(),
        is_archived: false,
      },
      {
        user_id: user.id,
        name: "Distributed Systems Architecture",
        code: "CS-405",
        instructor: teacherName,
        description: "Consensus protocols, Raft, vector clocks, fault tolerance, and event-driven architecture.",
        color: "#10B981", // Emerald
        join_code: generateJoinCode(),
        is_archived: false,
      },
    ];

    const { data: createdCourses, error: courseError } = await supabase
      .from("courses")
      .insert(sampleCourses)
      .select();

    if (courseError) {
      throw new Error(courseError.message || "Failed to create sample teacher courses.");
    }
    if (!createdCourses || createdCourses.length === 0) {
      throw new Error("No courses were created. Please try again.");
    }

    const [dsa, dist] = createdCourses;

    const sampleAssignments = [
      {
        user_id: user.id,
        course_id: dsa.id,
        title: "Red-Black Trees & Balancing Benchmark",
        description: "Implement AVL and Red-Black tree balancing rotations and benchmark memory efficiency.",
        priority: "High" as const,
        status: "In Progress" as const,
        progress: 50,
        due_date: format(addDays(today, 3), "yyyy-MM-dd"),
        due_time: "23:59:00",
      },
      {
        user_id: user.id,
        course_id: dsa.id,
        title: "Dijkstra & A* Pathfinding Benchmark",
        description: "Analyze graph search algorithms on Euclidean road networks.",
        priority: "Medium" as const,
        status: "Not Started" as const,
        progress: 0,
        due_date: format(addDays(today, 7), "yyyy-MM-dd"),
        due_time: "23:59:00",
      },
      {
        user_id: user.id,
        course_id: dist.id,
        title: "Raft Consensus Protocol Simulator",
        description: "Build a state-machine replication cluster with leader election and heartbeat timers.",
        priority: "High" as const,
        status: "Not Started" as const,
        progress: 0,
        due_date: format(addDays(today, 5), "yyyy-MM-dd"),
        due_time: "23:59:00",
      },
    ];

    const { data: createdAssignments, error: assignError } = await supabase
      .from("assignments")
      .insert(sampleAssignments)
      .select();

    if (assignError) {
      throw new Error(assignError.message || "Failed to create sample assignments.");
    }

    // Try to find registered students to enroll in the teacher's new courses
    const { data: students } = await supabase
      .from("profiles")
      .select("id, display_name")
      .eq("role", "student")
      .neq("id", user.id)
      .limit(4);

    if (students && students.length > 0) {
      const enrollments = [];
      for (const student of students) {
        enrollments.push({
          course_id: dsa.id,
          student_id: student.id,
          status: "active" as const,
        });
        enrollments.push({
          course_id: dist.id,
          student_id: student.id,
          status: "active" as const,
        });
      }

      await supabase.from("course_enrollments").insert(enrollments).select();

      // If assignments were created, add sample submissions
      if (createdAssignments && createdAssignments.length > 0) {
        const submissions = [
          {
            assignment_id: createdAssignments[0].id,
            student_id: students[0].id,
            status: "Completed" as const,
            progress: 100,
            submission_note: "Implemented balanced rotations in C++ with memory benchmarks.",
            submitted_at: new Date().toISOString(),
            grade: 95.0,
            feedback: "Excellent benchmark methodology and clean rotation pointers!",
          },
          {
            assignment_id: createdAssignments[0].id,
            student_id: students[Math.min(1, students.length - 1)].id,
            status: "In Progress" as const,
            progress: 60,
            submission_note: "Writing delete tests for double-black leaf nodes.",
          },
        ];

        await supabase.from("assignment_submissions").insert(submissions);
      }
    }

    return {
      coursesCount: createdCourses.length,
      assignmentsCount: createdAssignments ? createdAssignments.length : 0,
    };
  }

  // =========================================================================
  // STUDENT SEEDING FLOW
  // =========================================================================
  // Students should NOT create courses. Instead, enroll the student into existing
  // active courses with assignments to complete!
  const { data: existingCourses } = await supabase
    .from("courses")
    .select("id, name, join_code, assignments(id, title)")
    .eq("is_archived", false)
    .limit(4);

  if (existingCourses && existingCourses.length > 0) {
    // Enroll the student into these courses
    const newEnrollments = existingCourses.map((c) => ({
      course_id: c.id,
      student_id: user.id,
      status: "active" as const,
    }));

    await supabase.from("course_enrollments").upsert(newEnrollments, {
      onConflict: "course_id,student_id",
      ignoreDuplicates: true,
    });

    // Create initial submissions for the student so they have active progress
    const allAssignments = existingCourses.flatMap((c) => (c.assignments as any[]) || []);
    if (allAssignments.length > 0) {
      const studentSubmissions = allAssignments.slice(0, 3).map((a, idx) => ({
        assignment_id: a.id,
        student_id: user.id,
        status: idx === 0 ? ("In Progress" as const) : ("Not Started" as const),
        progress: idx === 0 ? 40 : 0,
        submission_note: idx === 0 ? "Started working on requirements." : null,
      }));

      await supabase.from("assignment_submissions").upsert(studentSubmissions, {
        onConflict: "assignment_id,student_id",
        ignoreDuplicates: true,
      });
    }

    return {
      coursesCount: existingCourses.length,
      assignmentsCount: allAssignments.length,
    };
  }

  // Fallback for empty database: Teacher course created and student enrolled
  const fallbackCourse = {
    user_id: user.id,
    name: "Software Engineering & Architecture",
    code: "CS-201",
    instructor: "Prof. System",
    description: "Design patterns, agile development, and scalable cloud applications.",
    color: "#8B5CF6",
    join_code: generateJoinCode(),
    is_archived: false,
  };

  const { data: createdCourses, error: courseError } = await supabase
    .from("courses")
    .insert([fallbackCourse])
    .select();

  if (courseError) {
    throw new Error(courseError.message || "Failed to initialize sample course.");
  }

  const course = createdCourses[0];

  const sampleAssignments = [
    {
      user_id: user.id,
      course_id: course.id,
      title: "Sprint 1 Architecture Design Document",
      description: "Decompose monolithic services into RESTful domain models.",
      priority: "High" as const,
      status: "In Progress" as const,
      progress: 50,
      due_date: format(addDays(today, 3), "yyyy-MM-dd"),
      due_time: "23:59:00",
    },
    {
      user_id: user.id,
      course_id: course.id,
      title: "Unit Testing & Mocking Lab",
      description: "Write integration tests with 85% code coverage.",
      priority: "Medium" as const,
      status: "Not Started" as const,
      progress: 0,
      due_date: format(addDays(today, 7), "yyyy-MM-dd"),
      due_time: "23:59:00",
    },
  ];

  const { data: createdAssignments, error: assignError } = await supabase
    .from("assignments")
    .insert(sampleAssignments)
    .select();

  if (assignError) {
    throw new Error(assignError.message || "Failed to create sample assignments.");
  }

  return {
    coursesCount: createdCourses.length,
    assignmentsCount: createdAssignments ? createdAssignments.length : 0,
  };
}

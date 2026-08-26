import { createClient } from "@/lib/supabase/client";
import { addDays, format, subDays } from "date-fns";

export async function seedSampleData() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be logged in to seed sample data.");
  }

  const today = new Date();

  // 1. Create sample courses
  const sampleCourses = [
    {
      user_id: user.id,
      name: "Data Structures & Algorithms",
      code: "CS-201",
      instructor: "Dr. Evelyn Reed",
      description: "Advanced data structures, graph algorithms, asymptotic analysis, and dynamic programming.",
      color: "#8B5CF6", // Purple
    },
    {
      user_id: user.id,
      name: "Database Systems",
      code: "CS-305",
      instructor: "Prof. Marcus Vance",
      description: "Relational database design, SQL querying, indexing, transaction processing, and normalization.",
      color: "#3B82F6", // Blue
    },
    {
      user_id: user.id,
      name: "Software Engineering Practice",
      code: "CS-401",
      instructor: "Prof. Sarah Chen",
      description: "Agile workflows, software architecture patterns, CI/CD pipelines, and team sprint projects.",
      color: "#10B981", // Emerald
    },
    {
      user_id: user.id,
      name: "Calculus II",
      code: "MATH-202",
      instructor: "Dr. Robert Hoffman",
      description: "Integration techniques, infinite series, Taylor polynomials, and parametric equations.",
      color: "#F59E0B", // Amber
    },
  ];

  const { data: createdCourses, error: courseError } = await supabase
    .from("courses")
    .insert(sampleCourses)
    .select();

  if (courseError) throw courseError;
  if (!createdCourses || createdCourses.length < 4) {
    throw new Error("Failed to create sample courses.");
  }

  const [dsa, db, se, calc] = createdCourses;

  // 2. Create sample assignments with intelligent deadlines
  const sampleAssignments = [
    {
      user_id: user.id,
      course_id: dsa.id,
      title: "Binary Search Trees & AVL Balancing Lab",
      description: "Implement AVL tree self-balancing rotations and benchmark search lookups against standard BSTs.",
      priority: "High",
      status: "In Progress",
      progress: 60,
      due_date: format(addDays(today, 1), "yyyy-MM-dd"), // Due tomorrow!
      due_time: "23:59:00",
    },
    {
      user_id: user.id,
      course_id: db.id,
      title: "ER Diagram & Schema Normalization (3NF)",
      description: "Design an E-Commerce database model adhering to Boyce-Codd Normal Form with foreign key constraints.",
      priority: "High",
      status: "Not Started",
      progress: 0,
      due_date: format(today, "yyyy-MM-dd"), // Due today!
      due_time: "18:00:00",
    },
    {
      user_id: user.id,
      course_id: se.id,
      title: "Sprint 2 Architecture Design Document",
      description: "Document component architecture, REST API contracts, and CI/CD automated deployment flow.",
      priority: "Medium",
      status: "In Progress",
      progress: 40,
      due_date: format(addDays(today, 4), "yyyy-MM-dd"), // Due in 4 days
      due_time: "23:59:00",
    },
    {
      user_id: user.id,
      course_id: calc.id,
      title: "Problem Set 5: Taylor & Maclaurin Series",
      description: "Solve problems 14 through 32 in Chapter 9 on radius of convergence and power series expansion.",
      priority: "Medium",
      status: "Not Started",
      progress: 0,
      due_date: format(addDays(today, 6), "yyyy-MM-dd"), // Due in 6 days
      due_time: "17:00:00",
    },
    {
      user_id: user.id,
      course_id: dsa.id,
      title: "Dijkstra & A* Shortest Path Benchmark",
      description: "Analyze road network graph traversal with Euclidean heuristic distance vs standard priority queue.",
      priority: "Medium",
      status: "Completed",
      progress: 100,
      due_date: format(subDays(today, 3), "yyyy-MM-dd"),
      due_time: "23:59:00",
    },
    {
      user_id: user.id,
      course_id: db.id,
      title: "Query Optimization & B-Tree Index Report",
      description: "Measure EXPLAIN ANALYZE execution costs with and without composite indexes on 1M rows.",
      priority: "Low",
      status: "Completed",
      progress: 100,
      due_date: format(subDays(today, 5), "yyyy-MM-dd"),
      due_time: "23:59:00",
    },
    {
      user_id: user.id,
      course_id: calc.id,
      title: "Integration by Parts & Partial Fractions Quiz",
      description: "Review improper integrals, trigonometric substitution, and partial fraction decomposition.",
      priority: "High",
      status: "Overdue",
      progress: 15,
      due_date: format(subDays(today, 2), "yyyy-MM-dd"), // Overdue!
      due_time: "23:59:00",
    },
  ];

  const { data: createdAssignments, error: assignError } = await supabase
    .from("assignments")
    .insert(sampleAssignments)
    .select();

  if (assignError) throw assignError;

  // 3. Create subtasks for the first assignment
  if (createdAssignments && createdAssignments.length > 0) {
    const firstAssign = createdAssignments[0];
    const sampleSubtasks = [
      {
        user_id: user.id,
        assignment_id: firstAssign.id,
        title: "Implement Node struct and basic BST insertion",
        completed: true,
        position: 1,
      },
      {
        user_id: user.id,
        assignment_id: firstAssign.id,
        title: "Calculate balance factor for left/right subtrees",
        completed: true,
        position: 2,
      },
      {
        user_id: user.id,
        assignment_id: firstAssign.id,
        title: "Implement Left and Right rotation methods",
        completed: false,
        position: 3,
      },
      {
        user_id: user.id,
        assignment_id: firstAssign.id,
        title: "Run automated test suite and write performance benchmark",
        completed: false,
        position: 4,
      },
    ];

    await supabase.from("assignment_subtasks").insert(sampleSubtasks);
  }

  return {
    coursesCount: createdCourses.length,
    assignmentsCount: createdAssignments ? createdAssignments.length : 0,
  };
}

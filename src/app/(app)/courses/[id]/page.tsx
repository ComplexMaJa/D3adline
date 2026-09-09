import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CourseDetailClient } from "./CourseDetailClient";
import { Course, Assignment } from "@/types/database";
import { getDeadlineInfo } from "@/lib/deadline-utils";

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Get current user and profile
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await supabase.from("profiles").select("*").eq("id", user.id).single()
    : { data: null };

  const isStudent = profile?.role === "student";

  // Fetch course
  const { data: courseData, error: courseError } = await supabase
    .from("courses")
    .select("*")
    .eq("id", id)
    .single();

  if (courseError || !courseData) {
    notFound();
  }

  // Fetch assignments for this course
  const { data: assignmentsData } = await supabase
    .from("assignments")
    .select(`
      *,
      course:courses(*)
    `)
    .eq("course_id", id)
    .order("due_date", { ascending: true });

  // Fetch enrolled students for this course
  const { data: enrollmentsData } = await supabase
    .from("course_enrollments")
    .select(`
      *,
      student:profiles(*)
    `)
    .eq("course_id", id)
    .order("enrolled_at", { ascending: true });

  const rawAssignments = (assignmentsData || []) as Assignment[];
  const enrollments = (enrollmentsData || []) as any[];

  // For students, fetch their individual submissions to reflect their personal progress
  let studentSubmissions: any[] = [];
  if (isStudent && user) {
    const { data: subs } = await supabase
      .from("assignment_submissions")
      .select("*")
      .eq("student_id", user.id);
    studentSubmissions = subs || [];
  }

  const submissionByAssignment = new Map<string, any>();
  for (const s of studentSubmissions) {
    submissionByAssignment.set(s.assignment_id, s);
  }

  const assignments: Assignment[] = rawAssignments.map((a) => {
    if (isStudent) {
      const sub = submissionByAssignment.get(a.id);
      if (sub) {
        return {
          ...a,
          status: sub.status,
          progress: sub.progress,
        };
      } else {
        return {
          ...a,
          status: "Not Started" as const,
          progress: 0,
        };
      }
    }
    return a;
  });

  // Calculate course metrics
  const total = assignments.length;
  const completed = assignments.filter(
    (a) => a.status === "Completed" || a.progress === 100
  ).length;
  const inProgress = assignments.filter(
    (a) => a.status === "In Progress" && a.progress < 100
  ).length;
  const overdue = assignments.filter((a) => {
    if (a.status === "Completed" || a.progress === 100) return false;
    return getDeadlineInfo(a.due_date, a.due_time, a.status).isOverdue;
  }).length;
  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const course: Course = {
    ...courseData,
    assignments_count: total,
    completed_count: completed,
    completion_percentage: completionPercentage,
    enrolled_students_count: enrollments.length,
  };

  return (
    <CourseDetailClient
      course={course}
      initialAssignments={assignments}
      initialEnrollments={enrollments}
      stats={{ total, completed, inProgress, overdue, completionPercentage }}
    />
  );
}

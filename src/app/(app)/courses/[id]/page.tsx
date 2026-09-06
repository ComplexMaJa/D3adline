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

  const assignments = (assignmentsData || []) as Assignment[];

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
  };

  return (
    <CourseDetailClient
      course={course}
      initialAssignments={assignments}
      stats={{ total, completed, inProgress, overdue, completionPercentage }}
    />
  );
}

import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "./DashboardClient";
import { Assignment, Course, DashboardMetrics } from "@/types/database";
import { differenceInCalendarDays, isPast, isToday, parseISO, startOfDay } from "date-fns";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch all assignments for user with courses
  const { data: rawAssignments } = await supabase
    .from("assignments")
    .select(`
      *,
      course:courses(*)
    `)
    .order("due_date", { ascending: true });

  const assignments: Assignment[] = (rawAssignments || []) as Assignment[];

  // Fetch courses with assignment stats
  const { data: rawCourses } = await supabase
    .from("courses")
    .select(`
      *,
      assignments:assignments(id, status, progress)
    `)
    .order("name", { ascending: true });

  const courses: Course[] = (rawCourses || []).map((c: any) => {
    const list = c.assignments || [];
    const total = list.length;
    const completed = list.filter(
      (a: any) => a.status === "Completed" || a.progress === 100
    ).length;
    const completion_percentage =
      total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      ...c,
      assignments_count: total,
      completed_count: completed,
      completion_percentage,
    };
  });

  // Calculate real metrics
  const now = new Date();
  const today = startOfDay(now);

  const totalAssignments = assignments.length;
  const completedAssignments = assignments.filter(
    (a) => a.status === "Completed" || a.progress === 100
  ).length;
  const pendingAssignments = totalAssignments - completedAssignments;

  let overdueAssignments = 0;
  let dueThisWeek = 0;

  assignments.forEach((a) => {
    const isCompleted = a.status === "Completed" || a.progress === 100;
    if (!isCompleted) {
      const deadline = parseISO(a.due_date);
      const days = differenceInCalendarDays(deadline, today);

      if (days < 0 || (days === 0 && a.status === "Overdue")) {
        overdueAssignments++;
      } else if (days >= 0 && days <= 7) {
        dueThisWeek++;
      }
    }
  });

  const completionPercentage =
    totalAssignments > 0
      ? Math.round((completedAssignments / totalAssignments) * 100)
      : 0;

  const metrics: DashboardMetrics = {
    totalAssignments,
    completedAssignments,
    pendingAssignments,
    overdueAssignments,
    dueThisWeek,
    completionPercentage,
  };

  return (
    <DashboardClient
      initialAssignments={assignments}
      initialCourses={courses}
      initialMetrics={metrics}
    />
  );
}

import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CourseDetailClient } from "./CourseDetailClient";
import { Course, Assignment, UserRole } from "@/types/database";
import { getDeadlineInfo } from "@/lib/deadline-utils";
import { deriveStudentAssignmentState } from "@/lib/assignment-state";

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

  let userRole: UserRole = "student";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    if (profile?.role) {
      userRole = profile.role;
    }
  }

  const isStudent = userRole === "student";

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
      course:courses(*),
      submissions:assignment_submissions(*),
      attachments:assignment_attachments(*),
      subtasks:assignment_subtasks(*)
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

  const rawAssignments = (assignmentsData || []) as any[];
  const enrollments = (enrollmentsData || []) as any[];

  // For students, fetch their subtask completions
  let subtaskCompletions: any[] = [];
  if (isStudent && user) {
    const { data: compData } = await supabase
      .from("assignment_subtask_completions")
      .select("*")
      .eq("student_id", user.id);
    subtaskCompletions = compData || [];
  }

  const assignments: Assignment[] = rawAssignments.map((a) => {
    if (isStudent && user) {
      const mySub = a.submissions?.find((s: any) => s.student_id === user.id);
      const myAtts = a.attachments?.filter((att: any) => att.user_id === user.id);
      const studentState = deriveStudentAssignmentState(
        a,
        user.id,
        mySub,
        myAtts,
        subtaskCompletions
      );

      return {
        ...a,
        status: studentState.status,
        progress: studentState.progress,
        has_submitted: studentState.hasSubmitted,
      };
    }

    return {
      ...a,
      has_submitted: false,
    };
  });

  // Calculate course metrics
  const total = assignments.length;
  let completed = 0;
  let inProgress = 0;
  let overdue = 0;

  for (const a of assignments) {
    if (isStudent) {
      if (a.status === "Completed" || a.progress === 100 || a.has_submitted) {
        completed++;
      } else if (a.status === "In Progress" || a.progress > 0) {
        inProgress++;
      } else if (a.status === "Overdue") {
        overdue++;
      }
    } else {
      if (a.status === "Completed" || a.progress === 100) {
        completed++;
      } else if (a.status === "In Progress") {
        inProgress++;
      } else {
        const deadline = getDeadlineInfo(a.due_date, a.due_time, a.status);
        if (deadline.isOverdue) {
          overdue++;
        }
      }
    }
  }

  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const course: Course = {
    ...courseData,
    assignments_count: total,
    completed_count: completed,
    overdue_count: overdue,
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

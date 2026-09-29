import { createClient } from "@/lib/supabase/server";
import { DashboardClient } from "./DashboardClient";
import { Assignment, Course, DashboardMetrics, Profile, UserRole } from "@/types/database";
import {
  calculateRoleCourseMetrics,
  calculateRoleDashboardMetrics,
  deriveStudentAssignmentState,
} from "@/lib/assignment-state";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch current user profile to determine authoritative role
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

  // Fetch all assignments with course data, submissions, attachments, subtasks
  const { data: rawAssignments } = await supabase
    .from("assignments")
    .select(`
      *,
      course:courses(*),
      submissions:assignment_submissions(*),
      attachments:assignment_attachments(*),
      subtasks:assignment_subtasks(*)
    `)
    .order("due_date", { ascending: true });

  const assignmentList = (rawAssignments || []) as any[];

  // If student: overlay personal submission & subtask completion state
  const assignments: Assignment[] = assignmentList.map((a) => {
    if (userRole === "student" && user) {
      const mySub = a.submissions?.find((s: any) => s.student_id === user.id);
      const myAtts = a.attachments?.filter((att: any) => att.user_id === user.id);
      const studentState = deriveStudentAssignmentState(
        a,
        user.id,
        mySub,
        myAtts
      );

      return {
        ...a,
        status: studentState.status,
        progress: studentState.progress,
        has_submitted: studentState.hasSubmitted,
      };
    }
    return a;
  });

  // Fetch accessible courses
  const { data: rawCourses } = await supabase
    .from("courses")
    .select("*")
    .order("name", { ascending: true });

  const courses: Course[] = calculateRoleCourseMetrics({
    courses: (rawCourses || []) as Course[],
    assignments: assignmentList,
    userRole,
    userId: user?.id || "",
  });

  const metrics: DashboardMetrics = calculateRoleDashboardMetrics({
    assignments: assignmentList,
    userRole,
    userId: user?.id || "",
  });

  return (
    <DashboardClient
      initialAssignments={assignments}
      initialCourses={courses}
      initialMetrics={metrics}
    />
  );
}

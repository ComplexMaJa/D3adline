import { createClient } from "@/lib/supabase/server";
import { CalendarClient } from "./CalendarClient";
import { Assignment, Course, UserRole } from "@/types/database";
import { deriveStudentAssignmentState } from "@/lib/assignment-state";

export default async function CalendarPage() {
  const supabase = await createClient();
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

  const { data: rawAssignments } = await supabase
    .from("assignments")
    .select(`
      *,
      course:courses(*),
      submissions:assignment_submissions(*),
      attachments:assignment_attachments(*)
    `)
    .order("due_date", { ascending: true });

  const assignmentList = (rawAssignments || []) as any[];

  const assignments: Assignment[] = assignmentList.map((a) => {
    if (isStudent && user) {
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
    return {
      ...a,
      has_submitted: false,
    };
  });

  const { data: rawCourses } = await supabase
    .from("courses")
    .select("*")
    .order("name", { ascending: true });

  const courses: Course[] = (rawCourses || []) as Course[];

  return <CalendarClient initialAssignments={assignments} courses={courses} />;
}

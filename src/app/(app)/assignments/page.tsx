import * as React from "react";
import { createClient } from "@/lib/supabase/server";
import { AssignmentsClient } from "./AssignmentsClient";
import { Assignment, Course, UserRole } from "@/types/database";
import { deriveStudentAssignmentState } from "@/lib/assignment-state";

export default async function AssignmentsPage() {
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

  // For students, fetch their subtask completions
  let subtaskCompletions: any[] = [];
  if (isStudent && user) {
    const { data: compData } = await supabase
      .from("assignment_subtask_completions")
      .select("*")
      .eq("student_id", user.id);
    subtaskCompletions = compData || [];
  }

  // Derive per-student assignment state
  const assignments: Assignment[] = assignmentList.map((a) => {
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

  // Fetch courses for filters
  const { data: rawCourses } = await supabase
    .from("courses")
    .select("*")
    .order("name", { ascending: true });

  const courses: Course[] = (rawCourses || []) as Course[];

  return (
    <React.Suspense fallback={<div className="animate-pulse py-12 text-center text-xs text-zinc-500">Loading assignments...</div>}>
      <AssignmentsClient
        initialAssignments={assignments}
        courses={courses}
      />
    </React.Suspense>
  );
}

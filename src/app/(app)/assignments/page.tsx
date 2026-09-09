import * as React from "react";
import { createClient } from "@/lib/supabase/server";
import { AssignmentsClient } from "./AssignmentsClient";
import { Assignment, Course } from "@/types/database";

export default async function AssignmentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch all assignments with course data and submissions
  const { data: rawAssignments } = await supabase
    .from("assignments")
    .select(`
      *,
      course:courses(*),
      submissions:assignment_submissions(*)
    `)
    .order("due_date", { ascending: true });

  // If student has a personal submission, overlay personal status & progress
  const assignments: Assignment[] = ((rawAssignments || []) as any[]).map((a) => {
    if (user && a.submissions && a.submissions.length > 0) {
      const mySub = a.submissions.find((s: any) => s.student_id === user.id);
      if (mySub) {
        return {
          ...a,
          status: mySub.status,
          progress: mySub.progress,
        };
      }
    }
    return a;
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

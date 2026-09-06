import * as React from "react";
import { createClient } from "@/lib/supabase/server";
import { AssignmentsClient } from "./AssignmentsClient";
import { Assignment, Course } from "@/types/database";

export default async function AssignmentsPage() {
  const supabase = await createClient();

  // Fetch all assignments with course data
  const { data: rawAssignments } = await supabase
    .from("assignments")
    .select(`
      *,
      course:courses(*)
    `)
    .order("due_date", { ascending: true });

  const assignments: Assignment[] = (rawAssignments || []) as Assignment[];

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

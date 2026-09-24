import * as React from "react";
import { createClient } from "@/lib/supabase/server";
import { AssignmentsClient } from "./AssignmentsClient";
import { Assignment, Course } from "@/types/database";

export default async function AssignmentsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch all assignments with course data, submissions, and attachments
  const { data: rawAssignments } = await supabase
    .from("assignments")
    .select(`
      *,
      course:courses(*),
      submissions:assignment_submissions(*),
      attachments:assignment_attachments(*)
    `)
    .order("due_date", { ascending: true });

  // If student has a personal submission, overlay personal status & progress
  const assignments: Assignment[] = ((rawAssignments || []) as any[]).map((a) => {
    let mySub = null;
    if (user && a.submissions && a.submissions.length > 0) {
      mySub = a.submissions.find((s: any) => s.student_id === user.id);
    }
    const hasMyAttachment = Boolean(
      user && a.attachments && a.attachments.some((att: any) => att.user_id === user.id)
    );
    const hasSubmitted = Boolean(
      mySub?.submitted_at ||
      (mySub?.submission_text && mySub.submission_text.trim().length > 0) ||
      (mySub?.submission_note && mySub.submission_note.trim().length > 0) ||
      hasMyAttachment
    );

    if (mySub) {
      return {
        ...a,
        status: mySub.status,
        progress: mySub.progress,
        has_submitted: hasSubmitted,
      };
    }
    return {
      ...a,
      has_submitted: hasSubmitted,
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

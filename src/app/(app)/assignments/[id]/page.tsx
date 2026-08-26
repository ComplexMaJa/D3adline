import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AssignmentDetailClient } from "./AssignmentDetailClient";
import { Assignment, Course, Subtask, Attachment } from "@/types/database";

export default async function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch assignment with joined course
  const { data: assignmentData, error: assignmentError } = await supabase
    .from("assignments")
    .select(`
      *,
      course:courses(*)
    `)
    .eq("id", id)
    .single();

  if (assignmentError || !assignmentData) {
    notFound();
  }

  // Fetch subtasks
  const { data: subtasksData } = await supabase
    .from("assignment_subtasks")
    .select("*")
    .eq("assignment_id", id)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  // Fetch attachments
  const { data: attachmentsData } = await supabase
    .from("assignment_attachments")
    .select("*")
    .eq("assignment_id", id)
    .order("created_at", { ascending: false });

  // Fetch all user courses (for edit dropdown)
  const { data: coursesData } = await supabase
    .from("courses")
    .select("*")
    .order("name", { ascending: true });

  const assignment = assignmentData as Assignment;
  const subtasks = (subtasksData || []) as Subtask[];
  const attachments = (attachmentsData || []) as Attachment[];
  const courses = (coursesData || []) as Course[];

  return (
    <AssignmentDetailClient
      initialAssignment={assignment}
      initialSubtasks={subtasks}
      initialAttachments={attachments}
      courses={courses}
    />
  );
}

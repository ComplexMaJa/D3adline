import { createClient } from "@/lib/supabase/server";
import { AdminAssignmentsClient } from "./AdminAssignmentsClient";
import { Assignment } from "@/types/database";

export const metadata = {
  title: "Assignment Oversight | D3adline Admin",
  description: "Global assignment oversight across all classes",
};

interface AssignmentWithMeta extends Assignment {
  submissionsCount: number;
  creatorProfile?: {
    display_name: string | null;
    email: string | null;
  } | null;
}

export default async function AdminAssignmentsPage() {
  const supabase = await createClient();

  // Fetch all assignments with course & creator
  const { data: assignmentsData } = await supabase
    .from("assignments")
    .select(`
      *,
      course:courses(id, name, code, color),
      creatorProfile:profiles(display_name, email)
    `)
    .order("due_date", { ascending: false });

  // Fetch submission counts
  const { data: submissionsData } = await supabase
    .from("assignment_submissions")
    .select("assignment_id");

  const submissionsCountMap: Record<string, number> = {};
  (submissionsData || []).forEach((s) => {
    if (s.assignment_id) {
      submissionsCountMap[s.assignment_id] = (submissionsCountMap[s.assignment_id] || 0) + 1;
    }
  });

  const assignments: AssignmentWithMeta[] = (assignmentsData || []).map((a) => ({
    ...a,
    submissionsCount: submissionsCountMap[a.id] || 0,
  }));

  return <AdminAssignmentsClient initialAssignments={assignments} />;
}

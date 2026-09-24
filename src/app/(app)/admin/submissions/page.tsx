import { createClient } from "@/lib/supabase/server";
import { SubmissionsClient } from "../../submissions/SubmissionsClient";
import { Course, AssignmentSubmission } from "@/types/database";

export const metadata = {
  title: "Submissions Audit | D3adline Admin",
  description: "Audit all student assignment submissions across the system",
};

export default async function AdminSubmissionsPage() {
  const supabase = await createClient();

  const { data: allCourses } = await supabase
    .from("courses")
    .select("*")
    .order("name", { ascending: true });

  const { data: allSubmissions } = await supabase
    .from("assignment_submissions")
    .select(`
      *,
      student:profiles(*),
      assignment:assignments(
        id,
        title,
        due_date,
        due_time,
        course:courses(id, name, code, color)
      )
    `)
    .order("updated_at", { ascending: false });

  const courses = (allCourses || []) as Course[];
  const submissions = (allSubmissions || []) as (AssignmentSubmission & Record<string, unknown>)[];

  return (
    <div className="space-y-4">
      <SubmissionsClient
        initialSubmissions={submissions}
        courses={courses}
        isAdmin={true}
      />
    </div>
  );
}

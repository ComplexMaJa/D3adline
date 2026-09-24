import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SubmissionsClient } from "./SubmissionsClient";
import { Course, AssignmentSubmission } from "@/types/database";

export const metadata = {
  title: "Submissions & Grading | D3adline",
  description: "Review and grade student assignment submissions",
};

export default async function SubmissionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const role = profile?.role || "student";

  if (role !== "teacher" && role !== "admin") {
    redirect("/dashboard");
  }

  const isAdmin = role === "admin";
  let courses: Course[] = [];
  let submissions: (AssignmentSubmission & Record<string, unknown>)[] = [];

  if (isAdmin) {
    // Admin can see submissions across all courses
    const { data: allCourses } = await supabase
      .from("courses")
      .select("*")
      .order("name", { ascending: true });
    courses = (allCourses || []) as Course[];

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

    submissions = allSubmissions || [];
  } else {
    // Teacher sees submissions for their owned courses
    const { data: teacherCourses } = await supabase
      .from("courses")
      .select("*")
      .eq("user_id", user.id)
      .order("name", { ascending: true });
    courses = (teacherCourses || []) as Course[];

    const courseIds = courses.map((c) => c.id);

    if (courseIds.length > 0) {
      // First get assignments belonging to teacher's courses
      const { data: teacherAssignments } = await supabase
        .from("assignments")
        .select("id")
        .in("course_id", courseIds);

      const assignmentIds = (teacherAssignments || []).map((a) => a.id);

      if (assignmentIds.length > 0) {
        const { data: teacherSubmissions } = await supabase
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
          .in("assignment_id", assignmentIds)
          .order("updated_at", { ascending: false });

        submissions = teacherSubmissions || [];
      }
    }
  }

  return (
    <SubmissionsClient
      initialSubmissions={submissions}
      courses={courses}
      isAdmin={isAdmin}
    />
  );
}

import { createClient } from "@/lib/supabase/server";
import { CoursesClient } from "./CoursesClient";
import { Course } from "@/types/database";

export default async function CoursesPage() {
  const supabase = await createClient();

  const { data: rawCourses } = await supabase
    .from("courses")
    .select(`
      *,
      assignments:assignments(id, status, progress)
    `)
    .order("name", { ascending: true });

  const courses: Course[] = (rawCourses || []).map((c: any) => {
    const list = c.assignments || [];
    const total = list.length;
    const completed = list.filter(
      (a: any) => a.status === "Completed" || a.progress === 100
    ).length;
    const completion_percentage =
      total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      ...c,
      assignments_count: total,
      completed_count: completed,
      completion_percentage,
    };
  });

  return <CoursesClient initialCourses={courses} />;
}

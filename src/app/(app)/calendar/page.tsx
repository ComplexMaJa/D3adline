import { createClient } from "@/lib/supabase/server";
import { CalendarClient } from "./CalendarClient";
import { Assignment, Course } from "@/types/database";

export default async function CalendarPage() {
  const supabase = await createClient();

  const { data: rawAssignments } = await supabase
    .from("assignments")
    .select(`
      *,
      course:courses(*)
    `)
    .order("due_date", { ascending: true });

  const assignments: Assignment[] = (rawAssignments || []) as Assignment[];

  const { data: rawCourses } = await supabase
    .from("courses")
    .select("*")
    .order("name", { ascending: true });

  const courses: Course[] = (rawCourses || []) as Course[];

  return <CalendarClient initialAssignments={assignments} courses={courses} />;
}

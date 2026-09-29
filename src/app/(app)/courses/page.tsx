import { createClient } from "@/lib/supabase/server";
import { CoursesClient } from "./CoursesClient";
import { Course, UserRole } from "@/types/database";
import { calculateRoleCourseMetrics } from "@/lib/assignment-state";

export default async function CoursesPage() {
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

  const { data: rawCourses } = await supabase
    .from("courses")
    .select("*")
    .order("name", { ascending: true });

  let rawAssignments: any[] = [];
  if (rawCourses && rawCourses.length > 0) {
    const courseIds = rawCourses.map((c) => c.id);
    const { data: assignmentsData } = await supabase
      .from("assignments")
      .select(`
        id,
        course_id,
        user_id,
        title,
        description,
        status,
        priority,
        progress,
        due_date,
        due_time,
        created_at,
        updated_at,
        submissions:assignment_submissions(*),
        attachments:assignment_attachments(*)
      `)
      .in("course_id", courseIds)
      .order("due_date", { ascending: true });

    rawAssignments = assignmentsData || [];
  }

  const courses: Course[] = calculateRoleCourseMetrics({
    courses: (rawCourses || []) as Course[],
    assignments: rawAssignments,
    userRole,
    userId: user?.id || "",
  });

  return <CoursesClient initialCourses={courses} />;
}

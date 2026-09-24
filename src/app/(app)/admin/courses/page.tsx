import { createClient } from "@/lib/supabase/server";
import { AdminCoursesClient } from "./AdminCoursesClient";
import { Course } from "@/types/database";

export const metadata = {
  title: "Course Registry | D3adline Admin",
  description: "Global course and classroom administration",
};

interface CourseWithMeta extends Course {
  instructorProfile?: {
    display_name: string | null;
    email: string | null;
    avatar_url: string | null;
  } | null;
  enrolledStudentsCount: number;
  assignmentsCount: number;
}

export default async function AdminCoursesPage() {
  const supabase = await createClient();

  // Fetch all courses with teacher profile
  const { data: coursesData } = await supabase
    .from("courses")
    .select(`
      *,
      instructorProfile:profiles(
        display_name,
        email,
        avatar_url
      )
    `)
    .order("created_at", { ascending: false });

  // Fetch enrollments counts grouped by course_id
  const { data: enrollmentsData } = await supabase
    .from("course_enrollments")
    .select("course_id");

  // Fetch assignments counts grouped by course_id
  const { data: assignmentsData } = await supabase
    .from("assignments")
    .select("course_id");

  const enrollmentsCountMap: Record<string, number> = {};
  (enrollmentsData || []).forEach((e) => {
    if (e.course_id) {
      enrollmentsCountMap[e.course_id] = (enrollmentsCountMap[e.course_id] || 0) + 1;
    }
  });

  const assignmentsCountMap: Record<string, number> = {};
  (assignmentsData || []).forEach((a) => {
    if (a.course_id) {
      assignmentsCountMap[a.course_id] = (assignmentsCountMap[a.course_id] || 0) + 1;
    }
  });

  const courses: CourseWithMeta[] = (coursesData || []).map((c) => ({
    ...c,
    enrolledStudentsCount: enrollmentsCountMap[c.id] || 0,
    assignmentsCount: assignmentsCountMap[c.id] || 0,
  }));

  return <AdminCoursesClient initialCourses={courses} />;
}

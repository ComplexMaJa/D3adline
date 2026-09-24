import { createClient } from "@/lib/supabase/server";
import { AdminDashboardClient } from "./AdminDashboardClient";
import { Profile } from "@/types/database";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // 1. Fetch user counts & recent users
  const { data: allProfiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  const profiles = (allProfiles || []) as Profile[];
  const totalUsers = profiles.length;
  const studentsCount = profiles.filter((p) => p.role === "student").length;
  const teachersCount = profiles.filter((p) => p.role === "teacher").length;
  const adminsCount = profiles.filter((p) => p.role === "admin").length;
  const recentUsers = profiles.slice(0, 5);

  // 2. Fetch courses statistics
  const { data: allCourses } = await supabase
    .from("courses")
    .select("id, is_archived, name, created_at");

  const courses = allCourses || [];
  const totalCourses = courses.length;
  const activeCourses = courses.filter((c) => !c.is_archived).length;
  const archivedCourses = courses.filter((c) => !!c.is_archived).length;

  // 3. Fetch assignments statistics
  const { count: assignmentsCount } = await supabase
    .from("assignments")
    .select("*", { count: "exact", head: true });

  // 4. Fetch submissions statistics
  const { data: allSubmissions } = await supabase
    .from("assignment_submissions")
    .select("id, grade, status");

  const submissions = allSubmissions || [];
  const totalSubmissions = submissions.length;
  const pendingSubmissions = submissions.filter(
    (s) => (s.status === "Completed") && s.grade === null
  ).length;
  const gradedSubmissions = submissions.filter((s) => s.grade !== null).length;

  const stats = {
    totalUsers,
    studentsCount,
    teachersCount,
    adminsCount,
    totalCourses,
    activeCourses,
    archivedCourses,
    totalAssignments: assignmentsCount || 0,
    totalSubmissions,
    pendingSubmissions,
    gradedSubmissions,
  };

  return <AdminDashboardClient stats={stats} recentUsers={recentUsers} />;
}

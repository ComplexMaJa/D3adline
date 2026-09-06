import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/AppShell";
import { Course, Profile } from "@/types/database";
import { getDeadlineInfo } from "@/lib/deadline-utils";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Fetch profile
  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const profile: Profile = profileData || {
    id: user.id,
    email: user.email || null,
    display_name:
      user.user_metadata?.display_name ||
      user.user_metadata?.full_name ||
      user.email?.split("@")[0] ||
      "Student",
    avatar_url: user.user_metadata?.avatar_url || null,
    created_at: user.created_at,
    updated_at: user.created_at,
  };

  // Fetch initial courses with counts
  const { data: rawCourses } = await supabase
    .from("courses")
    .select(`
      *,
      assignments:assignments(id, status, progress, due_date, due_time)
    `)
    .order("name", { ascending: true });

  const courses: Course[] = (rawCourses || []).map((c: any) => {
    const list = c.assignments || [];
    const total = list.length;
    const completed = list.filter(
      (a: any) => a.status === "Completed" || a.progress === 100
    ).length;
    const overdue = list.filter((a: any) => {
      if (a.status === "Completed" || a.progress === 100) return false;
      const info = getDeadlineInfo(a.due_date, a.due_time, a.status);
      return info.isOverdue;
    }).length;
    const completion_percentage =
      total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      id: c.id,
      user_id: c.user_id,
      name: c.name,
      code: c.code,
      instructor: c.instructor,
      description: c.description,
      color: c.color,
      created_at: c.created_at,
      updated_at: c.updated_at,
      assignments_count: total,
      completed_count: completed,
      overdue_count: overdue,
      completion_percentage,
    };
  });

  return (
    <AppShell initialProfile={profile} initialCourses={courses}>
      {children}
    </AppShell>
  );
}

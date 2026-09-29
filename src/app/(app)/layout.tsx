import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/layout/AppShell";
import { Course, Profile } from "@/types/database";
import { calculateRoleCourseMetrics } from "@/lib/assignment-state";

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

  // Fetch profile - database profile is authoritative for authorization
  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const profile: Profile = profileData
    ? {
        ...profileData,
        role: profileData.role || "student",
      }
    : {
        id: user.id,
        email: user.email || null,
        display_name:
          user.user_metadata?.display_name ||
          user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          "Student",
        avatar_url: user.user_metadata?.avatar_url || null,
        role: "student",
        institution: user.user_metadata?.institution || null,
        bio: user.user_metadata?.bio || null,
        created_at: user.created_at,
        updated_at: user.created_at,
      };

  // Fetch initial accessible courses
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
    userRole: profile.role,
    userId: user.id,
  });

  return (
    <AppShell initialProfile={profile} initialCourses={courses}>
      {children}
    </AppShell>
  );
}

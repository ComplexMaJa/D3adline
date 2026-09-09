import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SettingsClient } from "./SettingsClient";
import { Profile } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const profile: Profile = profileData
    ? {
        ...profileData,
        role: profileData.role || (user.user_metadata?.role as any) || "student",
        institution: profileData.institution || user.user_metadata?.institution || null,
        bio: profileData.bio || user.user_metadata?.bio || null,
      }
    : {
        id: user.id,
        email: user.email || null,
        display_name:
          user.user_metadata?.display_name ||
          user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          (user.user_metadata?.role === "teacher" ? "Instructor" : "Student"),
        avatar_url: user.user_metadata?.avatar_url || null,
        role: (user.user_metadata?.role as any) || "student",
        institution: user.user_metadata?.institution || null,
        bio: user.user_metadata?.bio || null,
        created_at: user.created_at,
        updated_at: user.created_at,
      };

  return <SettingsClient initialProfile={profile} />;
}

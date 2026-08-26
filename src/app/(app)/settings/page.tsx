import { createClient } from "@/lib/supabase/server";
import { SettingsClient } from "./SettingsClient";
import { Profile } from "@/types/database";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profileData } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id)
    .single();

  const profile: Profile = profileData || {
    id: user?.id || "",
    email: user?.email || null,
    display_name:
      user?.user_metadata?.display_name ||
      user?.email?.split("@")[0] ||
      "Student",
    avatar_url: user?.user_metadata?.avatar_url || null,
    created_at: user?.created_at || new Date().toISOString(),
    updated_at: user?.created_at || new Date().toISOString(),
  };

  return <SettingsClient initialProfile={profile} />;
}

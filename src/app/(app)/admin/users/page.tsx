import { createClient } from "@/lib/supabase/server";
import { AdminUsersClient } from "./AdminUsersClient";
import { Profile } from "@/types/database";

export const metadata = {
  title: "User Management | D3adline Admin",
  description: "Manage user roles and directory",
};

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const { data: profilesData } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  const profiles = (profilesData || []) as Profile[];

  return <AdminUsersClient initialProfiles={profiles} />;
}

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Profile } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { seedSampleData } from "@/lib/sample-data";
import { useApp } from "@/components/layout/AppShell";
import {
  User,
  Mail,
  Sparkles,
  Database,
  Moon,
  LogOut,
  Check,
  AlertCircle,
  Shield,
  Palette,
} from "lucide-react";

interface SettingsClientProps {
  initialProfile: Profile;
}

export function SettingsClient({ initialProfile }: SettingsClientProps) {
  const [profile, setProfile] = React.useState<Profile>(initialProfile);
  const [displayName, setDisplayName] = React.useState(
    initialProfile.display_name || ""
  );
  const [avatarUrl, setAvatarUrl] = React.useState(
    initialProfile.avatar_url || ""
  );
  const [isSaving, setIsSaving] = React.useState(false);
  const [saveSuccess, setSaveSuccess] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);

  const [isSeeding, setIsSeeding] = React.useState(false);
  const [seedSuccess, setSeedSuccess] = React.useState<string | null>(null);

  const [isSignOutModalOpen, setIsSignOutModalOpen] = React.useState(false);
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  const { refreshCourses } = useApp();
  const supabase = createClient();
  const router = useRouter();

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: displayName.trim(),
          avatar_url: avatarUrl.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (error) throw error;

      setProfile((prev) => ({
        ...prev,
        display_name: displayName.trim(),
        avatar_url: avatarUrl.trim() || null,
      }));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      router.refresh();
    } catch (err: unknown) {
      console.error("Error updating profile:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to update profile";
      setSaveError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSeedDemoData = async () => {
    setIsSeeding(true);
    setSeedSuccess(null);

    try {
      const result = await seedSampleData();
      await refreshCourses();
      setSeedSuccess(
        `Created ${result.coursesCount} courses and ${result.assignmentsCount} assignments!`
      );
      setTimeout(() => setSeedSuccess(null), 5000);
      router.refresh();
    } catch (err: unknown) {
      console.error("Error seeding:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to seed demo data";
      setSaveError(errorMessage);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Error signing out:", err);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <Header
        title="Account & Settings"
        description="Manage your student profile, workspace preferences, and application data."
      />

      {/* Profile Card */}
      <Card className="border-[#1E1E1E] bg-[#090909]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-zinc-100">
            <User className="h-4 w-4 text-purple-400" />
            <span>Student Profile</span>
          </CardTitle>
          <CardDescription>
            Your display name and identity across courses
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            {saveSuccess && (
              <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-xs text-emerald-400 flex items-center gap-2">
                <Check className="h-4 w-4" />
                <span>Profile updated successfully!</span>
              </div>
            )}

            {saveError && (
              <div className="p-3 rounded-lg bg-red-950/30 border border-red-900/50 text-xs text-red-400 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>{saveError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Display Name
                </label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your Name"
                  leftIcon={<User className="h-4 w-4" />}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  Email Address
                </label>
                <Input
                  value={profile.email || ""}
                  disabled
                  leftIcon={<Mail className="h-4 w-4" />}
                  className="opacity-60 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                Avatar Image URL (Optional)
              </label>
              <Input
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" isLoading={isSaving} size="sm">
                <span>Save Profile</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Theme & Design System */}
      <Card className="border-[#1E1E1E] bg-[#090909]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-zinc-100">
            <Palette className="h-4 w-4 text-purple-400" />
            <span>Aesthetics & Theme</span>
          </CardTitle>
          <CardDescription>
            System visual identity and AMOLED optimization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg border border-[#1A1A1A] bg-[#050505]">
            <div className="flex items-center gap-2.5">
              <Moon className="h-4 w-4 text-purple-400" />
              <div>
                <p className="text-xs font-semibold text-zinc-200">
                  AMOLED Deep Black Theme
                </p>
                <p className="text-[11px] text-zinc-500">
                  True black (#000000) background with high contrast purple accents
                </p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950/60 text-purple-300 border border-purple-800/40">
              ACTIVE
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Demo Data & Workspace Management */}
      <Card className="border-[#1E1E1E] bg-[#090909]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-zinc-100">
            <Database className="h-4 w-4 text-purple-400" />
            <span>Demo Data & Testing</span>
          </CardTitle>
          <CardDescription>
            Bootstrap realistic university courses and assignments for testing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {seedSuccess && (
            <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-xs text-emerald-400 flex items-center gap-2">
              <Check className="h-4 w-4" />
              <span>{seedSuccess}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg border border-[#1C1C1C] bg-[#050505]">
            <div>
              <p className="text-xs font-semibold text-zinc-200">
                Populate Realistic Sample Courses
              </p>
              <p className="text-[11px] text-zinc-500">
                Adds Data Structures, Database Systems, Software Engineering, and Calculus II with real deadlines.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSeedDemoData}
              isLoading={isSeeding}
              className="shrink-0"
            >
              <Sparkles className="h-3.5 w-3.5 text-purple-400" />
              <span>Seed Data</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security & Sign Out */}
      <Card className="border-[#1E1E1E] bg-[#090909]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-zinc-100">
            <Shield className="h-4 w-4 text-purple-400" />
            <span>Account Security</span>
          </CardTitle>
          <CardDescription>
            Session management and account authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-zinc-200">
              Sign Out of Session
            </p>
            <p className="text-[11px] text-zinc-500">
              Disconnect this browser session from Deadline
            </p>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsSignOutModalOpen(true)}
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out</span>
          </Button>
        </CardContent>
      </Card>

      {/* Sign Out Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isSignOutModalOpen}
        onClose={() => setIsSignOutModalOpen(false)}
        onConfirm={handleSignOut}
        title="Sign Out?"
        description="Are you sure you want to sign out of your Deadline account?"
        confirmText="Sign Out"
        variant="danger"
        isLoading={isSigningOut}
      />
    </div>
  );
}

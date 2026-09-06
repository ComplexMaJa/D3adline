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
  Globe,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { cn } from "@/lib/utils";

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
  const { language, setLanguage, t } = useLanguage();
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
        .upsert({
          id: profile.id,
          email: profile.email,
          display_name: displayName.trim(),
          avatar_url: avatarUrl.trim() || null,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      // Also update auth user metadata for fallback resilience
      await supabase.auth.updateUser({
        data: {
          display_name: displayName.trim(),
          avatar_url: avatarUrl.trim() || null,
        },
      });

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
      await seedSampleData();
      setSeedSuccess(t.settings.demoSuccess);
      await refreshCourses();
      router.refresh();
      setTimeout(() => setSeedSuccess(null), 4000);
    } catch (err: unknown) {
      console.error("Error seeding sample data:", err);
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
      setIsSigningOut(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <Header
        title={t.settings.title}
        description={t.settings.description}
      />

      {/* Profile Card */}
      <Card className="border-[#1E1E1E] bg-[#090909]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-zinc-100">
            <User className="h-4 w-4 text-purple-400" />
            <span>{t.settings.profileTitle}</span>
          </CardTitle>
          <CardDescription>
            {t.settings.profileDescription}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            {saveSuccess && (
              <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-xs text-emerald-400 flex items-center gap-2">
                <Check className="h-4 w-4" />
                <span>{t.settings.profileUpdated}</span>
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
                  {t.settings.displayName}
                </label>
                <Input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={t.settings.displayNamePlaceholder}
                  leftIcon={<User className="h-4 w-4" />}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  {t.settings.emailAddress}
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
                {t.settings.avatarUrl}
              </label>
              <Input
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" isLoading={isSaving} size="sm">
                <span>{t.settings.saveProfileBtn}</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Language & Regional Settings */}
      <Card className="border-[#1E1E1E] bg-[#090909]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-zinc-100">
            <Globe className="h-4 w-4 text-purple-400" />
            <span>{t.settings.languageTitle}</span>
          </CardTitle>
          <CardDescription>
            {t.settings.languageDescription}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* English Option */}
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={cn(
                "flex items-center justify-between p-3.5 rounded-xl border text-left transition-all",
                language === "en"
                  ? "border-purple-600/80 bg-purple-950/20 text-white shadow-purple-glow-sm"
                  : "border-[#1E1E1E] bg-[#050505] text-zinc-300 hover:border-[#2C2C2C] hover:bg-[#0A0A0A]"
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🇬🇧</span>
                <div>
                  <p className="text-xs font-semibold text-zinc-100">
                    {t.settings.languageEnName}
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    {t.settings.languageEnDesc}
                  </p>
                </div>
              </div>
              {language === "en" && (
                <span className="h-2 w-2 rounded-full bg-purple-400 shadow-sm" />
              )}
            </button>

            {/* Bahasa Indonesia Option */}
            <button
              type="button"
              onClick={() => setLanguage("id")}
              className={cn(
                "flex items-center justify-between p-3.5 rounded-xl border text-left transition-all",
                language === "id"
                  ? "border-purple-600/80 bg-purple-950/20 text-white shadow-purple-glow-sm"
                  : "border-[#1E1E1E] bg-[#050505] text-zinc-300 hover:border-[#2C2C2C] hover:bg-[#0A0A0A]"
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🇮🇩</span>
                <div>
                  <p className="text-xs font-semibold text-zinc-100">
                    {t.settings.languageIdName}
                  </p>
                  <p className="text-[11px] text-zinc-500">
                    {t.settings.languageIdDesc}
                  </p>
                </div>
              </div>
              {language === "id" && (
                <span className="h-2 w-2 rounded-full bg-purple-400 shadow-sm" />
              )}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Theme & Design System */}
      <Card className="border-[#1E1E1E] bg-[#090909]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-zinc-100">
            <Palette className="h-4 w-4 text-purple-400" />
            <span>{t.settings.themeTitle}</span>
          </CardTitle>
          <CardDescription>
            {t.settings.themeDescription}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg border border-[#1A1A1A] bg-[#050505]">
            <div className="flex items-center gap-2.5">
              <Moon className="h-4 w-4 text-purple-400" />
              <div>
                <p className="text-xs font-semibold text-zinc-200">
                  {t.settings.themeAmoledName}
                </p>
                <p className="text-[11px] text-zinc-500">
                  {t.settings.themeAmoledDesc}
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
            <span>{t.settings.demoTitle}</span>
          </CardTitle>
          <CardDescription>
            {t.settings.demoDescription}
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
                {t.settings.seedDemoBtn}
              </p>
              <p className="text-[11px] text-zinc-500">
                {t.settings.demoWarning}
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
              <span>{isSeeding ? t.settings.seedingDemo : t.settings.seedDemoBtn}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security & Sign Out */}
      <Card className="border-[#1E1E1E] bg-[#090909]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-zinc-100">
            <Shield className="h-4 w-4 text-purple-400" />
            <span>{t.settings.signOutTitle}</span>
          </CardTitle>
          <CardDescription>
            {t.settings.signOutTitle}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-zinc-200">
              {t.settings.signOutBtn}
            </p>
            <p className="text-[11px] text-zinc-500">
              {t.nav.signOut}
            </p>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsSignOutModalOpen(true)}
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>{t.settings.signOutBtn}</span>
          </Button>
        </CardContent>
      </Card>

      {/* Sign Out Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isSignOutModalOpen}
        onClose={() => setIsSignOutModalOpen(false)}
        onConfirm={handleSignOut}
        title={`${t.settings.signOutBtn}?`}
        description={t.settings.signOutTitle}
        confirmText={t.settings.signOutBtn}
        variant="danger"
        isLoading={isSigningOut}
      />
    </div>
  );
}

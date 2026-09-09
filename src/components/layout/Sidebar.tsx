"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CheckSquare,
  BookOpen,
  Calendar as CalendarIcon,
  Settings as SettingsIcon,
  Plus,
  LogOut,
  Sparkles,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  GraduationCap,
  School,
  KeyRound,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/types/database";
import { useApp } from "./AppShell";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface SidebarProps {
  profile: Profile | null;
  onOpenCreateAssignment?: () => void;
}

export function Sidebar({ profile: propProfile, onOpenCreateAssignment }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const [showCreateMenu, setShowCreateMenu] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const { profile: appProfile, courses, overdueCount, openCreateCourse, openJoinCourse, isTeacher } = useApp();
  const { language, t } = useLanguage();

  const effectiveProfile = appProfile || propProfile;

  // Close create dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCreateMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Compute counts from courses
  const totalCoursesCount = courses.length;
  const totalAssignmentsCount = courses.reduce(
    (acc, c) => acc + (c.assignments_count || 0),
    0
  );

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Error signing out:", err);
      setIsLoggingOut(false);
    }
  };

  const navItems = [
    {
      title: t.nav.dashboard,
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: t.nav.assignments,
      href: "/assignments",
      icon: CheckSquare,
      badge: totalAssignmentsCount > 0 ? totalAssignmentsCount : undefined,
    },
    {
      title: t.nav.courses,
      href: "/courses",
      icon: BookOpen,
      badge: totalCoursesCount > 0 ? totalCoursesCount : undefined,
    },
    {
      title: t.nav.calendar,
      href: "/calendar",
      icon: CalendarIcon,
    },
    {
      title: t.nav.settings,
      href: "/settings",
      icon: SettingsIcon,
    },
  ];

  const displayName =
    effectiveProfile?.display_name || (isTeacher ? "Instructor" : "Student");
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <aside className="hidden md:flex h-screen w-64 flex-col justify-between border-r border-[#1E1E22] bg-[#000000] p-4 fixed left-0 top-0 z-30 select-none">
      {/* Brand & Quick Actions */}
      <div className="space-y-5">
        {/* Brand Header & Role Indicator */}
        <div className="px-1 py-0.5">
          <div className="flex items-center justify-between gap-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 group min-w-0"
            >
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-200 shrink-0",
                  isTeacher
                    ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300 shadow-[0_0_14px_rgba(16,185,129,0.25)] group-hover:border-emerald-400 group-hover:shadow-[0_0_18px_rgba(16,185,129,0.35)]"
                    : "bg-purple-950/60 border-purple-500/40 text-purple-300 shadow-purple-glow-sm group-hover:border-purple-400 group-hover:shadow-purple-glow"
                )}
              >
                {isTeacher ? (
                  <School className="h-4 w-4 text-emerald-300" />
                ) : (
                  <Sparkles className="h-4 w-4 text-purple-300" />
                )}
              </div>
              <div className="min-w-0">
                <span className="text-base font-bold tracking-tight text-white block leading-tight">
                  Deadline
                </span>
                <span className="text-[11px] text-zinc-400 font-normal block leading-tight truncate">
                  {isTeacher
                    ? (language === "id" ? "Konsol Pengajar" : "Instructor Console")
                    : (language === "id" ? "Portal Mahasiswa" : "Assignment Hub")}
                </span>
              </div>
            </Link>

            {/* Role Badge Indicator */}
            <div
              className={cn(
                "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shrink-0 whitespace-nowrap",
                isTeacher
                  ? "bg-emerald-950/90 text-emerald-300 border-emerald-700/60 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                  : "bg-purple-950/90 text-purple-300 border-purple-700/60 shadow-purple-glow-sm"
              )}
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full animate-pulse shrink-0",
                  isTeacher ? "bg-emerald-400" : "bg-purple-400"
                )}
              />
              <span>{isTeacher ? t.auth.roleBadgeTeacher : t.auth.roleBadgeStudent}</span>
            </div>
          </div>
        </div>

        {/* Action Button: Teacher (Instructor Actions) vs Student (Join Class) */}
        {!isTeacher ? (
          <button
            onClick={openJoinCourse}
            className="w-full flex items-center justify-center gap-2 rounded-xl text-white font-semibold text-xs py-2.5 px-3.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 shadow-purple-glow-sm hover:shadow-purple-glow transition-all duration-200 active:scale-[0.98]"
          >
            <KeyRound className="h-4 w-4 text-purple-200" />
            <span>{language === "id" ? "Gabung dengan Kode" : "Join Class with Code"}</span>
          </button>
        ) : (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowCreateMenu((prev) => !prev)}
              className="w-full flex items-center justify-between gap-2 rounded-xl text-white font-medium text-xs py-2.5 px-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-[0_0_15px_rgba(16,185,129,0.25)] hover:shadow-[0_0_20px_rgba(16,185,129,0.35)] transition-all duration-200 active:scale-[0.98]"
            >
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span className="font-semibold text-xs">{language === "id" ? "Aksi Pengajar" : "Instructor Actions"}</span>
              </div>
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 opacity-80 transition-transform duration-200",
                  showCreateMenu && "rotate-180"
                )}
              />
            </button>

            {showCreateMenu && (
              <div className="absolute left-0 right-0 top-full mt-1.5 rounded-xl border border-[#242424] bg-[#0C0C0C] p-1.5 shadow-2xl z-50 animate-scale-up">
                <button
                  onClick={() => {
                    setShowCreateMenu(false);
                    onOpenCreateAssignment?.();
                  }}
                  className="w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-zinc-200 hover:bg-emerald-950/40 hover:text-emerald-300 transition-colors text-left font-medium"
                >
                  <CheckSquare className="h-3.5 w-3.5 text-emerald-400" />
                  <span>{language === "id" ? "Beri Tugas Baru" : "Give New Assignment"}</span>
                </button>
                <button
                  onClick={() => {
                    setShowCreateMenu(false);
                    openCreateCourse();
                  }}
                  className="w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-zinc-200 hover:bg-teal-950/40 hover:text-teal-300 transition-colors text-left font-medium"
                >
                  <BookOpen className="h-3.5 w-3.5 text-teal-400" />
                  <span>{t.nav.newCourse}</span>
                </button>
              </div>
            )}
          </div>
        )}


        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between rounded-lg px-3 py-2.5 text-xs font-medium transition-all duration-150 relative group",
                  isActive
                    ? "bg-[#141414] text-white border border-[#242424] shadow-sm font-semibold"
                    : "text-zinc-400 hover:bg-[#0A0A0A] hover:text-zinc-200 border border-transparent"
                )}
              >
                <div className="flex items-center gap-3">
                  {isActive && (
                    <div
                      className={cn(
                        "absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full",
                        isTeacher
                          ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                          : "bg-purple-500 shadow-purple-glow"
                      )}
                    />
                  )}
                  <Icon
                    className={cn(
                      "h-4 w-4 transition-colors",
                      isActive
                        ? isTeacher
                          ? "text-emerald-400"
                          : "text-purple-400"
                        : "text-zinc-500 group-hover:text-zinc-300"
                    )}
                  />
                  <span>{item.title}</span>
                </div>

                {item.badge !== undefined && (
                  <span
                    className={cn(
                      "text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-colors",
                      isActive
                        ? isTeacher
                          ? "bg-emerald-950/80 text-emerald-300 border-emerald-800/50"
                          : "bg-purple-950/80 text-purple-300 border-purple-800/50"
                        : "bg-[#111111] text-zinc-400 border-[#1E1E1E]"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Overdue Alert & User Profile */}
      <div className="space-y-3 pt-3 border-t border-[#18181C]">
        {/* Overdue alert card */}
        {overdueCount > 0 && (
          <Link
            href="/assignments?status=Overdue"
            className="flex items-center justify-between p-2.5 rounded-xl border border-red-950/40 bg-gradient-to-r from-red-950/20 via-[#0A0606] to-[#080808] hover:border-red-900/60 transition-all group animate-fade-in"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-7 w-7 rounded-lg bg-red-950/80 border border-red-800/60 flex items-center justify-center text-red-400 shrink-0">
                <AlertTriangle className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-red-300 group-hover:text-red-200 transition-colors truncate">
                  {overdueCount} {t.nav.overdueCount}
                </p>
                <p className="text-[10px] text-zinc-500 truncate">
                  {t.nav.overdueNotice}
                </p>
              </div>
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-zinc-300 transition-colors shrink-0" />
          </Link>
        )}

        {/* User Card */}
        <div
          className={cn(
            "rounded-xl border p-2.5 transition-all bg-[#090909]",
            isTeacher
              ? "border-emerald-950/80 hover:border-emerald-800/60"
              : "border-purple-950/80 hover:border-purple-800/60"
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <Link
              href="/settings"
              className="flex items-center gap-2.5 min-w-0 flex-1 group"
            >
              {/* Avatar */}
              <div
                className={cn(
                  "relative h-9 w-9 rounded-xl flex items-center justify-center shrink-0 overflow-hidden text-xs font-bold border transition-all",
                  isTeacher
                    ? "bg-emerald-950/90 border-emerald-600/50 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)] group-hover:border-emerald-400"
                    : "bg-purple-950/90 border-purple-600/50 text-purple-300 shadow-purple-glow-sm group-hover:border-purple-400"
                )}
              >
                {effectiveProfile?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={effectiveProfile.avatar_url}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="font-bold text-xs">{userInitial}</span>
                )}
                {/* Role indicator mini dot on avatar */}
                <span
                  className={cn(
                    "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-black",
                    isTeacher ? "bg-emerald-400" : "bg-purple-400"
                  )}
                />
              </div>

              {/* User info */}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors truncate">
                  {displayName}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={cn(
                      "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider inline-flex items-center gap-1 border shrink-0 whitespace-nowrap",
                      isTeacher
                        ? "bg-emerald-950/90 text-emerald-300 border-emerald-800/60"
                        : "bg-purple-950/90 text-purple-300 border-purple-800/60"
                    )}
                  >
                    {isTeacher ? (
                      <School className="h-2.5 w-2.5" />
                    ) : (
                      <GraduationCap className="h-2.5 w-2.5" />
                    )}
                    <span>{isTeacher ? t.auth.roleBadgeTeacher : t.auth.roleBadgeStudent}</span>
                  </span>
                  {effectiveProfile?.institution && (
                    <span
                      className="text-[10px] text-zinc-500 truncate min-w-0"
                      title={effectiveProfile.institution}
                    >
                      • {effectiveProfile.institution}
                    </span>
                  )}
                </div>
              </div>
            </Link>

            {/* Sign Out Button */}
            <button
              onClick={handleSignOut}
              disabled={isLoggingOut}
              title={t.nav.signOut}
              className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-950/40 transition-colors shrink-0"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}

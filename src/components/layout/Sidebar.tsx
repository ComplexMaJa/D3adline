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
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/types/database";
import { useApp } from "./AppShell";

interface SidebarProps {
  profile: Profile | null;
  onOpenCreateAssignment?: () => void;
}

export function Sidebar({ profile, onOpenCreateAssignment }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const [showCreateMenu, setShowCreateMenu] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const { courses, openCreateCourse } = useApp();

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
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Assignments",
      href: "/assignments",
      icon: CheckSquare,
      badge: totalAssignmentsCount > 0 ? totalAssignmentsCount : undefined,
    },
    {
      title: "Courses",
      href: "/courses",
      icon: BookOpen,
      badge: totalCoursesCount > 0 ? totalCoursesCount : undefined,
    },
    {
      title: "Calendar",
      href: "/calendar",
      icon: CalendarIcon,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: SettingsIcon,
    },
  ];

  const displayName = profile?.display_name || "Student";
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <aside className="hidden md:flex h-screen w-64 flex-col justify-between border-r border-[#141414] bg-[#000000] p-4 fixed left-0 top-0 z-30 select-none">
      {/* Brand & Quick Actions */}
      <div className="space-y-6">
        {/* Logo Header */}
        <Link
          href="/dashboard"
          className="flex items-center gap-3 px-1 py-1 group transition-all"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-400 shadow-purple-glow-sm group-hover:border-purple-400 group-hover:shadow-purple-glow transition-all">
            <Sparkles className="h-4 w-4 text-purple-300" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-bold tracking-tight text-white">
                Deadline
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-950/90 text-purple-300 border border-purple-700/50 uppercase tracking-wide">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 font-normal">Assignment Hub</p>
          </div>
        </Link>

        {/* Primary Create Button with dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowCreateMenu((prev) => !prev)}
            className="w-full flex items-center justify-between gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-medium text-xs py-2.5 px-3.5 transition-all duration-200 shadow-purple-glow-sm hover:shadow-purple-glow active:scale-[0.98]"
          >
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span className="font-semibold text-xs">Create</span>
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
                className="w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-zinc-200 hover:bg-purple-950/40 hover:text-purple-300 transition-colors text-left font-medium"
              >
                <CheckSquare className="h-3.5 w-3.5 text-purple-400" />
                <span>New Assignment</span>
              </button>
              <button
                onClick={() => {
                  setShowCreateMenu(false);
                  openCreateCourse();
                }}
                className="w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs text-zinc-200 hover:bg-purple-950/40 hover:text-purple-300 transition-colors text-left font-medium"
              >
                <BookOpen className="h-3.5 w-3.5 text-blue-400" />
                <span>New Course</span>
              </button>
            </div>
          )}
        </div>

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
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-purple-500 shadow-purple-glow" />
                  )}
                  <Icon
                    className={cn(
                      "h-4 w-4 transition-colors",
                      isActive
                        ? "text-purple-400"
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
                        ? "bg-purple-950/80 text-purple-300 border-purple-800/50"
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
      <div className="space-y-3 pt-4">
        {/* Overdue alert card matching reference */}
        <Link
          href="/assignments?status=Overdue"
          className="flex items-center justify-between p-2.5 rounded-xl border border-red-950/40 bg-gradient-to-r from-red-950/20 via-[#0A0606] to-[#080808] hover:border-red-900/60 transition-all group"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-7 w-7 rounded-lg bg-red-950/80 border border-red-800/60 flex items-center justify-center text-red-400 shrink-0">
              <AlertTriangle className="h-3.5 w-3.5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-red-300 group-hover:text-red-200 transition-colors truncate">
                1 Overdue
              </p>
              <p className="text-[10px] text-zinc-500 truncate">
                Needs your attention
              </p>
            </div>
          </div>
          <ChevronRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-zinc-300 transition-colors shrink-0" />
        </Link>

        {/* User Card */}
        <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#080808] border border-[#181818]">
          <Link
            href="/settings"
            className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-80 transition-opacity"
          >
            <div className="h-8 w-8 rounded-full bg-purple-950/80 border border-purple-700/60 flex items-center justify-center text-purple-200 shrink-0 overflow-hidden text-xs font-bold shadow-purple-glow-sm">
              {profile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt={displayName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span>{userInitial}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-zinc-200 truncate">
                {displayName}
              </p>
              <p className="text-[10px] text-zinc-500 truncate">
                {profile?.email || "student@deadline.app"}
              </p>
            </div>
          </Link>
          <button
            onClick={handleSignOut}
            disabled={isLoggingOut}
            title="Sign Out"
            className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

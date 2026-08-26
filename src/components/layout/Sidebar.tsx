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
  User,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/types/database";

interface SidebarProps {
  profile: Profile | null;
  onOpenCreateAssignment?: () => void;
}

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
  },
  {
    title: "Courses",
    href: "/courses",
    icon: BookOpen,
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

export function Sidebar({ profile, onOpenCreateAssignment }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const supabase = createClient();

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

  return (
    <aside className="hidden md:flex h-screen w-64 flex-col justify-between border-r border-[#181818] bg-[#050505] p-4 fixed left-0 top-0 z-30 select-none">
      {/* Brand & Quick Actions */}
      <div className="space-y-6">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 px-2 py-1.5 group transition-all"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-400 shadow-purple-glow-sm group-hover:border-purple-400 transition-colors">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
              Deadline
              <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-purple-950/80 text-purple-300 border border-purple-800/40">
                PRO
              </span>
            </h1>
            <p className="text-[11px] text-zinc-500 font-normal">Assignment Hub</p>
          </div>
        </Link>

        {/* Quick New Assignment Button */}
        {onOpenCreateAssignment && (
          <button
            onClick={onOpenCreateAssignment}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-medium text-xs py-2.5 px-3 transition-all duration-200 shadow-purple-glow-sm hover:shadow-purple-glow active:scale-[0.98]"
          >
            <Plus className="h-4 w-4" />
            <span>Create Assignment</span>
          </button>
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
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition-all duration-150 relative group",
                  isActive
                    ? "bg-[#141414] text-purple-300 border border-[#242424] shadow-sm"
                    : "text-zinc-400 hover:bg-[#0E0E0E] hover:text-zinc-200 border border-transparent"
                )}
              >
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
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User profile & Logout */}
      <div className="border-t border-[#161616] pt-3">
        <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-[#090909] border border-[#1C1C1C]">
          <Link
            href="/settings"
            className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-80 transition-opacity"
          >
            <div className="h-8 w-8 rounded-full bg-purple-950/60 border border-purple-800/40 flex items-center justify-center text-purple-300 shrink-0 overflow-hidden text-xs font-semibold">
              {profile?.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={profile.avatar_url}
                  alt={profile.display_name || "User"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-4 w-4" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-zinc-200 truncate">
                {profile?.display_name || "Student"}
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

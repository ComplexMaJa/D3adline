"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CheckSquare,
  BookOpen,
  Calendar as CalendarIcon,
  Settings as SettingsIcon,
  Plus,
  Sparkles,
  KeyRound,
  Shield,
  Users,
  Award,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useApp } from "@/components/layout/AppShell";

interface MobileNavProps {
  onOpenCreateAssignment?: () => void;
}

export function MobileNav({ onOpenCreateAssignment }: MobileNavProps) {
  const pathname = usePathname();
  const { t, language } = useLanguage();
  const { isTeacher, isAdmin, openJoinCourse } = useApp();

  const mobileItems = React.useMemo(() => {
    if (isAdmin) {
      return [
        {
          title: t.nav.dashboard,
          href: "/admin",
          icon: LayoutDashboard,
        },
        {
          title: language === "id" ? "Pengguna" : "Users",
          href: "/admin/users",
          icon: Users,
        },
        {
          title: language === "id" ? "Kelas" : "Classes",
          href: "/admin/courses",
          icon: BookOpen,
        },
        {
          title: language === "id" ? "Tugas" : "Tasks",
          href: "/admin/assignments",
          icon: CheckSquare,
        },
        {
          title: language === "id" ? "Nilai" : "Grades",
          href: "/admin/submissions",
          icon: Award,
        },
        {
          title: t.nav.settings,
          href: "/settings",
          icon: SettingsIcon,
        },
      ];
    }

    if (isTeacher) {
      return [
        {
          title: t.nav.dashboard,
          href: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: language === "id" ? "Kelas" : "Classes",
          href: "/courses",
          icon: BookOpen,
        },
        {
          title: t.nav.assignments,
          href: "/assignments",
          icon: CheckSquare,
        },
        {
          title: language === "id" ? "Nilai" : "Submissions",
          href: "/submissions",
          icon: Award,
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
    }

    return [
      {
        title: t.nav.dashboard,
        href: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: language === "id" ? "Kelas" : "Classes",
        href: "/courses",
        icon: BookOpen,
      },
      {
        title: t.nav.assignments,
        href: "/assignments",
        icon: CheckSquare,
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
  }, [isAdmin, isTeacher, language, t]);

  return (
    <>
      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between border-b border-[#1A1A1A] bg-[#050505]/95 px-4 py-2.5 backdrop-blur-md">
        <Link href={isAdmin ? "/admin" : "/dashboard"} className="flex items-center gap-2">
          <div
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-lg border",
              isAdmin
                ? "bg-amber-950/60 border-amber-500/40 text-amber-300"
                : isTeacher
                ? "bg-emerald-950/60 border-emerald-500/40 text-emerald-300"
                : "bg-purple-600/20 border-purple-500/40 text-purple-400"
            )}
          >
            {isAdmin ? (
              <Shield className="h-3.5 w-3.5" />
            ) : isTeacher ? (
              <BookOpen className="h-3.5 w-3.5" />
            ) : (
              <Sparkles className="h-3.5 w-3.5" />
            )}
          </div>
          <span className="text-sm font-bold tracking-tight text-white">
            Deadline
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          {isAdmin ? (
            <Link
              href="/admin/users"
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-semibold px-2.5 py-1.5 shadow-[0_0_10px_rgba(245,158,11,0.3)]"
            >
              <Users className="h-3.5 w-3.5" />
              <span>{language === "id" ? "Pengguna" : "Users"}</span>
            </Link>
          ) : isTeacher ? (
            onOpenCreateAssignment && (
              <button
                onClick={onOpenCreateAssignment}
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold px-2.5 py-1.5 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{language === "id" ? "Beri Tugas" : "Give"}</span>
              </button>
            )
          ) : (
            <button
              onClick={openJoinCourse}
              className="flex items-center gap-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium px-2.5 py-1.5 shadow-purple-glow-sm"
            >
              <KeyRound className="h-3.5 w-3.5" />
              <span>{language === "id" ? "Gabung" : "Join"}</span>
            </button>
          )}
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[#181818] bg-[#060606]/95 px-2 py-2 backdrop-blur-lg">
        <div className="flex items-center justify-around">
          {mobileItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && item.href !== "/admin" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors",
                  isActive
                    ? isAdmin
                      ? "text-amber-400 font-semibold"
                      : isTeacher
                      ? "text-emerald-400 font-semibold"
                      : "text-purple-400 font-semibold"
                    : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4",
                    isActive
                      ? isAdmin
                        ? "text-amber-400"
                        : isTeacher
                        ? "text-emerald-400"
                        : "text-purple-400"
                      : "text-zinc-500"
                  )}
                />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

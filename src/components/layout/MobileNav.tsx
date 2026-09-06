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
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

interface MobileNavProps {
  onOpenCreateAssignment?: () => void;
}

export function MobileNav({ onOpenCreateAssignment }: MobileNavProps) {
  const pathname = usePathname();
  const { t } = useLanguage();

  const mobileItems = [
    {
      title: t.nav.dashboard,
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: t.nav.assignments,
      href: "/assignments",
      icon: CheckSquare,
    },
    {
      title: t.nav.courses,
      href: "/courses",
      icon: BookOpen,
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

  return (
    <>
      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between border-b border-[#1A1A1A] bg-[#050505]/95 px-4 py-2.5 backdrop-blur-md">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-600/20 border border-purple-500/40 text-purple-400">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <span className="text-sm font-bold tracking-tight text-white">
            Deadline
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          {onOpenCreateAssignment && (
            <button
              onClick={onOpenCreateAssignment}
              className="flex items-center gap-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium px-2.5 py-1.5 shadow-purple-glow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{t.common.create}</span>
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
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-medium transition-colors",
                  isActive
                    ? "text-purple-400"
                    : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5",
                    isActive ? "text-purple-400" : "text-zinc-500"
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

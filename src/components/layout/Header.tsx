"use client";

import * as React from "react";
import { format } from "date-fns";
import { Clock } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

interface HeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function Header({ title, description, action }: HeaderProps) {
  const [currentDate, setCurrentDate] = React.useState<string>("");
  const { dateLocale } = useLanguage();

  React.useEffect(() => {
    setCurrentDate(format(new Date(), "EEEE, d MMMM yyyy", { locale: dateLocale }));
    const timer = setInterval(() => {
      setCurrentDate(format(new Date(), "EEEE, d MMMM yyyy", { locale: dateLocale }));
    }, 60000);
    return () => clearInterval(timer);
  }, [dateLocale]);

  return (
    <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#141414] mb-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {title}
          </h1>
        </div>
        {description && (
          <p className="mt-1 text-xs text-zinc-400 max-w-xl">{description}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        <LanguageSwitcher />

        {currentDate && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0A0A0A] border border-[#1C1C1C] text-zinc-400 text-xs font-medium">
            <Clock className="h-3.5 w-3.5 text-purple-400" />
            <span>{currentDate}</span>
          </div>
        )}
        {action}
      </div>
    </header>
  );
}

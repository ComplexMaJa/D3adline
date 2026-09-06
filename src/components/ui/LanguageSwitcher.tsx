"use client";

import * as React from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface LanguageSwitcherProps {
  className?: string;
  showIcon?: boolean;
}

export function LanguageSwitcher({
  className,
  showIcon = true,
}: LanguageSwitcherProps) {
  const { language, toggleLanguage, setLanguage } = useLanguage();

  return (
    <div
      className={cn(
        "inline-flex items-center p-0.5 rounded-lg border border-[#1E1E1E] bg-[#0A0A0A] text-xs select-none",
        className
      )}
      title={language === "en" ? "Ganti ke Bahasa Indonesia" : "Switch to English"}
    >
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all",
          language === "en"
            ? "bg-purple-600 text-white shadow-sm font-semibold"
            : "text-zinc-400 hover:text-zinc-200 hover:bg-[#141414]"
        )}
      >
        <span className="text-[11px]">🇬🇧</span>
        <span>EN</span>
      </button>

      <button
        type="button"
        onClick={() => setLanguage("id")}
        className={cn(
          "flex items-center gap-1.5 px-2.5 py-1 rounded-md font-medium transition-all",
          language === "id"
            ? "bg-purple-600 text-white shadow-sm font-semibold"
            : "text-zinc-400 hover:text-zinc-200 hover:bg-[#141414]"
        )}
      >
        <span className="text-[11px]">🇮🇩</span>
        <span>ID</span>
      </button>
    </div>
  );
}

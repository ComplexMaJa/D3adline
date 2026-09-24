"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { landingTranslations } from "@/lib/i18n/translations/landing";

export function LandingFooter() {
  const { language, setLanguage } = useLanguage();
  const t = landingTranslations[language].footer;

  const handleScrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="border-t border-white/[0.04] bg-black text-zinc-500 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Col 1: Brand & Tagline */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 group cursor-hover">
              <div className="relative h-7 w-7 rounded-lg overflow-hidden shadow-sm shrink-0">
                <Image
                  src="/logo.png"
                  alt="Deadline Logo"
                  width={28}
                  height={28}
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="text-sm font-display font-bold tracking-tight text-white group-hover:text-purple-200 transition-colors">
                Deadline
              </span>
            </Link>
            <p className="text-xs text-zinc-600 leading-relaxed">
              {t.tagline}
            </p>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-mono font-bold uppercase tracking-widest text-zinc-400">
              {t.navigationHeader}
            </h3>
            <ul className="space-y-2 text-xs">
              {[
                { label: "Features", href: "#features" },
                { label: "Product Preview", href: "#preview" },
                { label: "How It Works", href: "#how-it-works" },
                { label: "Pricing", href: "#pricing" },
                { label: "FAQ", href: "#faq" },
              ].map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={(e) => handleScrollToSection(e, item.href)}
                    className="text-zinc-600 hover:text-zinc-300 transition-colors cursor-hover"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Resources */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-mono font-bold uppercase tracking-widest text-zinc-400">
              {t.resourcesHeader}
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/login" className="text-zinc-600 hover:text-zinc-300 transition-colors cursor-hover">
                  Student Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-zinc-600 hover:text-zinc-300 transition-colors cursor-hover">
                  Create Account
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-zinc-600 hover:text-zinc-300 transition-colors cursor-hover">
                  Instructor Portal
                </Link>
              </li>
              <li>
                <span className="text-zinc-700 cursor-not-allowed">
                  API Docs (Coming Soon)
                </span>
              </li>
            </ul>
          </div>

          {/* Col 4: Language & Status */}
          <div className="space-y-3">
            <h3 className="text-[11px] font-mono font-bold uppercase tracking-widest text-zinc-400">
              {t.language}
            </h3>
            <div
              className="inline-flex items-center rounded-full bg-white/[0.03] border border-white/[0.05] p-0.5 text-xs font-medium"
              role="group"
              aria-label="Footer language selection"
            >
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`px-3 py-1 rounded-full transition-all cursor-hover ${
                  language === "en"
                    ? "bg-purple-600 text-white font-semibold shadow-purple-glow-sm"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
                aria-pressed={language === "en"}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLanguage("id")}
                className={`px-3 py-1 rounded-full transition-all cursor-hover ${
                  language === "id"
                    ? "bg-purple-600 text-white font-semibold shadow-purple-glow-sm"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
                aria-pressed={language === "id"}
              >
                Indonesia
              </button>
            </div>
            <div className="pt-2 flex items-center gap-2 text-xs text-emerald-500/70">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>All systems operational</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-700">
          <p>
            Deadline &copy; {new Date().getFullYear()} &mdash; {t.rights}
          </p>
          <div className="flex items-center gap-6">
            <span className="hover:text-zinc-400 cursor-pointer cursor-hover">{t.privacy}</span>
            <span className="hover:text-zinc-400 cursor-pointer cursor-hover">{t.terms}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

"use client";

import * as React from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { landingTranslations } from "@/lib/i18n/translations/landing";
import { useInView, useCountUp, useReducedMotion } from "@/lib/hooks/useMotion";
import { CheckCircle2, Users, Flame, Star, Sparkles, Award } from "lucide-react";

// ========================================
// Animated Counter Stat Card
// ========================================
function AnimatedStatCard({
  target,
  suffix = "",
  prefix = "",
  decimals = 0,
  label,
  icon: Icon,
  badgeText,
}: {
  target: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  label: string;
  icon: React.ElementType;
  badgeText?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { threshold: 0.3 });
  const count = useCountUp(target, isInView, 2200);

  const displayValue =
    decimals > 0
      ? count.toFixed(decimals)
      : Math.floor(count).toLocaleString();

  return (
    <div
      ref={ref}
      className="group relative flex flex-col items-center sm:items-start text-center sm:text-left p-5 sm:p-6 rounded-2xl border border-white/[0.05] bg-[#0A0A0C]/60 hover:bg-[#100D1C]/80 hover:border-purple-500/30 transition-all duration-300 backdrop-blur-md shadow-lg hover:shadow-[0_0_25px_-5px_rgba(139,92,246,0.18)]"
    >
      {/* Top Accent Icon & Badge */}
      <div className="flex items-center justify-between w-full mb-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 group-hover:scale-110 group-hover:bg-purple-500/20 group-hover:text-purple-300 transition-all duration-300">
          <Icon className="h-4 w-4" />
        </div>
        {badgeText && (
          <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-white/[0.04] text-zinc-400 border border-white/[0.06] group-hover:border-purple-500/30 group-hover:text-purple-300 transition-colors">
            {badgeText}
          </span>
        )}
      </div>

      {/* Counter Number */}
      <div className="flex items-baseline gap-0.5">
        <span className="text-3xl sm:text-4xl lg:text-[42px] font-display font-bold tracking-tight text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:via-purple-200 group-hover:to-purple-400 transition-all duration-300 leading-none">
          {prefix}{displayValue}{suffix}
        </span>
      </div>

      {/* Label */}
      <span className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed max-w-[200px]">
        {label}
      </span>
    </div>
  );
}

// ========================================
// Institution SVG Logo Definitions
// ========================================
interface UniversityLogo {
  id: string;
  name: string;
  subtitle: string;
  renderLogo: () => React.ReactNode;
}

const universityLogos: UniversityLogo[] = [
  {
    id: "mit",
    name: "MIT",
    subtitle: "Massachusetts Institute of Technology",
    renderLogo: () => (
      <svg viewBox="0 0 92 28" className="h-5 w-auto fill-current">
        {/* M */}
        <rect x="0" y="0" width="5.5" height="28" rx="0.5" />
        <rect x="11" y="0" width="5.5" height="19" rx="0.5" />
        <rect x="22" y="0" width="5.5" height="28" rx="0.5" />
        {/* I */}
        <rect x="33" y="0" width="5.5" height="28" rx="0.5" />
        {/* T */}
        <rect x="44" y="0" width="28" height="5.5" rx="0.5" />
        <rect x="55.2" y="5.5" width="5.5" height="22.5" rx="0.5" />
      </svg>
    ),
  },
  {
    id: "stanford",
    name: "Stanford",
    subtitle: "Stanford University",
    renderLogo: () => (
      <svg viewBox="0 0 24 28" className="h-5 w-auto fill-current">
        <path d="M12 1L8 8h3l-4 6h4l-5 8h12l-5-8h4l-4-6h3L12 1z" />
        <rect x="10.5" y="23" width="3" height="4" rx="0.5" />
      </svg>
    ),
  },
  {
    id: "berkeley",
    name: "UC Berkeley",
    subtitle: "University of California, Berkeley",
    renderLogo: () => (
      <svg viewBox="0 0 28 28" className="h-5 w-auto fill-none stroke-current" strokeWidth="1.5">
        <circle cx="14" cy="14" r="12" />
        <circle cx="14" cy="14" r="9" strokeDasharray="2 2" />
        <path d="M14 6v16M6 14h16M8.34 8.34l11.32 11.32M8.34 19.66L19.66 8.34" strokeWidth="1" />
        <circle cx="14" cy="14" r="2.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    id: "harvard",
    name: "Harvard",
    subtitle: "Harvard University",
    renderLogo: () => (
      <svg viewBox="0 0 24 28" className="h-5 w-auto fill-none stroke-current" strokeWidth="1.5">
        <path d="M3 3h18v14c0 6-9 10-9 10S3 23 3 17V3z" />
        <path d="M6 7h4v4H6zm8 0h4v4h-4zm-4 7h4v4h-4z" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    id: "eth",
    name: "ETH Zürich",
    subtitle: "Swiss Federal Institute of Technology",
    renderLogo: () => (
      <svg viewBox="0 0 28 28" className="h-5 w-auto fill-current">
        <rect x="2" y="2" width="10" height="10" rx="2" />
        <rect x="16" y="2" width="10" height="10" rx="2" opacity="0.8" />
        <rect x="2" y="16" width="10" height="10" rx="2" opacity="0.6" />
        <rect x="16" y="16" width="10" height="10" rx="2" />
      </svg>
    ),
  },
  {
    id: "oxford",
    name: "Oxford",
    subtitle: "University of Oxford",
    renderLogo: () => (
      <svg viewBox="0 0 24 28" className="h-5 w-auto fill-none stroke-current" strokeWidth="1.5">
        <path d="M3 4c0-1 1-2 2-2h14c1 0 2 1 2 2v14c0 6-9 9-9 9S3 24 3 18V4z" />
        <path d="M6 7l6 2 6-2v8l-6 2-6-2V7z" />
        <path d="M12 9v8" />
      </svg>
    ),
  },
  {
    id: "cambridge",
    name: "Cambridge",
    subtitle: "University of Cambridge",
    renderLogo: () => (
      <svg viewBox="0 0 24 28" className="h-5 w-auto fill-none stroke-current" strokeWidth="1.5">
        <path d="M3 3h18v13c0 7-9 11-9 11S3 23 3 16V3z" />
        <path d="M3 10h18M12 3v20" strokeWidth="1" />
        <circle cx="7.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="16.5" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="7.5" cy="15.5" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="16.5" cy="15.5" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    id: "nus",
    name: "NUS Singapore",
    subtitle: "National University of Singapore",
    renderLogo: () => (
      <svg viewBox="0 0 24 28" className="h-5 w-auto fill-none stroke-current" strokeWidth="1.5">
        <path d="M3 3h18v13c0 6-9 10-9 10S3 22 3 16V3z" />
        <path d="M7 8l5-3 5 3v6l-5 4-5-4V8z" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    id: "itb",
    name: "ITB",
    subtitle: "Institut Teknologi Bandung",
    renderLogo: () => (
      <svg viewBox="0 0 26 28" className="h-5 w-auto fill-none stroke-current" strokeWidth="1.5">
        <polygon points="13,1 24,7 24,21 13,27 2,21 2,7" />
        <circle cx="13" cy="14" r="5" fill="currentColor" stroke="none" />
        <line x1="13" y1="1" x2="13" y2="9" />
        <line x1="13" y1="19" x2="13" y2="27" />
      </svg>
    ),
  },
  {
    id: "ui",
    name: "Universitas Indonesia",
    subtitle: "UI Depok & Salemba",
    renderLogo: () => (
      <svg viewBox="0 0 26 28" className="h-5 w-auto fill-none stroke-current" strokeWidth="1.5">
        <circle cx="13" cy="14" r="11" />
        <circle cx="13" cy="14" r="6" />
        <path d="M13 3v5M13 20v5M3 14h5M18 14h5" />
        <circle cx="13" cy="14" r="2.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    id: "cmu",
    name: "Carnegie Mellon",
    subtitle: "Carnegie Mellon University",
    renderLogo: () => (
      <svg viewBox="0 0 26 28" className="h-5 w-auto fill-current">
        <path d="M3 5h5v18H3V5zm7 0h6v18h-6V5zm8 0h5v18h-5V5z" opacity="0.9" />
      </svg>
    ),
  },
  {
    id: "imperial",
    name: "Imperial College",
    subtitle: "Imperial College London",
    renderLogo: () => (
      <svg viewBox="0 0 26 28" className="h-5 w-auto fill-none stroke-current" strokeWidth="1.5">
        <rect x="3" y="3" width="20" height="22" rx="4" />
        <path d="M8 8h10M13 8v12M8 20h10" />
      </svg>
    ),
  },
];

// ========================================
// Seamless Logo Marquee Ticker
// ========================================
function UniversityLogoMarquee() {
  const prefersReduced = useReducedMotion();

  return (
    <div className="relative overflow-hidden py-4 group">
      {/* High-contrast AMOLED side feather gradient masks */}
      <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-r from-black via-black/90 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-l from-black via-black/90 to-transparent z-10 pointer-events-none" />

      <div
        className={`flex items-center gap-4 sm:gap-6 whitespace-nowrap group-hover:[animation-play-state:paused] ${
          prefersReduced ? "" : "animate-marquee"
        }`}
        style={{ width: "max-content" }}
      >
        {/* Double array for infinite loop */}
        {[...universityLogos, ...universityLogos].map((item, index) => (
          <div
            key={`${item.id}-${index}`}
            className="group/badge flex items-center gap-3.5 px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl border border-white/[0.06] bg-[#09090C]/80 hover:bg-[#120F22]/90 hover:border-purple-500/40 transition-all duration-300 shrink-0 shadow-sm hover:shadow-[0_0_24px_-4px_rgba(139,92,246,0.3)] cursor-default"
          >
            {/* Logo Graphic */}
            <div className="text-zinc-500 group-hover/badge:text-purple-300 transition-colors duration-300 shrink-0 flex items-center justify-center">
              {item.renderLogo()}
            </div>

            {/* Typography */}
            <div className="flex flex-col text-left">
              <span className="text-xs sm:text-sm font-semibold tracking-wide text-zinc-300 group-hover/badge:text-white transition-colors duration-300">
                {item.name}
              </span>
              <span className="text-[10px] font-medium text-zinc-600 group-hover/badge:text-purple-400/80 transition-colors duration-300 hidden sm:block">
                {item.subtitle}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ========================================
// Main Trust Bar & Bottom Stats Section
// ========================================
export function TrustBar() {
  const { language } = useLanguage();
  const t = landingTranslations[language].trustBar;
  const isId = language === "id";

  return (
    <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 mb-20 sm:mb-28">
      {/* Elevated Stats Card Panel */}
      <div className="relative rounded-3xl border border-white/[0.07] bg-[#07070A]/85 backdrop-blur-2xl p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95),0_0_35px_-8px_rgba(139,92,246,0.12)] overflow-hidden">
        {/* Subtle Ambient Glow inside panel */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-32 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent pointer-events-none" />

        {/* 4 Kinetic Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
          <AnimatedStatCard
            target={10000}
            suffix="+"
            label={t.deadlinesLabel}
            icon={CheckCircle2}
            badgeText={isId ? "Terkirim" : "On Track"}
          />
          <AnimatedStatCard
            target={500}
            suffix="+"
            label={t.usersLabel}
            icon={Users}
            badgeText={isId ? "Komunitas" : "Active"}
          />
          <AnimatedStatCard
            target={99.4}
            suffix="%"
            decimals={1}
            label={t.completionLabel}
            icon={Flame}
            badgeText={isId ? "Tepat Waktu" : "Precision"}
          />
          <AnimatedStatCard
            target={4.9}
            suffix=" / 5.0"
            decimals={1}
            label={t.ratingLabel}
            icon={Star}
            badgeText={isId ? "Kepuasan" : "Top Rated"}
          />
        </div>

        {/* Institutional Trust Divider & Header */}
        <div className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-white/[0.06] relative z-10">
          <div className="flex items-center justify-center gap-3 sm:gap-4 mb-6">
            <div className="h-px w-8 sm:w-16 bg-gradient-to-r from-transparent to-purple-500/40" />
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-purple-500/20 bg-purple-500/10 text-purple-300 text-[11px] font-semibold uppercase tracking-widest shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
              <span>
                {isId
                  ? "Dipercaya Mahasiswa & Pengajar di Berbagai Kampus Ternama"
                  : "Trusted by Students & Educators at World-Class Institutions"}
              </span>
            </div>
            <div className="h-px w-8 sm:w-16 bg-gradient-to-l from-transparent to-purple-500/40" />
          </div>

          {/* Marquee with Authentic Vector SVG Logos */}
          <UniversityLogoMarquee />
        </div>
      </div>
    </section>
  );
}

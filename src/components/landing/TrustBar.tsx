"use client";

import * as React from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { landingTranslations } from "@/lib/i18n/translations/landing";
import { useInView, useCountUp, useReducedMotion } from "@/lib/hooks/useMotion";

// ========================================
// Animated Counter Stat
// ========================================
function AnimatedStat({
  target,
  suffix = "",
  prefix = "",
  decimals = 0,
  label,
  accentColor,
}: {
  target: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  label: string;
  accentColor: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { threshold: 0.3 });
  const count = useCountUp(target, isInView, 2000);

  const displayValue = decimals > 0
    ? count.toFixed(decimals)
    : Math.floor(count).toLocaleString();

  return (
    <div ref={ref} className="flex flex-col items-center text-center py-4">
      <span className={`text-3xl sm:text-4xl lg:text-5xl font-display font-bold tracking-tight ${accentColor}`}>
        {prefix}{displayValue}{suffix}
      </span>
      <span className="text-xs sm:text-sm text-zinc-500 mt-1.5 leading-snug max-w-[180px]">
        {label}
      </span>
    </div>
  );
}

// ========================================
// University Marquee Ticker
// ========================================
const universities = [
  "Stanford University",
  "MIT",
  "ETH Zürich",
  "NUS Singapore",
  "University of Tokyo",
  "Universitas Indonesia",
  "Institut Teknologi Bandung",
  "UC Berkeley",
  "TU Munich",
  "Seoul National University",
  "University of Melbourne",
  "KAIST",
];

function UniversityMarquee() {
  const prefersReduced = useReducedMotion();

  return (
    <div className="relative overflow-hidden mt-8 py-4">
      {/* Gradient masks */}
      <div className="absolute left-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 sm:w-32 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none" />

      <div
        className={`flex items-center gap-8 sm:gap-12 whitespace-nowrap ${
          prefersReduced ? "" : "animate-marquee"
        }`}
        style={{ width: "max-content" }}
      >
        {/* Duplicate for seamless loop */}
        {[...universities, ...universities].map((name, i) => (
          <span
            key={i}
            className="text-[13px] sm:text-sm font-medium text-zinc-600 tracking-wide flex items-center gap-2"
          >
            <span className="h-1 w-1 rounded-full bg-purple-500/40" />
            {name}
          </span>
        ))}
      </div>
    </div>
  );
}

// ========================================
// Trust Bar
// ========================================
export function TrustBar() {
  const { language } = useLanguage();
  const t = landingTranslations[language].trustBar;

  return (
    <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4 sm:-mt-6 mb-16 sm:mb-24">
      {/* Kinetic counters */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.04]">
        <AnimatedStat
          target={10000}
          suffix="+"
          label={t.deadlinesLabel}
          accentColor="text-white"
        />
        <AnimatedStat
          target={500}
          suffix="+"
          label={t.usersLabel}
          accentColor="text-white"
        />
        <AnimatedStat
          target={99.4}
          suffix="%"
          decimals={1}
          label={t.completionLabel}
          accentColor="text-white"
        />
        <AnimatedStat
          target={4.9}
          suffix=" / 5.0"
          decimals={1}
          label={t.ratingLabel}
          accentColor="text-white"
        />
      </div>

      {/* University marquee */}
      <UniversityMarquee />
    </section>
  );
}

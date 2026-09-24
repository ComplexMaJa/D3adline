"use client";

import * as React from "react";
import {
  BookOpen,
  Flame,
  Calendar,
  BarChart3,
  Bell,
  RefreshCw,
  ArrowUpRight,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { landingTranslations } from "@/lib/i18n/translations/landing";
import { useTilt, useReducedMotion } from "@/lib/hooks/useMotion";

// ========================================
// Tilt Card Wrapper
// ========================================
function TiltCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const prefersReduced = useReducedMotion();
  const { style, handleMouseMove, handleMouseLeave } = useTilt(ref, {
    maxDeg: prefersReduced ? 0 : 6,
    scale: prefersReduced ? 1 : 1.01,
  });

  return (
    <div
      ref={ref}
      className={className}
      style={style}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </div>
  );
}

export function BentoFeatures() {
  const { language } = useLanguage();
  const t = landingTranslations[language].features;

  const featureCards = [
    {
      id: "courses",
      icon: BookOpen,
      iconColor: "text-purple-400",
      bgGlow: "from-purple-500/10",
      borderHover: "hover:border-purple-500/30",
      title: t.cards.courses.title,
      desc: t.cards.courses.desc,
      tag: t.cards.courses.tag,
      span: "md:col-span-2",
    },
    {
      id: "deadlines",
      icon: Flame,
      iconColor: "text-amber-400",
      bgGlow: "from-amber-500/10",
      borderHover: "hover:border-amber-500/30",
      title: t.cards.deadlines.title,
      desc: t.cards.deadlines.desc,
      tag: t.cards.deadlines.tag,
      span: "md:col-span-1",
    },
    {
      id: "calendarFiles",
      icon: Calendar,
      iconColor: "text-emerald-400",
      bgGlow: "from-emerald-500/10",
      borderHover: "hover:border-emerald-500/30",
      title: t.cards.calendarFiles.title,
      desc: t.cards.calendarFiles.desc,
      tag: t.cards.calendarFiles.tag,
      span: "md:col-span-1",
    },
    {
      id: "analytics",
      icon: BarChart3,
      iconColor: "text-cyan-400",
      bgGlow: "from-cyan-500/10",
      borderHover: "hover:border-cyan-500/30",
      title: t.cards.analytics.title,
      desc: t.cards.analytics.desc,
      tag: t.cards.analytics.tag,
      span: "md:col-span-2",
    },
    {
      id: "notifications",
      icon: Bell,
      iconColor: "text-rose-400",
      bgGlow: "from-rose-500/10",
      borderHover: "hover:border-rose-500/30",
      title: t.cards.notifications.title,
      desc: t.cards.notifications.desc,
      tag: t.cards.notifications.tag,
      span: "md:col-span-1",
    },
    {
      id: "sync",
      icon: RefreshCw,
      iconColor: "text-indigo-400",
      bgGlow: "from-indigo-500/10",
      borderHover: "hover:border-indigo-500/30",
      title: t.cards.sync.title,
      desc: t.cards.sync.desc,
      tag: t.cards.sync.tag,
      span: "md:col-span-2",
    },
  ];

  return (
    <section id="features" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header — left-aligned to break symmetry */}
      <div className="max-w-2xl mb-14 sm:mb-16">
        <span className="text-xs font-mono font-semibold uppercase tracking-widest text-purple-400 mb-3 block">
          {t.sectionBadge}
        </span>
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight text-white mb-4 leading-[1.1]">
          {t.sectionTitle}
        </h2>
        <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
          {t.sectionSubtitle}
        </p>
      </div>

      {/* Asymmetric Bento Grid with 3D Tilt */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {featureCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <TiltCard
              key={card.id}
              className={`rounded-2xl border border-white/[0.06] bg-[#080808] p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 ${card.span} ${card.borderHover} group relative overflow-hidden card-shine cursor-hover`}
            >
              {/* Subtle gradient glow on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${card.bgGlow} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />

              <div className="space-y-4 relative z-10">
                {/* Top: Icon + Tag */}
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.04] border border-white/[0.06] ${card.iconColor} group-hover:scale-110 transition-transform duration-300`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] font-mono tracking-wider uppercase px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.05] text-zinc-500">
                    {card.tag}
                  </span>
                </div>

                {/* Title & Desc */}
                <div className="space-y-2 pt-2">
                  <h3 className="text-lg font-display font-bold text-zinc-100 group-hover:text-white transition-colors flex items-center gap-1.5">
                    {card.title}
                    <ArrowUpRight className="h-4 w-4 opacity-0 -translate-y-1 translate-x-1 group-hover:opacity-60 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-300 text-zinc-400" />
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              </div>
            </TiltCard>
          );
        })}
      </div>
    </section>
  );
}

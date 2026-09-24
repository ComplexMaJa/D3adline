"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Clock,
  CheckCircle2,
  Circle,
  Flame,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { landingTranslations } from "@/lib/i18n/translations/landing";
import { useReducedMotion, useMagnetic } from "@/lib/hooks/useMotion";

// ========================================
// Animated Calendar Grid — Hero Visualization
// ========================================
function CalendarGrid({ mouseX, mouseY }: { mouseX: number; mouseY: number }) {
  const prefersReduced = useReducedMotion();

  // 7 cols (days) × 5 rows (weeks) = 35 cells
  const deadlineCells = new Set([4, 11, 16, 22, 28, 33]);
  const urgentCells = new Set([11, 22]);
  const overdueCells = new Set([4]);
  const todayCell = 16;

  const tiltX = prefersReduced ? 0 : (mouseY - 0.5) * -6;
  const tiltY = prefersReduced ? 0 : (mouseX - 0.5) * 6;

  return (
    <div className="perspective-1000">
      <div
        className="grid grid-cols-7 gap-1.5 sm:gap-2 preserve-3d transition-transform duration-300 ease-out"
        style={{
          transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
        }}
      >
        {Array.from({ length: 35 }, (_, i) => {
          const isToday = i === todayCell;
          const isDeadline = deadlineCells.has(i);
          const isUrgent = urgentCells.has(i);
          const isOverdue = overdueCells.has(i);

          let cellClass =
            "h-7 w-7 sm:h-9 sm:w-9 rounded-lg border transition-all duration-500 ";

          if (isToday) {
            cellClass +=
              "bg-purple-500/25 border-purple-500/60 shadow-[0_0_16px_-2px_rgba(139,92,246,0.3)] animate-cell-pulse";
          } else if (isOverdue) {
            cellClass +=
              "bg-rose-500/15 border-rose-500/30 animate-pulse";
          } else if (isUrgent) {
            cellClass +=
              "bg-amber-500/15 border-amber-500/30";
          } else if (isDeadline) {
            cellClass +=
              "bg-purple-500/8 border-purple-500/15";
          } else {
            cellClass +=
              "bg-white/[0.02] border-white/[0.04]";
          }

          return (
            <div
              key={i}
              className={cellClass}
              style={{
                animationDelay: prefersReduced ? "0ms" : `${i * 60}ms`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

// ========================================
// Staggered Word Reveal
// ========================================
function WordReveal({
  text,
  delay = 0,
  className = "",
}: {
  text: string;
  delay?: number;
  className?: string;
}) {
  const prefersReduced = useReducedMotion();
  const words = text.split(" ");

  if (prefersReduced) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={`word-reveal ${className}`} style={{ perspective: "600px" }}>
      {words.map((word, i) => (
        <span
          key={i}
          style={{ animationDelay: `${delay + i * 0.08}s` }}
        >
          {word}&nbsp;
        </span>
      ))}
    </span>
  );
}

// ========================================
// Landing Hero
// ========================================
export function LandingHero() {
  const { language } = useLanguage();
  const t = landingTranslations[language].hero;
  const prefersReduced = useReducedMotion();
  const ctaRef = React.useRef<HTMLDivElement>(null);
  const magnetic = useMagnetic(ctaRef, 0.2);

  // Normalized mouse position (0-1) for parallax
  const [mouse, setMouse] = React.useState({ x: 0.5, y: 0.5 });

  React.useEffect(() => {
    if (prefersReduced) return;
    const handler = (e: MouseEvent) => {
      setMouse({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };
    window.addEventListener("mousemove", handler, { passive: true });
    return () => window.removeEventListener("mousemove", handler);
  }, [prefersReduced]);

  const [interactiveChecked, setInteractiveChecked] = React.useState<boolean[]>([
    true,
    true,
    true,
    false,
  ]);

  const toggleSubtask = (index: number) => {
    setInteractiveChecked((prev) => {
      const copy = [...prev];
      copy[index] = !copy[index];
      return copy;
    });
  };

  const completedCount = interactiveChecked.filter(Boolean).length;
  const progressPercent = Math.round((completedCount / interactiveChecked.length) * 100);

  return (
    <section
      id="hero"
      className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* Animated aurora backdrop — parallax on mouse */}
      <div
        className="absolute top-[10%] left-1/2 w-[700px] sm:w-[1000px] h-[400px] sm:h-[550px] rounded-full blur-[160px] pointer-events-none -z-10 opacity-60 animate-glow-pulse"
        style={{
          background: "radial-gradient(ellipse, rgba(139,92,246,0.18) 0%, rgba(99,102,241,0.08) 50%, transparent 70%)",
          transform: `translate(${-50 + (mouse.x - 0.5) * 12}%, ${(mouse.y - 0.5) * 8}%)`,
        }}
      />
      <div
        className="absolute top-[20%] left-[25%] w-[350px] h-[350px] rounded-full blur-[140px] pointer-events-none -z-10 opacity-40"
        style={{
          background: "radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 60%)",
          transform: `translate(${(mouse.x - 0.5) * -8}%, ${(mouse.y - 0.5) * -6}%)`,
        }}
      />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left: Copy */}
        <div className="text-center lg:text-left">
          {/* Hero Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-6 animate-fade-in">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
            <span>{t.badge}</span>
          </div>

          {/* Main Headline — Staggered Word Reveal */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-display font-bold tracking-tight text-white leading-[1.08] mb-6">
            <WordReveal text={t.titleLine1} delay={0.2} />
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-violet-300 to-indigo-300 bg-clip-text text-transparent">
              <WordReveal text={t.titleHighlight} delay={0.5} />
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-zinc-400 max-w-lg mx-auto lg:mx-0 leading-relaxed mb-8 animate-fade-in" style={{ animationDelay: "0.8s", animationFillMode: "both" }}>
            {t.subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3 animate-fade-in" style={{ animationDelay: "1s", animationFillMode: "both" }}>
            <div
              ref={ctaRef}
              onMouseMove={magnetic.handleMouseMove}
              onMouseLeave={magnetic.handleMouseLeave}
              style={magnetic.style}
            >
              <Link href="/register" className="cursor-hover">
                <Button size="lg" className="shadow-purple-glow-lg text-sm sm:text-base px-7 py-3">
                  <span>{t.primaryCta}</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <Link href="/login" className="cursor-hover">
              <Button variant="outline" size="lg" className="text-sm sm:text-base px-7 py-3 border-white/[0.08] hover:bg-white/[0.04]">
                {t.secondaryCta}
              </Button>
            </Link>
          </div>
        </div>

        {/* Right: Interactive Calendar Grid + Task Card */}
        <div className="relative flex flex-col items-center lg:items-end gap-6">
          {/* Abstract Calendar Grid */}
          <div className="animate-fade-in" style={{ animationDelay: "0.6s", animationFillMode: "both" }}>
            <CalendarGrid mouseX={mouse.x} mouseY={mouse.y} />
          </div>

          {/* Interactive AMOLED Task Teaser Card */}
          <div className="w-full max-w-md rounded-2xl border border-white/[0.06] bg-[#0A0A0A]/90 p-5 text-left shadow-2xl backdrop-blur-xl relative group hover:border-purple-500/30 transition-all duration-300 card-shine animate-fade-in" style={{ animationDelay: "0.9s", animationFillMode: "both" }}>
            {/* Top Window Dots */}
            <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500/80 inline-block" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80 inline-block" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-2 text-[11px] font-mono text-zinc-600">
                  {t.teaserTag}
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-medium">
                <Clock className="h-3.5 w-3.5 text-amber-400" />
                <span>{t.teaserDueTomorrow}</span>
              </div>
            </div>

            {/* Task Title & Course */}
            <div className="space-y-1 mb-4">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  <BookOpen className="h-3 w-3" />
                  {t.teaserCourse}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/20">
                  High Priority
                </span>
              </div>
              <h2 className="text-base font-display font-bold text-zinc-100">
                {t.teaserTitle}
              </h2>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5 mb-4">
              <div className="flex justify-between text-xs text-zinc-500">
                <span>
                  {language === "id"
                    ? `${progressPercent}% Selesai (${completedCount} dari 4 Subtugas)`
                    : `${progressPercent}% Completed (${completedCount} of 4 Subtasks)`}
                </span>
                <span className="font-mono text-purple-400 font-semibold">{progressPercent}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 transition-all duration-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Subtasks Interactive Checklist */}
            <div className="space-y-1.5 pt-3 border-t border-white/[0.04]">
              {[
                language === "id" ? "Log replikasi mesin keadaan (State Machine)" : "State machine replication log",
                language === "id" ? "Uji batas waktu pemilihan pemimpin (Leader Election)" : "Leader election timeout test",
                language === "id" ? "RPC siaran detak jantung (Heartbeat broadcast)" : "Heartbeat broadcast RPC",
                language === "id" ? "Konfigurasi ulang keanggotaan cluster dinamis" : "Dynamic cluster membership reconfiguration",
              ].map((title, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleSubtask(idx)}
                  className="w-full flex items-center justify-between p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] text-left transition-colors group/item cursor-hover"
                >
                  <div className="flex items-center gap-2.5 text-xs text-zinc-300">
                    {interactiveChecked[idx] ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-zinc-600 group-hover/item:text-zinc-400 shrink-0" />
                    )}
                    <span
                      className={
                        interactiveChecked[idx]
                          ? "line-through text-zinc-600"
                          : "text-zinc-300"
                      }
                    >
                      {title}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-600 font-mono">
                    {interactiveChecked[idx] ? "Done" : "Pending"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

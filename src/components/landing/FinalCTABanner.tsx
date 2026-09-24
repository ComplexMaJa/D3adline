"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, CheckCircle2, Cloud } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { landingTranslations } from "@/lib/i18n/translations/landing";
import { useMagnetic } from "@/lib/hooks/useMotion";
import { DepthText } from "@/components/ui/DepthText";
import { Aurora } from "@/components/ui/AuroraBG";

// ========================================
// 3D Faceted Amethyst Crystal Gem
// ========================================
function CrystalGem({
  className = "",
  size = 40,
}: {
  className?: string;
  size?: number;
}) {
  const id = React.useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`drop-shadow-[0_0_15px_rgba(168,85,247,0.7)] ${className}`}
    >
      <polygon
        points="50,5 92,30 92,70 50,95 8,70 8,30"
        fill={`url(#gem-g1-${id})`}
        stroke="rgba(216,180,254,0.6)"
        strokeWidth="1.5"
      />
      <polygon points="50,5 92,30 50,50 8,30" fill={`url(#gem-g2-${id})`} opacity="0.85" />
      <polygon points="50,50 92,30 92,70" fill={`url(#gem-g3-${id})`} opacity="0.75" />
      <polygon points="50,50 92,70 50,95" fill={`url(#gem-g4-${id})`} opacity="0.9" />
      <polygon points="50,50 50,95 8,70" fill={`url(#gem-g2-${id})`} opacity="0.8" />
      <polygon points="50,50 8,70 8,30" fill={`url(#gem-g1-${id})`} opacity="0.7" />
      <defs>
        <linearGradient id={`gem-g1-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C084FC" />
          <stop offset="100%" stopColor="#6B21A8" />
        </linearGradient>
        <linearGradient id={`gem-g2-${id}`} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#E9D5FF" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
        <linearGradient id={`gem-g3-${id}`} x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#7E22CE" />
          <stop offset="100%" stopColor="#3B0764" />
        </linearGradient>
        <linearGradient id={`gem-g4-${id}`} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#9333EA" />
          <stop offset="100%" stopColor="#581C87" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ========================================
// Floating Calendar Widget (from Pic 1)
// ========================================
function FloatingCalendarCard({ className = "" }: { className?: string }) {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const cells = [
    null, null, 1, 2, 3, 4, 5,
    6, 7, 8, 9, 10, 11, 12,
    13, 14, 15, 16, 17, 18, 19,
    20, 21, 22, 23, 24, 25, 26,
    27, 28, 29, 30, null, null, null,
  ];

  return (
    <div
      className={`rounded-2xl border border-white/[0.1] bg-[#0A0716]/90 backdrop-blur-xl p-3.5 shadow-[0_20px_50px_-10px_rgba(139,92,246,0.35)] w-[185px] sm:w-[200px] select-none ${className}`}
    >
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.08] text-[11px] font-mono text-zinc-300">
        <span className="font-semibold text-white tracking-tight">September 2026</span>
        <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-mono text-zinc-500 mb-1.5">
        {days.map((d, i) => (
          <span key={i}>{d}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 text-[9px] font-mono">
        {cells.map((day, i) => {
          if (!day) return <span key={i} />;
          const isTarget = day === 24;
          return (
            <span
              key={i}
              className={`h-5 w-5 flex items-center justify-center rounded transition-colors ${
                isTarget
                  ? "bg-purple-500 text-white font-bold shadow-[0_0_12px_rgba(168,85,247,0.9)] animate-pulse"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {day}
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ========================================
// Final CTA Hero-Style Section
// ========================================
export function FinalCTABanner() {
  const { language } = useLanguage();
  const t = landingTranslations[language].cta;
  const ctaRef = React.useRef<HTMLDivElement>(null);
  const magnetic = useMagnetic(ctaRef, 0.2);

  // Split title into two majestic 3D typographic lines
  const line1 = language === "id" ? "Siap taklukkan" : "Ready to conquer your";
  const line2 = language === "id" ? "tenggat kuliahmu?" : "academic deadlines?";

  return (
    <section
      id="cta-section"
      className="relative isolate w-full py-24 sm:py-32 lg:py-36 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* Dynamic Hero-style Background: WebGL Aurora + Blueprint Grid + Edge Fades */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Deep midnight purple backdrop */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-[#090314] to-black pointer-events-none" />

        {/* Dynamic WebGL Aurora shader from AuroraBG.tsx */}
        <div className="absolute inset-0 opacity-40 mix-blend-screen pointer-events-none">
          <Aurora
            colorStops={["#5227FF", "#9333EA", "#3B82F6"]}
            amplitude={1.15}
            blend={0.55}
            speed={0.65}
          />
        </div>

        {/* Subtle geometric dot grid pattern matching Pic 1 */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.035]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)",
            backgroundSize: "36px 36px",
          }}
        />

        {/* Ambient atmospheric purple glows */}
        <div
          className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full pointer-events-none blur-[140px] opacity-35"
          style={{
            background: "radial-gradient(ellipse at center, rgba(139,92,246,0.4) 0%, rgba(99,102,241,0.15) 50%, transparent 75%)",
          }}
        />
        <div
          className="absolute bottom-1/4 right-1/4 translate-x-1/4 w-[600px] h-[500px] rounded-full pointer-events-none blur-[130px] opacity-40"
          style={{
            background: "radial-gradient(ellipse at center, rgba(168,85,247,0.35) 0%, rgba(124,58,237,0.15) 50%, transparent 75%)",
          }}
        />

        {/* Top edge soft vignette blending into previous FAQ section */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black via-black/80 to-transparent pointer-events-none z-10" />

        {/* Bottom edge smooth fade into footer */}
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-black via-black/90 to-transparent pointer-events-none z-10" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Top Badges Bar — Matching Pic 1 layout */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8 sm:mb-12">
          {/* Left Badge: Free Forever Tier */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-purple-500/25 bg-purple-500/10 text-purple-300 text-xs font-mono backdrop-blur-md shadow-[0_0_15px_-3px_rgba(139,92,246,0.3)]">
            <Sparkles className="h-3.5 w-3.5 text-purple-400" />
            <span>{language === "id" ? "Paket Gratis Selamanya" : "Free Forever Tier"}</span>
          </div>

          {/* Center Status Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-mono font-semibold tracking-widest uppercase shadow-[0_0_20px_-3px_rgba(139,92,246,0.4)]">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
            <span>{t.badge}</span>
          </div>

          {/* Right Badge: Instant Cloud Sync */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 text-emerald-300 text-xs font-mono backdrop-blur-md shadow-[0_0_15px_-3px_rgba(16,185,129,0.25)]">
            <Cloud className="h-3.5 w-3.5 text-emerald-400" />
            <span>{language === "id" ? "Sinkronisasi Cloud Instan" : "Instant Cloud Sync"}</span>
          </div>
        </div>

        {/* 2-Column Hero-Style Content Grid (Pic 3 Structure) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          {/* Left Column: Headlines, DepthText, Subtitle, CTA buttons, Guarantee */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
            {/* 3D DepthText Title — Responsive Stacked Extrusions matching Pic 1 */}
            <div className="flex flex-col items-center lg:items-start justify-center gap-1 sm:gap-2.5 py-2 font-display select-none">
              {/* Line 1 */}
              <DepthText
                text={line1}
                layers={26}
                depth={1.7}
                tilt={6}
                autoOrbit={true}
                orbitSpeed={0.22}
                fontSize="clamp(2.0rem, 4.2vw, 3.6rem)"
                fontWeight={800}
                faceColor="#FFFFFF"
                depthColor="#7C3AED"
                shadow={true}
                className="font-display tracking-tight drop-shadow-md"
              />
              {/* Line 2 */}
              <DepthText
                text={line2}
                layers={32}
                depth={2.3}
                tilt={7}
                autoOrbit={true}
                orbitSpeed={0.28}
                fontSize="clamp(2.4rem, 5.4vw, 4.6rem)"
                fontWeight={900}
                faceColor="#F5F3FF"
                depthColor="#6D28D9"
                shadow={true}
                className="font-display tracking-tight drop-shadow-xl"
              />
            </div>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-zinc-300 max-w-xl leading-relaxed pt-1">
              {t.subtitle}
            </p>

            {/* CTA Buttons — Magnetic primary with neon purple glow */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-3 w-full sm:w-auto">
              <div
                ref={ctaRef}
                onMouseMove={magnetic.handleMouseMove}
                onMouseLeave={magnetic.handleMouseLeave}
                style={magnetic.style}
                className="w-full sm:w-auto"
              >
                <Link href="/register" className="group block w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-600 hover:from-purple-500 hover:via-violet-500 hover:to-indigo-500 shadow-[0_0_35px_-5px_rgba(139,92,246,0.65)] hover:shadow-[0_0_45px_-2px_rgba(139,92,246,0.85)] text-sm sm:text-base px-8 py-4 font-semibold transition-all duration-300"
                  >
                    <span>{t.primaryCta}</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform" />
                  </Button>
                </Link>
              </div>
              <Link href="/login" className="block w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto text-sm sm:text-base px-8 py-4 border-white/[0.12] bg-[#0A0716]/80 hover:bg-white/[0.08] hover:border-purple-500/50 text-zinc-300 hover:text-white backdrop-blur-md transition-all duration-300 font-semibold"
                >
                  {t.secondaryCta}
                </Button>
              </Link>
            </div>

            {/* Trust Footnote Badge (No credit card required) */}
            <div className="pt-2">
              <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] text-xs text-zinc-400 font-mono backdrop-blur-md shadow-sm">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{t.noCardNeeded}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Anime Mascot Stage with Floating Calendar & Crystals (Pic 1) */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="relative w-full max-w-[520px] lg:max-w-[580px] flex items-center justify-center">
              {/* Backlight radiant purple glow behind mascot */}
              <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[460px] sm:w-[540px] h-[460px] sm:h-[540px] rounded-full pointer-events-none blur-[90px] opacity-75 animate-pulse"
                style={{
                  background:
                    "radial-gradient(circle, rgba(168,85,247,0.45) 0%, rgba(124,58,237,0.25) 45%, rgba(59,130,246,0.1) 68%, transparent 80%)",
                }}
              />

              {/* Floating Amethyst Gem 1 — Top Left */}
              <div className="absolute -top-3 left-4 sm:left-8 z-20 animate-float pointer-events-none">
                <CrystalGem size={38} />
              </div>

              {/* Floating Amethyst Gem 2 — Middle Right */}
              <div
                className="absolute top-1/3 -right-2 sm:-right-4 z-20 animate-float pointer-events-none"
                style={{ animationDelay: "1.6s" }}
              >
                <CrystalGem size={44} />
              </div>

              {/* Floating Amethyst Gem 3 — Bottom Left near books */}
              <div
                className="absolute bottom-16 -left-3 sm:left-0 z-20 animate-float pointer-events-none"
                style={{ animationDelay: "2.4s" }}
              >
                <CrystalGem size={32} />
              </div>

              {/* Floating Paper Sheets (Pic 1 background details) */}
              <div
                className="absolute top-2 right-4 sm:right-10 w-24 h-32 rounded-lg border border-purple-500/20 bg-purple-500/[0.04] backdrop-blur-sm -rotate-12 pointer-events-none p-2.5 shadow-lg opacity-60 z-0 animate-float"
                style={{ animationDelay: "1.2s" }}
              >
                <div className="h-1.5 w-10 bg-purple-400/40 rounded-full mb-2" />
                <div className="h-1 w-16 bg-white/20 rounded-full mb-1.5" />
                <div className="h-1 w-12 bg-white/20 rounded-full mb-1.5" />
                <div className="h-1 w-14 bg-white/20 rounded-full" />
              </div>

              {/* Floating Calendar Widget behind Mascot (from Pic 1) */}
              <div
                className="absolute top-6 right-0 sm:right-4 z-10 animate-float pointer-events-none rotate-3 opacity-90 hidden sm:block"
                style={{ animationDelay: "0.8s" }}
              >
                <FloatingCalendarCard />
              </div>

              {/* High-Resolution Mascot Image Asset */}
              <div className="relative z-10 w-full flex justify-center group">
                <Image
                  src="/mascot.png"
                  alt="Deadline Academic Assistant Mascot"
                  width={650}
                  height={600}
                  priority
                  className="w-full max-w-[380px] sm:max-w-[460px] lg:max-w-[520px] xl:max-w-[560px] h-auto object-contain drop-shadow-[0_25px_60px_rgba(139,92,246,0.45)] select-none pointer-events-none transition-transform duration-700 ease-out group-hover:scale-[1.02]"
                />
              </div>

              {/* Soft ground shadow underneath books */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[340px] sm:w-[420px] h-[30px] bg-purple-600/30 blur-2xl rounded-full pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

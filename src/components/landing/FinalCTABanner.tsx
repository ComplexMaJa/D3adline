"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { landingTranslations } from "@/lib/i18n/translations/landing";
import { useMagnetic } from "@/lib/hooks/useMotion";
import { DepthText } from "@/components/ui/DepthText";

export function FinalCTABanner() {
  const { language } = useLanguage();
  const t = landingTranslations[language].cta;
  const ctaRef = React.useRef<HTMLDivElement>(null);
  const magnetic = useMagnetic(ctaRef, 0.2);

  // Split title into two majestic 3D typographic lines
  const line1 = language === "id" ? "Siap taklukkan" : "Ready to conquer";
  const line2 = language === "id" ? "tenggat kuliahmu?" : "academic deadlines?";

  return (
    <section className="relative py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Outer ambient glow behind card */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[900px] h-[350px] sm:h-[450px] rounded-full pointer-events-none blur-[120px] opacity-35"
        style={{
          background: "radial-gradient(ellipse at center, rgba(139,92,246,0.3) 0%, rgba(99,102,241,0.15) 50%, transparent 75%)",
        }}
      />

      <div className="relative rounded-[2.5rem] border border-white/[0.08] bg-[#07050C]/90 p-8 sm:p-14 lg:p-20 text-center overflow-hidden shadow-[0_20px_80px_-20px_rgba(124,58,237,0.3)] backdrop-blur-2xl group hover:border-purple-500/30 transition-colors duration-500">
        {/* Top milled-glass light beam highlight */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-400/60 to-transparent" />
        {/* Bottom subtle ambient rim */}
        <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />

        {/* Central luminous nebula glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[400px] rounded-full pointer-events-none opacity-60 animate-glow-pulse"
          style={{
            background: "radial-gradient(ellipse at center, rgba(139,92,246,0.22) 0%, rgba(99,102,241,0.08) 45%, transparent 70%)",
          }}
        />

        {/* Subtle geometric dot grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.025]"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Floating decorative micro-pills (desktop) */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-purple-500/20 bg-purple-500/5 text-[11px] font-mono text-purple-300 absolute top-8 left-8 animate-float backdrop-blur-md shadow-sm">
          <Sparkles className="h-3 w-3 text-purple-400" />
          <span>{language === "id" ? "Paket Gratis Selamanya" : "Free Forever Tier"}</span>
        </div>
        <div
          className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 text-[11px] font-mono text-emerald-300 absolute top-8 right-8 animate-float backdrop-blur-md shadow-sm"
          style={{ animationDelay: "1.8s" }}
        >
          <CheckCircle2 className="h-3 w-3 text-emerald-400" />
          <span>{language === "id" ? "Setup Instan" : "Instant Cloud Sync"}</span>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto space-y-6">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-300 text-xs font-mono font-semibold tracking-widest uppercase mb-1 shadow-[0_0_15px_-3px_rgba(139,92,246,0.3)]">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse" />
            <span>{t.badge}</span>
          </div>

          {/* 3D DepthText Title — Responsive Stacked Extrusions */}
          <div className="flex flex-col items-center justify-center gap-1.5 sm:gap-3 py-2 font-display select-none">
            {/* 3D Line 1 */}
            <DepthText
              text={line1}
              layers={26}
              depth={1.8}
              tilt={6.5}
              autoOrbit={true}
              orbitSpeed={0.25}
              fontSize="clamp(1.9rem, 4.8vw, 3.8rem)"
              fontWeight={800}
              faceColor="#FFFFFF"
              depthColor="#7C3AED"
              shadow={true}
              className="font-display tracking-tight drop-shadow-md"
            />
            {/* 3D Line 2 */}
            <DepthText
              text={line2}
              layers={34}
              depth={2.5}
              tilt={7.5}
              autoOrbit={true}
              orbitSpeed={0.3}
              fontSize="clamp(2.3rem, 6.2vw, 5.0rem)"
              fontWeight={900}
              faceColor="#F5F3FF"
              depthColor="#6D28D9"
              shadow={true}
              className="font-display tracking-tight drop-shadow-xl"
            />
          </div>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-zinc-400 max-w-xl mx-auto leading-relaxed pt-2">
            {t.subtitle}
          </p>

          {/* CTA Buttons — magnetic primary with glowing hover */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <div
              ref={ctaRef}
              onMouseMove={magnetic.handleMouseMove}
              onMouseLeave={magnetic.handleMouseLeave}
              style={magnetic.style}
            >
              <Link href="/register" className="group block">
                <Button size="lg" className="shadow-purple-glow-lg text-sm sm:text-base px-8 py-4 font-semibold">
                  <span>{t.primaryCta}</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
            <Link href="/login" className="block">
              <Button
                variant="outline"
                size="lg"
                className="text-sm sm:text-base px-8 py-4 border-white/[0.1] bg-white/[0.03] hover:bg-white/[0.08] hover:border-purple-500/40 text-zinc-300 hover:text-white backdrop-blur-md transition-all duration-300 font-semibold"
              >
                {t.secondaryCta}
              </Button>
            </Link>
          </div>

          {/* Footnote Badge */}
          <div className="pt-3">
            <div className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/[0.02] border border-white/[0.06] text-xs text-zinc-400 font-mono shadow-sm">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>{t.noCardNeeded}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


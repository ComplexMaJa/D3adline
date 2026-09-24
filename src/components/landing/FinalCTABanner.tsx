"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { landingTranslations } from "@/lib/i18n/translations/landing";
import { useMagnetic } from "@/lib/hooks/useMotion";

export function FinalCTABanner() {
  const { language } = useLanguage();
  const t = landingTranslations[language].cta;
  const ctaRef = React.useRef<HTMLDivElement>(null);
  const magnetic = useMagnetic(ctaRef, 0.2);

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <div className="relative rounded-3xl border border-purple-500/20 bg-[#050505] p-8 sm:p-14 text-center overflow-hidden">
        {/* Dramatic radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full pointer-events-none animate-glow-pulse"
          style={{
            background: "radial-gradient(ellipse, rgba(139,92,246,0.15) 0%, rgba(99,102,241,0.05) 40%, transparent 70%)",
          }}
        />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(139,92,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.3) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          {/* Badge */}
          <span className="inline-block text-xs font-mono font-semibold uppercase tracking-widest text-purple-400 mb-2">
            {t.badge}
          </span>

          {/* Title */}
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight text-white leading-tight">
            {t.title}
          </h2>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto leading-relaxed">
            {t.subtitle}
          </p>

          {/* CTA Buttons — magnetic primary */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <div
              ref={ctaRef}
              onMouseMove={magnetic.handleMouseMove}
              onMouseLeave={magnetic.handleMouseLeave}
              style={magnetic.style}
            >
              <Link href="/register" className="cursor-hover">
                <Button size="lg" className="shadow-purple-glow text-sm sm:text-base px-8 py-3.5">
                  <span>{t.primaryCta}</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <Link href="/login" className="cursor-hover">
              <Button variant="outline" size="lg" className="text-sm sm:text-base px-8 py-3.5 border-white/[0.08] hover:bg-white/[0.04]">
                {t.secondaryCta}
              </Button>
            </Link>
          </div>

          {/* Footnote */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-zinc-600 pt-2">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>{t.noCardNeeded}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

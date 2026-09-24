"use client";

import * as React from "react";
import Link from "next/link";
import { BookPlus, ListChecks, CheckCircle2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { landingTranslations } from "@/lib/i18n/translations/landing";

export function HowItWorks() {
  const { language } = useLanguage();
  const t = landingTranslations[language].howItWorks;

  const steps = [
    {
      number: t.steps.step1Number,
      title: t.steps.step1Title,
      desc: t.steps.step1Desc,
      icon: BookPlus,
      accentColor: "text-purple-400",
      accentBorder: "border-purple-500/20",
      accentBg: "bg-purple-500/10",
      lineGradient: "from-purple-500 to-amber-500",
    },
    {
      number: t.steps.step2Number,
      title: t.steps.step2Title,
      desc: t.steps.step2Desc,
      icon: ListChecks,
      accentColor: "text-amber-400",
      accentBorder: "border-amber-500/20",
      accentBg: "bg-amber-500/10",
      lineGradient: "from-amber-500 to-emerald-500",
    },
    {
      number: t.steps.step3Number,
      title: t.steps.step3Title,
      desc: t.steps.step3Desc,
      icon: CheckCircle2,
      accentColor: "text-emerald-400",
      accentBorder: "border-emerald-500/20",
      accentBg: "bg-emerald-500/10",
      lineGradient: "",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Asymmetric layout: left header + right steps */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        {/* Left: Sticky Header */}
        <div className="lg:col-span-5 lg:sticky lg:top-32 lg:self-start">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-purple-400 mb-3 block">
            {t.sectionBadge}
          </span>
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight text-white mb-4 leading-[1.1]">
            {t.sectionTitle}
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed mb-8">
            {t.sectionSubtitle}
          </p>
          <Link href="/register" className="cursor-hover hidden lg:inline-block">
            <Button size="lg" className="shadow-purple-glow-sm text-sm px-6 py-3">
              <span>{language === "id" ? "Mulai Sekarang" : "Get Started Now"}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Right: Vertical Timeline */}
        <div className="lg:col-span-7">
          <div className="relative">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isLast = idx === steps.length - 1;

              return (
                <div key={step.number} className="flex gap-6 sm:gap-8 relative pb-12 sm:pb-16 last:pb-0">
                  {/* Timeline line + dot */}
                  <div className="flex flex-col items-center shrink-0">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-2xl ${step.accentBg} border ${step.accentBorder} ${step.accentColor} shadow-lg z-10`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    {!isLast && (
                      <div className={`w-px flex-1 mt-3 bg-gradient-to-b ${step.lineGradient} opacity-20`} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="pt-2">
                    <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-zinc-600 mb-2">
                      Step {step.number}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-display font-bold text-white mb-3">
                      {step.title}
                    </h3>
                    <p className="text-sm text-zinc-400 leading-relaxed max-w-md">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mobile CTA */}
          <Link href="/register" className="cursor-hover block lg:hidden mt-4">
            <Button size="lg" className="w-full justify-center shadow-purple-glow-sm text-sm px-6 py-3">
              <span>{language === "id" ? "Mulai Sekarang" : "Get Started Now"}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

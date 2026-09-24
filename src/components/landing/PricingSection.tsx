"use client";

import * as React from "react";
import Link from "next/link";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { landingTranslations } from "@/lib/i18n/translations/landing";

export function PricingSection() {
  const { language } = useLanguage();
  const t = landingTranslations[language].pricing;

  const [isAnnual, setIsAnnual] = React.useState(true);

  return (
    <section id="pricing" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header — centered */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
        <span className="text-xs font-mono font-semibold uppercase tracking-widest text-purple-400 mb-3 block">
          {t.sectionBadge}
        </span>
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight text-white mb-4 leading-[1.1]">
          {t.sectionTitle}
        </h2>
        <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
          {t.sectionSubtitle}
        </p>

        {/* Animated Sliding Pill Toggle */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <span
            className={`text-xs sm:text-sm font-medium transition-colors duration-300 ${
              !isAnnual ? "text-white" : "text-zinc-600"
            }`}
          >
            {t.billingMonthly}
          </span>

          <button
            type="button"
            onClick={() => setIsAnnual(!isAnnual)}
            className="relative w-14 h-7 flex items-center rounded-full p-1 bg-white/[0.06] border border-white/[0.08] transition-colors focus:outline-none cursor-hover"
            aria-label="Toggle annual billing"
          >
            <div
              className={`bg-purple-600 h-5 w-5 rounded-full shadow-lg transform transition-all duration-300 ${
                isAnnual ? "translate-x-7" : "translate-x-0"
              }`}
            />
          </button>

          <span
            className={`text-xs sm:text-sm font-medium flex items-center gap-2 transition-colors duration-300 ${
              isAnnual ? "text-white" : "text-zinc-600"
            }`}
          >
            {t.billingAnnual}
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
              {t.annualDiscount}
            </span>
          </span>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto items-stretch">
        {/* FREE TIER */}
        <div className="rounded-3xl border border-white/[0.06] bg-[#060606] p-7 sm:p-9 flex flex-col justify-between hover:border-white/[0.1] transition-all duration-300 cursor-hover">
          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-500">
                {t.freeTier.name}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl sm:text-6xl font-display font-bold text-white tracking-tight">
                  {t.freeTier.price}
                </span>
                <span className="text-sm text-zinc-500">
                  / {t.freeTier.period}
                </span>
              </div>
              <p className="text-sm text-zinc-500 pt-1">
                {t.freeTier.desc}
              </p>
            </div>

            <Link href="/register" className="block w-full cursor-hover">
              <Button variant="outline" className="w-full justify-center py-3 text-sm border-white/[0.08] hover:bg-white/[0.04]">
                <span>{t.freeTier.cta}</span>
              </Button>
            </Link>

            <div className="space-y-3 pt-6 border-t border-white/[0.05]">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-zinc-500">
                {language === "id" ? "Fitur Termasuk:" : "Included Features:"}
              </span>
              <ul className="space-y-2.5">
                {t.freeTier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-400">
                    <Check className="h-4 w-4 text-zinc-600 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* PREMIUM TIER */}
        <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-b from-purple-500/[0.06] to-transparent p-7 sm:p-9 flex flex-col justify-between shadow-purple-glow relative overflow-hidden group cursor-hover">
          {/* Popular badge */}
          <div className="absolute top-5 right-5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-600 text-white text-[11px] font-bold uppercase tracking-wider shadow-purple-glow-sm">
              <Sparkles className="h-3 w-3" />
              {t.premiumTier.popularBadge}
            </span>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-purple-400">
                {t.premiumTier.name}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl sm:text-6xl font-display font-bold text-white tracking-tight">
                  {isAnnual ? t.premiumTier.priceAnnual : t.premiumTier.priceMonthly}
                </span>
                <span className="text-sm text-zinc-400">
                  {isAnnual ? t.premiumTier.periodAnnual : t.premiumTier.periodMonthly}
                </span>
              </div>
              <p className="text-sm text-zinc-300 pt-1">
                {t.premiumTier.desc}
              </p>
            </div>

            <Link href="/register" className="block w-full cursor-hover">
              <Button className="w-full justify-center py-3 text-sm shadow-purple-glow-lg font-bold">
                <span>{t.premiumTier.cta}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <div className="space-y-3 pt-6 border-t border-purple-500/15">
              <span className="text-[11px] font-mono font-bold uppercase tracking-widest text-purple-300">
                {language === "id" ? "Semua fitur Free, plus:" : "Everything in Free, plus:"}
              </span>
              <ul className="space-y-2.5">
                {t.premiumTier.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-200">
                    <Check className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

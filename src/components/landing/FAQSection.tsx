"use client";

import * as React from "react";
import { ChevronDown, Plus, Minus, HelpCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { landingTranslations } from "@/lib/i18n/translations/landing";

export function FAQSection() {
  const { language } = useLanguage();
  const t = landingTranslations[language].faq;

  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section id="faq" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Asymmetric layout: left header + right accordion */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        {/* Left: Header */}
        <div className="lg:col-span-4 lg:sticky lg:top-32 lg:self-start">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-purple-400 mb-3 block">
            {t.sectionBadge}
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold tracking-tight text-white mb-4 leading-[1.1]">
            {t.sectionTitle}
          </h2>
          <p className="text-sm text-zinc-400 leading-relaxed">
            {t.sectionSubtitle}
          </p>
        </div>

        {/* Right: Accordion */}
        <div className="lg:col-span-8">
          <div className="space-y-3">
            {t.items.map((item, idx) => {
              const isOpen = openIndex === idx;
              const buttonId = `faq-btn-${idx}`;
              const panelId = `faq-panel-${idx}`;

              return (
                <div
                  key={idx}
                  className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isOpen
                      ? "border-purple-500/25 bg-purple-500/[0.03]"
                      : "border-white/[0.05] bg-white/[0.01] hover:border-white/[0.1]"
                  }`}
                >
                  <button
                    id={buttonId}
                    type="button"
                    onClick={() => toggleAccordion(idx)}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 rounded-2xl cursor-hover"
                  >
                    <span className="text-sm sm:text-base font-display font-semibold text-zinc-100 leading-snug">
                      {item.q}
                    </span>
                    <div
                      className={`h-7 w-7 rounded-lg flex items-center justify-center border transition-all duration-300 shrink-0 ${
                        isOpen
                          ? "bg-purple-600 border-purple-500 text-white rotate-0"
                          : "bg-white/[0.03] border-white/[0.06] text-zinc-500"
                      }`}
                    >
                      {isOpen ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                    </div>
                  </button>

                  {/* Smooth height animation via grid */}
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className={`accordion-content ${isOpen ? "open" : ""}`}
                  >
                    <div>
                      <div className="px-5 sm:px-6 pb-6 pt-0 text-sm text-zinc-400 leading-relaxed border-t border-white/[0.04]">
                        <div className="pt-4">
                          {item.a}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

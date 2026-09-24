"use client";

import * as React from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { landingTranslations } from "@/lib/i18n/translations/landing";
import { useReducedMotion } from "@/lib/hooks/useMotion";

export function TestimonialsSection() {
  const { language } = useLanguage();
  const t = landingTranslations[language].testimonials;
  const prefersReduced = useReducedMotion();

  const reviews = [
    {
      quote: t.quotes.quote1,
      author: t.quotes.author1,
      role: t.quotes.role1,
      initials: "AR",
      gradient: "from-purple-600 to-indigo-600",
    },
    {
      quote: t.quotes.quote2,
      author: t.quotes.author2,
      role: t.quotes.role2,
      initials: "ML",
      gradient: "from-emerald-600 to-teal-600",
    },
    {
      quote: t.quotes.quote3,
      author: t.quotes.author3,
      role: t.quotes.role3,
      initials: "RH",
      gradient: "from-indigo-600 to-blue-600",
    },
  ];

  const [activeIndex, setActiveIndex] = React.useState(0);

  // Auto-play carousel
  React.useEffect(() => {
    if (prefersReduced) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % reviews.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [prefersReduced, reviews.length]);

  const goTo = (idx: number) => {
    setActiveIndex(idx);
  };

  const goPrev = () => {
    setActiveIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const goNext = () => {
    setActiveIndex((prev) => (prev + 1) % reviews.length);
  };

  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header — left-aligned */}
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

      {/* Testimonial Carousel */}
      <div className="relative">
        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {reviews.map((item, idx) => (
            <div
              key={idx}
              className={`rounded-2xl border p-6 sm:p-8 flex flex-col justify-between transition-all duration-500 cursor-hover group ${
                idx === activeIndex
                  ? "border-purple-500/30 bg-purple-500/[0.04] scale-[1.02] shadow-purple-glow"
                  : "border-white/[0.06] bg-white/[0.02] opacity-60 md:opacity-100"
              }`}
              onClick={() => goTo(idx)}
            >
              <div className="space-y-4">
                {/* Star Rating */}
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 text-amber-400 fill-amber-400"
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-sm text-zinc-300 leading-relaxed">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 pt-6 border-t border-white/[0.05] mt-6">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs text-white bg-gradient-to-br ${item.gradient} shadow-sm shrink-0`}
                >
                  {item.initials}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-display font-bold text-white tracking-tight">
                    {item.author}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {item.role}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation dots + arrows */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={goPrev}
            className="h-9 w-9 rounded-full border border-white/[0.06] bg-white/[0.03] flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/[0.12] transition-all cursor-hover"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex gap-2">
            {reviews.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                className={`h-2 rounded-full transition-all duration-300 cursor-hover ${
                  idx === activeIndex
                    ? "w-8 bg-purple-500"
                    : "w-2 bg-white/[0.1] hover:bg-white/[0.2]"
                }`}
                aria-label={`Go to testimonial ${idx + 1}`}
              />
            ))}
          </div>

          <button
            onClick={goNext}
            className="h-9 w-9 rounded-full border border-white/[0.06] bg-white/[0.03] flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/[0.12] transition-all cursor-hover"
            aria-label="Next testimonial"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

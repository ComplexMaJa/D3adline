"use client";

import * as React from "react";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingHero } from "@/components/landing/LandingHero";
import { TrustBar } from "@/components/landing/TrustBar";
import { BentoFeatures } from "@/components/landing/BentoFeatures";
import { ProductPreview } from "@/components/landing/ProductPreview";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { PricingSection } from "@/components/landing/PricingSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { FinalCTABanner } from "@/components/landing/FinalCTABanner";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { useMousePosition, useReducedMotion } from "@/lib/hooks/useMotion";

// ========================================
// Section Reveal Wrapper (IntersectionObserver)
// ========================================
function RevealSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = React.useState(false);
  const prefersReduced = useReducedMotion();

  React.useEffect(() => {
    if (prefersReduced) {
      setIsVisible(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.06, rootMargin: "0px 0px -60px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [prefersReduced]);

  return (
    <div
      ref={ref}
      className={`reveal-section ${isVisible ? "visible" : ""} ${className}`}
      style={{ transitionDelay: isVisible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}

// ========================================
// Custom Cursor Component
// ========================================
function CustomCursor() {
  const { x, y, isTouch } = useMousePosition();
  const [isHovering, setIsHovering] = React.useState(false);
  const prefersReduced = useReducedMotion();
  const ringRef = React.useRef<HTMLDivElement>(null);
  const ringPos = React.useRef({ x: -100, y: -100 });
  const rafId = React.useRef<number>(0);

  // Smooth ring follow with lerp
  React.useEffect(() => {
    if (isTouch || prefersReduced) return;

    const animate = () => {
      ringPos.current.x += (x - ringPos.current.x) * 0.15;
      ringPos.current.y += (y - ringPos.current.y) * 0.15;

      if (ringRef.current) {
        ringRef.current.style.left = `${ringPos.current.x}px`;
        ringRef.current.style.top = `${ringPos.current.y}px`;
      }

      rafId.current = requestAnimationFrame(animate);
    };

    rafId.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId.current);
  }, [x, y, isTouch, prefersReduced]);

  // Track interactive element hover
  React.useEffect(() => {
    if (isTouch || prefersReduced) return;

    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest("a, button, [role='button'], input, textarea, select, .cursor-hover")
      ) {
        setIsHovering(true);
      }
    };

    const handleOut = () => setIsHovering(false);

    document.addEventListener("mouseover", handleOver);
    document.addEventListener("mouseout", handleOut);
    return () => {
      document.removeEventListener("mouseover", handleOver);
      document.removeEventListener("mouseout", handleOut);
    };
  }, [isTouch, prefersReduced]);

  if (isTouch || prefersReduced) return null;

  return (
    <div className={isHovering ? "cursor-hovering" : ""}>
      <div className="cursor-dot" style={{ left: x, top: y }} />
      <div ref={ringRef} className="cursor-ring" />
    </div>
  );
}

// ========================================
// Main Landing Client
// ========================================
export function LandingClient() {
  return (
    <LanguageProvider>
      <div className="min-h-screen bg-black text-[#F5F5F5] flex flex-col selection:bg-purple-600/30 selection:text-purple-200 overflow-x-hidden relative grain-overlay cursor-none md:cursor-none">
        {/* Custom cursor — desktop only */}
        <CustomCursor />

        {/* Subtle dot grid background */}
        <div
          className="fixed inset-0 pointer-events-none opacity-[0.02] z-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 0.5px, transparent 0)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* 1. Fixed Navigation — SINGLE INSTANCE */}
        <LandingNavbar />

        {/* Main scrollable content */}
        <main className="relative z-10 flex-1">
          {/* 2. Hero Section — no reveal wrapper, instant */}
          <LandingHero />

          {/* 3. Trust Bar — Kinetic Counters */}
          <RevealSection>
            <TrustBar />
          </RevealSection>

          {/* 4. Bento Feature Grid */}
          <RevealSection>
            <BentoFeatures />
          </RevealSection>

          {/* 5. Product Preview (Interactive Tabs) */}
          <RevealSection>
            <ProductPreview />
          </RevealSection>

          {/* 6. How It Works (3-Step) */}
          <RevealSection>
            <HowItWorks />
          </RevealSection>

          {/* 7. Pricing / Tier Comparison */}
          <RevealSection>
            <PricingSection />
          </RevealSection>

          {/* 8. Testimonials */}
          <RevealSection>
            <TestimonialsSection />
          </RevealSection>

          {/* 9. FAQ Accordion */}
          <RevealSection>
            <FAQSection />
          </RevealSection>

          {/* 10. Final CTA Banner */}
          <RevealSection>
            <FinalCTABanner />
          </RevealSection>
        </main>

        {/* 11. Footer — clearly NOT a navbar */}
        <LandingFooter />
      </div>
    </LanguageProvider>
  );
}

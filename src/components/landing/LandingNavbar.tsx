"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Sparkles, ArrowRight, Menu, X, Globe } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { landingTranslations } from "@/lib/i18n/translations/landing";
import { useMagnetic } from "@/lib/hooks/useMotion";

export function LandingNavbar() {
  const { language, setLanguage } = useLanguage();
  const t = landingTranslations[language].navbar;
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const ctaRef = React.useRef<HTMLDivElement>(null);
  const magnetic = useMagnetic(ctaRef, 0.25);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: t.features, href: "#features" },
    { label: t.preview, href: "#preview" },
    { label: t.howItWorks, href: "#how-it-works" },
    { label: t.pricing, href: "#pricing" },
    { label: t.faq, href: "#faq" },
  ];

  const handleScrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-black/80 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_1px_40px_-12px_rgba(139,92,246,0.08)] py-3"
          : "bg-transparent border-b border-transparent py-5"
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group cursor-hover">
          <div className="relative h-8 w-8 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(168,85,247,0.35)] group-hover:shadow-[0_0_22px_rgba(168,85,247,0.6)] group-hover:scale-105 transition-all duration-300 shrink-0">
            <Image
              src="/logo.png"
              alt="Deadline Logo"
              width={32}
              height={32}
              priority
              className="h-full w-full object-contain"
            />
          </div>
          <span className="text-base font-display font-bold tracking-tight text-white group-hover:text-purple-200 transition-colors">
            Deadline
          </span>
        </Link>

        {/* Desktop Section Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => handleScrollToSection(e, item.href)}
              className="text-[13px] font-medium text-zinc-500 hover:text-white transition-colors duration-200 cursor-hover relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1.5px] after:bg-purple-500 after:transition-all after:duration-300 hover:after:w-full"
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Right Actions & Language Switcher */}
        <div className="hidden md:flex items-center gap-3">
          {/* EN / ID Language Pill */}
          <div
            className="flex items-center rounded-full bg-white/[0.04] border border-white/[0.06] p-0.5 text-[11px] font-medium"
            role="group"
            aria-label="Language selection"
          >
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={`px-2.5 py-1 rounded-full transition-all duration-200 cursor-hover ${
                language === "en"
                  ? "bg-purple-600 text-white font-semibold shadow-purple-glow-sm"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
              aria-pressed={language === "en"}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLanguage("id")}
              className={`px-2.5 py-1 rounded-full transition-all duration-200 cursor-hover ${
                language === "id"
                  ? "bg-purple-600 text-white font-semibold shadow-purple-glow-sm"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
              aria-pressed={language === "id"}
            >
              ID
            </button>
          </div>

          {/* Sign In */}
          <Link href="/login" className="cursor-hover">
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white text-[13px]">
              {t.signIn}
            </Button>
          </Link>

          {/* Get Started Free — Magnetic */}
          <div
            ref={ctaRef}
            onMouseMove={magnetic.handleMouseMove}
            onMouseLeave={magnetic.handleMouseLeave}
            style={magnetic.style}
          >
            <Link href="/register" className="cursor-hover">
              <Button size="sm" className="shadow-purple-glow-sm text-[13px] gap-1.5">
                <span>{t.getStarted}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Mobile Hamburger & Language */}
        <div className="flex md:hidden items-center gap-2">
          {/* Mobile Language Toggle */}
          <button
            type="button"
            onClick={() => setLanguage(language === "en" ? "id" : "en")}
            className="px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-[11px] font-medium text-zinc-400 flex items-center gap-1"
            aria-label={`Switch language. Current: ${language.toUpperCase()}`}
          >
            <Globe className="h-3 w-3 text-purple-400" />
            <span>{language.toUpperCase()}</span>
          </button>

          {/* Hamburger toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-zinc-400 hover:text-white focus:outline-none"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/[0.06] bg-black/95 backdrop-blur-xl px-4 pt-4 pb-6 space-y-4 animate-slide-up">
          <div className="flex flex-col space-y-1">
            {navLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleScrollToSection(e, item.href)}
                className="px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:bg-white/[0.04] hover:text-white transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="pt-3 border-t border-white/[0.06] flex flex-col gap-2.5">
            <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full justify-center">
                {t.signIn}
              </Button>
            </Link>
            <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
              <Button className="w-full justify-center shadow-purple-glow-sm">
                <span>{t.getStarted}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

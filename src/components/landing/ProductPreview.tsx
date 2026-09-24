"use client";

import * as React from "react";
import {
  LayoutDashboard,
  Calendar as CalendarIcon,
  BookOpen,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Copy,
  Check,
  TrendingUp,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { landingTranslations } from "@/lib/i18n/translations/landing";
import { useReducedMotion } from "@/lib/hooks/useMotion";

export function ProductPreview() {
  const { language } = useLanguage();
  const t = landingTranslations[language].preview;
  const prefersReduced = useReducedMotion();

  const tabs = [
    { key: "dashboard" as const, label: t.tabs.dashboard, icon: LayoutDashboard },
    { key: "calendar" as const, label: t.tabs.calendar, icon: CalendarIcon },
    { key: "courses" as const, label: t.tabs.courses, icon: BookOpen },
  ];

  const [activeTab, setActiveTab] = React.useState<"dashboard" | "calendar" | "courses">("dashboard");
  const [copiedCode, setCopiedCode] = React.useState(false);
  const [transitioning, setTransitioning] = React.useState(false);

  // Auto-play carousel
  React.useEffect(() => {
    if (prefersReduced) return;
    const interval = setInterval(() => {
      setTransitioning(true);
      setTimeout(() => {
        setActiveTab((prev) => {
          const order: ("dashboard" | "calendar" | "courses")[] = ["dashboard", "calendar", "courses"];
          const idx = order.indexOf(prev);
          return order[(idx + 1) % order.length];
        });
        setTransitioning(false);
      }, 200);
    }, 5000);
    return () => clearInterval(interval);
  }, [prefersReduced]);

  const handleTabClick = (tab: "dashboard" | "calendar" | "courses") => {
    if (tab === activeTab) return;
    setTransitioning(true);
    setTimeout(() => {
      setActiveTab(tab);
      setTransitioning(false);
    }, 150);
  };

  const handleCopyCode = () => {
    navigator.clipboard?.writeText("K9X2P4");
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Find active tab index for sliding indicator
  const activeIndex = tabs.findIndex((t) => t.key === activeTab);

  return (
    <section id="preview" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header — right-aligned for asymmetry */}
      <div className="max-w-2xl ml-auto text-right mb-12 sm:mb-16">
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

      {/* Tab Buttons with sliding indicator */}
      <div className="flex flex-wrap items-center justify-center gap-1 mb-8 p-1 rounded-2xl bg-white/[0.03] border border-white/[0.05] w-fit mx-auto relative">
        {tabs.map((tab, i) => {
          const Icon = tab.icon;
          const isActive = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabClick(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 relative z-10 cursor-hover ${
                isActive
                  ? "text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
        {/* Sliding active bg */}
        <div
          className="absolute top-1 bottom-1 rounded-xl bg-purple-600/80 shadow-purple-glow-sm transition-all duration-300 z-0"
          style={{
            left: `${activeIndex * (100 / tabs.length)}%`,
            width: `${100 / tabs.length}%`,
            marginLeft: "4px",
            marginRight: "4px",
            maxWidth: `calc(${100 / tabs.length}% - 8px)`,
          }}
        />
      </div>

      {/* AMOLED Command Center Window Frame */}
      <div className="rounded-3xl border border-white/[0.06] bg-[#050505] shadow-2xl overflow-hidden">
        {/* Window Topbar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-white/[0.02] border-b border-white/[0.05]">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-500/80 inline-block" />
            <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <div className="px-4 py-1 rounded-lg bg-white/[0.03] border border-white/[0.05] text-[11px] font-mono text-zinc-500 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>deadline.app/{activeTab}</span>
          </div>
          <div className="text-[11px] text-zinc-600 font-mono hidden sm:block">
            AMOLED Dark Suite v2.0
          </div>
        </div>

        {/* Window Interior Content */}
        <div className={`p-4 sm:p-7 min-h-[460px] transition-opacity duration-200 ${transitioning ? "opacity-0" : "opacity-100"}`}>
          {/* TAB 1: DASHBOARD COMMAND CENTER */}
          {activeTab === "dashboard" && (
            <div className="space-y-6">
              {/* Greeting */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/[0.05]">
                <div>
                  <h3 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">
                    {t.dashboardMockup.headerGreeting}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    {t.dashboardMockup.headerSub}
                  </p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold">
                  Term: Fall 2026
                </span>
              </div>

              {/* 4 Stat Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <span className="text-xs text-zinc-500">{t.dashboardMockup.statTotal}</span>
                  <p className="text-2xl font-display font-bold text-white mt-1">12</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <span className="text-xs text-emerald-400">{t.dashboardMockup.statCompleted}</span>
                  <p className="text-2xl font-display font-bold text-emerald-300 mt-1">9</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <span className="text-xs text-rose-400">{t.dashboardMockup.statOverdue}</span>
                  <p className="text-2xl font-display font-bold text-rose-400 mt-1">0</p>
                </div>
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                  <span className="text-xs text-purple-400">{t.dashboardMockup.statDueWeek}</span>
                  <p className="text-2xl font-display font-bold text-purple-300 mt-1">3</p>
                </div>
              </div>

              {/* Today's Focus Card + Workload Bar */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 p-5 rounded-2xl bg-white/[0.02] border border-purple-500/15 space-y-3 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                      <Flame className="h-3.5 w-3.5" />
                      {t.dashboardMockup.focusTitle}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      {t.dashboardMockup.dueBadge}
                    </span>
                  </div>
                  <h4 className="text-base sm:text-lg font-display font-bold text-white">
                    {t.dashboardMockup.focusItem}
                  </h4>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-zinc-500">
                      <span>Progress</span>
                      <span className="font-mono text-purple-400">80%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 w-4/5 rounded-full" />
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
                    {t.dashboardMockup.workloadTitle}
                  </span>
                  <p className="text-xs text-zinc-400">
                    {t.dashboardMockup.workloadStatus}
                  </p>
                  <div className="flex items-end justify-between h-20 pt-2 gap-2">
                    {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => {
                      const heights = ["40%", "70%", "90%", "60%", "30%", "20%", "45%"];
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                          <div
                            className={`w-full rounded-t transition-all ${
                              i === 2 ? "bg-purple-500 shadow-purple-glow-sm" : "bg-white/[0.06]"
                            }`}
                            style={{ height: heights[i] }}
                          />
                          <span className="text-[10px] text-zinc-600 font-mono">{day}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INTERACTIVE CALENDAR */}
          {activeTab === "calendar" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.05]">
                <div>
                  <h3 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">
                    {t.calendarMockup.monthLabel}
                  </h3>
                  <p className="text-xs text-zinc-500">{t.calendarMockup.weekLabel}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
                  <span className="text-xs text-zinc-500">CS-301</span>
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 ml-2" />
                  <span className="text-xs text-zinc-500">MATH-202</span>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2 text-center text-xs font-mono text-zinc-600 pb-2 border-b border-white/[0.04]">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {[...Array(28)].map((_, i) => {
                  const dayNum = i + 1;
                  const isToday = dayNum === 15;
                  const hasDeadline1 = dayNum === 16;
                  const hasDeadline2 = dayNum === 22;
                  const hasExam = dayNum === 25;

                  return (
                    <div
                      key={i}
                      className={`min-h-[60px] sm:min-h-[72px] p-2 rounded-xl border flex flex-col justify-between text-left transition-all ${
                        isToday
                          ? "border-purple-500/40 bg-purple-500/10 text-purple-300 shadow-purple-glow-sm"
                          : "border-white/[0.04] bg-white/[0.01] hover:border-white/[0.08]"
                      }`}
                    >
                      <span className={`text-xs font-mono ${isToday ? "font-bold text-purple-400" : "text-zinc-600"}`}>
                        {dayNum}
                      </span>
                      {hasDeadline1 && (
                        <div className="px-1.5 py-0.5 rounded bg-purple-500/15 border border-purple-500/25 text-[10px] text-purple-300 truncate">
                          CS-301 Set
                        </div>
                      )}
                      {hasDeadline2 && (
                        <div className="px-1.5 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/25 text-[10px] text-emerald-300 truncate">
                          Math Quiz
                        </div>
                      )}
                      {hasExam && (
                        <div className="px-1.5 py-0.5 rounded bg-rose-500/15 border border-rose-500/25 text-[10px] text-rose-300 truncate">
                          Midterm
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: COURSES & SUBMISSIONS */}
          {activeTab === "courses" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/[0.05]">
                <div>
                  <h3 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">
                    {t.coursesMockup.activeStudents}: 48
                  </h3>
                  <p className="text-xs text-zinc-500">
                    2 Active Courses · Fall Semester
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500">{t.coursesMockup.joinCodeLabel}:</span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-purple-500/25 text-purple-300 text-xs font-mono font-bold hover:bg-white/[0.05] transition-colors cursor-hover"
                  >
                    <span>K9X2P4</span>
                    {copiedCode ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-purple-500/15 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded text-xs font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      {t.coursesMockup.course1Code}
                    </span>
                    <span className="text-xs font-mono text-zinc-500">24 Students</span>
                  </div>
                  <div>
                    <h4 className="text-base font-display font-bold text-white">{t.coursesMockup.course1Title}</h4>
                    <p className="text-xs text-zinc-500 mt-0.5">Instructor: Prof. Robert Hoffman</p>
                  </div>
                  <div className="space-y-1.5 pt-2 border-t border-white/[0.05]">
                    <div className="flex justify-between text-xs text-zinc-500">
                      <span>{t.coursesMockup.progressLabel}</span>
                      <span className="font-mono text-purple-400">82%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full w-[82%]" />
                    </div>
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-white/[0.02] border border-emerald-500/15 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded text-xs font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                      {t.coursesMockup.course2Code}
                    </span>
                    <span className="text-xs font-mono text-zinc-500">24 Students</span>
                  </div>
                  <div>
                    <h4 className="text-base font-display font-bold text-white">{t.coursesMockup.course2Title}</h4>
                    <p className="text-xs text-zinc-500 mt-0.5">Instructor: Dr. Sarah Chen</p>
                  </div>
                  <div className="space-y-1.5 pt-2 border-t border-white/[0.05]">
                    <div className="flex justify-between text-xs text-zinc-500">
                      <span>{t.coursesMockup.progressLabel}</span>
                      <span className="font-mono text-emerald-400">65%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full w-[65%]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

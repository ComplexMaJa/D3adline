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
  FileText,
  Award,
  Sparkles,
  Paperclip,
  CheckSquare,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { landingTranslations } from "@/lib/i18n/translations/landing";
import { AccordionGallery, AccordionGalleryItem } from "@/components/ui/AccordionGallery";

export function ProductPreview() {
  const { language } = useLanguage();
  const t = landingTranslations[language].preview;
  const isId = language === "id";

  const [activeIndex, setActiveIndex] = React.useState(0);
  const [copiedCode, setCopiedCode] = React.useState(false);

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText("K9X2P4");
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Nav pills for quick direct jumping
  const views = [
    { label: t.tabs.dashboard, icon: LayoutDashboard, color: "#8B5CF6" },
    { label: t.tabs.calendar, icon: CalendarIcon, color: "#3B82F6" },
    { label: t.tabs.courses, icon: BookOpen, color: "#10B981" },
    { label: isId ? "Pengumpulan Tugas" : "Deliverables & Files", icon: FileText, color: "#F59E0B" },
    { label: isId ? "Penilaian Dosen" : "Grading Suite", icon: Award, color: "#EC4899" },
  ];

  // Accordion Panels Definition
  const accordionItems: AccordionGalleryItem[] = [
    // 1. Dashboard Command Center
    {
      label: isId ? "Dasbor Utama" : "Dashboard Command Center",
      tag: isId ? "IKHTISAR UTAMA" : "EXECUTIVE OVERVIEW",
      description: isId ? "Pelacakan beban tugas & prioritas waktu nyata" : "Workload pacing & priority tracking",
      accentColor: "#8B5CF6",
      content: (
        <div className="h-full w-full bg-[#08070D] p-5 sm:p-7 flex flex-col justify-between overflow-hidden relative text-left">
          {/* Top Window Bar */}
          <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
              <span className="ml-2 font-mono text-[11px] text-zinc-500">deadline.app/dashboard</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-[10px] font-semibold">
              Term: Fall 2026
            </span>
          </div>

          {/* Welcome greeting */}
          <div className="my-2">
            <h3 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">
              {t.dashboardMockup.headerGreeting}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              {t.dashboardMockup.headerSub}
            </p>
          </div>

          {/* 4 Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-2">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
              <span className="text-[11px] text-zinc-400">{t.dashboardMockup.statTotal}</span>
              <p className="text-xl sm:text-2xl font-display font-bold text-white mt-0.5">12</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20">
              <span className="text-[11px] text-emerald-400">{t.dashboardMockup.statCompleted}</span>
              <p className="text-xl sm:text-2xl font-display font-bold text-emerald-300 mt-0.5">9</p>
            </div>
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
              <span className="text-[11px] text-zinc-500">{t.dashboardMockup.statOverdue}</span>
              <p className="text-xl sm:text-2xl font-display font-bold text-zinc-400 mt-0.5">0</p>
            </div>
            <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-500/20">
              <span className="text-[11px] text-purple-400">{t.dashboardMockup.statDueWeek}</span>
              <p className="text-xl sm:text-2xl font-display font-bold text-purple-300 mt-0.5">3</p>
            </div>
          </div>

          {/* Today's Focus Card */}
          <div className="p-4 rounded-xl bg-[#0F0C1B] border border-purple-500/25 my-2">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5" />
                {t.dashboardMockup.focusTitle}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/25">
                {t.dashboardMockup.dueBadge}
              </span>
            </div>
            <h4 className="text-sm sm:text-base font-display font-bold text-white truncate">
              {t.dashboardMockup.focusItem}
            </h4>
            <div className="space-y-1 mt-2">
              <div className="flex justify-between text-[11px] text-zinc-400">
                <span>Progress</span>
                <span className="font-mono text-purple-400">80%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-white/[0.08] overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-violet-400 w-4/5 rounded-full" />
              </div>
            </div>
          </div>

          {/* Bottom spacer for accordion label */}
          <div className="h-12" />
        </div>
      ),
    },

    // 2. Interactive Calendar Matrix
    {
      label: isId ? "Matriks Kalender Tenggat" : "Interactive Calendar Matrix",
      tag: isId ? "JADWAL & TENGGAT" : "SCHEDULES & TIMELINES",
      description: isId ? "Tampilan linimasa dengan kode warna mata kuliah" : "Timeline views with course chips",
      accentColor: "#3B82F6",
      content: (
        <div className="h-full w-full bg-[#060913] p-5 sm:p-7 flex flex-col justify-between overflow-hidden relative text-left">
          {/* Top Window Bar */}
          <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
              <span className="ml-2 font-mono text-[11px] text-zinc-500">deadline.app/calendar</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              <span className="text-[11px] text-zinc-400 font-mono">CS-301</span>
              <span className="h-2 w-2 rounded-full bg-emerald-500 ml-1.5" />
              <span className="text-[11px] text-zinc-400 font-mono">MATH-202</span>
            </div>
          </div>

          {/* Calendar Header */}
          <div className="my-2 flex items-center justify-between">
            <h3 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">
              {t.calendarMockup.monthLabel}
            </h3>
            <span className="text-xs text-blue-400 font-mono">{t.calendarMockup.weekLabel}</span>
          </div>

          {/* Calendar Day Header */}
          <div className="grid grid-cols-7 gap-1.5 text-center text-[10px] font-mono text-zinc-500 pb-1 border-b border-white/[0.04]">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>

          {/* Calendar Days Matrix */}
          <div className="grid grid-cols-7 gap-1.5 my-2">
            {[...Array(21)].map((_, i) => {
              const dayNum = i + 10;
              const isToday = dayNum === 16;
              const hasTask1 = dayNum === 17;
              const hasTask2 = dayNum === 21;
              const hasExam = dayNum === 25;

              return (
                <div
                  key={i}
                  className={`min-h-[50px] sm:min-h-[60px] p-1.5 rounded-xl border flex flex-col justify-between text-left transition-all ${
                    isToday
                      ? "border-blue-500/50 bg-blue-500/15 text-blue-300 shadow-[0_0_15px_-2px_rgba(59,130,246,0.25)]"
                      : "border-white/[0.04] bg-white/[0.01]"
                  }`}
                >
                  <span className={`text-[10px] font-mono ${isToday ? "font-bold text-blue-400" : "text-zinc-500"}`}>
                    {dayNum}
                  </span>
                  {hasTask1 && (
                    <div className="px-1 py-0.5 rounded bg-purple-500/20 text-[9px] text-purple-300 truncate font-medium">
                      CS-301 AVL
                    </div>
                  )}
                  {hasTask2 && (
                    <div className="px-1 py-0.5 rounded bg-blue-500/20 text-[9px] text-blue-300 truncate font-medium">
                      Math Set 1
                    </div>
                  )}
                  {hasExam && (
                    <div className="px-1 py-0.5 rounded bg-rose-500/20 text-[9px] text-rose-300 truncate font-medium">
                      Midterm
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom spacer for accordion label */}
          <div className="h-12" />
        </div>
      ),
    },

    // 3. Courses & Student Hub
    {
      label: isId ? "Pusat Mata Kuliah" : "Courses & Student Hub",
      tag: isId ? "MANAJEMEN KELAS" : "CLASS MANAGEMENT",
      description: isId ? "Kode gabung 6 digit & persentase kelulusan tugas" : "6-digit join codes & syllabus tracking",
      accentColor: "#10B981",
      content: (
        <div className="h-full w-full bg-[#050D0A] p-5 sm:p-7 flex flex-col justify-between overflow-hidden relative text-left">
          {/* Top Window Bar */}
          <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
              <span className="ml-2 font-mono text-[11px] text-zinc-500">deadline.app/courses</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-zinc-400">{t.coursesMockup.joinCodeLabel}:</span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-bold hover:bg-emerald-500/20 transition-all cursor-pointer"
              >
                <span>K9X2P4</span>
                {copiedCode ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              </button>
            </div>
          </div>

          {/* Active Courses count */}
          <div className="my-2">
            <h3 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight">
              {t.coursesMockup.activeStudents}: 48
            </h3>
            <p className="text-xs text-zinc-400">2 Active Enrolled Courses · Fall 2026</p>
          </div>

          {/* 2 Course Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-2">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-emerald-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/25">
                  CS-301
                </span>
                <span className="text-[11px] font-mono text-zinc-500">24 Students</span>
              </div>
              <div>
                <h4 className="text-sm font-display font-bold text-white truncate">
                  Data Structures & Algorithms
                </h4>
                <p className="text-[11px] text-zinc-400">Prof. Robert Hoffman</p>
              </div>
              <div className="space-y-1 pt-1.5 border-t border-white/[0.05]">
                <div className="flex justify-between text-[11px] text-zinc-400">
                  <span>Completion</span>
                  <span className="font-mono text-emerald-400">82%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/[0.08] overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full w-[82%]" />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-blue-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/15 text-blue-300 border border-blue-500/25">
                  MATH-202
                </span>
                <span className="text-[11px] font-mono text-zinc-500">24 Students</span>
              </div>
              <div>
                <h4 className="text-sm font-display font-bold text-white truncate">
                  Linear Algebra & Calculus III
                </h4>
                <p className="text-[11px] text-zinc-400">Dr. Sarah Chen</p>
              </div>
              <div className="space-y-1 pt-1.5 border-t border-white/[0.05]">
                <div className="flex justify-between text-[11px] text-zinc-400">
                  <span>Completion</span>
                  <span className="font-mono text-blue-400">65%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/[0.08] overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full w-[65%]" />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom spacer for accordion label */}
          <div className="h-12" />
        </div>
      ),
    },

    // 4. Deliverables & Smart Turn-In
    {
      label: isId ? "Pengumpulan Tugas Nyata" : "Deliverables & Smart Turn-In",
      tag: isId ? "PROTOKOL PENGUMPULAN" : "SUBMISSION PROTOCOL",
      description: isId ? "Daftar periksa subtugas & verifikasi berkas" : "Non-empty deliverable verification",
      accentColor: "#F59E0B",
      content: (
        <div className="h-full w-full bg-[#0D0A05] p-5 sm:p-7 flex flex-col justify-between overflow-hidden relative text-left">
          {/* Top Window Bar */}
          <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
              <span className="ml-2 font-mono text-[11px] text-zinc-500">deadline.app/assignments/d111</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-semibold">
              Deliverables Enforced
            </span>
          </div>

          {/* Assignment Title */}
          <div className="my-2">
            <span className="text-[11px] font-mono text-amber-400 font-semibold">CS-301 · Assignment 1</span>
            <h3 className="text-xl sm:text-2xl font-display font-bold text-white tracking-tight mt-0.5">
              Red-Black Trees & Balancing Benchmark
            </h3>
          </div>

          {/* Subtasks Checklist */}
          <div className="space-y-2 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] my-2">
            <div className="flex items-center gap-2.5 text-xs text-zinc-300">
              <CheckSquare className="h-4 w-4 text-emerald-400 shrink-0" />
              <span className="line-through text-zinc-500">Define AVL tree rotation primitives</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-zinc-300">
              <CheckSquare className="h-4 w-4 text-emerald-400 shrink-0" />
              <span className="line-through text-zinc-500">Implement Red-Black tree insertion color fixes</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-zinc-300">
              <CheckSquare className="h-4 w-4 text-emerald-400 shrink-0" />
              <span className="line-through text-zinc-500">Benchmark throughput against standard std::map</span>
            </div>
          </div>

          {/* Attached Deliverables Bar */}
          <div className="flex flex-wrap gap-2 my-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/30 border border-amber-500/30 text-amber-300 text-xs">
              <Paperclip className="h-3.5 w-3.5" />
              <span>benchmark_results.cpp</span>
              <span className="text-[10px] text-amber-400/70 font-mono">(24.5 KB)</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/30 border border-amber-500/30 text-amber-300 text-xs">
              <FileText className="h-3.5 w-3.5" />
              <span>rotation_proof.pdf</span>
              <span className="text-[10px] text-amber-400/70 font-mono">(1.2 MB)</span>
            </div>
          </div>

          {/* Bottom spacer for accordion label */}
          <div className="h-12" />
        </div>
      ),
    },

    // 5. Grading & Instructor Suite
    {
      label: isId ? "Portal Penilaian Dosen" : "Grading & Instructor Suite",
      tag: isId ? "PORTAL PENILAIAN" : "EVALUATION HUB",
      description: isId ? "Pemberian nilai & umpan balik terisolasi" : "Teacher grading portal & score analytics",
      accentColor: "#EC4899",
      content: (
        <div className="h-full w-full bg-[#0D0509] p-5 sm:p-7 flex flex-col justify-between overflow-hidden relative text-left">
          {/* Top Window Bar */}
          <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.06]">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
              <span className="ml-2 font-mono text-[11px] text-zinc-500">deadline.app/submissions</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-[10px] font-semibold">
              Teacher Review Mode
            </span>
          </div>

          {/* Student Evaluation Card */}
          <div className="my-2 p-4 rounded-xl bg-white/[0.02] border border-rose-500/20 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full bg-purple-600/30 border border-purple-500/40 text-purple-300 flex items-center justify-center font-bold text-xs">
                  AR
                </div>
                <div>
                  <h4 className="text-sm font-display font-bold text-white">Alex Rivera</h4>
                  <p className="text-[11px] text-zinc-400">CS-301 · Red-Black Trees Benchmark</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-display font-bold text-emerald-400">95.00</span>
                <span className="text-xs text-zinc-500"> / 100</span>
              </div>
            </div>

            {/* Teacher Feedback Box */}
            <div className="p-3 rounded-lg bg-black/40 border border-white/[0.06]">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">
                Instructor Feedback:
              </span>
              <p className="text-xs text-zinc-300 italic">
                &ldquo;Exceptional benchmark methodology and clean rotation pointers! Well done.&rdquo;
              </p>
              <span className="text-[10px] text-purple-400 block mt-1.5 font-medium">
                — Prof. Robert Hoffman
              </span>
            </div>
          </div>

          {/* Bottom spacer for accordion label */}
          <div className="h-12" />
        </div>
      ),
    },
  ];

  return (
    <section id="preview" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
      {/* Background radial aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Header — elegant asymmetric headline */}
      <div className="max-w-2xl ml-auto text-right mb-10 sm:mb-14">
        <span className="text-xs font-mono font-semibold uppercase tracking-widest text-purple-400 mb-3 block">
          {t.sectionBadge}
        </span>
        <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight text-white mb-4 leading-[1.08]">
          {t.sectionTitle}
        </h2>
        <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
          {t.sectionSubtitle}
        </p>
      </div>

      {/* Quick View Navigation Pills */}
      <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-8 p-1.5 rounded-2xl bg-[#09090C]/90 border border-white/[0.06] w-fit mx-auto shadow-lg backdrop-blur-md">
        {views.map((item, i) => {
          const Icon = item.icon;
          const isActive = i === activeIndex;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 cursor-pointer ${
                isActive
                  ? "bg-purple-600 text-white shadow-purple-glow-sm"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]"
              }`}
            >
              <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" style={{ color: isActive ? "#ffffff" : item.color }} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3D Perspective Accordion Gallery */}
      <div className="rounded-3xl border border-white/[0.08] bg-[#050508]/80 p-2 sm:p-3 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <AccordionGallery
          items={accordionItems}
          defaultIndex={0}
          activeIndex={activeIndex}
          onActiveChange={setActiveIndex}
          height={520}
          gap={12}
          radius={20}
          expandRatio={0.56}
          duration={0.55}
          parallax={0.4}
          tilt={5}
          trigger="hover"
          accentColor="#8B5CF6"
          overlayColor="#05020A"
          grayscale={true}
          showLabels={true}
        />
      </div>
    </section>
  );
}

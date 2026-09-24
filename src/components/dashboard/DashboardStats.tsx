import * as React from "react";
import Link from "next/link";
import { MessageSquare, CheckCircle2, AlertTriangle, Calendar, Percent, BookOpen, Users, Award } from "lucide-react";
import { DashboardMetrics } from "@/types/database";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useApp } from "@/components/layout/AppShell";

interface DashboardStatsProps {
  metrics: DashboardMetrics;
}

export function DashboardStats({ metrics }: DashboardStatsProps) {
  const { t, language } = useLanguage();
  const { isTeacher, courses } = useApp();
  const isId = language === "id";

  if (isTeacher) {
    const totalStudents = courses.reduce(
      (acc, c) => acc + (c.enrolled_students_count || 0),
      0
    );

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* 1. Classes Taught */}
        <Link
          href="/courses"
          className="rounded-2xl border border-[#181818] bg-[#070707] p-4 flex items-center gap-3.5 hover:border-emerald-800/50 hover:bg-[#060f0a] transition-all group"
        >
          <div className="h-10 w-10 rounded-xl bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
            <BookOpen className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-2xl font-bold tracking-tight text-white leading-tight">
              {courses.length}
            </div>
            <div className="text-xs font-semibold text-zinc-300 truncate">
              {isId ? "Kelas Diajar" : "Classes Taught"}
            </div>
            <div className="text-[11px] text-zinc-500 truncate">
              {isId ? "Kelas aktif Anda" : "Your active classes"}
            </div>
          </div>
        </Link>

        {/* 2. Total Enrolled Students */}
        <Link
          href="/courses"
          className="rounded-2xl border border-[#181818] bg-[#070707] p-4 flex items-center gap-3.5 hover:border-teal-800/50 hover:bg-[#060e0d] transition-all group"
        >
          <div className="h-10 w-10 rounded-xl bg-teal-950/40 border border-teal-800/40 flex items-center justify-center text-teal-400 group-hover:scale-105 transition-transform shrink-0">
            <Users className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-2xl font-bold tracking-tight text-white leading-tight">
              {totalStudents}
            </div>
            <div className="text-xs font-semibold text-zinc-300 truncate">
              {isId ? "Total Mahasiswa" : "Enrolled Students"}
            </div>
            <div className="text-[11px] text-teal-400 font-medium truncate">
              {isId ? "Di semua kelas" : "Across all classes"}
            </div>
          </div>
        </Link>

        {/* 3. Active Assignments */}
        <Link
          href="/assignments"
          className="rounded-2xl border border-[#181818] bg-[#070707] p-4 flex items-center gap-3.5 hover:border-purple-800/50 hover:bg-[#0c0812] transition-all group"
        >
          <div className="h-10 w-10 rounded-xl bg-purple-950/40 border border-purple-800/40 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform shrink-0">
            <MessageSquare className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-2xl font-bold tracking-tight text-white leading-tight">
              {metrics.totalAssignments}
            </div>
            <div className="text-xs font-semibold text-zinc-300 truncate">
              {isId ? "Tugas Aktif" : "Active Tasks"}
            </div>
            <div className="text-[11px] text-zinc-500 truncate">
              {metrics.dueThisWeek} {isId ? "tenggat minggu ini" : "due this week"}
            </div>
          </div>
        </Link>

        {/* 4. Submissions / Grading Workload */}
        <Link
          href="/submissions"
          className="rounded-2xl border border-[#181818] bg-[#070707] p-4 flex items-center gap-3.5 hover:border-amber-800/50 hover:bg-[#120e06] transition-all group"
        >
          <div className="h-10 w-10 rounded-xl bg-amber-950/40 border border-amber-800/40 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform shrink-0">
            <Award className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-2xl font-bold tracking-tight text-white leading-tight">
              {metrics.pendingAssignments}
            </div>
            <div className="text-xs font-semibold text-zinc-300 truncate">
              {isId ? "Perlu Dinilai" : "Grading Queue"}
            </div>
            <div className="text-[11px] text-amber-400/90 font-medium truncate">
              {isId ? "Buka Pengumpulan" : "Review Submissions"}
            </div>
          </div>
        </Link>

        {/* 5. Completion Rate */}
        <div className="rounded-2xl border border-[#181818] bg-[#070707] p-4 flex flex-col justify-between gap-2 col-span-2 sm:col-span-1">
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-xl bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-center text-emerald-400 shrink-0">
              <Percent className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-2xl font-bold tracking-tight text-white leading-tight">
                {metrics.completionPercentage}%
              </div>
              <div className="text-xs font-semibold text-zinc-300 truncate">
                {isId ? "Tingkat Selesai" : "Completion Rate"}
              </div>
            </div>
          </div>
          <div className="w-full h-1.5 bg-[#161616] rounded-full overflow-hidden mt-1">
            <div
              className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]"
              style={{ width: `${Math.min(100, Math.max(0, metrics.completionPercentage))}%` }}
            />
          </div>
        </div>
      </div>
    );
  }

  // Student Metrics
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
      {/* 1. Total Assignments */}
      <Link
        href="/assignments"
        className="rounded-2xl border border-[#181818] bg-[#070707] p-4 flex items-center gap-3.5 hover:border-purple-800/50 hover:bg-[#0c0812] transition-all group"
      >
        <div className="h-10 w-10 rounded-xl bg-purple-950/40 border border-purple-800/40 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform shrink-0">
          <MessageSquare className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-2xl font-bold tracking-tight text-white leading-tight">
            {metrics.totalAssignments}
          </div>
          <div className="text-xs font-semibold text-zinc-300 truncate">
            {t.dashboard.stats.totalAssignments}
          </div>
          <div className="text-[11px] text-zinc-500 truncate">
            {isId ? "Semua mata kuliah" : "All courses"}
          </div>
        </div>
      </Link>

      {/* 2. Completed */}
      <Link
        href="/assignments?status=Completed"
        className="rounded-2xl border border-[#181818] bg-[#070707] p-4 flex items-center gap-3.5 hover:border-emerald-800/50 hover:bg-[#060f0a] transition-all group"
      >
        <div className="h-10 w-10 rounded-xl bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
          <CheckCircle2 className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-2xl font-bold tracking-tight text-white leading-tight">
            {metrics.completedAssignments}
          </div>
          <div className="text-xs font-semibold text-zinc-300 truncate">
            {t.dashboard.stats.completed}
          </div>
          <div className="text-[11px] text-emerald-400 font-medium truncate">
            {metrics.completionPercentage}% {t.dashboard.stats.ofTotal}
          </div>
        </div>
      </Link>

      {/* 3. Overdue */}
      <Link
        href="/assignments?status=Overdue"
        className="rounded-2xl border border-[#181818] bg-[#070707] p-4 flex items-center gap-3.5 hover:border-red-800/60 hover:bg-[#120707] transition-all group"
      >
        <div className="h-10 w-10 rounded-xl bg-red-950/40 border border-red-800/40 flex items-center justify-center text-red-400 group-hover:scale-105 transition-transform shrink-0">
          <AlertTriangle className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-2xl font-bold tracking-tight text-white leading-tight">
            {metrics.overdueAssignments}
          </div>
          <div className="text-xs font-semibold text-zinc-300 truncate">
            {t.dashboard.stats.overdue}
          </div>
          <div className="text-[11px] text-red-400/90 font-medium truncate">
            {metrics.overdueAssignments > 0 ? t.dashboard.stats.needsAttention : t.dashboard.stats.allOnTrack}
          </div>
        </div>
      </Link>

      {/* 4. Due This Week */}
      <Link
        href="/assignments?dateRange=this_week"
        className="rounded-2xl border border-[#181818] bg-[#070707] p-4 flex items-center gap-3.5 hover:border-amber-800/50 hover:bg-[#120e06] transition-all group"
      >
        <div className="h-10 w-10 rounded-xl bg-amber-950/40 border border-amber-800/40 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform shrink-0">
          <Calendar className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-2xl font-bold tracking-tight text-white leading-tight">
            {metrics.dueThisWeek}
          </div>
          <div className="text-xs font-semibold text-zinc-300 truncate">
            {t.dashboard.stats.dueThisWeek}
          </div>
          <div className="text-[11px] text-zinc-500 truncate">
            {t.dashboard.stats.next7Days}
          </div>
        </div>
      </Link>

      {/* 5. Completion Rate */}
      <Link
        href="/assignments"
        className="rounded-2xl border border-[#181818] bg-[#070707] p-4 flex flex-col justify-between gap-2 hover:border-purple-800/50 hover:bg-[#0c0812] transition-all col-span-2 sm:col-span-1 group"
      >
        <div className="flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-purple-950/40 border border-purple-800/40 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform shrink-0">
            <Percent className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-2xl font-bold tracking-tight text-white leading-tight">
              {metrics.completionPercentage}%
            </div>
            <div className="text-xs font-semibold text-zinc-300 truncate">
              {t.dashboard.stats.completionRate}
            </div>
          </div>
        </div>
        <div className="w-full h-1.5 bg-[#161616] rounded-full overflow-hidden mt-1">
          <div
            className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all duration-500 shadow-purple-glow-sm"
            style={{ width: `${Math.min(100, Math.max(0, metrics.completionPercentage))}%` }}
          />
        </div>
      </Link>
    </div>
  );
}

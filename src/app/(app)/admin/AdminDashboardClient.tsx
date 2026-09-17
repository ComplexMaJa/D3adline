"use client";

import * as React from "react";
import Link from "next/link";
import { Profile } from "@/types/database";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { format, parseISO } from "date-fns";
import {
  ShieldAlert,
  Users,
  BookOpen,
  FileCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Shield,
  GraduationCap,
  Sparkles,
  Layers,
  ChevronRight,
} from "lucide-react";

interface AdminStats {
  totalUsers: number;
  studentsCount: number;
  teachersCount: number;
  adminsCount: number;
  totalCourses: number;
  activeCourses: number;
  archivedCourses: number;
  totalAssignments: number;
  totalSubmissions: number;
  pendingSubmissions: number;
  gradedSubmissions: number;
}

interface AdminDashboardClientProps {
  stats: AdminStats;
  recentUsers: Profile[];
}

export function AdminDashboardClient({ stats, recentUsers }: AdminDashboardClientProps) {
  const { language } = useLanguage();
  const isId = language === "id";

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-950/60 border border-rose-800/60 text-rose-300">
            Admin
          </span>
        );
      case "teacher":
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-950/60 border border-purple-800/60 text-purple-300">
            {isId ? "Pengajar" : "Teacher"}
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950/60 border border-emerald-800/60 text-emerald-300">
            {isId ? "Siswa" : "Student"}
          </span>
        );
    }
  };

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Top Banner Header */}
      <div className="relative rounded-2xl border border-rose-900/30 bg-gradient-to-r from-rose-950/20 via-black to-[#0A0A0E] p-6 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-purple-500 to-indigo-500" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-rose-950/60 border border-rose-800/50 flex items-center justify-center">
                <ShieldAlert className="h-4 w-4 text-rose-400" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {isId ? "Pusat Kontrol Administrator" : "Admin Control Center"}
              </h1>
            </div>
            <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
              {isId
                ? "Akses penuh sistem untuk memantau pengguna, kelas, tugas, dan menetapkan hak akses peran secara aman."
                : "Full system oversight to monitor users, courses, assignments, and securely manage role authorizations."}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-1.5 rounded-xl bg-rose-950/40 border border-rose-800/40 text-xs font-semibold text-rose-300 flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" />
              <span>{isId ? "Otoritas Superuser" : "Superuser Mode"}</span>
            </span>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <Link
          href="/admin/users"
          className="group rounded-2xl border border-[#1E1E24] bg-[#0A0A0C] p-4 sm:p-5 hover:border-purple-500/40 transition-all space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">
              {isId ? "Total Pengguna" : "Total Users"}
            </span>
            <div className="h-7 w-7 rounded-lg bg-purple-950/40 border border-purple-800/40 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="h-3.5 w-3.5 text-purple-400" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {stats.totalUsers}
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-zinc-500 flex-wrap">
              <span className="text-emerald-400 font-medium">{stats.studentsCount} {isId ? "siswa" : "students"}</span>
              <span>•</span>
              <span className="text-purple-400 font-medium">{stats.teachersCount} {isId ? "guru" : "teachers"}</span>
              <span>•</span>
              <span className="text-rose-400 font-medium">{stats.adminsCount} admin</span>
            </div>
          </div>
        </Link>

        {/* Total Courses */}
        <Link
          href="/admin/courses"
          className="group rounded-2xl border border-[#1E1E24] bg-[#0A0A0C] p-4 sm:p-5 hover:border-blue-500/40 transition-all space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">
              {isId ? "Total Kelas" : "Total Courses"}
            </span>
            <div className="h-7 w-7 rounded-lg bg-blue-950/40 border border-blue-800/40 flex items-center justify-center group-hover:scale-105 transition-transform">
              <BookOpen className="h-3.5 w-3.5 text-blue-400" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {stats.totalCourses}
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-zinc-500">
              <span className="text-emerald-400 font-medium">{stats.activeCourses} {isId ? "aktif" : "active"}</span>
              {stats.archivedCourses > 0 && (
                <>
                  <span>•</span>
                  <span className="text-amber-400 font-medium">{stats.archivedCourses} {isId ? "diarsipkan" : "archived"}</span>
                </>
              )}
            </div>
          </div>
        </Link>

        {/* Total Assignments */}
        <Link
          href="/admin/assignments"
          className="group rounded-2xl border border-[#1E1E24] bg-[#0A0A0C] p-4 sm:p-5 hover:border-indigo-500/40 transition-all space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">
              {isId ? "Total Tugas" : "Total Tasks"}
            </span>
            <div className="h-7 w-7 rounded-lg bg-indigo-950/40 border border-indigo-800/40 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Layers className="h-3.5 w-3.5 text-indigo-400" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {stats.totalAssignments}
            </p>
            <p className="mt-2 text-[10px] text-zinc-500">
              {isId ? "Tersebar di semua kelas" : "Across all curriculum classes"}
            </p>
          </div>
        </Link>

        {/* Total Submissions */}
        <Link
          href="/admin/submissions"
          className="group rounded-2xl border border-[#1E1E24] bg-[#0A0A0C] p-4 sm:p-5 hover:border-emerald-500/40 transition-all space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">
              {isId ? "Pengumpulan Tugas" : "Submissions"}
            </span>
            <div className="h-7 w-7 rounded-lg bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-center group-hover:scale-105 transition-transform">
              <FileCheck className="h-3.5 w-3.5 text-emerald-400" />
            </div>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {stats.totalSubmissions}
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-zinc-500">
              <span className="text-amber-400 font-medium">{stats.pendingSubmissions} {isId ? "perlu dinilai" : "pending"}</span>
              <span>•</span>
              <span className="text-emerald-400 font-medium">{stats.gradedSubmissions} {isId ? "dinilai" : "graded"}</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Navigation Cards */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold text-zinc-200 uppercase tracking-wider">
          {isId ? "Modul Administrasi" : "Administrative Modules"}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/admin/users"
            className="flex items-center justify-between p-4 rounded-xl border border-[#1E1E22] bg-[#0A0A0C] hover:border-purple-500/40 hover:bg-[#101014] transition-all group"
          >
            <div className="flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-purple-950/40 border border-purple-800/40 flex items-center justify-center text-purple-400">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">
                  {isId ? "Manajemen Pengguna & Peran" : "User & Role Directory"}
                </h3>
                <p className="text-xs text-zinc-400">
                  {isId
                    ? "Ubah peran akun siswa, pengajar, atau admin secara aman."
                    : "Inspect users, change role permissions, and view institutions."}
                </p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>

          <Link
            href="/admin/courses"
            className="flex items-center justify-between p-4 rounded-xl border border-[#1E1E22] bg-[#0A0A0C] hover:border-blue-500/40 hover:bg-[#101014] transition-all group"
          >
            <div className="flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-blue-950/40 border border-blue-800/40 flex items-center justify-center text-blue-400">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">
                  {isId ? "Daftar Semua Kelas" : "Course Registry"}
                </h3>
                <p className="text-xs text-zinc-400">
                  {isId
                    ? "Pantau kepemilikan pengajar, jumlah siswa terdaftar, dan status arsip."
                    : "Inspect instructor ownership, enrollment counts, and archives."}
                </p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>

          <Link
            href="/admin/assignments"
            className="flex items-center justify-between p-4 rounded-xl border border-[#1E1E22] bg-[#0A0A0C] hover:border-indigo-500/40 hover:bg-[#101014] transition-all group"
          >
            <div className="flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-indigo-950/40 border border-indigo-800/40 flex items-center justify-center text-indigo-400">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">
                  {isId ? "Pengawasan Tugas Global" : "Global Assignment Oversight"}
                </h3>
                <p className="text-xs text-zinc-400">
                  {isId
                    ? "Tinjau semua tugas yang diterbitkan pengajar di seluruh sistem."
                    : "Inspect all teacher-assigned tasks, deadlines, and priorities."}
                </p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>

          <Link
            href="/admin/submissions"
            className="flex items-center justify-between p-4 rounded-xl border border-[#1E1E22] bg-[#0A0A0C] hover:border-emerald-500/40 hover:bg-[#101014] transition-all group"
          >
            <div className="flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-center text-emerald-400">
                <FileCheck className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">
                  {isId ? "Audit Pengumpulan & Penilaian" : "Submissions & Grading Audit"}
                </h3>
                <p className="text-xs text-zinc-400">
                  {isId
                    ? "Audit seluruh pengumpulan tugas mahasiswa beserta nilainya."
                    : "Audit all student submissions, submission notes, and grades."}
                </p>
              </div>
            </div>
            <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>
        </div>
      </div>

      {/* Recent Users Section */}
      <div className="rounded-2xl border border-[#1E1E24] bg-[#0A0A0C] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
            <Users className="h-4 w-4 text-purple-400" />
            <span>{isId ? "Pengguna Terbaru" : "Recent Registrations"}</span>
          </h2>
          <Link
            href="/admin/users"
            className="text-xs text-purple-400 hover:text-purple-300 font-medium inline-flex items-center gap-1"
          >
            <span>{isId ? "Lihat Semua" : "View All"}</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="divide-y divide-[#18181C]">
          {recentUsers.map((user) => {
            const userName = user.display_name || user.email?.split("@")[0] || "User";
            const initials = userName
              .split(" ")
              .map((n: string) => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase() || "U";

            return (
              <div key={user.id} className="py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {user.avatar_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.avatar_url}
                      alt={userName}
                      className="h-8 w-8 rounded-full object-cover border border-[#2A2A2E] shrink-0"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs font-bold text-zinc-300 shrink-0">
                      {initials}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-zinc-200 truncate">{userName}</p>
                    <p className="text-[11px] text-zinc-500 truncate">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {getRoleBadge(user.role || "student")}
                  <span className="text-[10px] text-zinc-500 hidden sm:inline font-mono">
                    {user.created_at ? format(parseISO(user.created_at), "d MMM yyyy") : ""}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

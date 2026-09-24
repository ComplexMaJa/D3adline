"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Course } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { toggleCourseArchivedAction, deleteCourseAction } from "@/lib/actions";
import { format, parseISO } from "date-fns";
import {
  BookOpen,
  Search,
  ArrowLeft,
  Users,
  Layers,
  Archive,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  Building2,
  CheckCircle2,
} from "lucide-react";

interface CourseWithMeta extends Course {
  instructorProfile?: {
    display_name: string | null;
    email: string | null;
    avatar_url: string | null;
  } | null;
  enrolledStudentsCount: number;
  assignmentsCount: number;
}

interface AdminCoursesClientProps {
  initialCourses: CourseWithMeta[];
}

export function AdminCoursesClient({ initialCourses }: AdminCoursesClientProps) {
  const { language } = useLanguage();
  const router = useRouter();
  const isId = language === "id";

  const [courses, setCourses] = React.useState<CourseWithMeta[]>(initialCourses);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | "active" | "archived">("all");

  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  // Archive & Delete states
  const [courseToArchive, setCourseToArchive] = React.useState<CourseWithMeta | null>(null);
  const [isArchiving, setIsArchiving] = React.useState(false);
  const [courseToDelete, setCourseToDelete] = React.useState<CourseWithMeta | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    setCourses(initialCourses);
  }, [initialCourses]);

  const filteredCourses = React.useMemo(() => {
    return courses.filter((c) => {
      if (statusFilter === "active" && c.is_archived) return false;
      if (statusFilter === "archived" && !c.is_archived) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const name = c.name.toLowerCase();
        const code = c.code?.toLowerCase() || "";
        const instructor =
          c.instructor?.toLowerCase() ||
          c.instructorProfile?.display_name?.toLowerCase() ||
          c.instructorProfile?.email?.toLowerCase() ||
          "";
        if (!name.includes(q) && !code.includes(q) && !instructor.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [courses, statusFilter, searchQuery]);

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleConfirmToggleArchive = async () => {
    if (!courseToArchive) return;
    setIsArchiving(true);
    try {
      const targetArchived = !courseToArchive.is_archived;
      await toggleCourseArchivedAction(courseToArchive.id, targetArchived);

      setCourses((prev) =>
        prev.map((c) =>
          c.id === courseToArchive.id ? { ...c, is_archived: targetArchived } : c
        )
      );
      setCourseToArchive(null);
      router.refresh();
    } catch (err) {
      console.error("Error toggling course archive status:", err);
    } finally {
      setIsArchiving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!courseToDelete) return;
    setIsDeleting(true);
    try {
      await deleteCourseAction(courseToDelete.id);
      setCourses((prev) => prev.filter((c) => c.id !== courseToDelete.id));
      setCourseToDelete(null);
      router.refresh();
    } catch (err) {
      console.error("Error deleting course:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back Link */}
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>{isId ? "Kembali ke Beranda Admin" : "Back to Admin Console"}</span>
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <BookOpen className="h-6 w-6 text-blue-400" />
            <span>{isId ? "Pusat Registri Kelas" : "Course Registry"}</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            {isId
              ? "Pantau seluruh kelas pembelajaran, dosen/pengajar, jumlah siswa, dan status arsip."
              : "Oversee all curriculum courses, assigned teachers, enrollment counts, and archives."}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-400 bg-[#0A0A0C] border border-[#1E1E22] px-3 py-1.5 rounded-xl self-start sm:self-auto">
          <span>{isId ? "Total Kelas:" : "Total Courses:"}</span>
          <span className="font-bold text-white">{courses.length}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-[#1E1E22] bg-[#0A0A0C]">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isId
                ? "Cari nama kelas, kode, atau nama pengajar..."
                : "Search course name, code, or instructor..."
            }
            className="w-full bg-[#121214] border border-[#222226] focus:border-purple-500/60 text-xs text-white pl-9 pr-3 py-2 rounded-lg outline-none placeholder:text-zinc-600 transition-colors"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#121214] border border-[#222226]">
          {[
            { id: "all", label: isId ? "Semua" : "All" },
            { id: "active", label: isId ? "Aktif" : "Active" },
            { id: "archived", label: isId ? "Diarsipkan" : "Archived" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setStatusFilter(item.id as "all" | "active" | "archived")}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                statusFilter === item.id
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table / List */}
      {filteredCourses.length === 0 ? (
        <EmptyState
          title={isId ? "Tidak ada kelas ditemukan" : "No courses found"}
          description={
            isId
              ? "Tidak ada kelas yang cocok dengan filter atau pencarian Anda."
              : "No courses match your selected filter or search term."
          }
        />
      ) : (
        <div className="rounded-xl border border-[#1E1E22] bg-[#0A0A0C] overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-[#121216] border-b border-[#1E1E24] text-zinc-400 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-semibold">{isId ? "Kelas" : "Course"}</th>
                  <th className="py-3 px-4 font-semibold">{isId ? "Pengajar" : "Instructor"}</th>
                  <th className="py-3 px-4 font-semibold">{isId ? "Siswa" : "Students"}</th>
                  <th className="py-3 px-4 font-semibold">{isId ? "Tugas" : "Tasks"}</th>
                  <th className="py-3 px-4 font-semibold">{isId ? "Kode Gabung" : "Join Code"}</th>
                  <th className="py-3 px-4 font-semibold">{isId ? "Status" : "Status"}</th>
                  <th className="py-3 px-4 font-semibold text-right">{isId ? "Aksi" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#18181C]">
                {filteredCourses.map((c) => {
                  const teacherName =
                    c.instructor ||
                    c.instructorProfile?.display_name ||
                    c.instructorProfile?.email?.split("@")[0] ||
                    "Instructor";

                  return (
                    <tr key={c.id} className="hover:bg-[#121216]/60 transition-colors">
                      {/* Course */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: c.color || "#8B5CF6" }}
                          />
                          <div>
                            <Link
                              href={`/courses/${c.id}`}
                              className="font-semibold text-white hover:text-purple-300 transition-colors inline-flex items-center gap-1.5"
                            >
                              <span>{c.name}</span>
                              <ExternalLink className="h-3 w-3 text-zinc-500" />
                            </Link>
                            {c.code && (
                              <p className="font-mono text-[10px] text-zinc-400">
                                {c.code}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Instructor */}
                      <td className="py-3.5 px-4">
                        <p className="font-medium text-zinc-200">{teacherName}</p>
                        {c.instructorProfile?.email && (
                          <p className="text-[10px] text-zinc-500">{c.instructorProfile.email}</p>
                        )}
                      </td>

                      {/* Enrolled Students */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-zinc-300">
                          <Users className="h-3 w-3 text-zinc-500" />
                          <span className="font-semibold">{c.enrolledStudentsCount}</span>
                        </div>
                      </td>

                      {/* Tasks */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-zinc-300">
                          <Layers className="h-3 w-3 text-zinc-500" />
                          <span className="font-semibold">{c.assignmentsCount}</span>
                        </div>
                      </td>

                      {/* Join Code */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {c.join_code ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-purple-300 bg-purple-950/40 border border-purple-800/40 px-2 py-0.5 rounded text-[11px]">
                              {c.join_code}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyCode(c.join_code!, c.id)}
                              className="p-1 rounded text-zinc-500 hover:text-zinc-300 transition-colors"
                              title="Copy code"
                            >
                              {copiedId === c.id ? (
                                <Check className="h-3 w-3 text-emerald-400" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-zinc-600">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {c.is_archived ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-950/40 border border-amber-800/40 text-amber-300">
                            {isId ? "Diarsipkan" : "Archived"}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/40 border border-emerald-800/40 text-emerald-400">
                            {isId ? "Aktif" : "Active"}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCourseToArchive(c)}
                            className={`h-7 text-xs gap-1 border-[#2A2A2E] ${
                              c.is_archived ? "text-amber-300" : "text-zinc-400"
                            }`}
                            title={c.is_archived ? "Unarchive course" : "Archive course"}
                          >
                            <Archive className="h-3 w-3" />
                            <span>{c.is_archived ? (isId ? "Aktifkan" : "Unarchive") : (isId ? "Arsipkan" : "Archive")}</span>
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => setCourseToDelete(c)}
                            className="h-7 text-xs gap-1"
                            title="Delete course"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="block md:hidden divide-y divide-[#18181C]">
            {filteredCourses.map((c) => {
              const teacherName =
                c.instructor ||
                c.instructorProfile?.display_name ||
                c.instructorProfile?.email?.split("@")[0] ||
                "Instructor";

              return (
                <div key={c.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 mt-0.5"
                        style={{ backgroundColor: c.color || "#8B5CF6" }}
                      />
                      <div>
                        <Link
                          href={`/courses/${c.id}`}
                          className="text-sm font-semibold text-white hover:text-purple-300 transition-colors inline-flex items-center gap-1"
                        >
                          <span>{c.name}</span>
                          <ExternalLink className="h-3 w-3 text-zinc-500" />
                        </Link>
                        {c.code && (
                          <p className="font-mono text-[11px] text-zinc-400">{c.code}</p>
                        )}
                      </div>
                    </div>

                    {c.is_archived ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-950/40 border border-amber-800/40 text-amber-300">
                        {isId ? "Diarsipkan" : "Archived"}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/40 border border-emerald-800/40 text-emerald-400">
                        {isId ? "Aktif" : "Active"}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-zinc-400">
                    <span className="text-zinc-500">{isId ? "Pengajar: " : "Instructor: "}</span>
                    <span className="font-medium text-zinc-200">{teacherName}</span>
                  </p>

                  <div className="flex items-center gap-4 text-xs text-zinc-400">
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3 text-zinc-500" />
                      <span>{c.enrolledStudentsCount} {isId ? "siswa" : "students"}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Layers className="h-3 w-3 text-zinc-500" />
                      <span>{c.assignmentsCount} {isId ? "tugas" : "tasks"}</span>
                    </div>
                  </div>

                  {c.join_code && (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-[#121214] border border-[#222226]">
                      <span className="text-[10px] text-zinc-500">{isId ? "Kode Gabung:" : "Join Code:"}</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-purple-300 text-xs">{c.join_code}</span>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(c.join_code!, c.id)}
                          className="p-1 rounded text-zinc-400 hover:text-white"
                        >
                          {copiedId === c.id ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-[#18181C]">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCourseToArchive(c)}
                      className="h-7 text-xs gap-1"
                    >
                      <Archive className="h-3 w-3" />
                      <span>{c.is_archived ? (isId ? "Buka Arsip" : "Unarchive") : (isId ? "Arsipkan" : "Archive")}</span>
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setCourseToDelete(c)}
                      className="h-7 text-xs"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Archive Toggle Confirm */}
      <ConfirmDialog
        isOpen={!!courseToArchive}
        onClose={() => setCourseToArchive(null)}
        onConfirm={handleConfirmToggleArchive}
        title={
          courseToArchive?.is_archived
            ? (isId ? `Aktifkan kembali ${courseToArchive.name}?` : `Unarchive ${courseToArchive?.name}?`)
            : (isId ? `Arsipkan ${courseToArchive?.name}?` : `Archive ${courseToArchive?.name}?`)
        }
        description={
          courseToArchive?.is_archived
            ? (isId
                ? "Kelas ini akan kembali aktif dan dapat diakses siswa."
                : "This class will become active again for enrolled students.")
            : (isId
                ? "Kelas yang diarsipkan tidak dapat menerima pengumpulan tugas baru."
                : "Archiving this class will prevent new submissions.")
        }
        confirmText={
          courseToArchive?.is_archived
            ? (isId ? "Aktifkan" : "Unarchive")
            : (isId ? "Arsipkan" : "Archive")
        }
        variant={courseToArchive?.is_archived ? "default" : "danger"}
        isLoading={isArchiving}
      />

      {/* Delete Course Confirm */}
      <ConfirmDialog
        isOpen={!!courseToDelete}
        onClose={() => setCourseToDelete(null)}
        onConfirm={handleConfirmDelete}
        title={isId ? `Hapus ${courseToDelete?.name}?` : `Delete ${courseToDelete?.name}?`}
        description={
          isId
            ? `Apakah Anda yakin ingin menghapus kelas ini beserta seluruh tugas dan pengumpulan di dalamnya? Tindakan ini tidak dapat dibatalkan.`
            : `Are you sure you want to permanently delete this course and all associated assignments and submissions? This action cannot be undone.`
        }
        confirmText={isId ? "Hapus Permanen" : "Permanently Delete"}
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}

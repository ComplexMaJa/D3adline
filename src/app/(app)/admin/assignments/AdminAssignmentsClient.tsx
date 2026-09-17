"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Assignment } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { getPriorityBadgeStyle } from "@/lib/deadline-utils";
import { format, parseISO } from "date-fns";
import {
  Layers,
  Search,
  ArrowLeft,
  ExternalLink,
  Trash2,
  Calendar,
  Clock,
  FileCheck,
  Building2,
  AlertTriangle,
} from "lucide-react";

interface AssignmentWithMeta extends Assignment {
  submissionsCount: number;
  creatorProfile?: {
    display_name: string | null;
    email: string | null;
  } | null;
}

interface AdminAssignmentsClientProps {
  initialAssignments: AssignmentWithMeta[];
}

export function AdminAssignmentsClient({ initialAssignments }: AdminAssignmentsClientProps) {
  const { language } = useLanguage();
  const supabase = createClient();
  const router = useRouter();
  const isId = language === "id";

  const [assignments, setAssignments] = React.useState<AssignmentWithMeta[]>(initialAssignments);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [priorityFilter, setPriorityFilter] = React.useState<string>("all");

  const [assignmentToDelete, setAssignmentToDelete] = React.useState<AssignmentWithMeta | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    setAssignments(initialAssignments);
  }, [initialAssignments]);

  const filteredAssignments = React.useMemo(() => {
    return assignments.filter((a) => {
      if (priorityFilter !== "all" && a.priority !== priorityFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const title = a.title.toLowerCase();
        const course = a.course?.name?.toLowerCase() || "";
        const code = a.course?.code?.toLowerCase() || "";
        const creator =
          a.creatorProfile?.display_name?.toLowerCase() ||
          a.creatorProfile?.email?.toLowerCase() ||
          "";
        if (!title.includes(q) && !course.includes(q) && !code.includes(q) && !creator.includes(q)) {
          return false;
        }
      }
      return true;
    });
  }, [assignments, priorityFilter, searchQuery]);

  const handleConfirmDelete = async () => {
    if (!assignmentToDelete) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("assignments")
        .delete()
        .eq("id", assignmentToDelete.id);

      if (error) throw error;

      setAssignments((prev) => prev.filter((a) => a.id !== assignmentToDelete.id));
      setAssignmentToDelete(null);
      router.refresh();
    } catch (err) {
      console.error("Error deleting assignment:", err);
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
            <Layers className="h-6 w-6 text-indigo-400" />
            <span>{isId ? "Pengawasan Tugas Global" : "Global Assignment Oversight"}</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            {isId
              ? "Tinjau semua tugas yang dibuat oleh para pengajar dan pantau pengumpulan siswa."
              : "Review all curriculum tasks created by teachers and track student submission volumes."}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-zinc-400 bg-[#0A0A0C] border border-[#1E1E22] px-3 py-1.5 rounded-xl self-start sm:self-auto">
          <span>{isId ? "Total Tugas:" : "Total Tasks:"}</span>
          <span className="font-bold text-white">{assignments.length}</span>
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
                ? "Cari judul tugas, kelas, atau pengajar..."
                : "Search task title, course, or teacher..."
            }
            className="w-full bg-[#121214] border border-[#222226] focus:border-purple-500/60 text-xs text-white pl-9 pr-3 py-2 rounded-lg outline-none placeholder:text-zinc-600 transition-colors"
          />
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#121214] border border-[#222226]">
          {[
            { id: "all", label: isId ? "Semua Prioritas" : "All Priorities" },
            { id: "High", label: isId ? "Tinggi" : "High" },
            { id: "Medium", label: isId ? "Sedang" : "Medium" },
            { id: "Low", label: isId ? "Rendah" : "Low" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setPriorityFilter(item.id)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                priorityFilter === item.id
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
      {filteredAssignments.length === 0 ? (
        <EmptyState
          title={isId ? "Tugas tidak ditemukan" : "No assignments found"}
          description={
            isId
              ? "Tidak ada tugas yang cocok dengan filter atau kriteria pencarian Anda."
              : "No tasks match your selected filter or search term."
          }
        />
      ) : (
        <div className="rounded-xl border border-[#1E1E22] bg-[#0A0A0C] overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-[#121216] border-b border-[#1E1E24] text-zinc-400 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-semibold">{isId ? "Tugas" : "Assignment"}</th>
                  <th className="py-3 px-4 font-semibold">{isId ? "Kelas" : "Course"}</th>
                  <th className="py-3 px-4 font-semibold">{isId ? "Pengajar" : "Teacher"}</th>
                  <th className="py-3 px-4 font-semibold">{isId ? "Tenggat Waktu" : "Deadline"}</th>
                  <th className="py-3 px-4 font-semibold">{isId ? "Prioritas" : "Priority"}</th>
                  <th className="py-3 px-4 font-semibold">{isId ? "Pengumpulan" : "Submissions"}</th>
                  <th className="py-3 px-4 font-semibold text-right">{isId ? "Aksi" : "Action"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#18181C]">
                {filteredAssignments.map((a) => {
                  const priorityStyle = getPriorityBadgeStyle(a.priority);
                  const teacherName =
                    a.creatorProfile?.display_name ||
                    a.creatorProfile?.email?.split("@")[0] ||
                    "Teacher";

                  return (
                    <tr key={a.id} className="hover:bg-[#121216]/60 transition-colors">
                      {/* Title */}
                      <td className="py-3.5 px-4">
                        <Link
                          href={`/assignments/${a.id}`}
                          className="font-semibold text-white hover:text-purple-300 transition-colors inline-flex items-center gap-1.5 line-clamp-1"
                        >
                          <span>{a.title}</span>
                          <ExternalLink className="h-3 w-3 text-zinc-500 shrink-0" />
                        </Link>
                      </td>

                      {/* Course */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {a.course ? (
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: a.course.color || "#8B5CF6" }}
                            />
                            <span className="text-zinc-300 font-medium">
                              {a.course.code ? `[${a.course.code}] ` : ""}
                              {a.course.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-zinc-500 italic">
                            {isId ? "Pribadi" : "Personal"}
                          </span>
                        )}
                      </td>

                      {/* Teacher */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-zinc-300">
                        {teacherName}
                      </td>

                      {/* Due date */}
                      <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-zinc-300">
                        {format(parseISO(a.due_date), isId ? "d MMM yyyy" : "MMM d, yyyy")}
                        {a.due_time && ` ${a.due_time.slice(0, 5)}`}
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${priorityStyle}`}
                        >
                          {a.priority}
                        </span>
                      </td>

                      {/* Submissions Count */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-zinc-300">
                          <FileCheck className="h-3 w-3 text-emerald-400" />
                          <span className="font-semibold">{a.submissionsCount}</span>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => setAssignmentToDelete(a)}
                          className="h-7 text-xs"
                          title="Delete assignment"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="block md:hidden divide-y divide-[#18181C]">
            {filteredAssignments.map((a) => {
              const priorityStyle = getPriorityBadgeStyle(a.priority);
              const teacherName =
                a.creatorProfile?.display_name ||
                a.creatorProfile?.email?.split("@")[0] ||
                "Teacher";

              return (
                <div key={a.id} className="p-4 space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/assignments/${a.id}`}
                      className="text-sm font-semibold text-white hover:text-purple-300 transition-colors inline-flex items-center gap-1"
                    >
                      <span>{a.title}</span>
                      <ExternalLink className="h-3 w-3 text-zinc-500 shrink-0" />
                    </Link>
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${priorityStyle} shrink-0`}
                    >
                      {a.priority}
                    </span>
                  </div>

                  {a.course && (
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: a.course.color || "#8B5CF6" }}
                      />
                      <span>
                        {a.course.code ? `[${a.course.code}] ` : ""}
                        {a.course.name}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
                    <span>
                      {isId ? "Pengajar: " : "By: "}
                      <span className="text-zinc-200 font-medium">{teacherName}</span>
                    </span>
                    <span className="font-mono text-[11px]">
                      {format(parseISO(a.due_date), isId ? "d MMM yyyy" : "MMM d, yyyy")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-[#18181C]">
                    <div className="flex items-center gap-1 text-xs text-zinc-400">
                      <FileCheck className="h-3 w-3 text-emerald-400" />
                      <span>{a.submissionsCount} {isId ? "pengumpulan" : "submissions"}</span>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setAssignmentToDelete(a)}
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

      {/* Delete Assignment Confirm */}
      <ConfirmDialog
        isOpen={!!assignmentToDelete}
        onClose={() => setAssignmentToDelete(null)}
        onConfirm={handleConfirmDelete}
        title={isId ? `Hapus "${assignmentToDelete?.title}"?` : `Delete "${assignmentToDelete?.title}"?`}
        description={
          isId
            ? "Apakah Anda yakin ingin menghapus tugas ini beserta seluruh pengumpulan dan lampirannya? Tindakan ini tidak dapat dibatalkan."
            : "Are you sure you want to permanently delete this assignment, including all student submissions and attachments? This action cannot be undone."
        }
        confirmText={isId ? "Hapus Tugas" : "Delete Assignment"}
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}

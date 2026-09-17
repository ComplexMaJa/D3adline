"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AssignmentSubmission, Course } from "@/types/database";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { gradeSubmissionAction } from "@/lib/actions";
import { format, parseISO } from "date-fns";
import {
  Award,
  CheckCircle2,
  Clock,
  Search,
  BookOpen,
  User,
  ExternalLink,
  MessageSquare,
  Building2,
  FileCheck,
  Filter,
} from "lucide-react";

interface ExtendedSubmission extends Omit<AssignmentSubmission, "assignment"> {
  assignment?: {
    id: string;
    title: string;
    due_date: string;
    due_time: string | null;
    course?: {
      id: string;
      name: string;
      code: string | null;
      color: string | null;
    } | null;
  };
}

interface SubmissionsClientProps {
  initialSubmissions: ExtendedSubmission[];
  courses: Course[];
  isAdmin: boolean;
}

export function SubmissionsClient({
  initialSubmissions,
  courses,
  isAdmin,
}: SubmissionsClientProps) {
  const { language } = useLanguage();
  const router = useRouter();
  const isId = language === "id";

  const [submissions, setSubmissions] = React.useState<ExtendedSubmission[]>(initialSubmissions);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCourseId, setSelectedCourseId] = React.useState<string>("all");
  const [selectedStatus, setSelectedStatus] = React.useState<string>("all");

  // Grading modal state
  const [selectedSubmission, setSelectedSubmission] = React.useState<ExtendedSubmission | null>(null);
  const [gradeInput, setGradeInput] = React.useState("");
  const [feedbackInput, setFeedbackInput] = React.useState("");
  const [isSubmittingGrade, setIsSubmittingGrade] = React.useState(false);
  const [gradingError, setGradingError] = React.useState<string | null>(null);

  React.useEffect(() => {
    setSubmissions(initialSubmissions);
  }, [initialSubmissions]);

  // Derived metrics
  const totalSubmissions = submissions.length;
  const needsGrading = submissions.filter(
    (s) => Boolean(s.submitted_at) && s.grade === null
  ).length;
  const gradedCount = submissions.filter((s) => s.grade !== null).length;
  const averageGrade = React.useMemo(() => {
    const graded = submissions.filter((s) => s.grade !== null && s.grade !== undefined);
    if (graded.length === 0) return 0;
    const sum = graded.reduce((acc, curr) => acc + (curr.grade || 0), 0);
    return Math.round(sum / graded.length);
  }, [submissions]);

  // Filtered submissions
  const filteredSubmissions = React.useMemo(() => {
    return submissions.filter((item) => {
      // Course filter
      if (selectedCourseId !== "all") {
        if (item.assignment?.course?.id !== selectedCourseId) {
          return false;
        }
      }

      // Status filter
      if (selectedStatus === "needs_grading") {
        if (!item.submitted_at || item.grade !== null) {
          return false;
        }
      } else if (selectedStatus === "graded") {
        if (item.grade === null) {
          return false;
        }
      } else if (selectedStatus === "in_progress") {
        if (Boolean(item.submitted_at)) {
          return false;
        }
      }

      // Search filter (student name, email, or assignment title)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const studentName = item.student?.display_name?.toLowerCase() || "";
        const studentEmail = item.student?.email?.toLowerCase() || "";
        const title = item.assignment?.title?.toLowerCase() || "";
        if (!studentName.includes(q) && !studentEmail.includes(q) && !title.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [submissions, selectedCourseId, selectedStatus, searchQuery]);

  const handleOpenGradeModal = (sub: ExtendedSubmission) => {
    setSelectedSubmission(sub);
    setGradeInput(sub.grade !== null && sub.grade !== undefined ? String(sub.grade) : "");
    setFeedbackInput(sub.feedback || "");
    setGradingError(null);
  };

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;

    const parsedGrade = gradeInput.trim() !== "" ? parseFloat(gradeInput) : null;
    if (parsedGrade !== null && (isNaN(parsedGrade) || parsedGrade < 0 || parsedGrade > 100)) {
      setGradingError(isId ? "Nilai harus berupa angka antara 0 dan 100." : "Grade must be a number between 0 and 100.");
      return;
    }

    setIsSubmittingGrade(true);
    setGradingError(null);

    try {
      await gradeSubmissionAction(
        selectedSubmission.id,
        parsedGrade,
        feedbackInput.trim() || null
      );

      // Optimistic update
      setSubmissions((prev) =>
        prev.map((s) =>
          s.id === selectedSubmission.id
            ? {
                ...s,
                grade: parsedGrade,
                feedback: feedbackInput.trim() || null,
                status: "Completed",
                updated_at: new Date().toISOString(),
              }
            : s
        )
      );

      setSelectedSubmission(null);
      router.refresh();
    } catch (err: unknown) {
      console.error("Error saving grade:", err);
      const msg = err instanceof Error ? err.message : "Failed to save grade";
      setGradingError(msg);
    } finally {
      setIsSubmittingGrade(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <FileCheck className="h-6 w-6 text-purple-400" />
            <span>{isId ? "Pengumpulan & Penilaian" : "Submissions & Grading"}</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            {isId
              ? "Tinjau dan berikan nilai pada tugas yang dikumpulkan mahasiswa."
              : "Review and evaluate assignments submitted by students across your courses."}
          </p>
        </div>

        {isAdmin && (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-950/40 border border-red-800/50 text-red-300 self-start sm:self-auto">
            {isId ? "Mode Administrator (Semua Kelas)" : "Admin Mode (All Courses)"}
          </span>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="rounded-xl border border-[#1E1E22] bg-[#0A0A0C] p-4 space-y-1">
          <span className="text-[11px] font-medium text-zinc-400">
            {isId ? "Total Pengumpulan" : "Total Submissions"}
          </span>
          <p className="text-2xl font-bold text-white tracking-tight">{totalSubmissions}</p>
        </div>

        <div className="rounded-xl border border-amber-900/30 bg-amber-950/10 p-4 space-y-1">
          <span className="text-[11px] font-medium text-amber-300 flex items-center gap-1.5">
            <Clock className="h-3 w-3" />
            <span>{isId ? "Perlu Dinilai" : "Needs Grading"}</span>
          </span>
          <p className="text-2xl font-bold text-amber-200 tracking-tight">{needsGrading}</p>
        </div>

        <div className="rounded-xl border border-emerald-900/30 bg-emerald-950/10 p-4 space-y-1">
          <span className="text-[11px] font-medium text-emerald-300 flex items-center gap-1.5">
            <CheckCircle2 className="h-3 w-3" />
            <span>{isId ? "Sudah Dinilai" : "Graded"}</span>
          </span>
          <p className="text-2xl font-bold text-emerald-200 tracking-tight">{gradedCount}</p>
        </div>

        <div className="rounded-xl border border-purple-900/30 bg-purple-950/10 p-4 space-y-1">
          <span className="text-[11px] font-medium text-purple-300 flex items-center gap-1.5">
            <Award className="h-3 w-3" />
            <span>{isId ? "Rata-rata Nilai" : "Average Score"}</span>
          </span>
          <p className="text-2xl font-bold text-purple-200 tracking-tight">
            {gradedCount > 0 ? `${averageGrade}%` : "—"}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3.5 rounded-xl border border-[#1E1E22] bg-[#0A0A0C]">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isId ? "Cari nama mahasiswa atau judul tugas..." : "Search student name or assignment title..."
            }
            className="w-full bg-[#121214] border border-[#222226] focus:border-purple-500/60 text-xs text-white pl-9 pr-3 py-2 rounded-lg outline-none placeholder:text-zinc-600 transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Course Select */}
          {courses.length > 0 && (
            <div className="w-44">
              <Select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
              >
                <option value="all">{isId ? "Semua Kelas" : "All Classes"}</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code ? `[${c.code}] ${c.name}` : c.name}
                  </option>
                ))}
              </Select>
            </div>
          )}

          {/* Status Pills */}
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-[#121214] border border-[#222226]">
            {[
              { id: "all", label: isId ? "Semua" : "All" },
              { id: "needs_grading", label: isId ? "Perlu Nilai" : "Needs Grading" },
              { id: "graded", label: isId ? "Dinilai" : "Graded" },
              { id: "in_progress", label: isId ? "Dikerjakan" : "In Progress" },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setSelectedStatus(st.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  selectedStatus === st.id
                    ? "bg-purple-600 text-white shadow-sm"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Submissions List / Table */}
      {filteredSubmissions.length === 0 ? (
        <EmptyState
          title={isId ? "Tidak ada pengumpulan ditemukan" : "No submissions found"}
          description={
            isId
              ? "Belum ada mahasiswa yang mengumpulkan tugas sesuai kriteria filter Anda."
              : "No students have submitted assignments matching your selected filters."
          }
        />
      ) : (
        <div className="rounded-xl border border-[#1E1E22] bg-[#0A0A0C] overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300">
              <thead className="bg-[#121216] border-b border-[#1E1E24] text-zinc-400 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-semibold">{isId ? "Mahasiswa" : "Student"}</th>
                  <th className="py-3 px-4 font-semibold">{isId ? "Tugas & Kelas" : "Assignment & Class"}</th>
                  <th className="py-3 px-4 font-semibold">{isId ? "Waktu Kumpul" : "Submitted"}</th>
                  <th className="py-3 px-4 font-semibold">{isId ? "Catatan Mahasiswa" : "Student Note"}</th>
                  <th className="py-3 px-4 font-semibold">{isId ? "Nilai" : "Grade"}</th>
                  <th className="py-3 px-4 font-semibold text-right">{isId ? "Aksi" : "Action"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#18181C]">
                {filteredSubmissions.map((sub) => {
                  const studentName =
                    sub.student?.display_name || sub.student?.email?.split("@")[0] || "Student";
                  const initials =
                    studentName
                      .split(" ")
                      .map((n: string) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase() || "S";
                  const isGraded = sub.grade !== null && sub.grade !== undefined;

                  return (
                    <tr key={sub.id} className="hover:bg-[#121216]/60 transition-colors">
                      {/* Student Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {sub.student?.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={sub.student.avatar_url}
                              alt={studentName}
                              className="h-8 w-8 rounded-full object-cover border border-[#2A2A2E] shrink-0"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-purple-950/60 border border-purple-800/40 flex items-center justify-center text-xs font-bold text-purple-300 shrink-0">
                              {initials}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-zinc-100 truncate">{studentName}</p>
                            <p className="text-[11px] text-zinc-500 truncate">{sub.student?.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Assignment & Course */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <Link
                            href={`/assignments/${sub.assignment_id}`}
                            className="font-medium text-white hover:text-purple-300 transition-colors line-clamp-1 inline-flex items-center gap-1.5"
                          >
                            <span>{sub.assignment?.title || "Assignment"}</span>
                            <ExternalLink className="h-2.5 w-2.5 text-zinc-500" />
                          </Link>
                          {sub.assignment?.course && (
                            <div className="flex items-center gap-1.5">
                              <span
                                className="w-1.5 h-1.5 rounded-full"
                                style={{
                                  backgroundColor: sub.assignment.course.color || "#8B5CF6",
                                }}
                              />
                              <span className="text-[10px] font-medium text-zinc-400">
                                {sub.assignment.course.code
                                  ? `[${sub.assignment.course.code}] `
                                  : ""}
                                {sub.assignment.course.name}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Submitted Date */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {sub.submitted_at ? (
                          <div className="text-[11px]">
                            <p className="text-zinc-200">
                              {format(
                                parseISO(sub.submitted_at),
                                isId ? "d MMM yyyy" : "MMM d, yyyy"
                              )}
                            </p>
                            <p className="text-zinc-500 font-mono">
                              {format(parseISO(sub.submitted_at), "HH:mm")}
                            </p>
                          </div>
                        ) : (
                          <span className="text-zinc-500 text-[11px] italic">
                            {isId ? "Belum dikirim" : "In Progress"}
                          </span>
                        )}
                      </td>

                      {/* Student Note / Deliverable */}
                      <td className="py-3.5 px-4 max-w-xs">
                        {sub.submission_text || sub.submission_note ? (
                          <p className="text-xs text-zinc-300 italic line-clamp-2">
                            &ldquo;{sub.submission_text || sub.submission_note}&rdquo;
                          </p>
                        ) : (
                          <span className="text-zinc-600 text-[11px]">
                            {isId ? "Tanpa catatan" : "No note"}
                          </span>
                        )}
                      </td>

                      {/* Grade & Feedback */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isGraded ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold font-mono bg-emerald-950/50 border border-emerald-800/60 text-emerald-300">
                              <Award className="h-3 w-3" />
                              <span>{sub.grade}/100</span>
                            </span>
                            {sub.feedback && (
                              <p className="text-[10px] text-zinc-400 truncate max-w-[140px]" title={sub.feedback}>
                                {sub.feedback}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-950/40 border border-amber-800/40 text-amber-300">
                            <Clock className="h-3 w-3" />
                            <span>{isId ? "Belum Dinilai" : "Not Graded"}</span>
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <Button
                          variant={isGraded ? "outline" : "default"}
                          size="sm"
                          onClick={() => handleOpenGradeModal(sub)}
                          className="h-7 text-xs gap-1.5"
                        >
                          <Award className="h-3 w-3" />
                          <span>{isGraded ? (isId ? "Ubah Nilai" : "Edit Grade") : (isId ? "Beri Nilai" : "Grade")}</span>
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="block md:hidden divide-y divide-[#18181C]">
            {filteredSubmissions.map((sub) => {
              const studentName =
                sub.student?.display_name || sub.student?.email?.split("@")[0] || "Student";
              const isGraded = sub.grade !== null && sub.grade !== undefined;

              return (
                <div key={sub.id} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-full bg-purple-950/60 border border-purple-800/40 flex items-center justify-center text-[10px] font-bold text-purple-300 shrink-0">
                        {studentName[0]?.toUpperCase() || "S"}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-zinc-100">{studentName}</p>
                        <p className="text-[10px] text-zinc-500">{sub.student?.email}</p>
                      </div>
                    </div>

                    {isGraded ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-bold font-mono bg-emerald-950/50 border border-emerald-800/60 text-emerald-300">
                        <Award className="h-3 w-3" />
                        <span>{sub.grade}/100</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-950/40 border border-amber-800/40 text-amber-300">
                        <Clock className="h-3 w-3" />
                        <span>{isId ? "Belum Dinilai" : "Not Graded"}</span>
                      </span>
                    )}
                  </div>

                  <div>
                    <Link
                      href={`/assignments/${sub.assignment_id}`}
                      className="text-xs font-medium text-white hover:text-purple-300 transition-colors inline-flex items-center gap-1"
                    >
                      <span>{sub.assignment?.title || "Assignment"}</span>
                      <ExternalLink className="h-2.5 w-2.5 text-zinc-500" />
                    </Link>
                    {sub.assignment?.course && (
                      <p className="text-[10px] text-zinc-400 mt-0.5">
                        {sub.assignment.course.name}
                      </p>
                    )}
                  </div>

                  {(sub.submission_text || sub.submission_note) && (
                    <div className="p-2 rounded-lg bg-[#121214] border border-[#202024] text-[11px] text-zinc-300 italic">
                      &ldquo;{sub.submission_text || sub.submission_note}&rdquo;
                    </div>
                  )}

                  {sub.feedback && (
                    <div className="text-[11px] text-emerald-400/90">
                      <span className="font-semibold">{isId ? "Umpan Balik: " : "Feedback: "}</span>
                      <span>{sub.feedback}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-zinc-500">
                      {sub.submitted_at
                        ? format(parseISO(sub.submitted_at), isId ? "d MMM yyyy, HH:mm" : "MMM d, yyyy, HH:mm")
                        : "In Progress"}
                    </span>
                    <Button
                      variant={isGraded ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleOpenGradeModal(sub)}
                      className="h-7 text-xs gap-1"
                    >
                      <Award className="h-3 w-3" />
                      <span>{isGraded ? (isId ? "Ubah Nilai" : "Edit Grade") : (isId ? "Beri Nilai" : "Grade")}</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Grade Modal */}
      {selectedSubmission && (
        <Modal
          isOpen={!!selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          title={isId ? "Penilaian Tugas" : "Grade Submission"}
          description={
            isId
              ? `Berikan nilai dan umpan balik untuk tugas "${selectedSubmission.assignment?.title}".`
              : `Assign score and constructive feedback for "${selectedSubmission.assignment?.title}".`
          }
        >
          <form onSubmit={handleSaveGrade} className="space-y-4 pt-2">
            {/* Student metadata banner */}
            <div className="p-3 rounded-xl border border-[#1E1E24] bg-[#121216] space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-zinc-100">
                    {selectedSubmission.student?.display_name ||
                      selectedSubmission.student?.email?.split("@")[0] ||
                      "Student"}
                  </p>
                  <p className="text-[11px] text-zinc-400">{selectedSubmission.student?.email}</p>
                </div>
                {selectedSubmission.submitted_at && (
                  <span className="text-[10px] font-mono text-zinc-500">
                    {format(parseISO(selectedSubmission.submitted_at), isId ? "d MMM, HH:mm" : "MMM d, HH:mm")}
                  </span>
                )}
              </div>

              {(selectedSubmission.submission_text || selectedSubmission.submission_note) && (
                <div className="pt-2 border-t border-[#1C1C20] text-xs text-zinc-300">
                  <span className="text-zinc-500 not-italic text-[10px] block mb-0.5 font-medium">
                    {isId ? "Deliverable / Catatan Serahan:" : "Deliverable / Submission Content:"}
                  </span>
                  <div className="p-2 rounded-lg bg-[#0c0c0e] border border-[#202024] font-sans text-zinc-200 whitespace-pre-wrap">
                    {selectedSubmission.submission_text || selectedSubmission.submission_note}
                  </div>
                </div>
              )}
            </div>

            {/* Error banner */}
            {gradingError && (
              <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs">
                {gradingError}
              </div>
            )}

            {/* Grade Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
                <span>{isId ? "Nilai (Skala 0 - 100)" : "Score / Grade (0 - 100)"}</span>
                <span className="text-[10px] text-zinc-500">{isId ? "Opsional" : "Optional"}</span>
              </label>
              <Input
                type="number"
                min={0}
                max={100}
                step={1}
                value={gradeInput}
                onChange={(e) => setGradeInput(e.target.value)}
                placeholder="e.g. 95"
                className="font-mono text-sm"
              />
            </div>

            {/* Feedback Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">
                {isId ? "Umpan Balik / Catatan Pengajar" : "Teacher Feedback"}
              </label>
              <textarea
                value={feedbackInput}
                onChange={(e) => setFeedbackInput(e.target.value)}
                placeholder={
                  isId
                    ? "Tulis umpan balik konstruktif untuk mahasiswa..."
                    : "Write helpful feedback and guidance for the student..."
                }
                rows={4}
                className="w-full rounded-xl border border-[#222226] bg-[#121216] px-3.5 py-2.5 text-xs text-white placeholder:text-zinc-600 focus:border-purple-500/60 focus:outline-none transition-colors resize-none"
              />
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#1C1C20]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedSubmission(null)}
                disabled={isSubmittingGrade}
              >
                {isId ? "Batal" : "Cancel"}
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmittingGrade}
                className="gap-1.5"
              >
                <Award className="h-3.5 w-3.5" />
                <span>{isSubmittingGrade ? (isId ? "Menyimpan..." : "Saving...") : (isId ? "Simpan Nilai" : "Save Grade")}</span>
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

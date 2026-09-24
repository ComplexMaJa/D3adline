"use client";

import * as React from "react";
import Link from "next/link";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Assignment } from "@/types/database";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { AlertCircle, ArrowUpRight, UploadCloud, Layers } from "lucide-react";

interface SubmissionRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: Assignment | null;
}

export function SubmissionRequiredModal({
  isOpen,
  onClose,
  assignment,
}: SubmissionRequiredModalProps) {
  const { language } = useLanguage();

  if (!assignment) return null;

  const isId = language === "id";
  const course = assignment.course;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="flex flex-col items-center text-center">
        {/* Warning Icon Badge */}
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-400 mb-4 shadow-lg shadow-amber-500/5">
          <UploadCloud className="h-7 w-7" />
        </div>

        {/* Title & Description */}
        <h3 className="text-base sm:text-lg font-bold text-zinc-100 tracking-tight">
          {isId ? "Pengumpulan Tugas Diperlukan" : "Submission Required"}
        </h3>
        <p className="mt-2 text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-sm">
          {isId
            ? "Siswa tidak dapat menandai tugas ini selesai tanpa mengumpulkan hasil tugas. Silakan buka tugas untuk melampirkan berkas atau mengirimkan jawaban tertulis Anda terlebih dahulu."
            : "Students cannot mark this assignment as complete without actually submitting anything. Please open the assignment and submit your coursework or deliverables first."}
        </p>

        {/* Assignment Preview Card */}
        <div className="mt-5 w-full rounded-xl border border-[#222222] bg-[#0E0E0E] p-3.5 text-left space-y-2">
          <div className="flex items-center justify-between gap-2">
            {course ? (
              <span
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium"
                style={{
                  backgroundColor: `${course.color || "#8B5CF6"}20`,
                  color: course.color || "#8B5CF6",
                }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: course.color || "#8B5CF6" }}
                />
                <span>{course.code || course.name}</span>
              </span>
            ) : (
              <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                <Layers className="h-3 w-3" /> General
              </span>
            )}

            <span className="text-[11px] font-mono text-zinc-400">
              {isId ? "Tenggat:" : "Due:"} {assignment.due_date}
            </span>
          </div>

          <p className="text-sm font-semibold text-zinc-200 line-clamp-1">
            {assignment.title}
          </p>
        </div>

        {/* Actions */}
        <div className="mt-6 flex w-full flex-col-reverse sm:flex-row gap-2.5">
          <Button
            type="button"
            variant="outline"
            className="flex-1 text-xs"
            onClick={onClose}
          >
            {isId ? "Tutup" : "Dismiss"}
          </Button>

          <Link
            href={`/assignments/${assignment.id}`}
            onClick={onClose}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-900/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>{isId ? "Buka & Kumpulkan Tugas" : "Go to Assignment & Submit"}</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </Modal>
  );
}

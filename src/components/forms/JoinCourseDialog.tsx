"use client";

import * as React from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useApp } from "@/components/layout/AppShell";
import { Course } from "@/types/database";
import { BookOpen, Check, AlertCircle, KeyRound, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

interface JoinCourseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onJoined?: (course: Course) => void;
}

export function JoinCourseDialog({ isOpen, onClose, onJoined }: JoinCourseDialogProps) {
  const [joinCode, setJoinCode] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [successCourse, setSuccessCourse] = React.useState<Course | null>(null);

  const { refreshCourses } = useApp();
  const { language } = useLanguage();
  const supabase = createClient();
  const router = useRouter();

  const isId = language === "id";

  React.useEffect(() => {
    if (!isOpen) {
      setJoinCode("");
      setError(null);
      setSuccessCourse(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = joinCode.trim().toUpperCase();

    if (!cleanCode) {
      setError(isId ? "Masukkan kode kelas terlebih dahulu." : "Please enter a class join code.");
      return;
    }

    if (cleanCode.length < 4) {
      setError(isId ? "Format kode kelas tidak valid." : "Invalid class code format.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError(isId ? "Sesi Anda telah berakhir. Silakan login kembali." : "Session expired. Please log in again.");
        return;
      }

      // Find course by join_code (case-insensitive)
      const { data: course, error: courseError } = await supabase
        .from("courses")
        .select("*")
        .ilike("join_code", cleanCode)
        .maybeSingle();

      if (courseError) throw courseError;

      if (!course) {
        setError(
          isId
            ? `Kelas dengan kode "${cleanCode}" tidak ditemukan. Pastikan kode sudah benar dari pengajar Anda.`
            : `No course found with code "${cleanCode}". Please verify the code with your instructor.`
        );
        return;
      }

      // Check if user is the course instructor
      if (course.user_id === user.id) {
        setError(
          isId
            ? "Anda adalah pembuat / pengajar kelas ini."
            : "You are the instructor / creator of this class."
        );
        return;
      }

      // Check if student is already enrolled
      const { data: existingEnrollment } = await supabase
        .from("course_enrollments")
        .select("id")
        .eq("course_id", course.id)
        .eq("student_id", user.id)
        .maybeSingle();

      if (existingEnrollment) {
        setError(
          isId
            ? `Anda sudah terdaftar di kelas "${course.name}".`
            : `You are already enrolled in "${course.name}".`
        );
        return;
      }

      // Enroll student into course
      const { error: enrollError } = await supabase
        .from("course_enrollments")
        .insert({
          course_id: course.id,
          student_id: user.id,
          status: "active",
        });

      if (enrollError) throw enrollError;

      setSuccessCourse(course as Course);
      await refreshCourses();
      router.refresh();

      if (onJoined) {
        onJoined(course as Course);
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: unknown) {
      console.error("Error joining course:", err);
      const msg = err instanceof Error ? err.message : "Failed to join course";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="md">
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-[#222226]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-950/80 border border-purple-700/60 text-purple-300 shadow-purple-glow-sm">
            <KeyRound className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              {isId ? "Gabung Kelas Kuliah" : "Join Course with Code"}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              {isId
                ? "Masukkan 6 karakter kode unik yang dibagikan oleh pengajar Anda."
                : "Enter the 6-character unique invite code provided by your instructor."}
            </p>
          </div>
        </div>

        {successCourse ? (
          <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-600/50 text-emerald-300 flex items-center gap-3 my-2 animate-fade-in">
            <div className="h-9 w-9 rounded-lg bg-emerald-900/60 flex items-center justify-center shrink-0 border border-emerald-500/40">
              <Check className="h-5 w-5 text-emerald-300" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-emerald-200">
                {isId ? "Berhasil Bergabung!" : "Successfully Enrolled!"}
              </p>
              <p className="text-[11px] text-emerald-300/80 truncate">
                {successCourse.code ? `${successCourse.code} • ` : ""}
                {successCourse.name}
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleJoin} className="space-y-4 pt-2">
            {error && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/50 text-xs text-red-300 flex items-start gap-2.5 animate-shake">
                <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-2">
                {isId ? "Kode Undangan Kelas" : "Class Invite Code"}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => {
                    setJoinCode(e.target.value.toUpperCase());
                    if (error) setError(null);
                  }}
                  placeholder="e.g. ALGO99"
                  maxLength={10}
                  autoFocus
                  className="w-full h-12 rounded-xl bg-[#121214] border border-[#2A2A30] px-4 font-mono text-center text-lg font-bold tracking-[0.25em] text-white uppercase placeholder:text-zinc-600 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all"
                />
              </div>
              <p className="text-[11px] text-zinc-500 mt-2 text-center">
                {isId
                  ? "Kode tidak sensitif terhadap huruf besar/kecil (contoh: ALGO99, DIST77, SOFT55)"
                  : "Codes are case-insensitive (e.g., ALGO99, DIST77, SOFT55)"}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1C1C20]">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onClose}
                disabled={isLoading}
              >
                <span>{isId ? "Batal" : "Cancel"}</span>
              </Button>
              <Button
                type="submit"
                size="sm"
                isLoading={isLoading}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold shadow-purple-glow-sm"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>{isId ? "Gabung Kelas" : "Join Course"}</span>
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}

"use client";

import * as React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Course, Profile } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import {
  Search,
  UserPlus,
  Users,
  Check,
  CheckCircle2,
  Copy,
  GraduationCap,
  Building,
  Mail,
  AlertCircle,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface AssignStudentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  onEnrolled?: () => void;
}

export function AssignStudentDialog({
  isOpen,
  onClose,
  course,
  onEnrolled,
}: AssignStudentDialogProps) {
  const { language } = useLanguage();
  const isId = language === "id";
  const supabase = createClient();

  const [students, setStudents] = React.useState<Profile[]>([]);
  const [enrolledStudentIds, setEnrolledStudentIds] = React.useState<Set<string>>(new Set());
  const [search, setSearch] = React.useState("");
  const [emailInput, setEmailInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isAssigning, setIsAssigning] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [successMsg, setSuccessMsg] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  // Load students & existing enrollments when modal opens
  React.useEffect(() => {
    if (!isOpen) {
      setSearch("");
      setEmailInput("");
      setError(null);
      setSuccessMsg(null);
      return;
    }

    async function loadData() {
      setIsLoading(true);
      setError(null);

      try {
        // 1. Fetch current enrollments for this course
        const { data: enrollments, error: enrError } = await supabase
          .from("course_enrollments")
          .select("student_id")
          .eq("course_id", course.id);

        if (enrError) throw enrError;
        const enrolledSet = new Set((enrollments || []).map((e) => e.student_id));
        setEnrolledStudentIds(enrolledSet);

        // 2. Fetch all registered student profiles
        const { data: studentProfiles, error: profError } = await supabase
          .from("profiles")
          .select("*")
          .eq("role", "student")
          .order("display_name", { ascending: true });

        if (profError) throw profError;
        setStudents((studentProfiles || []) as Profile[]);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [isOpen, course.id, supabase]);

  // Handle assigning a student
  const handleAssignStudent = async (student: Profile) => {
    setIsAssigning(student.id);
    setError(null);
    setSuccessMsg(null);

    try {
      const { error: insertError } = await supabase
        .from("course_enrollments")
        .insert({
          course_id: course.id,
          student_id: student.id,
          status: "active",
        });

      if (insertError) throw insertError;

      // Update local set
      setEnrolledStudentIds((prev) => new Set(prev).add(student.id));
      setSuccessMsg(
        isId
          ? `Mahasiswa "${student.display_name || student.email}" berhasil didaftarkan!`
          : `Student "${student.display_name || student.email}" successfully enrolled!`
      );
      onEnrolled?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setIsAssigning(null);
    }
  };

  // Handle assign by direct email lookup
  const handleAssignByEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail) return;

    setIsAssigning("email");
    setError(null);
    setSuccessMsg(null);

    try {
      // Find profile by email
      const { data: targetProfile, error: searchError } = await supabase
        .from("profiles")
        .select("*")
        .ilike("email", cleanEmail)
        .maybeSingle();

      if (searchError) throw searchError;
      if (!targetProfile) {
        throw new Error(
          isId
            ? `Pengguna dengan email "${cleanEmail}" tidak ditemukan di sistem.`
            : `User with email "${cleanEmail}" was not found.`
        );
      }

      if (enrolledStudentIds.has(targetProfile.id)) {
        throw new Error(
          isId
            ? `Mahasiswa ini sudah terdaftar di kelas "${course.name}".`
            : `This student is already enrolled in "${course.name}".`
        );
      }

      await handleAssignStudent(targetProfile);
      setEmailInput("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(msg);
    } finally {
      setIsAssigning(null);
    }
  };

  const handleCopyCode = () => {
    if (course.join_code) {
      navigator.clipboard.writeText(course.join_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Filter students based on search query
  const filteredStudents = students.filter((s) => {
    const term = search.toLowerCase();
    const nameMatch = (s.display_name || "").toLowerCase().includes(term);
    const emailMatch = (s.email || "").toLowerCase().includes(term);
    const instMatch = (s.institution || "").toLowerCase().includes(term);
    return nameMatch || emailMatch || instMatch;
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isId ? "Daftarkan Mahasiswa ke Kelas" : "Assign Student to Course"}
      description={
        isId
          ? `Tambahkan mahasiswa ke kelas "${course.name}" atau bagikan kode undangan.`
          : `Add students directly to "${course.name}" or share the course invite code.`
      }
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Status Alerts */}
        {error && (
          <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Quick Share Code Banner */}
        {course.join_code && (
          <div className="p-3.5 rounded-xl border border-purple-900/40 bg-purple-950/20 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-[11px] font-semibold text-purple-300 uppercase tracking-wider">
                {isId ? "Kode Undangan Kelas" : "Course Invite Code"}
              </span>
              <p className="text-xs text-zinc-400">
                {isId
                  ? "Mahasiswa juga dapat mendaftar mandiri menggunakan kode ini:"
                  : "Students can also self-enroll by entering this 6-character code:"}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="px-3 py-1.5 rounded-lg bg-black/80 border border-purple-800/60 font-mono text-sm font-bold text-purple-300 tracking-wider">
                {course.join_code}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyCode}
                className="h-8 border-[#2E2E33] hover:border-purple-500/50"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-zinc-400" />
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Direct Email Assign Form */}
        <form onSubmit={handleAssignByEmail} className="space-y-2">
          <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5 text-zinc-400" />
            <span>{isId ? "Daftarkan lewat Email Mahasiswa" : "Assign by Student Email"}</span>
          </label>
          <div className="flex items-center gap-2">
            <Input
              placeholder={isId ? "contoh: alex.rivera@campus.edu" : "e.g. student@deadline.app"}
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              type="email"
              className="text-xs"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!emailInput.trim() || isAssigning === "email"}
              isLoading={isAssigning === "email"}
              className="shrink-0 bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>{isId ? "Daftarkan" : "Assign"}</span>
            </Button>
          </div>
        </form>

        {/* Search Registered Students */}
        <div className="space-y-2 pt-2 border-t border-[#1C1C1C]">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-zinc-400" />
              <span>{isId ? "Pilih dari Mahasiswa Terdaftar" : "Select from Registered Students"}</span>
            </label>
            <span className="text-[11px] text-zinc-500 font-mono">
              {filteredStudents.length} {isId ? "mahasiswa" : "students"}
            </span>
          </div>
          <Input
            placeholder={isId ? "Cari nama, email, atau universitas..." : "Search by name, email, or institution..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="h-3.5 w-3.5" />}
            className="text-xs"
          />
        </div>

        {/* Student List */}
        <div className="max-h-64 overflow-y-auto space-y-2 pr-1 divide-y divide-[#141414]">
          {isLoading ? (
            <div className="py-8 text-center text-xs text-zinc-500 animate-pulse">
              {isId ? "Memuat daftar mahasiswa..." : "Loading registered students..."}
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="py-8 text-center text-xs text-zinc-500 space-y-1">
              <GraduationCap className="h-6 w-6 text-zinc-600 mx-auto" />
              <p>{isId ? "Tidak ada mahasiswa ditemukan." : "No registered students found."}</p>
            </div>
          ) : (
            filteredStudents.map((student) => {
              const isEnrolled = enrolledStudentIds.has(student.id);
              const name = student.display_name || student.email?.split("@")[0] || "Student";
              const initials = name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase() || "S";

              return (
                <div
                  key={student.id}
                  className="flex items-center justify-between gap-3 pt-2 pb-2 first:pt-0"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-purple-800 to-indigo-700 flex items-center justify-center text-white text-xs font-bold shrink-0 border border-[#2A2A2E]">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-zinc-200 truncate">
                          {name}
                        </span>
                        {isEnrolled && (
                          <span className="px-1.5 py-0.2 text-[9px] rounded font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                            {isId ? "Terdaftar" : "Enrolled"}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-500 truncate">
                        <span>{student.email}</span>
                        {student.institution && (
                          <span className="flex items-center gap-1 text-zinc-400 truncate">
                            <Building className="h-2.5 w-2.5 shrink-0" />
                            <span className="truncate">{student.institution}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isEnrolled ? (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled
                        className="h-7 text-[11px] border-[#222226] text-zinc-500 cursor-not-allowed"
                      >
                        <Check className="h-3 w-3 text-emerald-500" />
                        <span>{isId ? "Terdaftar" : "Enrolled"}</span>
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleAssignStudent(student)}
                        disabled={isAssigning === student.id}
                        isLoading={isAssigning === student.id}
                        className="h-7 text-[11px] bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-glow-sm"
                      >
                        <UserPlus className="h-3 w-3" />
                        <span>{isId ? "Daftarkan" : "Assign"}</span>
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer actions */}
        <div className="flex justify-end pt-3 border-t border-[#1C1C1C]">
          <Button variant="outline" size="sm" onClick={onClose}>
            {isId ? "Selesai" : "Done"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

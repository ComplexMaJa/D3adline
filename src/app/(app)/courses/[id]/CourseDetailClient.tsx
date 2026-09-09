"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Course, Assignment, CourseEnrollment } from "@/types/database";
import { CourseDialog } from "@/components/forms/CourseDialog";
import { AssignmentDialog } from "@/components/forms/AssignmentDialog";
import { AssignStudentDialog } from "@/components/forms/AssignStudentDialog";
import { AssignmentCard } from "@/components/assignments/AssignmentCard";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { useApp } from "@/components/layout/AppShell";
import { createClient } from "@/lib/supabase/client";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { format, parseISO } from "date-fns";
import {
  ArrowLeft,
  BookOpen,
  User,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Copy,
  Check,
  Users,
  Building2,
  GraduationCap,
  UserPlus,
} from "lucide-react";

interface CourseDetailClientProps {
  course: Course;
  initialAssignments: Assignment[];
  initialEnrollments?: CourseEnrollment[];
  stats: {
    total: number;
    completed: number;
    inProgress: number;
    overdue: number;
    completionPercentage: number;
  };
}

export function CourseDetailClient({
  course,
  initialAssignments,
  initialEnrollments = [],
  stats,
}: CourseDetailClientProps) {
  const { t, language } = useLanguage();
  const [assignments, setAssignments] = React.useState<Assignment[]>(initialAssignments);
  const [enrollments, setEnrollments] = React.useState<CourseEnrollment[]>(initialEnrollments);
  const [copiedCode, setCopiedCode] = React.useState(false);

  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isAddAssignmentOpen, setIsAddAssignmentOpen] = React.useState(false);
  const [isAssignStudentOpen, setIsAssignStudentOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Assignment edit and delete states
  const [assignmentToEdit, setAssignmentToEdit] = React.useState<Assignment | null>(null);
  const [isEditAssignmentOpen, setIsEditAssignmentOpen] = React.useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = React.useState<Assignment | null>(null);
  const [isDeletingAssignment, setIsDeletingAssignment] = React.useState(false);

  const { profile, courses, refreshCourses, isTeacher } = useApp();
  const supabase = createClient();
  const router = useRouter();

  const isInstructor = isTeacher && (profile?.id === course.user_id || profile?.role === "admin");
  const isEnrolled = enrollments.some((e) => e.student_id === profile?.id);

  const handleCopyInviteCode = () => {
    if (course.join_code) {
      navigator.clipboard.writeText(course.join_code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  React.useEffect(() => {
    setAssignments(initialAssignments);
  }, [initialAssignments]);

  const handleStudentEnrolled = async () => {
    try {
      const { data: updatedEnrollments } = await supabase
        .from("course_enrollments")
        .select("*, student:profiles(*)")
        .eq("course_id", course.id);
      if (updatedEnrollments) {
        setEnrollments(updatedEnrollments as CourseEnrollment[]);
      }
      router.refresh();
    } catch (err) {
      console.error("Error refreshing roster:", err);
    }
  };

  const handleToggleComplete = async (assignment: Assignment) => {
    const isNowCompleted = assignment.status !== "Completed";
    const newStatus = isNowCompleted ? "Completed" : "In Progress";
    const newProgress = isNowCompleted ? 100 : 50;

    setAssignments((prev) =>
      prev.map((a) =>
        a.id === assignment.id
          ? { ...a, status: newStatus, progress: newProgress }
          : a
      )
    );

    try {
      if (isInstructor) {
        const { error } = await supabase
          .from("assignments")
          .update({
            status: newStatus,
            progress: newProgress,
            updated_at: new Date().toISOString(),
          })
          .eq("id", assignment.id);

        if (error) throw error;
      } else if (profile?.id) {
        const now = new Date().toISOString();
        const { error } = await supabase
          .from("assignment_submissions")
          .upsert(
            {
              assignment_id: assignment.id,
              student_id: profile.id,
              status: newStatus,
              progress: newProgress,
              submitted_at: isNowCompleted ? now : null,
              updated_at: now,
            },
            { onConflict: "assignment_id,student_id" }
          );

        if (error) throw error;
      }

      await refreshCourses();
      router.refresh();
    } catch (err) {
      console.error("Error updating assignment:", err);
      setAssignments(initialAssignments);
    }
  };

  const handleDeleteCourse = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("courses")
        .delete()
        .eq("id", course.id);

      if (error) throw error;
      await refreshCourses();
      router.push("/courses");
    } catch (err) {
      console.error("Error deleting course:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setAssignmentToEdit(assignment);
    setIsEditAssignmentOpen(true);
  };

  const handleDeleteAssignment = (assignment: Assignment) => {
    setAssignmentToDelete(assignment);
  };

  const handleConfirmDeleteAssignment = async () => {
    if (!assignmentToDelete) return;
    setIsDeletingAssignment(true);
    try {
      const { error } = await supabase
        .from("assignments")
        .delete()
        .eq("id", assignmentToDelete.id);

      if (error) throw error;

      setAssignments((prev) => prev.filter((a) => a.id !== assignmentToDelete.id));
      await refreshCourses();
      router.refresh();
      setAssignmentToDelete(null);
    } catch (err) {
      console.error("Error deleting assignment:", err);
    } finally {
      setIsDeletingAssignment(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back link */}
      <Link
        href="/courses"
        className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>{t.courses.backToCourses}</span>
      </Link>

      {/* Course Banner Card */}
      <div className="relative rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-6 overflow-hidden">
        {/* Accent strip */}
        <div
          className="absolute top-0 left-0 right-0 h-1.5"
          style={{ backgroundColor: course.color || "#8B5CF6" }}
        />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              {course.code && (
                <span
                  className="px-2.5 py-0.5 rounded-md text-xs font-mono font-bold tracking-wide"
                  style={{
                    backgroundColor: `${course.color}25`,
                    color: course.color || "#8B5CF6",
                    border: `1px solid ${course.color}50`,
                  }}
                >
                  {course.code}
                </span>
              )}
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {course.name}
              </h1>
            </div>

            {course.instructor && (
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <User className="h-3.5 w-3.5 text-zinc-500" />
                <span>{t.courses.instructorLabel}: {course.instructor}</span>
              </div>
            )}

            {course.description && (
              <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
                {course.description}
              </p>
            )}

            {/* Course Join Code Banner */}
            {course.join_code && (
              <div className="mt-3 flex flex-wrap items-center gap-2.5 p-2.5 sm:p-3 rounded-xl bg-black/70 border border-[#1E1E22]">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium text-zinc-400">
                    {t.courses.inviteCode}:
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-purple-950/40 border border-purple-800/50 text-purple-300 font-mono text-xs font-bold tracking-wider">
                    {course.join_code}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyInviteCode}
                  className="h-7 text-xs gap-1.5 border-[#2A2A2E] hover:border-purple-500/40"
                >
                  {copiedCode ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span className="text-emerald-400">{t.courses.codeCopied}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 text-zinc-400" />
                      <span>{t.courses.copyCode}</span>
                    </>
                  )}
                </Button>
                <span className="text-[11px] text-zinc-500 hidden sm:inline">
                  {t.courses.shareCodeDesc}
                </span>
                {isEnrolled && !isInstructor && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium bg-emerald-950/40 text-emerald-400 border border-emerald-800/50 ml-auto">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>{t.courses.enrolledStatus}</span>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Action buttons (only for course instructor / teacher) */}
          {isInstructor && (
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditDialogOpen(true)}
              >
                <Edit2 className="h-3.5 w-3.5" />
                <span>{t.courses.editCourse}</span>
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{t.common.delete}</span>
              </Button>
              <Button
                size="sm"
                onClick={() => setIsAddAssignmentOpen(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{t.courses.createAssignment}</span>
              </Button>
            </div>
          )}
        </div>

        {/* Progress meter */}
        <div className="mt-6 pt-5 border-t border-[#161616] grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="space-y-1">
            <span className="text-[11px] text-zinc-500">{t.courses.totalWorkload}</span>
            <p className="text-lg font-bold text-zinc-100">
              {stats.total} {stats.total === 1 ? t.courses.tasksCountSingular : t.courses.tasksCount}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] text-emerald-500">{t.courses.completed}</span>
            <p className="text-lg font-bold text-emerald-400">{stats.completed}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] text-blue-400">{t.courses.inProgress}</span>
            <p className="text-lg font-bold text-blue-400">{stats.inProgress}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] text-purple-400">{t.courses.completion}</span>
            <p className="text-lg font-bold text-purple-300">
              {stats.completionPercentage}%
            </p>
          </div>
        </div>

        <div className="mt-3">
          <ProgressBar
            value={stats.completionPercentage}
            color={course.color}
            size="sm"
          />
        </div>
      </div>

      {/* Enrolled Students Roster Section */}
      {(isInstructor || isEnrolled || enrollments.length > 0) && (
        <div className="rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-lg bg-purple-950/30 border border-purple-800/40 flex items-center justify-center">
                <Users className="h-4 w-4 text-purple-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                  <span>{t.courses.rosterTitle}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-zinc-800 text-zinc-300">
                    {enrollments.length}
                  </span>
                </h2>
                <p className="text-[11px] text-zinc-500">
                  {enrollments.length} {t.courses.rosterCount}
                </p>
              </div>
            </div>

            {isInstructor && (
              <Button
                size="sm"
                onClick={() => setIsAssignStudentOpen(true)}
                className="gap-1.5"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>{language === "id" ? "Tugaskan Mahasiswa" : "Assign Student"}</span>
              </Button>
            )}
          </div>

          {enrollments.length === 0 ? (
            <div className="p-6 rounded-xl border border-dashed border-[#1E1E22] text-center space-y-1.5">
              <Users className="h-6 w-6 text-zinc-600 mx-auto" />
              <p className="text-xs text-zinc-400 font-medium">
                {t.courses.rosterEmpty}
              </p>
              {course.join_code && (
                <p className="text-[11px] text-zinc-500">
                  {language === "id"
                    ? `Bagikan kode ${course.join_code} agar mahasiswa dapat bergabung ke kelas ini.`
                    : `Share code ${course.join_code} with students so they can enroll in this class.`}
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {enrollments.map((enr) => {
                const student = enr.student;
                const studentName =
                  student?.display_name ||
                  student?.email?.split("@")[0] ||
                  "Student";
                const initials =
                  studentName
                    .split(" ")
                    .map((n: string) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase() || "S";

                return (
                  <div
                    key={enr.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-[#18181A] bg-[#070708] hover:border-[#26262B] transition-colors"
                  >
                    {/* Student Avatar */}
                    {student?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={student.avatar_url}
                        alt={studentName}
                        className="h-9 w-9 rounded-full object-cover border border-[#2A2A2E] shrink-0"
                      />
                    ) : (
                      <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-purple-950/60 to-indigo-950/60 border border-purple-800/40 flex items-center justify-center text-xs font-bold text-purple-300 shrink-0">
                        {initials}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-semibold text-zinc-200 truncate">
                          {studentName}
                        </p>
                        <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-emerald-400">
                          {enr.status}
                        </span>
                      </div>

                      {student?.institution && (
                        <div className="flex items-center gap-1 text-[10px] text-zinc-400 truncate mt-0.5">
                          <Building2 className="h-2.5 w-2.5 text-zinc-500 shrink-0" />
                          <span className="truncate">{student.institution}</span>
                        </div>
                      )}

                      <p className="text-[10px] text-zinc-500 mt-0.5">
                        {t.courses.enrolledOn}{" "}
                        {enr.enrolled_at
                          ? format(
                              parseISO(enr.enrolled_at),
                              language === "id" ? "d MMM yyyy" : "MMM d, yyyy"
                            )
                          : ""}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Course Assignments List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-purple-400" />
            <span>{t.courses.assignmentsTitle} ({assignments.length})</span>
          </h2>
          {isInstructor && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsAddAssignmentOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{t.courses.newTaskBtn}</span>
            </Button>
          )}
        </div>

        {assignments.length === 0 ? (
          <EmptyState
            title={t.courses.noAssignmentsTitle}
            description={t.courses.noAssignmentsDesc}
            action={
              isInstructor ? (
                <Button
                  size="sm"
                  onClick={() => setIsAddAssignmentOpen(true)}
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{t.courses.createAssignment}</span>
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignments.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                course={course}
                onToggleComplete={handleToggleComplete}
                onEdit={isInstructor ? handleEditAssignment : undefined}
                onDelete={isInstructor ? handleDeleteAssignment : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {/* Assign Student Dialog */}
      <AssignStudentDialog
        isOpen={isAssignStudentOpen}
        onClose={() => setIsAssignStudentOpen(false)}
        course={course}
        onEnrolled={handleStudentEnrolled}
      />

      {/* Edit Course Dialog */}
      <CourseDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        courseToEdit={course}
        onSaved={async () => {
          await refreshCourses();
          router.refresh();
        }}
      />

      {/* Add Assignment Dialog pre-selected with this course */}
      <AssignmentDialog
        isOpen={isAddAssignmentOpen}
        onClose={() => setIsAddAssignmentOpen(false)}
        courses={courses && courses.length > 0 ? courses : [course]}
        initialCourseId={course.id}
        onSaved={async () => {
          await refreshCourses();
          router.refresh();
        }}
      />

      {/* Edit Assignment Dialog */}
      <AssignmentDialog
        isOpen={isEditAssignmentOpen}
        onClose={() => {
          setIsEditAssignmentOpen(false);
          setAssignmentToEdit(null);
        }}
        assignmentToEdit={assignmentToEdit}
        courses={courses && courses.length > 0 ? courses : [course]}
        initialCourseId={assignmentToEdit?.course_id || course.id}
        onSaved={async () => {
          await refreshCourses();
          router.refresh();
        }}
      />

      {/* Delete Course Confirm */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteCourse}
        title={language === "id" ? `Hapus ${course.name}?` : `Delete ${course.name}?`}
        description={t.courses.deleteCourseConfirmDesc}
        confirmText={t.courses.deleteCourse}
        isLoading={isDeleting}
      />

      {/* Delete Assignment Confirm */}
      <ConfirmDialog
        isOpen={!!assignmentToDelete}
        onClose={() => setAssignmentToDelete(null)}
        onConfirm={handleConfirmDeleteAssignment}
        title={t.courses.deleteAssignmentConfirmTitle}
        description={
          language === "id"
            ? `Apakah Anda yakin ingin menghapus "${assignmentToDelete?.title}"? Tindakan ini tidak dapat dibatalkan.`
            : `Are you sure you want to delete "${assignmentToDelete?.title}"? This action cannot be undone.`
        }
        confirmText={t.common.delete}
        isLoading={isDeletingAssignment}
      />
    </div>
  );
}

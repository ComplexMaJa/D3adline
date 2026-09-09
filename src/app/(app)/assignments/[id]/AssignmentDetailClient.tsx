"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Assignment,
  Course,
  Subtask,
  Attachment,
  AssignmentPriority,
  AssignmentStatus,
  AssignmentSubmission,
  CourseEnrollment,
} from "@/types/database";
import { AssignmentDialog } from "@/components/forms/AssignmentDialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { createClient } from "@/lib/supabase/client";
import { useApp } from "@/components/layout/AppShell";
import { triggerCompletionConfetti } from "@/lib/confetti";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  getDeadlineInfo,
  getPriorityBadgeStyle,
  getStatusBadgeStyle,
} from "@/lib/deadline-utils";
import { formatBytes } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Edit2,
  Paperclip,
  Upload,
  File,
  Download,
  AlertTriangle,
  Layers,
  Sparkles,
  Loader2,
  GraduationCap,
  Award,
  Send,
  Users,
  Check,
  Building2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AssignmentDetailClientProps {
  initialAssignment: Assignment;
  initialSubtasks: Subtask[];
  initialAttachments: Attachment[];
  courses: Course[];
  initialSubmissions?: AssignmentSubmission[];
  initialEnrollments?: CourseEnrollment[];
}

export function AssignmentDetailClient({
  initialAssignment,
  initialSubtasks,
  initialAttachments,
  courses,
  initialSubmissions = [],
  initialEnrollments = [],
}: AssignmentDetailClientProps) {
  const { t, language, dateLocale } = useLanguage();
  const { profile, userRole, isTeacher, isStudent, refreshCourses } = useApp();
  const [assignment, setAssignment] = React.useState<Assignment>(initialAssignment);
  const [subtasks, setSubtasks] = React.useState<Subtask[]>(initialSubtasks);
  const [attachments, setAttachments] = React.useState<Attachment[]>(initialAttachments);
  const [submissions, setSubmissions] = React.useState<AssignmentSubmission[]>(initialSubmissions);
  const [enrollments, setEnrollments] = React.useState<CourseEnrollment[]>(initialEnrollments);

  const [newSubtaskTitle, setNewSubtaskTitle] = React.useState("");
  const [isAddingSubtask, setIsAddingSubtask] = React.useState(false);

  const [isUploadingFile, setIsUploadingFile] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const supabase = createClient();
  const router = useRouter();

  const course = assignment.course;
  const isAssignmentOwner = profile?.id === assignment.user_id;
  const isInstructor = isTeacher && (course?.user_id === profile?.id || profile?.role === "admin");
  const canGrade = isTeacher && (course?.user_id === profile?.id || profile?.role === "admin" || !assignment.course_id);
  const canManageAssignment = assignment.course_id ? isInstructor : (isAssignmentOwner || isTeacher);

  // Student submission state & memo
  const mySubmission = React.useMemo(() => {
    return submissions.find((s) => s.student_id === profile?.id) || null;
  }, [submissions, profile?.id]);

  const [studentNote, setStudentNote] = React.useState(
    mySubmission?.submission_note || ""
  );
  const [studentProgress, setStudentProgress] = React.useState<number>(
    mySubmission?.progress ?? (mySubmission?.status === "Completed" ? 100 : 0)
  );
  const [isSubmittingWork, setIsSubmittingWork] = React.useState(false);
  const [submissionSuccess, setSubmissionSuccess] = React.useState(false);

  React.useEffect(() => {
    if (mySubmission?.submission_note !== undefined && mySubmission?.submission_note !== null) {
      setStudentNote(mySubmission.submission_note);
    }
    if (mySubmission) {
      setStudentProgress(
        mySubmission.progress ?? (mySubmission.status === "Completed" ? 100 : 0)
      );
    }
  }, [mySubmission]);

  const handleSaveStudentProgress = async (newProg: number) => {
    if (!profile?.id) return;
    setStudentProgress(newProg);
    const newStatus: AssignmentStatus =
      newProg === 100 ? "Completed" : newProg > 0 ? "In Progress" : "Not Started";
    const now = new Date().toISOString();

    try {
      const { data, error } = await supabase
        .from("assignment_submissions")
        .upsert(
          {
            assignment_id: assignment.id,
            student_id: profile.id,
            status: newStatus,
            progress: newProg,
            submission_note: studentNote.trim() || null,
            submitted_at: newProg === 100 ? (mySubmission?.submitted_at || now) : mySubmission?.submitted_at,
            updated_at: now,
          },
          { onConflict: "assignment_id,student_id" }
        )
        .select(`*, student:profiles(*)`)
        .single();

      if (error) throw error;

      if (data) {
        setSubmissions((prev) => {
          const index = prev.findIndex((s) => s.student_id === profile.id);
          if (index >= 0) {
            const copy = [...prev];
            copy[index] = data;
            return copy;
          }
          return [data, ...prev];
        });
      }

      if (newProg === 100) {
        triggerCompletionConfetti();
      }
      router.refresh();
    } catch (err) {
      console.error("Error updating student progress:", err);
    }
  };

  // Teacher grading modal state
  const [gradingTarget, setGradingTarget] = React.useState<{
    studentId: string;
    studentName: string;
    studentEmail?: string | null;
    studentAvatar?: string | null;
    submission?: AssignmentSubmission | null;
  } | null>(null);

  const [gradeInput, setGradeInput] = React.useState("");
  const [feedbackInput, setFeedbackInput] = React.useState("");
  const [isSavingGrade, setIsSavingGrade] = React.useState(false);

  const handleOpenGradeModal = (target: {
    studentId: string;
    studentName: string;
    studentEmail?: string | null;
    studentAvatar?: string | null;
    submission?: AssignmentSubmission | null;
  }) => {
    setGradingTarget(target);
    setGradeInput(
      target.submission?.grade !== null && target.submission?.grade !== undefined
        ? String(target.submission.grade)
        : ""
    );
    setFeedbackInput(target.submission?.feedback || "");
  };

  // Student Turn-in Handler
  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;
    setIsSubmittingWork(true);

    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("assignment_submissions")
        .upsert(
          {
            assignment_id: assignment.id,
            student_id: profile.id,
            status: "Completed",
            progress: 100,
            submission_note: studentNote.trim() || null,
            submitted_at: now,
            updated_at: now,
          },
          { onConflict: "assignment_id,student_id" }
        )
        .select(`*, student:profiles(*)`)
        .single();

      if (error) throw error;

      if (data) {
        setSubmissions((prev) => {
          const index = prev.findIndex((s) => s.student_id === profile.id);
          if (index >= 0) {
            const copy = [...prev];
            copy[index] = data;
            return copy;
          }
          return [data, ...prev];
        });
      }

      triggerCompletionConfetti();
      setSubmissionSuccess(true);
      setTimeout(() => setSubmissionSuccess(false), 3000);

      // Auto update master assignment progress to 100% only if teacher/owner
      if (canGrade && assignment.status !== "Completed") {
        await handleStatusChange("Completed");
      }
    } catch (err) {
      console.error("Error submitting assignment:", err);
    } finally {
      setIsSubmittingWork(false);
    }
  };

  // Teacher Save Grade Handler
  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingTarget) return;

    setIsSavingGrade(true);
    try {
      const parsedGrade = gradeInput.trim() ? parseFloat(gradeInput) : null;
      const now = new Date().toISOString();

      const { data, error } = await supabase
        .from("assignment_submissions")
        .upsert(
          {
            assignment_id: assignment.id,
            student_id: gradingTarget.studentId,
            status: "Completed",
            progress: 100,
            grade: parsedGrade,
            feedback: feedbackInput.trim() || null,
            updated_at: now,
          },
          { onConflict: "assignment_id,student_id" }
        )
        .select(`*, student:profiles(*)`)
        .single();

      if (error) throw error;

      if (data) {
        setSubmissions((prev) => {
          const index = prev.findIndex((s) => s.student_id === gradingTarget.studentId);
          if (index >= 0) {
            const copy = [...prev];
            copy[index] = { ...copy[index], ...data };
            return copy;
          }
          return [data, ...prev];
        });
      }

      setGradingTarget(null);
    } catch (err) {
      console.error("Error saving grade:", err);
    } finally {
      setIsSavingGrade(false);
    }
  };

  // Complete roster of enrolled students merged with submission states
  const studentRoster = React.useMemo(() => {
    const map = new Map<
      string,
      {
        studentId: string;
        student: any;
        submission: AssignmentSubmission | null;
      }
    >();

    for (const enr of enrollments) {
      map.set(enr.student_id, {
        studentId: enr.student_id,
        student: enr.student || null,
        submission: null,
      });
    }

    for (const sub of submissions) {
      const existing = map.get(sub.student_id);
      if (existing) {
        existing.submission = sub;
        if (!existing.student && (sub as any).student) {
          existing.student = (sub as any).student;
        }
      } else {
        map.set(sub.student_id, {
          studentId: sub.student_id,
          student: (sub as any).student || null,
          submission: sub,
        });
      }
    }

    return Array.from(map.values());
  }, [enrollments, submissions]);

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const deadline = getDeadlineInfo(
    assignment.due_date,
    assignment.due_time,
    assignment.status,
    language
  );

  const isCompleted = assignment.status === "Completed" || assignment.progress === 100;

  // Handle Progress Change
  const handleProgressChange = async (newProgress: number) => {
    let newStatus = assignment.status;
    if (newProgress === 100) {
      newStatus = "Completed";
      triggerCompletionConfetti();
    } else if (newProgress > 0 && assignment.status === "Not Started") {
      newStatus = "In Progress";
    } else if (newProgress === 0 && assignment.status === "Completed") {
      newStatus = "Not Started";
    }

    setAssignment((prev) => ({
      ...prev,
      progress: newProgress,
      status: newStatus,
    }));

    try {
      const { error } = await supabase
        .from("assignments")
        .update({
          progress: newProgress,
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", assignment.id);

      if (error) throw error;
      await refreshCourses();
    } catch (err) {
      console.error("Error updating progress:", err);
    }
  };

  // Handle Status Change
  const handleStatusChange = async (newStatus: AssignmentStatus) => {
    let newProgress = assignment.progress;
    if (newStatus === "Completed") {
      newProgress = 100;
      triggerCompletionConfetti();
    } else if (newStatus === "Not Started" && assignment.progress === 100) {
      newProgress = 0;
    } else if (newStatus === "In Progress" && assignment.progress === 0) {
      newProgress = 25;
    }

    setAssignment((prev) => ({
      ...prev,
      status: newStatus,
      progress: newProgress,
    }));

    try {
      const { error } = await supabase
        .from("assignments")
        .update({
          status: newStatus,
          progress: newProgress,
          updated_at: new Date().toISOString(),
        })
        .eq("id", assignment.id);

      if (error) throw error;
      await refreshCourses();
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  // Handle Priority Change
  const handlePriorityChange = async (newPriority: AssignmentPriority) => {
    setAssignment((prev) => ({ ...prev, priority: newPriority }));

    try {
      const { error } = await supabase
        .from("assignments")
        .update({
          priority: newPriority,
          updated_at: new Date().toISOString(),
        })
        .eq("id", assignment.id);

      if (error) throw error;
    } catch (err) {
      console.error("Error updating priority:", err);
    }
  };

  // Subtask: Add
  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;

    setIsAddingSubtask(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const position = subtasks.length + 1;
      const { data, error } = await supabase
        .from("assignment_subtasks")
        .insert({
          user_id: user.id,
          assignment_id: assignment.id,
          title: newSubtaskTitle.trim(),
          completed: false,
          position,
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setSubtasks((prev) => [...prev, data]);
        setNewSubtaskTitle("");
      }
    } catch (err) {
      console.error("Error adding subtask:", err);
    } finally {
      setIsAddingSubtask(false);
    }
  };

  // Subtask: Toggle
  const handleToggleSubtask = async (subtask: Subtask) => {
    const updatedCompleted = !subtask.completed;

    const newSubtasks = subtasks.map((s) =>
      s.id === subtask.id ? { ...s, completed: updatedCompleted } : s
    );
    setSubtasks(newSubtasks);

    // Auto calculate progress recommendation from subtasks
    const completedCount = newSubtasks.filter((s) => s.completed).length;
    const computedProgress =
      newSubtasks.length > 0
        ? Math.round((completedCount / newSubtasks.length) * 100)
        : assignment.progress;

    if (computedProgress === 100 && assignment.progress !== 100) {
      triggerCompletionConfetti();
    }

    try {
      await supabase
        .from("assignment_subtasks")
        .update({
          completed: updatedCompleted,
          updated_at: new Date().toISOString(),
        })
        .eq("id", subtask.id);

      // Sync progress
      if (canGrade) {
        handleProgressChange(computedProgress);
      } else {
        handleSaveStudentProgress(computedProgress);
      }
    } catch (err) {
      console.error("Error updating subtask:", err);
    }
  };

  // Subtask: Delete
  const handleDeleteSubtask = async (subtaskId: string) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== subtaskId));

    try {
      await supabase.from("assignment_subtasks").delete().eq("id", subtaskId);
    } catch (err) {
      console.error("Error deleting subtask:", err);
    }
  };

  // Attachments: Upload file to Supabase Storage
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB
    const BLOCKED_EXTENSIONS = ["exe", "bat", "cmd", "sh", "msi", "vbs", "scr", "com", "pif"];

    const fileExt = file.name.split(".").pop()?.toLowerCase();

    if (file.size > MAX_FILE_SIZE) {
      setUploadError(t.assignments.detail.fileSizeExceeded);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (fileExt && BLOCKED_EXTENSIONS.includes(fileExt)) {
      setUploadError(t.assignments.detail.blockedExtension);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsUploadingFile(true);
    setUploadError(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const filePath = `${user.id}/${assignment.id}/${Date.now()}_${safeName}`;

      // Upload to Storage
      const { error: storageError } = await supabase.storage
        .from("assignment-files")
        .upload(filePath, file);

      if (storageError) throw storageError;

      // Insert record to assignment_attachments
      const { data: attachmentRecord, error: dbError } = await supabase
        .from("assignment_attachments")
        .insert({
          user_id: user.id,
          assignment_id: assignment.id,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
          file_type: file.type || fileExt || "file",
        })
        .select()
        .single();

      if (dbError) throw dbError;
      if (attachmentRecord) {
        setAttachments((prev) => [attachmentRecord, ...prev]);
      }
    } catch (err: unknown) {
      console.error("Upload error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to upload attachment.";
      setUploadError(errorMessage);
    } finally {
      setIsUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Attachments: Download
  const handleDownloadFile = async (attachment: Attachment) => {
    try {
      const { data, error } = await supabase.storage
        .from("assignment-files")
        .createSignedUrl(attachment.file_path, 60);

      if (error) throw error;
      if (data?.signedUrl) {
        window.open(data.signedUrl, "_blank");
      }
    } catch (err) {
      console.error("Error creating download url:", err);
    }
  };

  // Attachments: Delete
  const handleDeleteAttachment = async (attachment: Attachment) => {
    setAttachments((prev) => prev.filter((a) => a.id !== attachment.id));

    try {
      await supabase.storage
        .from("assignment-files")
        .remove([attachment.file_path]);

      await supabase
        .from("assignment_attachments")
        .delete()
        .eq("id", attachment.id);
    } catch (err) {
      console.error("Error deleting attachment:", err);
    }
  };

  // Delete Assignment
  const handleDeleteAssignment = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("assignments")
        .delete()
        .eq("id", assignment.id);

      if (error) throw error;
      await refreshCourses();
      router.push("/assignments");
    } catch (err) {
      console.error("Error deleting assignment:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const completedSubtasksCount = subtasks.filter((s) => s.completed).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back Link */}
      <div className="flex items-center justify-between">
        <Link
          href="/assignments"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>{t.assignments.detail.backToAssignments}</span>
        </Link>

        {canManageAssignment && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Edit2 className="h-3.5 w-3.5" />
              <span>{t.common.edit}</span>
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>{t.common.delete}</span>
            </Button>
          </div>
        )}
      </div>

      {/* Main Assignment Card */}
      <div className="rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-6 space-y-6">
        {/* Header Information */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Course Pill */}
            {course && (
              <Link
                href={`/courses/${course.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold bg-[#141414] border border-[#262626] text-zinc-200 hover:border-purple-500/50 transition-colors"
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: course.color || "#8B5CF6" }}
                />
                <span>
                  {course.code ? `${course.code} · ` : ""}
                  {course.name}
                </span>
              </Link>
            )}

            {/* Deadline Intelligence Badge */}
            <div
              className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium border",
                deadline.isOverdue && !isCompleted
                  ? "bg-red-950/50 text-red-400 border-red-800/40"
                  : deadline.isDueToday && !isCompleted
                  ? "bg-amber-950/50 text-amber-300 border-amber-800/40"
                  : "bg-[#141414] text-purple-300 border-purple-900/40"
              )}
            >
              {deadline.isOverdue && !isCompleted ? (
                <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
              ) : (
                <Clock className="h-3.5 w-3.5 text-purple-400" />
              )}
              <span>{deadline.label}</span>
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            {assignment.title}
          </h1>

          {assignment.description && (
            <div className="p-4 rounded-xl bg-[#060606] border border-[#181818] text-xs text-zinc-300 leading-relaxed whitespace-pre-wrap">
              {assignment.description}
            </div>
          )}
        </div>

        {/* Quick Controls Grid: Deadline, Priority, Status, Progress */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-[#141414]">
          {/* Deadline details */}
          <div className="p-3.5 rounded-xl border border-[#161616] bg-[#070707] space-y-1">
            <span className="text-[11px] text-zinc-500 flex items-center gap-1">
              <Calendar className="h-3 w-3" /> {t.assignments.detail.dueDateTime}
            </span>
            <p className="text-xs font-semibold text-zinc-200">
              {deadline.formattedDate}
            </p>
            <p className="text-[11px] text-zinc-400">{deadline.formattedTime}</p>
          </div>

          {/* Priority selector */}
          <div className="p-3.5 rounded-xl border border-[#161616] bg-[#070707] space-y-1">
            <span className="text-[11px] text-zinc-500">{t.assignments.detail.priorityLevel}</span>
            {canGrade ? (
              <Select
                value={assignment.priority}
                onChange={(e) =>
                  handlePriorityChange(e.target.value as AssignmentPriority)
                }
                className="text-xs h-7"
              >
                <option value="Low">{t.priorities.low}</option>
                <option value="Medium">{t.priorities.medium}</option>
                <option value="High">{t.priorities.high}</option>
              </Select>
            ) : (
              <div className="pt-0.5">
                <span
                  className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border",
                    getPriorityBadgeStyle(assignment.priority)
                  )}
                >
                  {t.priorities[assignment.priority.toLowerCase() as keyof typeof t.priorities] || assignment.priority}
                </span>
              </div>
            )}
          </div>

          {/* Status selector */}
          <div className="p-3.5 rounded-xl border border-[#161616] bg-[#070707] space-y-1">
            <span className="text-[11px] text-zinc-500">
              {canGrade ? t.assignments.detail.workflowStatus : (language === "id" ? "Status Tugas Anda" : "Your Submission")}
            </span>
            {canGrade ? (
              <Select
                value={assignment.status}
                onChange={(e) =>
                  handleStatusChange(e.target.value as AssignmentStatus)
                }
                className="text-xs h-7"
              >
                <option value="Not Started">{t.statuses.notStarted}</option>
                <option value="In Progress">{t.statuses.inProgress}</option>
                <option value="Completed">{t.statuses.completed}</option>
                <option value="Overdue">{t.statuses.overdue}</option>
              </Select>
            ) : (
              <div className="pt-0.5">
                <span
                  className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border",
                    getStatusBadgeStyle(mySubmission?.status || "Not Started")
                  )}
                >
                  {mySubmission?.status === "Completed"
                    ? t.statuses.completed
                    : mySubmission?.status === "In Progress"
                    ? t.statuses.inProgress
                    : t.statuses.notStarted}
                </span>
              </div>
            )}
          </div>

          {/* Progress % */}
          <div className="p-3.5 rounded-xl border border-[#161616] bg-[#070707] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-zinc-500">
                {canGrade ? t.assignments.detail.completionProgress : (language === "id" ? "Progres Anda" : "Your Progress")}
              </span>
              <span className="text-xs font-bold text-purple-400">
                {canGrade ? assignment.progress : studentProgress}%
              </span>
            </div>
            {canGrade ? (
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={assignment.progress}
                onChange={(e) => handleProgressChange(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            ) : (
              <div className="pt-1.5">
                <ProgressBar
                  value={studentProgress}
                  color="#8B5CF6"
                  size="sm"
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Two-Column Section: Subtasks & Attachments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Subtasks Checklist */}
        <div className="rounded-xl border border-[#1A1A1A] bg-[#080808] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-purple-400" />
                <span>{t.assignments.detail.subtasksTitle}</span>
              </h3>
              <p className="text-[11px] text-zinc-500">
                {t.assignments.detail.subtasksSubtitle}
              </p>
            </div>
            <span className="text-xs font-medium text-zinc-400">
              {completedSubtasksCount}/{subtasks.length} {t.assignments.detail.doneCount}
            </span>
          </div>

          {/* Add Subtask Form */}
          {canGrade && (
            <form onSubmit={handleAddSubtask} className="flex gap-2">
              <Input
                placeholder={t.assignments.detail.subtasksPlaceholder}
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                className="text-xs h-8"
              />
              <Button
                type="submit"
                size="sm"
                isLoading={isAddingSubtask}
                disabled={!newSubtaskTitle.trim()}
              >
                <Plus className="h-3.5 w-3.5" />
                <span>{t.assignments.detail.addSubtaskBtn}</span>
              </Button>
            </form>
          )}

          {/* Subtask list */}
          {subtasks.length === 0 ? (
            <div className="p-4 rounded-lg border border-dashed border-[#1C1C1C] text-center text-xs text-zinc-500">
              {t.assignments.detail.subtasksEmpty}
            </div>
          ) : (
            <div className="space-y-2">
              {subtasks.map((subtask) => (
                <div
                  key={subtask.id}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-[#161616] bg-[#0C0C0C] hover:border-[#262626] transition-colors group"
                >
                  <button
                    onClick={() => handleToggleSubtask(subtask)}
                    className="flex items-center gap-2.5 text-left flex-1 min-w-0"
                  >
                    {subtask.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-zinc-600 hover:text-purple-400 shrink-0" />
                    )}
                    <span
                      className={cn(
                        "text-xs truncate",
                        subtask.completed
                          ? "line-through text-zinc-500"
                          : "text-zinc-200"
                      )}
                    >
                      {subtask.title}
                    </span>
                  </button>

                  {canGrade && (
                    <button
                      onClick={() => handleDeleteSubtask(subtask.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-zinc-600 hover:text-red-400 transition-opacity"
                      title={t.common.delete}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Attachments & Storage */}
        <div className="rounded-xl border border-[#1A1A1A] bg-[#080808] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-purple-400" />
                <span>{t.assignments.detail.attachmentsTitle}</span>
              </h3>
              <p className="text-[11px] text-zinc-500">
                {t.assignments.detail.attachmentsSubtitle}
              </p>
            </div>

            {profile?.id && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  isLoading={isUploadingFile}
                  className="gap-1.5"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>{t.assignments.detail.uploadBtn}</span>
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </>
            )}
          </div>

          {uploadError && (
            <div className="p-3 rounded-lg border border-red-900/50 bg-red-950/30 text-xs text-red-400">
              {uploadError}
            </div>
          )}

          {/* Attachments List */}
          {attachments.length === 0 ? (
            <div className="p-6 rounded-lg border border-dashed border-[#1C1C1C] text-center space-y-2">
              <File className="h-6 w-6 text-zinc-600 mx-auto" />
              <p className="text-xs text-zinc-500">
                {language === "id"
                  ? "Belum ada berkas lampiran yang diunggah."
                  : "No attached files uploaded yet."}
              </p>
              {profile?.id && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-purple-400"
                >
                  {t.assignments.detail.chooseFile}
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {attachments.map((att) => {
                const isMyUpload = att.user_id === profile?.id;
                const canDeleteThis = canGrade || isMyUpload;

                return (
                  <div
                    key={att.id}
                    className="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-[#161616] bg-[#0C0C0C] hover:border-[#262626] transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <File className="h-4 w-4 text-purple-400 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-medium text-zinc-200 truncate">
                            {att.file_name}
                          </p>
                          {isMyUpload && (
                            <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-purple-950/50 border border-purple-800/40 text-purple-300 shrink-0">
                              {language === "id" ? "Unggahan Anda" : "Your Upload"}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-500">
                          {formatBytes(att.file_size)} ·{" "}
                          {format(parseISO(att.created_at), language === "id" ? "d MMM yyyy" : "MMM d, yyyy", { locale: dateLocale })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleDownloadFile(att)}
                        className="p-1.5 rounded-md text-zinc-400 hover:text-purple-300 hover:bg-[#181818] transition-colors"
                        title="Download File"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                      {canDeleteThis && (
                        <button
                          onClick={() => handleDeleteAttachment(att)}
                          className="p-1.5 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                          title={t.common.delete}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Student Course Submission Card */}
      {(!canGrade || isStudent || mySubmission) && (
        <div className="rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#141414]">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-purple-950/40 border border-purple-800/40 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-zinc-100 flex items-center gap-2">
                  <span>{t.assignments.detail.yourSubmission}</span>
                </h3>
                <p className="text-xs text-zinc-500">
                  {mySubmission?.submitted_at
                    ? `${t.assignments.detail.submittedAt} ${format(parseISO(mySubmission.submitted_at), language === "id" ? "d MMM yyyy, HH:mm" : "MMM d, yyyy 'at' h:mm a")}`
                    : t.assignments.detail.notSubmitted}
                </p>
              </div>
            </div>

            {/* Status & Graded pill */}
            <div className="flex items-center gap-2">
              {mySubmission?.status === "Completed" ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 border border-emerald-700/50 text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{t.statuses.completed}</span>
                </span>
              ) : mySubmission?.status === "In Progress" ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-950/60 border border-blue-700/50 text-blue-400">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{t.statuses.inProgress}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-900 border border-zinc-700/60 text-zinc-400">
                  <Circle className="h-3.5 w-3.5" />
                  <span>{t.assignments.detail.notSubmitted}</span>
                </span>
              )}

              {mySubmission?.grade !== null && mySubmission?.grade !== undefined && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-900/60 border border-emerald-600/60 text-emerald-300">
                  <Award className="h-3.5 w-3.5" />
                  <span>{t.assignments.detail.graded}: {mySubmission.grade}/100</span>
                </span>
              )}
            </div>
          </div>

          {/* Graded Celebratory Card if instructor provided feedback and grade */}
          {mySubmission?.grade !== null && mySubmission?.grade !== undefined && (
            <div className="p-4 rounded-xl border border-emerald-700/40 bg-gradient-to-r from-emerald-950/30 via-emerald-900/10 to-transparent space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-emerald-400" />
                  <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                    {t.assignments.detail.gradeLabel} & {t.assignments.detail.feedbackLabel}
                  </span>
                </div>
                <span className="text-xl font-black font-mono text-emerald-400">
                  {mySubmission.grade} <span className="text-xs text-zinc-500 font-sans font-normal">/ 100</span>
                </span>
              </div>

              {mySubmission.feedback && (
                <div className="mt-2 text-xs text-zinc-300 bg-black/40 p-3 rounded-lg border border-emerald-900/30 italic">
                  &ldquo;{mySubmission.feedback}&rdquo;
                </div>
              )}
            </div>
          )}

          {/* Submission note / link form */}
          <form onSubmit={handleSubmitAssignment} className="space-y-4">
            {/* Student Personal Progress Slider */}
            <div className="p-3.5 rounded-xl bg-[#060606] border border-[#18181A] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-300">
                  {language === "id" ? "Progres Pengerjaan Anda" : "Your Working Progress"}
                </span>
                <span className="text-xs font-bold font-mono text-purple-400">
                  {studentProgress}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={studentProgress}
                onChange={(e) => handleSaveStudentProgress(parseInt(e.target.value, 10))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
              <div className="flex justify-between text-[10px] text-zinc-500">
                <span>{t.statuses.notStarted} (0%)</span>
                <span>{t.statuses.inProgress} (50%)</span>
                <span>{t.statuses.completed} (100%)</span>
              </div>
            </div>

            {/* Student Attached Deliverables */}
            <div className="p-3.5 rounded-xl bg-[#060606] border border-[#18181A] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Paperclip className="h-4 w-4 text-purple-400" />
                  <span className="text-xs font-semibold text-zinc-300">
                    {language === "id" ? "Berkas Lampiran Tugas Anda" : "Your Attached Deliverables"}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono">
                    {attachments.filter((a) => a.user_id === profile?.id).length}
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  isLoading={isUploadingFile}
                  className="h-7 text-xs gap-1.5 border-[#2A2A2E] hover:border-purple-500/50"
                >
                  <Upload className="h-3 w-3 text-purple-400" />
                  <span>{language === "id" ? "Lampirkan Berkas" : "Attach File"}</span>
                </Button>
              </div>

              {attachments.filter((a) => a.user_id === profile?.id).length === 0 ? (
                <p className="text-[11px] text-zinc-500 italic">
                  {language === "id"
                    ? "Belum ada berkas tugas yang Anda lampirkan (PDF, dokumen, kode, zip, dll)."
                    : "No assignment files attached yet (PDF, docx, code, zip, etc.)."}
                </p>
              ) : (
                <div className="space-y-1.5">
                  {attachments
                    .filter((a) => a.user_id === profile?.id)
                    .map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center justify-between gap-2 p-2 rounded-lg bg-black/50 border border-[#222226]"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <File className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                          <span className="text-xs text-zinc-200 truncate">{att.file_name}</span>
                          <span className="text-[10px] text-zinc-500 shrink-0">
                            ({formatBytes(att.file_size)})
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleDownloadFile(att)}
                            className="p-1 text-zinc-400 hover:text-purple-300 transition-colors"
                            title="Download"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteAttachment(att)}
                            className="p-1 text-zinc-500 hover:text-red-400 transition-colors"
                            title={t.common.delete}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                {t.assignments.detail.submissionNote}
              </label>
              <textarea
                value={studentNote}
                onChange={(e) => setStudentNote(e.target.value)}
                placeholder={t.assignments.detail.submissionPlaceholder}
                rows={3}
                className="w-full rounded-xl border border-[#222226] bg-[#070707] px-3.5 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors resize-none"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <p className="text-[11px] text-zinc-500">
                {mySubmission?.status === "Completed"
                  ? (language === "id" ? "Tugas telah diserahkan. Anda dapat memperbarui catatan kapan saja." : "Assignment submitted. You can update your submission notes anytime.")
                  : (language === "id" ? "Klik serahkan tugas untuk mengirim ke dosen." : "Submit your coursework for instructor review and grading.")}
              </p>

              <div className="flex items-center gap-2 shrink-0">
                {mySubmission?.status !== "Completed" && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleSaveStudentProgress(studentProgress)}
                    className="text-xs border-[#2A2A2E]"
                  >
                    {language === "id" ? "Simpan Draf" : "Save Draft"}
                  </Button>
                )}

                <Button
                  type="submit"
                  size="sm"
                  isLoading={isSubmittingWork}
                  className="gap-1.5"
                >
                  {submissionSuccess ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-300">{language === "id" ? "Terkirim!" : "Submitted!"}</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>
                        {mySubmission?.status === "Completed"
                          ? t.assignments.detail.updateSubmissionBtn
                          : t.assignments.detail.turnInBtn}
                      </span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Teacher Submissions & Grading Roster */}
      {canGrade && (
        <div className="rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#141414]">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-center">
                <Users className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-zinc-100 flex items-center gap-2">
                  <span>{t.assignments.detail.submissionsTitle}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-zinc-800 text-zinc-300">
                    {studentRoster.length}
                  </span>
                </h3>
                <p className="text-xs text-zinc-500">
                  {studentRoster.filter((r) => r.submission?.status === "Completed").length} / {studentRoster.length} {t.assignments.detail.submissionsCount}
                </p>
              </div>
            </div>
          </div>

          {studentRoster.length === 0 ? (
            <div className="p-8 rounded-xl border border-dashed border-[#1E1E22] text-center space-y-2">
              <Users className="h-7 w-7 text-zinc-600 mx-auto" />
              <p className="text-xs text-zinc-400 font-medium">
                {language === "id"
                  ? "Belum ada mahasiswa yang terdaftar di kelas ini untuk mengumpulkan tugas."
                  : "No students are enrolled in this course yet to submit coursework."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {studentRoster.map((item) => {
                const student = item.student;
                const sub = item.submission;
                const studentName = student?.display_name || student?.email?.split("@")[0] || "Student";
                const initials = studentName
                  .split(" ")
                  .map((n: string) => n[0])
                  .slice(0, 2)
                  .join("")
                  .toUpperCase() || "S";
                const isTurnedIn = sub?.status === "Completed";
                const isGraded = sub?.grade !== null && sub?.grade !== undefined;

                return (
                  <div
                    key={item.studentId}
                    className="p-4 rounded-xl border border-[#18181A] bg-[#070708] hover:border-[#26262B] transition-colors space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Student Info */}
                      <div className="flex items-center gap-3 min-w-0">
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

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-zinc-200 truncate">
                              {studentName}
                            </p>
                            {isTurnedIn ? (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800/50 text-emerald-400 shrink-0">
                                {t.statuses.completed}
                              </span>
                            ) : sub?.status === "In Progress" ? (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-950/60 border border-blue-800/50 text-blue-400 shrink-0">
                                {t.statuses.inProgress}
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-500 shrink-0">
                                {t.assignments.detail.notSubmitted}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-zinc-500 truncate">
                            <span>{student?.email}</span>
                            {student?.institution && (
                              <>
                                <span>·</span>
                                <span className="text-zinc-400">{student.institution}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Grade Display & Action */}
                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                        {isGraded ? (
                          <div className="text-right">
                            <span className="text-xs text-zinc-400 font-medium">Grade: </span>
                            <span className="text-sm font-bold font-mono text-emerald-400">
                              {sub.grade} / 100
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-500">
                            {t.assignments.detail.ungraded}
                          </span>
                        )}

                        <Button
                          size="sm"
                          variant={isGraded ? "outline" : "default"}
                          onClick={() =>
                            handleOpenGradeModal({
                              studentId: item.studentId,
                              studentName,
                              studentEmail: student?.email,
                              studentAvatar: student?.avatar_url,
                              submission: sub,
                            })
                          }
                          className="text-xs h-7 gap-1"
                        >
                          <Award className="h-3.5 w-3.5" />
                          <span>{isGraded ? (language === "id" ? "Ubah Nilai" : "Edit Grade") : t.assignments.detail.gradeSubmission}</span>
                        </Button>
                      </div>
                    </div>

                    {/* Submission content if any */}
                    {sub?.submission_note && (
                      <div className="p-3 rounded-lg bg-black/60 border border-[#1B1B1E] text-xs text-zinc-300 space-y-1">
                        <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                          {language === "id" ? "Catatan / Tautan Mahasiswa:" : "Student Note / Link:"}
                        </span>
                        <p className="whitespace-pre-wrap leading-relaxed break-words font-mono text-[11px] text-zinc-200">
                          {sub.submission_note}
                        </p>
                        {sub.submitted_at && (
                          <p className="text-[10px] text-zinc-500 pt-1">
                            {t.assignments.detail.submittedAt} {format(parseISO(sub.submitted_at), language === "id" ? "d MMM yyyy, HH:mm" : "MMM d, yyyy 'at' h:mm a")}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Student attached deliverables if any */}
                    {attachments.filter((a) => a.user_id === item.studentId).length > 0 && (
                      <div className="p-3 rounded-lg bg-black/60 border border-[#1B1B1E] text-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Paperclip className="h-3 w-3" />
                            <span>{language === "id" ? "Berkas Lampiran Mahasiswa:" : "Student Attachments:"}</span>
                          </span>
                          <span className="text-[10px] font-mono text-zinc-500">
                            {attachments.filter((a) => a.user_id === item.studentId).length} {language === "id" ? "berkas" : "file(s)"}
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          {attachments
                            .filter((a) => a.user_id === item.studentId)
                            .map((att) => (
                              <div
                                key={att.id}
                                className="flex items-center justify-between gap-2 p-1.5 rounded-md bg-[#0F0F12] border border-[#222226]"
                              >
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <File className="h-3 w-3 text-purple-400 shrink-0" />
                                  <span className="text-xs text-zinc-200 truncate">{att.file_name}</span>
                                  <span className="text-[10px] text-zinc-500">({formatBytes(att.file_size)})</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleDownloadFile(att)}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#1A1A1E] hover:bg-[#25252A] text-zinc-300 hover:text-purple-300 text-[10px] font-medium transition-colors shrink-0"
                                >
                                  <Download className="h-3 w-3" />
                                  <span>Download</span>
                                </button>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Instructor Feedback if already graded */}
                    {sub?.feedback && (
                      <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-900/30 text-xs text-emerald-300">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 block mb-0.5">
                          {t.assignments.detail.feedbackLabel}:
                        </span>
                        <span>{sub.feedback}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Teacher Grading Dialog */}
      {gradingTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-[#222226] bg-[#0A0A0C] p-6 shadow-2xl space-y-5 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#18181A]">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-emerald-950/50 border border-emerald-800/40 flex items-center justify-center">
                  <Award className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-100">
                    {t.assignments.detail.gradeSubmission}
                  </h3>
                  <p className="text-xs text-zinc-400">
                    {gradingTarget.studentName} ({gradingTarget.studentEmail})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setGradingTarget(null)}
                className="p-1 rounded-lg text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* If student submitted notes, show them */}
            {gradingTarget.submission?.submission_note && (
              <div className="p-3 rounded-xl bg-black/60 border border-[#1C1C20] space-y-1">
                <span className="text-[10px] font-semibold uppercase text-zinc-500">
                  {language === "id" ? "Catatan Mahasiswa" : "Student Submission"}
                </span>
                <p className="text-xs text-zinc-200 whitespace-pre-wrap break-words">
                  {gradingTarget.submission.submission_note}
                </p>
              </div>
            )}

            {/* Student Attached Deliverables in Grading Modal */}
            {attachments.filter((a) => a.user_id === gradingTarget.studentId).length > 0 && (
              <div className="p-3.5 rounded-xl bg-black/60 border border-[#1C1C20] space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase text-purple-400 flex items-center gap-1.5">
                    <Paperclip className="h-3 w-3" />
                    <span>{language === "id" ? "Berkas Lampiran Mahasiswa" : "Student Deliverables"}</span>
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">
                    {attachments.filter((a) => a.user_id === gradingTarget.studentId).length} {language === "id" ? "berkas" : "file(s)"}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {attachments
                    .filter((a) => a.user_id === gradingTarget.studentId)
                    .map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[#101014] border border-[#222228]"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <File className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                          <span className="text-xs text-zinc-200 truncate">{att.file_name}</span>
                          <span className="text-[10px] text-zinc-500 shrink-0">
                            ({formatBytes(att.file_size)})
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadFile(att)}
                          className="h-6 text-[11px] gap-1 px-2 border-[#2A2A2E] hover:border-purple-500/40"
                        >
                          <Download className="h-3 w-3" />
                          <span>Download</span>
                        </Button>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSaveGrade} className="space-y-4">
              {/* Score Input */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  {t.assignments.detail.gradeLabel} (0 - 100)
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      placeholder={t.assignments.detail.gradePlaceholder}
                      value={gradeInput}
                      onChange={(e) => setGradeInput(e.target.value)}
                      required
                      className="text-sm h-10 pr-12 font-mono font-bold"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">
                      / 100
                    </span>
                  </div>

                  {/* Preset buttons */}
                  <div className="flex items-center gap-1">
                    {[100, 95, 90, 85].map((preset) => (
                      <button
                        type="button"
                        key={preset}
                        onClick={() => setGradeInput(String(preset))}
                        className="px-2 py-1.5 rounded-lg text-[10px] font-mono font-semibold bg-[#141416] border border-[#242428] text-zinc-300 hover:border-emerald-500 hover:text-emerald-400 transition-colors"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Feedback Textarea */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                  {t.assignments.detail.feedbackLabel}
                </label>
                <textarea
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  placeholder={t.assignments.detail.feedbackPlaceholder}
                  rows={4}
                  className="w-full rounded-xl border border-[#222226] bg-[#070707] px-3.5 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setGradingTarget(null)}
                >
                  {t.common.cancel}
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  isLoading={isSavingGrade}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white"
                >
                  <Award className="h-3.5 w-3.5" />
                  <span>{isSavingGrade ? t.assignments.detail.savingGrade : t.assignments.detail.saveGradeBtn}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Assignment Dialog */}
      <AssignmentDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        assignmentToEdit={assignment}
        courses={courses}
        onSaved={async (updated) => {
          setAssignment(updated);
          await refreshCourses();
          router.refresh();
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteAssignment}
        title={t.assignments.detail.deleteConfirmTitle}
        description={
          language === "id"
            ? `Apakah Anda yakin ingin menghapus "${assignment.title}"? Seluruh subtugas dan berkas lampiran juga akan dihapus.`
            : `Are you sure you want to delete "${assignment.title}"? All subtasks and attached files will also be removed.`
        }
        confirmText={t.common.delete}
        isLoading={isDeleting}
      />
    </div>
  );
}

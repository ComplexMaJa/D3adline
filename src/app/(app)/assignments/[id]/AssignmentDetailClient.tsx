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
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AssignmentDetailClientProps {
  initialAssignment: Assignment;
  initialSubtasks: Subtask[];
  initialAttachments: Attachment[];
  courses: Course[];
}

export function AssignmentDetailClient({
  initialAssignment,
  initialSubtasks,
  initialAttachments,
  courses,
}: AssignmentDetailClientProps) {
  const [assignment, setAssignment] = React.useState<Assignment>(initialAssignment);
  const [subtasks, setSubtasks] = React.useState<Subtask[]>(initialSubtasks);
  const [attachments, setAttachments] = React.useState<Attachment[]>(initialAttachments);

  const [newSubtaskTitle, setNewSubtaskTitle] = React.useState("");
  const [isAddingSubtask, setIsAddingSubtask] = React.useState(false);

  const [isUploadingFile, setIsUploadingFile] = React.useState(false);
  const [uploadError, setUploadError] = React.useState<string | null>(null);

  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const { refreshCourses } = useApp();
  const supabase = createClient();
  const router = useRouter();

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const course = assignment.course;
  const deadline = getDeadlineInfo(
    assignment.due_date,
    assignment.due_time,
    assignment.status
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

      // Sync assignment progress
      handleProgressChange(computedProgress);
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
      setUploadError("File size exceeds 25 MB limit. Please upload a smaller file.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (fileExt && BLOCKED_EXTENSIONS.includes(fileExt)) {
      setUploadError(`Executable files (.${fileExt}) are not allowed for security.`);
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
          <span>Back to Assignments</span>
        </Link>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditDialogOpen(true)}
          >
            <Edit2 className="h-3.5 w-3.5" />
            <span>Edit</span>
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete</span>
          </Button>
        </div>
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
              <Calendar className="h-3 w-3" /> Due Date & Time
            </span>
            <p className="text-xs font-semibold text-zinc-200">
              {deadline.formattedDate}
            </p>
            <p className="text-[11px] text-zinc-400">{deadline.formattedTime}</p>
          </div>

          {/* Priority selector */}
          <div className="p-3.5 rounded-xl border border-[#161616] bg-[#070707] space-y-1">
            <span className="text-[11px] text-zinc-500">Priority Level</span>
            <Select
              value={assignment.priority}
              onChange={(e) =>
                handlePriorityChange(e.target.value as AssignmentPriority)
              }
              className="text-xs h-7"
            >
              <option value="Low">Low Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="High">High Priority</option>
            </Select>
          </div>

          {/* Status selector */}
          <div className="p-3.5 rounded-xl border border-[#161616] bg-[#070707] space-y-1">
            <span className="text-[11px] text-zinc-500">Workflow Status</span>
            <Select
              value={assignment.status}
              onChange={(e) =>
                handleStatusChange(e.target.value as AssignmentStatus)
              }
              className="text-xs h-7"
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Overdue">Overdue</option>
            </Select>
          </div>

          {/* Progress % */}
          <div className="p-3.5 rounded-xl border border-[#161616] bg-[#070707] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-zinc-500">Completion</span>
              <span className="text-xs font-bold text-purple-400">
                {assignment.progress}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={assignment.progress}
              onChange={(e) => handleProgressChange(parseInt(e.target.value, 10))}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
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
                <span>Subtasks & Checklist</span>
              </h3>
              <p className="text-[11px] text-zinc-500">
                Break down complex assignments into actionable milestones
              </p>
            </div>
            <span className="text-xs font-medium text-zinc-400">
              {completedSubtasksCount}/{subtasks.length} done
            </span>
          </div>

          {/* Add Subtask Form */}
          <form onSubmit={handleAddSubtask} className="flex gap-2">
            <Input
              placeholder="Add a step (e.g. Draft section 1, Run tests)..."
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
              <span>Add</span>
            </Button>
          </form>

          {/* Subtask list */}
          {subtasks.length === 0 ? (
            <div className="p-4 rounded-lg border border-dashed border-[#1C1C1C] text-center text-xs text-zinc-500">
              No subtasks added yet. Add steps above to track progress granularly.
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

                  <button
                    onClick={() => handleDeleteSubtask(subtask.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-zinc-600 hover:text-red-400 transition-opacity"
                    title="Delete subtask"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
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
                <span>Files & Attachments</span>
              </h3>
              <p className="text-[11px] text-zinc-500">
                Upload problem set PDFs, rubrics, and source files
              </p>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              isLoading={isUploadingFile}
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Upload File</span>
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
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
                No attachments uploaded yet.
              </p>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-purple-400"
              >
                Choose a file to attach
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-[#161616] bg-[#0C0C0C] hover:border-[#262626] transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <File className="h-4 w-4 text-purple-400 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-zinc-200 truncate">
                        {att.file_name}
                      </p>
                      <p className="text-[10px] text-zinc-500">
                        {formatBytes(att.file_size)} ·{" "}
                        {format(parseISO(att.created_at), "MMM d, yyyy")}
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
                    <button
                      onClick={() => handleDeleteAttachment(att)}
                      className="p-1.5 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                      title="Delete File"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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
        title="Delete Assignment?"
        description={`Are you sure you want to delete "${assignment.title}"? All subtasks and attached files will also be removed.`}
        isLoading={isDeleting}
      />
    </div>
  );
}

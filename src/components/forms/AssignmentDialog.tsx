"use client";

import * as React from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Assignment, Course, AssignmentPriority, AssignmentStatus } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { Calendar, Clock, BookOpen, AlertCircle, Plus } from "lucide-react";

interface AssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentToEdit?: Assignment | null;
  courses: Course[];
  initialCourseId?: string;
  onSaved?: (assignment: Assignment) => void;
  onOpenCreateCourse?: () => void;
}

export function AssignmentDialog({
  isOpen,
  onClose,
  assignmentToEdit,
  courses,
  initialCourseId,
  onSaved,
  onOpenCreateCourse,
}: AssignmentDialogProps) {
  const isEditing = !!assignmentToEdit;
  const [title, setTitle] = React.useState("");
  const [courseId, setCourseId] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [dueDate, setDueDate] = React.useState(format(new Date(), "yyyy-MM-dd"));
  const [dueTime, setDueTime] = React.useState("23:59");
  const [priority, setPriority] = React.useState<AssignmentPriority>("Medium");
  const [status, setStatus] = React.useState<AssignmentStatus>("Not Started");
  const [progress, setProgress] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errors, setErrors] = React.useState<{ [key: string]: string }>({});

  const supabase = createClient();

  React.useEffect(() => {
    if (assignmentToEdit) {
      setTitle(assignmentToEdit.title || "");
      setCourseId(assignmentToEdit.course_id || "");
      setDescription(assignmentToEdit.description || "");
      setDueDate(assignmentToEdit.due_date || format(new Date(), "yyyy-MM-dd"));
      setDueTime(
        assignmentToEdit.due_time
          ? assignmentToEdit.due_time.substring(0, 5)
          : "23:59"
      );
      setPriority(assignmentToEdit.priority || "Medium");
      setStatus(assignmentToEdit.status || "Not Started");
      setProgress(assignmentToEdit.progress || 0);
    } else {
      setTitle("");
      setCourseId(initialCourseId || (courses.length > 0 ? courses[0].id : ""));
      setDescription("");
      setDueDate(format(new Date(), "yyyy-MM-dd"));
      setDueTime("23:59");
      setPriority("Medium");
      setStatus("Not Started");
      setProgress(0);
    }
    setErrors({});
  }, [assignmentToEdit, initialCourseId, courses, isOpen]);

  // Sync progress if status changes
  const handleStatusChange = (newStatus: AssignmentStatus) => {
    setStatus(newStatus);
    if (newStatus === "Completed") {
      setProgress(100);
    } else if (newStatus === "Not Started" && progress === 100) {
      setProgress(0);
    } else if (newStatus === "In Progress" && progress === 0) {
      setProgress(25);
    }
  };

  // Sync status if progress changes
  const handleProgressChange = (newProgress: number) => {
    setProgress(newProgress);
    if (newProgress === 100) {
      setStatus("Completed");
    } else if (newProgress > 0 && status === "Not Started") {
      setStatus("In Progress");
    } else if (newProgress === 0 && status === "Completed") {
      setStatus("Not Started");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!title.trim()) {
      newErrors.title = "Assignment title is required";
    }

    if (!courseId) {
      newErrors.courseId = "Please select a course";
    }

    if (!dueDate) {
      newErrors.dueDate = "Due date is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setErrors({ form: "You must be signed in to manage assignments." });
        setIsLoading(false);
        return;
      }

      const formattedTime = dueTime.length === 5 ? `${dueTime}:00` : dueTime;

      if (isEditing && assignmentToEdit) {
        const { data, error } = await supabase
          .from("assignments")
          .update({
            course_id: courseId,
            title: title.trim(),
            description: description.trim() || null,
            due_date: dueDate,
            due_time: formattedTime,
            priority,
            status,
            progress,
            updated_at: new Date().toISOString(),
          })
          .eq("id", assignmentToEdit.id)
          .select(`*, course:courses(*)`)
          .single();

        if (error) throw error;
        if (onSaved && data) onSaved(data as Assignment);
      } else {
        const { data, error } = await supabase
          .from("assignments")
          .insert({
            user_id: user.id,
            course_id: courseId,
            title: title.trim(),
            description: description.trim() || null,
            due_date: dueDate,
            due_time: formattedTime,
            priority,
            status,
            progress,
          })
          .select(`*, course:courses(*)`)
          .single();

        if (error) throw error;
        if (onSaved && data) onSaved(data as Assignment);
      }

      onClose();
    } catch (err: unknown) {
      console.error("Error saving assignment:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to save assignment";
      setErrors({ form: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? "Edit Assignment" : "Create New Assignment"}
      description={
        isEditing
          ? "Update assignment details, deadline, or status."
          : "Add an upcoming project, problem set, lab, or exam deadline."
      }
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.form && (
          <div className="rounded-lg border border-red-900/50 bg-red-950/30 p-3 text-xs text-red-400">
            {errors.form}
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">
            Assignment Title <span className="text-purple-400">*</span>
          </label>
          <Input
            placeholder="e.g. Binary Search Trees Problem Set"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={errors.title}
            autoFocus
          />
        </div>

        {/* Course selection */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-medium text-zinc-300">
              Course / Subject <span className="text-purple-400">*</span>
            </label>
            {onOpenCreateCourse && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCreateCourse();
                }}
                className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
              >
                <Plus className="h-3 w-3" />
                <span>New Course</span>
              </button>
            )}
          </div>
          {courses.length === 0 ? (
            <div className="rounded-lg border border-amber-900/40 bg-amber-950/20 p-3 text-xs text-amber-300 flex items-center justify-between">
              <span>No courses created yet. Please create a course first!</span>
              {onOpenCreateCourse && (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    onClose();
                    onOpenCreateCourse();
                  }}
                >
                  Add Course
                </Button>
              )}
            </div>
          ) : (
            <Select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              error={errors.courseId}
            >
              <option value="" disabled>
                Select a course...
              </option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code ? `[${course.code}] ` : ""}
                  {course.name}
                </option>
              ))}
            </Select>
          )}
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Due Date <span className="text-purple-400">*</span>
            </label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              error={errors.dueDate}
              leftIcon={<Calendar className="h-4 w-4" />}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Due Time
            </label>
            <Input
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              leftIcon={<Clock className="h-4 w-4" />}
            />
          </div>
        </div>

        {/* Priority & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Priority
            </label>
            <Select
              value={priority}
              onChange={(e) => setPriority(e.target.value as AssignmentPriority)}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </Select>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              Status
            </label>
            <Select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value as AssignmentStatus)}
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Overdue">Overdue</option>
            </Select>
          </div>
        </div>

        {/* Progress Slider */}
        <div className="rounded-xl border border-[#1E1E1E] bg-[#080808] p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-zinc-300">Completion Progress</span>
            <span className="font-bold text-purple-400">{progress}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={progress}
            onChange={(e) => handleProgressChange(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-zinc-300 mb-1.5">
            Description & Instructions (Optional)
          </label>
          <Textarea
            placeholder="Assignment prompt, submission guidelines, rubric notes, etc."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#181818]">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={isLoading}
            disabled={courses.length === 0}
          >
            {isEditing ? "Save Changes" : "Create Assignment"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

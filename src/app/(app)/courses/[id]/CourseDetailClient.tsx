"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Course, Assignment } from "@/types/database";
import { CourseDialog } from "@/components/forms/CourseDialog";
import { AssignmentDialog } from "@/components/forms/AssignmentDialog";
import { AssignmentCard } from "@/components/assignments/AssignmentCard";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { useApp } from "@/components/layout/AppShell";
import { createClient } from "@/lib/supabase/client";
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
} from "lucide-react";

interface CourseDetailClientProps {
  course: Course;
  initialAssignments: Assignment[];
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
  stats,
}: CourseDetailClientProps) {
  const [assignments, setAssignments] = React.useState<Assignment[]>(initialAssignments);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isAddAssignmentOpen, setIsAddAssignmentOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const { refreshCourses } = useApp();
  const supabase = createClient();
  const router = useRouter();

  React.useEffect(() => {
    setAssignments(initialAssignments);
  }, [initialAssignments]);

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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back link */}
      <Link
        href="/courses"
        className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Courses</span>
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
                <span>Instructor: {course.instructor}</span>
              </div>
            )}

            {course.description && (
              <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
                {course.description}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <Edit2 className="h-3.5 w-3.5" />
              <span>Edit Course</span>
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete</span>
            </Button>
            <Button
              size="sm"
              onClick={() => setIsAddAssignmentOpen(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Assignment</span>
            </Button>
          </div>
        </div>

        {/* Progress meter */}
        <div className="mt-6 pt-5 border-t border-[#161616] grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="space-y-1">
            <span className="text-[11px] text-zinc-500">Total Workload</span>
            <p className="text-lg font-bold text-zinc-100">{stats.total} tasks</p>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] text-emerald-500">Completed</span>
            <p className="text-lg font-bold text-emerald-400">{stats.completed}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] text-blue-400">In Progress</span>
            <p className="text-lg font-bold text-blue-400">{stats.inProgress}</p>
          </div>
          <div className="space-y-1">
            <span className="text-[11px] text-purple-400">Completion</span>
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

      {/* Course Assignments List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-purple-400" />
            <span>Course Assignments ({assignments.length})</span>
          </h2>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsAddAssignmentOpen(true)}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Task</span>
          </Button>
        </div>

        {assignments.length === 0 ? (
          <EmptyState
            title="No assignments for this course"
            description="You have not created any assignments or problem sets for this subject yet."
            action={
              <Button
                size="sm"
                onClick={() => setIsAddAssignmentOpen(true)}
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Create Assignment</span>
              </Button>
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
              />
            ))}
          </div>
        )}
      </div>

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
        courses={[course]}
        initialCourseId={course.id}
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
        title={`Delete ${course.name}?`}
        description="This will permanently delete this course and all associated assignments. This action cannot be undone."
        isLoading={isDeleting}
      />
    </div>
  );
}

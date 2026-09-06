"use client";

import * as React from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { AssignmentCard } from "@/components/assignments/AssignmentCard";
import { AssignmentDialog } from "@/components/forms/AssignmentDialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Assignment, Course, AssignmentStatus, AssignmentPriority } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { useApp } from "@/components/layout/AppShell";
import { triggerCompletionConfetti } from "@/lib/confetti";
import {
  getDeadlineInfo,
  getPriorityBadgeStyle,
  getStatusBadgeStyle,
} from "@/lib/deadline-utils";
import {
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Circle,
  LayoutGrid,
  List,
  Edit2,
  Trash2,
  Calendar,
  AlertTriangle,
  ArrowUpDown,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  differenceInCalendarDays,
  isThisWeek,
  isToday,
  isTomorrow,
  parseISO,
  startOfDay,
} from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface AssignmentsClientProps {
  initialAssignments: Assignment[];
  courses: Course[];
}

export function AssignmentsClient({
  initialAssignments,
  courses,
}: AssignmentsClientProps) {
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status");
  const courseParam = searchParams.get("course");

  const [assignments, setAssignments] = React.useState<Assignment[]>(initialAssignments);
  const [search, setSearch] = React.useState("");
  const [selectedCourse, setSelectedCourse] = React.useState<string>(courseParam || "all");
  const [selectedStatus, setSelectedStatus] = React.useState<string>(statusParam || "all");
  const [selectedPriority, setSelectedPriority] = React.useState<string>("all");
  const [selectedDateRange, setSelectedDateRange] = React.useState<string>("all");
  const [sortBy, setSortBy] = React.useState<string>("deadline_asc");
  const [viewMode, setViewMode] = React.useState<"grid" | "table">("grid");

  const [assignmentToEdit, setAssignmentToEdit] = React.useState<Assignment | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = React.useState<Assignment | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const { refreshCourses, openCreateAssignment } = useApp();
  const { t, language } = useLanguage();
  const supabase = createClient();
  const router = useRouter();

  React.useEffect(() => {
    setAssignments(initialAssignments);
  }, [initialAssignments]);

  // Synchronize when query params change
  React.useEffect(() => {
    const s = searchParams.get("status");
    if (s) {
      setSelectedStatus(s);
    }
    const c = searchParams.get("course");
    if (c) {
      setSelectedCourse(c);
    }
  }, [searchParams]);

  // Filter & Search Logic
  const filteredAssignments = React.useMemo(() => {
    const today = startOfDay(new Date());

    return assignments
      .filter((a) => {
        // Search
        if (search) {
          const q = search.toLowerCase();
          const matchesTitle = a.title.toLowerCase().includes(q);
          const matchesDesc = a.description?.toLowerCase().includes(q);
          const matchesCourse = a.course?.name.toLowerCase().includes(q) || a.course?.code?.toLowerCase().includes(q);
          if (!matchesTitle && !matchesDesc && !matchesCourse) return false;
        }

        // Course filter
        if (selectedCourse !== "all" && a.course_id !== selectedCourse) {
          return false;
        }

        // Status filter
        if (selectedStatus !== "all" && a.status !== selectedStatus) {
          return false;
        }

        // Priority filter
        if (selectedPriority !== "all" && a.priority !== selectedPriority) {
          return false;
        }

        // Date Range filter
        if (selectedDateRange !== "all") {
          const deadline = parseISO(a.due_date);
          const daysDiff = differenceInCalendarDays(deadline, today);

          if (selectedDateRange === "today" && !isToday(deadline)) {
            return false;
          }
          if (selectedDateRange === "tomorrow" && !isTomorrow(deadline)) {
            return false;
          }
          if (selectedDateRange === "this_week" && (daysDiff < 0 || daysDiff > 7)) {
            return false;
          }
          if (selectedDateRange === "overdue" && (daysDiff >= 0 || a.status === "Completed")) {
            return false;
          }
          if (selectedDateRange === "upcoming" && daysDiff < 0) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "deadline_asc") {
          const dateA = `${a.due_date}T${a.due_time || "23:59:00"}`;
          const dateB = `${b.due_date}T${b.due_time || "23:59:00"}`;
          return dateA.localeCompare(dateB);
        }
        if (sortBy === "deadline_desc") {
          const dateA = `${a.due_date}T${a.due_time || "23:59:00"}`;
          const dateB = `${b.due_date}T${b.due_time || "23:59:00"}`;
          return dateB.localeCompare(dateA);
        }
        if (sortBy === "priority") {
          const order = { High: 3, Medium: 2, Low: 1 };
          return order[b.priority] - order[a.priority];
        }
        if (sortBy === "progress") {
          return b.progress - a.progress;
        }
        if (sortBy === "created_desc") {
          return b.created_at.localeCompare(a.created_at);
        }
        return 0;
      });
  }, [
    assignments,
    search,
    selectedCourse,
    selectedStatus,
    selectedPriority,
    selectedDateRange,
    sortBy,
  ]);

  // Toggle complete
  const handleToggleComplete = async (assignment: Assignment) => {
    const isNowCompleted = assignment.status !== "Completed";
    const newStatus: AssignmentStatus = isNowCompleted ? "Completed" : "In Progress";
    const newProgress = isNowCompleted ? 100 : 50;

    if (isNowCompleted) {
      triggerCompletionConfetti();
    }

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
      console.error("Error toggling completion:", err);
      setAssignments(initialAssignments);
    }
  };

  // Delete
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
      await refreshCourses();
      router.refresh();
      setAssignmentToDelete(null);
    } catch (err) {
      console.error("Error deleting assignment:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = (assignment: Assignment) => {
    setAssignmentToEdit(assignment);
    setIsEditDialogOpen(true);
  };

  const clearFilters = () => {
    setSearch("");
    setSelectedCourse("all");
    setSelectedStatus("all");
    setSelectedPriority("all");
    setSelectedDateRange("all");
    setSortBy("deadline_asc");
  };

  const hasActiveFilters =
    search !== "" ||
    selectedCourse !== "all" ||
    selectedStatus !== "all" ||
    selectedPriority !== "all" ||
    selectedDateRange !== "all";

  return (
    <div className="space-y-6 animate-fade-in">
      <Header
        title={t.assignments.title}
        description={t.assignments.description}
        action={
          <Button onClick={() => openCreateAssignment()} size="sm">
            <Plus className="h-4 w-4" />
            <span>{t.assignments.newAssignmentBtn}</span>
          </Button>
        }
      />

      {/* Filter and Control Toolbar */}
      <div className="rounded-xl border border-[#1C1C1C] bg-[#080808] p-4 space-y-3">
        {/* Search row & View Toggle */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-80">
            <Input
              placeholder={t.assignments.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {/* View Mode Toggle */}
            <div className="flex items-center rounded-lg border border-[#222222] bg-[#0E0E0E] p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-1.5 rounded-md text-xs transition-colors",
                  viewMode === "grid"
                    ? "bg-[#1C1C1C] text-purple-300"
                    : "text-zinc-500 hover:text-zinc-300"
                )}
                title="Grid View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={cn(
                  "p-1.5 rounded-md text-xs transition-colors",
                  viewMode === "table"
                    ? "bg-[#1C1C1C] text-purple-300"
                    : "text-zinc-500 hover:text-zinc-300"
                )}
                title="Table View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-xs text-zinc-400 hover:text-zinc-200"
              >
                {t.assignments.clearFilters}
              </Button>
            )}
          </div>
        </div>

        {/* Filter Dropdowns Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
          {/* Course filter */}
          <div>
            <Select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="text-xs h-8"
            >
              <option value="all">{t.assignments.allCourses}</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code ? `[${c.code}] ` : ""}
                  {c.name}
                </option>
              ))}
            </Select>
          </div>

          {/* Status filter */}
          <div>
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs h-8"
            >
              <option value="all">{t.assignments.allStatuses}</option>
              <option value="Not Started">{t.statuses.notStarted}</option>
              <option value="In Progress">{t.statuses.inProgress}</option>
              <option value="Completed">{t.statuses.completed}</option>
              <option value="Overdue">{t.statuses.overdue}</option>
            </Select>
          </div>

          {/* Priority filter */}
          <div>
            <Select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="text-xs h-8"
            >
              <option value="all">{t.assignments.allPriorities}</option>
              <option value="High">{t.priorities.high}</option>
              <option value="Medium">{t.priorities.medium}</option>
              <option value="Low">{t.priorities.low}</option>
            </Select>
          </div>

          {/* Date range filter */}
          <div>
            <Select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="text-xs h-8"
            >
              <option value="all">{t.assignments.allTimeframes}</option>
              <option value="today">{t.assignments.today}</option>
              <option value="tomorrow">{t.assignments.tomorrow}</option>
              <option value="this_week">{t.assignments.thisWeek}</option>
              <option value="upcoming">{t.assignments.upcoming}</option>
              <option value="overdue">{t.assignments.overdue}</option>
            </Select>
          </div>

          {/* Sort By */}
          <div className="col-span-2 sm:col-span-1">
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs h-8"
            >
              <option value="deadline_asc">{t.assignments.sortDeadlineAsc}</option>
              <option value="deadline_desc">{t.assignments.sortDeadlineDesc}</option>
              <option value="priority">{t.assignments.sortPriority}</option>
              <option value="title">{t.assignments.sortTitle}</option>
            </Select>
          </div>
        </div>
      </div>

      {/* Assignment Display */}
      {filteredAssignments.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-6 w-6 text-purple-400" />}
          title={t.assignments.emptyTitle}
          description={t.assignments.emptyDescription}
          action={
            hasActiveFilters ? (
              <Button size="sm" variant="outline" onClick={clearFilters}>
                {t.assignments.clearFilters}
              </Button>
            ) : (
              <Button size="sm" onClick={() => openCreateAssignment()}>
                <Plus className="h-4 w-4" />
                <span>{t.assignments.newAssignmentBtn}</span>
              </Button>
            )
          }
        />
      ) : viewMode === "grid" ? (
        /* Grid Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssignments.map((assignment) => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              onToggleComplete={handleToggleComplete}
              onEdit={handleEdit}
              onDelete={(a) => setAssignmentToDelete(a)}
            />
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="overflow-x-auto rounded-xl border border-[#1C1C1C] bg-[#080808]">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#1A1A1A] bg-[#0B0B0B] text-zinc-400">
                <th className="p-3.5 w-10">Done</th>
                <th className="p-3.5">{t.assignments.tableHeaders.title}</th>
                <th className="p-3.5">{t.assignments.tableHeaders.course}</th>
                <th className="p-3.5">{t.assignments.tableHeaders.dueDate}</th>
                <th className="p-3.5">{t.assignments.tableHeaders.priority}</th>
                <th className="p-3.5">{t.assignments.tableHeaders.status}</th>
                <th className="p-3.5">{t.assignments.tableHeaders.progress}</th>
                <th className="p-3.5 text-right">{t.assignments.tableHeaders.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#141414]">
              {filteredAssignments.map((assignment) => {
                const deadline = getDeadlineInfo(
                  assignment.due_date,
                  assignment.due_time,
                  assignment.status,
                  language
                );
                const isCompleted =
                  assignment.status === "Completed" || assignment.progress === 100;

                return (
                  <tr
                    key={assignment.id}
                    className="hover:bg-[#0E0E0E] transition-colors group"
                  >
                    <td className="p-3.5">
                      <button
                        onClick={() => handleToggleComplete(assignment)}
                        className="text-zinc-500 hover:text-purple-400 transition-colors"
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 fill-emerald-950" />
                        ) : (
                          <Circle className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                    <td className="p-3.5 font-medium max-w-xs truncate">
                      <Link
                        href={`/assignments/${assignment.id}`}
                        className={cn(
                          "hover:text-purple-300 transition-colors block truncate",
                          isCompleted ? "line-through text-zinc-500" : "text-zinc-100"
                        )}
                      >
                        {assignment.title}
                      </Link>
                    </td>
                    <td className="p-3.5">
                      {assignment.course ? (
                        <span
                          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium"
                          style={{
                            backgroundColor: `${assignment.course.color}20`,
                            color: assignment.course.color || "#8B5CF6",
                          }}
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{
                              backgroundColor: assignment.course.color || "#8B5CF6",
                            }}
                          />
                          <span>{assignment.course.code || assignment.course.name}</span>
                        </span>
                      ) : (
                        <span className="text-zinc-500">—</span>
                      )}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span
                        className={cn(
                          "font-medium",
                          deadline.isOverdue && !isCompleted && "text-red-400",
                          deadline.isDueToday && !isCompleted && "text-amber-400",
                          !deadline.isOverdue && !deadline.isDueToday && "text-zinc-300"
                        )}
                      >
                        {deadline.label}
                      </span>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-semibold uppercase border tracking-wider",
                          getPriorityBadgeStyle(assignment.priority)
                        )}
                      >
                        {assignment.priority}
                      </span>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded text-[10px] border font-medium",
                          getStatusBadgeStyle(assignment.status)
                        )}
                      >
                        {assignment.status}
                      </span>
                    </td>
                    <td className="p-3.5 w-28">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-[#181818] rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              isCompleted ? "bg-emerald-500" : "bg-purple-500"
                            )}
                            style={{ width: `${assignment.progress}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-zinc-400">
                          {assignment.progress}%
                        </span>
                      </div>
                    </td>
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(assignment)}
                          className="p-1 rounded text-zinc-500 hover:text-zinc-200 hover:bg-[#181818] transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setAssignmentToDelete(assignment)}
                          className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Assignment Dialog */}
      <AssignmentDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setAssignmentToEdit(null);
        }}
        assignmentToEdit={assignmentToEdit}
        courses={courses}
        onSaved={async () => {
          await refreshCourses();
          router.refresh();
        }}
      />

      {/* Delete Assignment Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!assignmentToDelete}
        onClose={() => setAssignmentToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Assignment?"
        description={`Are you sure you want to delete "${assignmentToDelete?.title}"? This action cannot be undone.`}
        isLoading={isDeleting}
      />
    </div>
  );
}

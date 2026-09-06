"use client";

import * as React from "react";
import Link from "next/link";
import { Assignment, Course } from "@/types/database";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  getDeadlineInfo,
  getPriorityBadgeStyle,
  getStatusBadgeStyle,
} from "@/lib/deadline-utils";
import { triggerCompletionConfetti } from "@/lib/confetti";
import {
  Clock,
  CheckCircle2,
  Circle,
  MoreVertical,
  Edit2,
  Trash2,
  ExternalLink,
  Layers,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface AssignmentCardProps {
  assignment: Assignment;
  course?: Course | null;
  onToggleComplete?: (assignment: Assignment) => void;
  onEdit?: (assignment: Assignment) => void;
  onDelete?: (assignment: Assignment) => void;
}

export function AssignmentCard({
  assignment,
  course,
  onToggleComplete,
  onEdit,
  onDelete,
}: AssignmentCardProps) {
  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const { t, language } = useLanguage();

  const courseData = assignment.course || course;
  const deadlineInfo = getDeadlineInfo(
    assignment.due_date,
    assignment.due_time,
    assignment.status,
    language
  );

  const isCompleted = assignment.status === "Completed" || assignment.progress === 100;

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isCompleted) {
      triggerCompletionConfetti();
    }
    if (onToggleComplete) {
      onToggleComplete(assignment);
    }
  };

  return (
    <div
      className={cn(
        "group relative rounded-xl border border-[#1C1C1C] bg-[#090909] p-4 transition-all duration-200 hover:border-[#2C2C2C] hover:bg-[#0D0D0D] flex flex-col justify-between",
        deadlineInfo.isOverdue && !isCompleted && "border-red-950/60 bg-red-950/10 hover:border-red-900/80",
        isCompleted && "opacity-75 hover:opacity-100"
      )}
    >
      <div>
        {/* Top Header: Course Pill + Deadline Badge + Menu */}
        <div className="flex items-center justify-between gap-2 mb-3">
          {/* Course Badge */}
          {courseData ? (
            <Link
              href={`/courses/${courseData.id}`}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#141414] border border-[#222222] text-zinc-300 hover:border-purple-500/40 hover:text-white transition-colors"
            >
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: courseData.color || "#8B5CF6" }}
              />
              <span className="truncate max-w-[120px]">
                {courseData.code ? `${courseData.code} · ` : ""}
                {courseData.name}
              </span>
            </Link>
          ) : (
            <span className="text-[11px] text-zinc-500 flex items-center gap-1">
              <Layers className="h-3 w-3" /> General
            </span>
          )}

          {/* Actions menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-[#1A1A1A] transition-colors"
              title="Assignment Actions"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-36 rounded-lg border border-[#262626] bg-[#121212] p-1 shadow-xl z-20 animate-fade-in text-xs">
                <Link
                  href={`/assignments/${assignment.id}`}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded text-zinc-300 hover:bg-[#1E1E1E] hover:text-white"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>{t.common.viewDetails}</span>
                </Link>
                {onEdit && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onEdit(assignment);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-zinc-300 hover:bg-[#1E1E1E] hover:text-white text-left"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>{t.common.edit}</span>
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onDelete(assignment);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-red-400 hover:bg-red-950/40 text-left"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>{t.common.delete}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Title & Quick Toggle */}
        <div className="flex items-start gap-2.5 mb-2">
          <button
            onClick={handleToggle}
            className="mt-0.5 text-zinc-500 hover:text-purple-400 transition-colors shrink-0"
            title={isCompleted ? "Mark incomplete" : "Mark complete"}
          >
            {isCompleted ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-400 fill-emerald-950" />
            ) : (
              <Circle className="h-4 w-4 hover:stroke-purple-400" />
            )}
          </button>

          <div className="min-w-0 flex-1">
            <Link
              href={`/assignments/${assignment.id}`}
              className={cn(
                "font-semibold text-sm leading-snug block truncate hover:text-purple-300 transition-colors",
                isCompleted
                  ? "line-through text-zinc-500"
                  : "text-zinc-100"
              )}
            >
              {assignment.title}
            </Link>

            {assignment.description && (
              <p className="text-xs text-zinc-500 mt-1 line-clamp-2 leading-relaxed">
                {assignment.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Footer Info: Deadline label, Priority, Progress */}
      <div className="mt-4 pt-3 border-t border-[#161616] space-y-2.5">
        <div className="flex items-center justify-between gap-2 text-xs">
          {/* Smart Deadline Label */}
          <div
            className={cn(
              "flex items-center gap-1.5 font-medium text-[11px]",
              deadlineInfo.isOverdue && !isCompleted && "text-red-400",
              deadlineInfo.isDueToday && !isCompleted && "text-amber-400",
              deadlineInfo.isDueTomorrow && !isCompleted && "text-purple-300",
              !deadlineInfo.isOverdue && !deadlineInfo.isDueToday && !deadlineInfo.isDueTomorrow && "text-zinc-400"
            )}
          >
            {deadlineInfo.isOverdue && !isCompleted ? (
              <AlertTriangle className="h-3.5 w-3.5 text-red-400 shrink-0" />
            ) : (
              <Clock className="h-3.5 w-3.5 shrink-0 opacity-70" />
            )}
            <span>{deadlineInfo.label}</span>
          </div>

          {/* Priority Badge */}
          <span
            className={cn(
              "px-2 py-0.5 rounded text-[10px] font-semibold uppercase border tracking-wider",
              getPriorityBadgeStyle(assignment.priority)
            )}
          >
            {assignment.priority === "High"
              ? t.priorities.high
              : assignment.priority === "Medium"
              ? t.priorities.medium
              : t.priorities.low}
          </span>
        </div>

        {/* Progress Bar & Status indicator */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span
              className={cn(
                "px-1.5 py-0.2 rounded text-[10px] border font-medium",
                getStatusBadgeStyle(assignment.status)
              )}
            >
              {assignment.status === "Completed"
                ? t.statuses.completed
                : assignment.status === "In Progress"
                ? t.statuses.inProgress
                : assignment.status === "Overdue"
                ? t.statuses.overdue
                : t.statuses.notStarted}
            </span>
            <span className="font-semibold text-zinc-300">{assignment.progress}%</span>
          </div>
          <ProgressBar
            value={assignment.progress}
            size="sm"
            color={courseData?.color}
          />
        </div>
      </div>
    </div>
  );
}

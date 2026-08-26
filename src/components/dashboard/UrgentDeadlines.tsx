"use client";

import * as React from "react";
import Link from "next/link";
import { Assignment } from "@/types/database";
import { getDeadlineInfo, getPriorityBadgeStyle } from "@/lib/deadline-utils";
import { AlertCircle, ArrowRight, CheckCircle2, Clock, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface UrgentDeadlinesProps {
  assignments: Assignment[];
  onToggleComplete?: (assignment: Assignment) => void;
}

export function UrgentDeadlines({
  assignments,
  onToggleComplete,
}: UrgentDeadlinesProps) {
  if (assignments.length === 0) {
    return (
      <div className="rounded-xl border border-[#1A1A1A] bg-[#080808] p-6 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-950/40 border border-emerald-900/50 text-emerald-400 mx-auto mb-2">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <h4 className="text-sm font-semibold text-zinc-200">All caught up!</h4>
        <p className="text-xs text-zinc-500 mt-1">
          No urgent deadlines due in the next 7 days.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#1A1A1A] bg-[#080808] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-950/40 border border-amber-800/40 text-amber-400">
            <Flame className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">
              Urgent & Upcoming
            </h3>
            <p className="text-[11px] text-zinc-500">Deadlines requiring immediate focus</p>
          </div>
        </div>
        <Link
          href="/assignments"
          className="text-xs font-medium text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="space-y-2.5">
        {assignments.map((assignment) => {
          const deadline = getDeadlineInfo(
            assignment.due_date,
            assignment.due_time,
            assignment.status
          );
          const course = assignment.course;

          return (
            <div
              key={assignment.id}
              className={cn(
                "group flex items-center justify-between gap-3 p-3 rounded-lg border border-[#181818] bg-[#0C0C0C] hover:border-[#282828] hover:bg-[#111111] transition-all",
                deadline.isOverdue && "border-red-950/60 bg-red-950/10"
              )}
            >
              {/* Left Info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {course && (
                    <span
                      className="px-1.5 py-0.2 rounded text-[10px] font-medium"
                      style={{
                        backgroundColor: `${course.color}20`,
                        color: course.color || "#8B5CF6",
                      }}
                    >
                      {course.code || course.name}
                    </span>
                  )}
                  <span
                    className={cn(
                      "px-1.5 py-0.2 rounded text-[9px] font-semibold uppercase border tracking-wider",
                      getPriorityBadgeStyle(assignment.priority)
                    )}
                  >
                    {assignment.priority}
                  </span>
                </div>

                <Link
                  href={`/assignments/${assignment.id}`}
                  className="text-xs font-semibold text-zinc-200 hover:text-purple-300 truncate block transition-colors"
                >
                  {assignment.title}
                </Link>
              </div>

              {/* Right Deadline Pill */}
              <div className="text-right shrink-0">
                <div
                  className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border",
                    deadline.isOverdue
                      ? "bg-red-950/50 text-red-400 border-red-800/40"
                      : deadline.isDueToday
                      ? "bg-amber-950/50 text-amber-300 border-amber-800/40"
                      : "bg-[#161616] text-purple-300 border-purple-900/40"
                  )}
                >
                  {deadline.isOverdue ? (
                    <AlertCircle className="h-3 w-3 text-red-400" />
                  ) : (
                    <Clock className="h-3 w-3 text-purple-400" />
                  )}
                  <span>{deadline.label}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

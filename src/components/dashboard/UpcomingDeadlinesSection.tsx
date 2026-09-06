"use client";

import * as React from "react";
import Link from "next/link";
import { Clock, AlertTriangle, ChevronRight } from "lucide-react";
import { Assignment } from "@/types/database";
import { formatDeadline } from "@/lib/deadline-utils";
import { parseISO, isPast, isToday, differenceInCalendarDays } from "date-fns";

interface UpcomingDeadlinesSectionProps {
  assignments: Assignment[];
}

type FilterType = "All" | "Overdue" | "Today" | "Upcoming";

export function UpcomingDeadlinesSection({ assignments }: UpcomingDeadlinesSectionProps) {
  const [filter, setFilter] = React.useState<FilterType>("All");

  // Incomplete assignments sorted by due_date
  const incompleteAssignments = React.useMemo(() => {
    return assignments
      .filter((a) => a.status !== "Completed" && a.progress < 100)
      .sort((a, b) => {
        const dateA = `${a.due_date}T${a.due_time || "23:59:00"}`;
        const dateB = `${b.due_date}T${b.due_time || "23:59:00"}`;
        return dateA.localeCompare(dateB);
      });
  }, [assignments]);

  // Apply active filter
  const filteredAssignments = React.useMemo(() => {
    const now = new Date();
    return incompleteAssignments.filter((a) => {
      try {
        const dueDate = parseISO(a.due_date);
        const daysDiff = differenceInCalendarDays(dueDate, now);

        if (filter === "Overdue") {
          return daysDiff < 0 || (daysDiff === 0 && a.status === "Overdue");
        }
        if (filter === "Today") {
          return isToday(dueDate);
        }
        if (filter === "Upcoming") {
          return daysDiff > 0;
        }
        return true;
      } catch {
        return true;
      }
    });
  }, [incompleteAssignments, filter]);

  const tabs: FilterType[] = ["All", "Overdue", "Today", "Upcoming"];

  return (
    <div className="rounded-2xl border border-[#181818] bg-[#070707] p-5 space-y-4 hover:border-[#222222] transition-colors">
      {/* Header & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">
          <Clock className="h-4 w-4 text-purple-400" />
          <span>Upcoming Deadlines</span>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-[#101010] p-1 rounded-xl border border-[#1E1E1E] self-start sm:self-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                filter === tab
                  ? "bg-purple-600 text-white shadow-sm font-semibold"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-[#181818]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Deadlines List Table */}
      {filteredAssignments.length === 0 ? (
        <div className="py-8 text-center text-xs text-zinc-500">
          No deadlines found for &quot;{filter}&quot;.
        </div>
      ) : (
        <div className="divide-y divide-[#141414]">
          {filteredAssignments.map((assignment) => {
            const deadlineInfo = formatDeadline(assignment.due_date, assignment.due_time);
            const courseCode = assignment.course?.code || assignment.course?.name || "GEN";
            const priority = (assignment.priority || "Medium").toUpperCase();

            // Status Icon style
            const isOverdue = deadlineInfo.isOverdue;
            const isDueToday = deadlineInfo.isDueToday;

            return (
              <Link
                key={assignment.id}
                href={`/assignments/${assignment.id}`}
                className="flex items-center justify-between gap-3 py-3 px-2 rounded-xl hover:bg-[#0E0E0E] transition-colors group"
              >
                {/* Left: Status Icon, Course Tag, Priority Tag, Title */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Status Icon */}
                  <div
                    className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 border ${
                      isOverdue
                        ? "bg-red-950/60 border-red-800/50 text-red-400"
                        : isDueToday
                        ? "bg-amber-950/60 border-amber-800/50 text-amber-400"
                        : "bg-purple-950/60 border-purple-800/50 text-purple-400"
                    }`}
                  >
                    {isOverdue ? (
                      <AlertTriangle className="h-3.5 w-3.5" />
                    ) : (
                      <Clock className="h-3.5 w-3.5" />
                    )}
                  </div>

                  {/* Course code pill */}
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800/40 shrink-0">
                    {courseCode}
                  </span>

                  {/* Priority pill */}
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${
                      priority === "HIGH"
                        ? "bg-red-950/60 text-red-300 border-red-800/40"
                        : priority === "MEDIUM"
                        ? "bg-amber-950/60 text-amber-300 border-amber-800/40"
                        : "bg-blue-950/60 text-blue-300 border-blue-800/40"
                    }`}
                  >
                    {priority}
                  </span>

                  {/* Title */}
                  <span className="text-xs font-semibold text-zinc-200 group-hover:text-purple-300 transition-colors truncate">
                    {assignment.title}
                  </span>
                </div>

                {/* Right: Relative Status, Absolute Date/Time, Arrow */}
                <div className="flex items-center gap-4 shrink-0 text-right">
                  {/* Relative Status */}
                  <span
                    className={`text-[11px] font-semibold hidden md:inline ${
                      isOverdue
                        ? "text-red-400"
                        : isDueToday
                        ? "text-amber-400"
                        : "text-purple-400"
                    }`}
                  >
                    {deadlineInfo.relative}
                  </span>

                  {/* Exact formatted date/time */}
                  <span className="text-[11px] text-zinc-400 font-medium">
                    {deadlineInfo.absolute}
                  </span>

                  <ChevronRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

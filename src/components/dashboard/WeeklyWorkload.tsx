"use client";

import * as React from "react";
import Link from "next/link";
import { BarChart3, Clock, ArrowRight } from "lucide-react";
import { Assignment } from "@/types/database";
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay, parseISO } from "date-fns";

interface WeeklyWorkloadProps {
  assignments: Assignment[];
}

export function WeeklyWorkload({ assignments }: WeeklyWorkloadProps) {
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 }); // Sunday
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Compute assignment count per day
  const dayStats = daysInWeek.map((day) => {
    const dayName = format(day, "EEE").toUpperCase();
    const count = assignments.filter((a) => {
      try {
        const dueDate = parseISO(a.due_date);
        return isSameDay(dueDate, day);
      } catch {
        return false;
      }
    }).length;
    const isToday = isSameDay(day, now);

    return {
      day,
      dayName,
      count,
      isToday,
    };
  });

  const totalThisWeek = dayStats.reduce((acc, d) => acc + d.count, 0);
  const maxCount = Math.max(1, ...dayStats.map((d) => d.count));

  return (
    <div className="rounded-2xl border border-[#181818] bg-[#070707] p-5 flex flex-col justify-between h-full space-y-4 hover:border-[#222222] transition-colors relative overflow-hidden group">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">
          <BarChart3 className="h-4 w-4 text-purple-400" />
          <span>Weekly Workload</span>
        </div>
        <Link
          href="/calendar"
          className="text-xs font-medium text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
        >
          <span>View Calendar</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {/* Subtitle */}
      <p className="text-[11px] text-zinc-500">
        Number of assignments due each day
      </p>

      {/* Vertical Bar Chart */}
      <div className="flex items-end justify-between gap-2 h-32 pt-2 px-1">
        {dayStats.map((item, idx) => {
          // Calculate height percentage (min 8% so empty bars have a subtle baseline)
          const heightPct = item.count > 0 ? Math.max(15, (item.count / maxCount) * 100) : 4;

          return (
            <div
              key={idx}
              className="flex-1 flex flex-col items-center justify-end gap-1.5 h-full group/bar"
            >
              {/* Count number label above bar */}
              <span
                className={`text-[11px] font-bold transition-colors ${
                  item.count > 0
                    ? item.isToday
                      ? "text-purple-300"
                      : "text-zinc-300"
                    : "text-zinc-600 opacity-60"
                }`}
              >
                {item.count}
              </span>

              {/* The Vertical Bar */}
              <div className="w-full flex items-end justify-center h-20">
                <div
                  className={`w-full max-w-[28px] rounded-t-md transition-all duration-300 ${
                    item.isToday
                      ? "bg-gradient-to-t from-purple-700 via-purple-500 to-purple-400 shadow-purple-glow"
                      : item.count > 0
                      ? "bg-gradient-to-t from-purple-900/80 to-purple-600/80 group-hover/bar:from-purple-800 group-hover/bar:to-purple-500"
                      : "bg-[#141414] rounded-t-sm"
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
              </div>

              {/* Day Label */}
              <span
                className={`text-[10px] font-bold tracking-wider uppercase transition-colors ${
                  item.isToday
                    ? "text-purple-400"
                    : "text-zinc-500 group-hover/bar:text-zinc-300"
                }`}
              >
                {item.dayName}
              </span>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-center gap-1.5 pt-2 border-t border-[#141414] text-xs text-zinc-400 font-medium">
        <Clock className="h-3.5 w-3.5 text-purple-400" />
        <span>{totalThisWeek} assignments this week</span>
      </div>
    </div>
  );
}

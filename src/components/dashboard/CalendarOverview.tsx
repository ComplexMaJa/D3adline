"use client";

import * as React from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  parseISO,
  isPast,
  isToday,
} from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import { Assignment } from "@/types/database";

interface CalendarOverviewProps {
  assignments: Assignment[];
}

export function CalendarOverview({ assignments }: CalendarOverviewProps) {
  const [currentDate, setCurrentDate] = React.useState<Date>(new Date());
  const now = new Date();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const handlePrevMonth = () => setCurrentDate((prev) => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentDate((prev) => addMonths(prev, 1));

  // Determine deadline status dots for each date
  const getDayDots = (day: Date) => {
    const dayAssignments = assignments.filter((a) => {
      try {
        const dueDate = parseISO(a.due_date);
        return isSameDay(dueDate, day);
      } catch {
        return false;
      }
    });

    if (dayAssignments.length === 0) return null;

    let hasOverdue = false;
    let hasDueToday = false;
    let hasDueSoon = false;
    let hasCompleted = false;

    dayAssignments.forEach((a) => {
      const isCompleted = a.status === "Completed" || a.progress === 100;
      if (isCompleted) {
        hasCompleted = true;
      } else {
        const dueDate = parseISO(a.due_date);
        if (isPast(dueDate) && !isToday(dueDate)) {
          hasOverdue = true;
        } else if (isToday(dueDate)) {
          hasDueToday = true;
        } else {
          hasDueSoon = true;
        }
      }
    });

    return { hasOverdue, hasDueToday, hasDueSoon, hasCompleted };
  };

  const weekDays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

  return (
    <div className="rounded-2xl border border-[#181818] bg-[#070707] p-5 space-y-4 hover:border-[#222222] transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">
          <CalendarIcon className="h-4 w-4 text-purple-400" />
          <span>Calendar Overview</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-zinc-400 bg-[#121212] px-2 py-1 rounded-md border border-[#1E1E1E]">
          <span>Month</span>
          <ChevronDown className="h-3 w-3" />
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between px-1">
        <button
          onClick={handlePrevMonth}
          className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-[#141414] transition-colors"
          title="Previous Month"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-xs font-bold text-zinc-200">
          {format(currentDate, "MMMM yyyy")}
        </span>
        <button
          onClick={handleNextMonth}
          className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-[#141414] transition-colors"
          title="Next Month"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Weekday Header */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {weekDays.map((day) => (
          <span key={day} className="text-[10px] font-bold text-zinc-500 py-1">
            {day}
          </span>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 text-center">
        {calendarDays.map((day, idx) => {
          const isSelected = isSameDay(day, now);
          const isCurrentMonth = isSameMonth(day, monthStart);
          const dots = getDayDots(day);

          return (
            <div
              key={idx}
              className="flex flex-col items-center justify-center p-1 rounded-lg transition-colors relative min-h-[32px]"
            >
              <span
                className={`text-xs font-medium h-6 w-6 flex items-center justify-center rounded-full transition-all ${
                  isSelected
                    ? "bg-purple-600 text-white font-bold shadow-purple-glow-sm"
                    : isCurrentMonth
                    ? "text-zinc-300 hover:bg-[#141414]"
                    : "text-zinc-600"
                }`}
              >
                {format(day, "d")}
              </span>

              {/* Status Dots */}
              {dots && (
                <div className="flex items-center justify-center gap-0.5 mt-0.5">
                  {dots.hasOverdue && (
                    <span className="h-1 w-1 rounded-full bg-red-500" />
                  )}
                  {dots.hasDueToday && (
                    <span className="h-1 w-1 rounded-full bg-amber-500" />
                  )}
                  {dots.hasDueSoon && (
                    <span className="h-1 w-1 rounded-full bg-purple-400" />
                  )}
                  {dots.hasCompleted && (
                    <span className="h-1 w-1 rounded-full bg-emerald-500" />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend at bottom */}
      <div className="pt-2 border-t border-[#141414] flex flex-wrap items-center justify-between gap-2 text-[10px] text-zinc-400">
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
          <span>Overdue</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          <span>Due Today</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
          <span>Due Soon</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span>Completed</span>
        </div>
      </div>
    </div>
  );
}

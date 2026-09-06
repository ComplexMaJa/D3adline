"use client";

import * as React from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Assignment, Course } from "@/types/database";
import { useApp } from "@/components/layout/AppShell";
import {
  getDeadlineInfo,
  getPriorityBadgeStyle,
  getStatusBadgeStyle,
} from "@/lib/deadline-utils";
import {
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
  parseISO,
  addWeeks,
  subWeeks,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  Plus,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface CalendarClientProps {
  initialAssignments: Assignment[];
  courses: Course[];
}

export function CalendarClient({
  initialAssignments,
  courses,
}: CalendarClientProps) {
  const [currentDate, setCurrentDate] = React.useState<Date>(new Date());
  const [viewMode, setViewMode] = React.useState<"month" | "week">("month");
  const [selectedDay, setSelectedDay] = React.useState<Date | null>(null);
  const [isDayModalOpen, setIsDayModalOpen] = React.useState(false);

  const { openCreateAssignment } = useApp();
  const { t, dateLocale, language } = useLanguage();

  const assignments = initialAssignments;

  // Month navigation
  const nextPeriod = () => {
    if (viewMode === "month") {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addWeeks(currentDate, 1));
    }
  };

  const prevPeriod = () => {
    if (viewMode === "month") {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(subWeeks(currentDate, 1));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Generate days to render
  const calendarDays = React.useMemo(() => {
    if (viewMode === "month") {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(monthStart);
      const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
      const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
      return eachDayOfInterval({ start: startDate, end: endDate });
    } else {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
      return eachDayOfInterval({ start: weekStart, end: weekEnd });
    }
  }, [currentDate, viewMode]);

  // Group assignments by date string "yyyy-MM-dd"
  const assignmentsByDate = React.useMemo(() => {
    const map = new Map<string, Assignment[]>();
    assignments.forEach((a) => {
      const dateKey = a.due_date;
      const list = map.get(dateKey) || [];
      list.push(a);
      map.set(dateKey, list);
    });
    return map;
  }, [assignments]);

  const handleDayClick = (day: Date) => {
    setSelectedDay(day);
    setIsDayModalOpen(true);
  };

  const selectedDayAssignments = selectedDay
    ? assignmentsByDate.get(format(selectedDay, "yyyy-MM-dd")) || []
    : [];

  return (
    <div className="space-y-6 animate-fade-in">
      <Header
        title={t.calendar.title}
        description={t.calendar.description}
        action={
          <Button onClick={() => openCreateAssignment()} size="sm">
            <Plus className="h-4 w-4" />
            <span>{t.assignments.newAssignmentBtn}</span>
          </Button>
        }
      />

      {/* Calendar Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-[#1A1A1A] bg-[#080808]">
        {/* Navigation & Current Month */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <h2 className="text-base sm:text-lg font-bold text-zinc-100 min-w-[160px]">
            {format(
              currentDate,
              viewMode === "month"
                ? "MMMM yyyy"
                : language === "id"
                ? "'Minggu dari' d MMM yyyy"
                : "'Week of' MMM d, yyyy",
              { locale: dateLocale }
            )}
          </h2>

          <div className="flex items-center gap-1">
            <button
              onClick={prevPeriod}
              className="p-1.5 rounded-lg border border-[#222222] bg-[#0E0E0E] text-zinc-400 hover:text-white hover:bg-[#181818] transition-colors"
              title="Previous"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="text-xs h-8 px-2.5"
            >
              {t.calendar.todayBtn}
            </Button>
            <button
              onClick={nextPeriod}
              className="p-1.5 rounded-lg border border-[#222222] bg-[#0E0E0E] text-zinc-400 hover:text-white hover:bg-[#181818] transition-colors"
              title="Next"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center rounded-lg border border-[#222222] bg-[#0E0E0E] p-0.5 self-end sm:self-center">
          <button
            onClick={() => setViewMode("month")}
            className={cn(
              "px-3 py-1 rounded-md text-xs font-medium transition-colors",
              viewMode === "month"
                ? "bg-[#1C1C1C] text-purple-300 shadow-sm"
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            {t.calendar.monthView}
          </button>
          <button
            onClick={() => setViewMode("week")}
            className={cn(
              "px-3 py-1 rounded-md text-xs font-medium transition-colors",
              viewMode === "week"
                ? "bg-[#1C1C1C] text-purple-300 shadow-sm"
                : "text-zinc-500 hover:text-zinc-300"
            )}
          >
            {t.calendar.weekView}
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-xl border border-[#1A1A1A] bg-[#060606] overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-[#1A1A1A] bg-[#0A0A0A] text-center text-xs font-semibold text-zinc-400 py-2.5">
          <div>{t.calendar.weekdays.mon}</div>
          <div>{t.calendar.weekdays.tue}</div>
          <div>{t.calendar.weekdays.wed}</div>
          <div>{t.calendar.weekdays.thu}</div>
          <div>{t.calendar.weekdays.fri}</div>
          <div className="text-zinc-500">{t.calendar.weekdays.sat}</div>
          <div className="text-zinc-500">{t.calendar.weekdays.sun}</div>
        </div>

        {/* Days cells */}
        <div
          className={cn(
            "grid grid-cols-7 divide-x divide-y divide-[#141414]",
            viewMode === "week" ? "min-h-[400px]" : ""
          )}
        >
          {calendarDays.map((day) => {
            const dateKey = format(day, "yyyy-MM-dd");
            const dayAssignments = assignmentsByDate.get(dateKey) || [];
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isTodayDate = isToday(day);

            return (
              <div
                key={day.toISOString()}
                onClick={() => handleDayClick(day)}
                className={cn(
                  "min-h-[100px] sm:min-h-[120px] p-2 transition-colors cursor-pointer group flex flex-col justify-between",
                  !isCurrentMonth && viewMode === "month" && "bg-[#030303]/60 text-zinc-600",
                  isCurrentMonth && "bg-[#070707] hover:bg-[#0E0E0E]",
                  isTodayDate && "ring-1 ring-inset ring-purple-500/50 bg-purple-950/10"
                )}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={cn(
                      "text-xs font-semibold h-6 w-6 rounded-full flex items-center justify-center transition-colors",
                      isTodayDate
                        ? "bg-purple-600 text-white shadow-purple-glow-sm"
                        : isCurrentMonth
                        ? "text-zinc-300 group-hover:text-white"
                        : "text-zinc-600"
                    )}
                  >
                    {format(day, "d")}
                  </span>

                  {dayAssignments.length > 0 && (
                    <span className="text-[10px] text-purple-400 font-bold sm:hidden">
                      • {dayAssignments.length}
                    </span>
                  )}
                </div>

                {/* Day Assignment Pills */}
                <div className="space-y-1 overflow-hidden flex-1">
                  {dayAssignments.slice(0, 3).map((a) => {
                    const isDone = a.status === "Completed" || a.progress === 100;
                    const isOver = a.status === "Overdue";

                    return (
                      <div
                        key={a.id}
                        className={cn(
                          "truncate rounded px-1.5 py-0.5 text-[10px] font-medium transition-all flex items-center gap-1 border",
                          isDone
                            ? "bg-zinc-900/60 text-zinc-500 border-zinc-800 line-through"
                            : isOver
                            ? "bg-red-950/40 text-red-300 border-red-900/40"
                            : "bg-[#121212] text-zinc-200 border-[#222222] hover:border-purple-500/40"
                        )}
                        title={`${a.title} (${a.course?.name || "General"})`}
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full shrink-0"
                          style={{
                            backgroundColor: a.course?.color || "#8B5CF6",
                          }}
                        />
                        <span className="truncate">{a.title}</span>
                      </div>
                    );
                  })}

                  {dayAssignments.length > 3 && (
                    <p className="text-[10px] text-zinc-500 font-medium pl-1">
                      +{dayAssignments.length - 3} more
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Schedule Inspection Modal */}
      <Modal
        isOpen={isDayModalOpen}
        onClose={() => setIsDayModalOpen(false)}
        title={
          selectedDay
            ? `${t.calendar.dayModalTitle} ${format(selectedDay, "EEEE, d MMMM yyyy", { locale: dateLocale })}`
            : t.calendar.title
        }
        description={
          selectedDayAssignments.length > 0
            ? `${selectedDayAssignments.length} ${t.common.tasks}`
            : t.calendar.noTasksForDay
        }
        maxWidth="md"
      >
        <div className="space-y-3">
          {selectedDayAssignments.length === 0 ? (
            <div className="p-6 text-center text-xs text-zinc-500">
              {t.calendar.noTasksForDay}
            </div>
          ) : (
            selectedDayAssignments.map((assignment) => {
              const deadline = getDeadlineInfo(
                assignment.due_date,
                assignment.due_time,
                assignment.status,
                language
              );
              const isDone = assignment.status === "Completed" || assignment.progress === 100;

              return (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl border border-[#1C1C1C] bg-[#090909] hover:border-[#2C2C2C] transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {assignment.course && (
                        <span
                          className="px-1.5 py-0.2 rounded text-[10px] font-medium"
                          style={{
                            backgroundColor: `${assignment.course.color}20`,
                            color: assignment.course.color || "#8B5CF6",
                          }}
                        >
                          {assignment.course.code || assignment.course.name}
                        </span>
                      )}
                      <span
                        className={cn(
                          "px-1.5 py-0.2 rounded text-[9px] font-semibold uppercase border",
                          getPriorityBadgeStyle(assignment.priority)
                        )}
                      >
                        {assignment.priority}
                      </span>
                    </div>

                    <Link
                      href={`/assignments/${assignment.id}`}
                      className={cn(
                        "text-xs font-semibold block truncate hover:text-purple-300 transition-colors",
                        isDone ? "line-through text-zinc-500" : "text-zinc-100"
                      )}
                    >
                      {assignment.title}
                    </Link>

                    <div className="flex items-center gap-2 mt-1 text-[11px] text-zinc-400">
                      <Clock className="h-3 w-3 text-purple-400" />
                      <span>{deadline.formattedTime}</span>
                      <span>·</span>
                      <span>{assignment.progress}% {t.common.completed.toLowerCase()}</span>
                    </div>
                  </div>

                  <Link
                    href={`/assignments/${assignment.id}`}
                    className="p-2 rounded-lg bg-[#141414] text-zinc-400 hover:text-white hover:bg-[#1E1E1E] transition-colors"
                    title={t.common.viewDetails}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Link>
                </div>
              );
            })
          )}

          <div className="pt-2 flex justify-end">
            <Button
              size="sm"
              onClick={() => {
                setIsDayModalOpen(false);
                openCreateAssignment();
              }}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{t.assignments.newAssignmentBtn}</span>
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

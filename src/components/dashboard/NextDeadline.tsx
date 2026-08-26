"use client";

import * as React from "react";
import Link from "next/link";
import { Clock, ArrowRight, CheckCircle } from "lucide-react";
import { Assignment } from "@/types/database";
import { formatDeadline } from "@/lib/deadline-utils";
import { parseISO } from "date-fns";

interface NextDeadlineProps {
  assignment: Assignment | null;
}

export function NextDeadline({ assignment }: NextDeadlineProps) {
  const [timeLeft, setTimeLeft] = React.useState({
    hours: "00",
    minutes: "00",
    seconds: "00",
    isOverdue: false,
  });

  React.useEffect(() => {
    if (!assignment) return;

    function calculateTime() {
      if (!assignment) return;
      const dateStr = assignment.due_date;
      const timeStr = assignment.due_time || "23:59:00";
      const dueDateTime = parseISO(`${dateStr}T${timeStr}`);
      const now = new Date();
      const diffMs = dueDateTime.getTime() - now.getTime();

      if (diffMs <= 0) {
        // Overdue by some time
        const absDiff = Math.abs(diffMs);
        const totalSec = Math.floor(absDiff / 1000);
        const hours = Math.floor(totalSec / 3600);
        const mins = Math.floor((totalSec % 3600) / 60);
        const secs = totalSec % 60;

        setTimeLeft({
          hours: String(hours).padStart(2, "0"),
          minutes: String(mins).padStart(2, "0"),
          seconds: String(secs).padStart(2, "0"),
          isOverdue: true,
        });
      } else {
        const totalSec = Math.floor(diffMs / 1000);
        const hours = Math.floor(totalSec / 3600);
        const mins = Math.floor((totalSec % 3600) / 60);
        const secs = totalSec % 60;

        setTimeLeft({
          hours: String(hours).padStart(2, "0"),
          minutes: String(mins).padStart(2, "0"),
          seconds: String(secs).padStart(2, "0"),
          isOverdue: false,
        });
      }
    }

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [assignment]);

  if (!assignment) {
    return (
      <div className="rounded-2xl border border-[#181818] bg-[#070707] p-5 flex flex-col justify-between h-full space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
          <Clock className="h-4 w-4 text-purple-400" />
          <span>Next Deadline</span>
        </div>
        <div className="py-8 text-center space-y-2">
          <div className="h-10 w-10 mx-auto rounded-full bg-purple-950/60 border border-purple-800/40 flex items-center justify-center text-purple-400">
            <CheckCircle className="h-5 w-5" />
          </div>
          <h4 className="text-sm font-semibold text-white">No upcoming deadlines</h4>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto">
            Take a breather or plan ahead for upcoming courses.
          </p>
        </div>
      </div>
    );
  }

  const deadlineInfo = formatDeadline(assignment.due_date, assignment.due_time);
  const courseCode = assignment.course?.code || assignment.course?.name || "GEN";
  const priority = (assignment.priority || "Medium").toUpperCase();

  return (
    <div className="rounded-2xl border border-[#181818] bg-[#070707] p-5 flex flex-col justify-between h-full space-y-4 hover:border-[#222222] transition-colors relative overflow-hidden group">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">
          <Clock className="h-4 w-4 text-purple-400" />
          <span>Next Deadline</span>
        </div>
      </div>

      {/* Badges: Course & Priority */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-950/80 text-amber-300 border border-amber-800/50">
            {courseCode}
          </span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
              priority === "HIGH"
                ? "bg-red-950/80 text-red-300 border-red-800/50"
                : priority === "MEDIUM"
                ? "bg-amber-950/80 text-amber-300 border-amber-800/50"
                : "bg-blue-950/80 text-blue-300 border-blue-800/50"
            }`}
          >
            {priority}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-white tracking-tight leading-snug group-hover:text-purple-200 transition-colors line-clamp-2">
          {assignment.title}
        </h3>

        {/* Relative Due Tag */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
          <Clock className="h-3.5 w-3.5" />
          <span>{deadlineInfo.relative}</span>
        </div>
      </div>

      {/* Dynamic Digital Countdown Box */}
      <div className="rounded-xl border border-[#1C1C1C] bg-[#0C0C0C] p-3 text-center space-y-1">
        <div className="flex items-center justify-center gap-2 text-2xl sm:text-3xl font-mono font-bold tracking-widest text-white">
          <span className="bg-[#141414] px-2 py-1 rounded-lg border border-[#222222]">
            {timeLeft.hours}
          </span>
          <span className="text-purple-400 animate-pulse">:</span>
          <span className="bg-[#141414] px-2 py-1 rounded-lg border border-[#222222]">
            {timeLeft.minutes}
          </span>
          <span className="text-purple-400 animate-pulse">:</span>
          <span className="bg-[#141414] px-2 py-1 rounded-lg border border-[#222222]">
            {timeLeft.seconds}
          </span>
        </div>
        <div className="flex items-center justify-center gap-6 text-[10px] font-bold text-zinc-500 uppercase tracking-widest pt-0.5">
          <span>Hours</span>
          <span>Mins</span>
          <span>Secs</span>
        </div>
      </div>

      {/* Action Button */}
      <Link
        href={`/assignments/${assignment.id}`}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#121212] hover:bg-[#1A1A1A] border border-[#222222] hover:border-[#333333] text-zinc-200 text-xs font-semibold transition-all duration-200 active:scale-[0.98]"
      >
        <span>View Assignment</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

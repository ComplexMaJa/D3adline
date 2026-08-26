"use client";

import * as React from "react";
import Link from "next/link";
import { Target, ArrowRight, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { Assignment } from "@/types/database";
import { formatDeadline } from "@/lib/deadline-utils";

interface TodaysFocusProps {
  assignment: Assignment | null;
}

export function TodaysFocus({ assignment }: TodaysFocusProps) {
  if (!assignment) {
    return (
      <div className="rounded-2xl border border-[#181818] bg-[#070707] p-5 flex flex-col justify-between h-full space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 uppercase tracking-wider">
          <Target className="h-4 w-4" />
          <span>Today&apos;s Focus</span>
        </div>
        <div className="py-8 text-center space-y-2">
          <div className="h-10 w-10 mx-auto rounded-full bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center text-emerald-400">
            <CheckCircle className="h-5 w-5" />
          </div>
          <h4 className="text-sm font-semibold text-white">You&apos;re all caught up!</h4>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto">
            No pending assignments need immediate attention right now. Great job!
          </p>
        </div>
      </div>
    );
  }

  const deadlineInfo = formatDeadline(assignment.due_date, assignment.due_time);
  const courseCode = assignment.course?.code || assignment.course?.name || "GEN";
  const priority = (assignment.priority || "Medium").toUpperCase();
  const progress = assignment.progress || 0;

  return (
    <div className="rounded-2xl border border-[#181818] bg-[#070707] p-5 flex flex-col justify-between h-full space-y-4 hover:border-[#222222] transition-colors relative overflow-hidden group">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-purple-400 uppercase tracking-wider">
          <Target className="h-4 w-4" />
          <span>Today&apos;s Focus</span>
        </div>
      </div>

      {/* Badges: Course & Priority */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-purple-950/80 text-purple-300 border border-purple-800/50">
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

        {/* Urgency state */}
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          {deadlineInfo.isOverdue ? (
            <div className="flex items-center gap-1.5 text-red-400">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>{deadlineInfo.relative}</span>
            </div>
          ) : deadlineInfo.isDueToday ? (
            <div className="flex items-center gap-1.5 text-amber-400">
              <Clock className="h-3.5 w-3.5" />
              <span>{deadlineInfo.relative}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-purple-400">
              <Clock className="h-3.5 w-3.5" />
              <span>{deadlineInfo.relative}</span>
            </div>
          )}
        </div>

        {/* Description snippet */}
        {assignment.description && (
          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
            {assignment.description}
          </p>
        )}
      </div>

      {/* Progress Bar & Percentage */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-xs">
          <div className="w-full h-1.5 bg-[#161616] rounded-full overflow-hidden mr-3">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all duration-300 shadow-purple-glow-sm"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs font-bold text-zinc-300 shrink-0">
            {progress}%
          </span>
        </div>
      </div>

      {/* Primary Action Button */}
      <Link
        href={`/assignments/${assignment.id}`}
        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-purple-glow-sm hover:shadow-purple-glow transition-all duration-200 active:scale-[0.98]"
      >
        <span>Continue Working</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}

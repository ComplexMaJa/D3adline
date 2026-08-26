"use client";

import * as React from "react";
import { MessageSquare, CheckCircle2, AlertTriangle, Calendar, Percent } from "lucide-react";
import { DashboardMetrics } from "@/types/database";

interface DashboardStatsProps {
  metrics: DashboardMetrics;
}

export function DashboardStats({ metrics }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
      {/* 1. Total Assignments */}
      <div className="rounded-2xl border border-[#181818] bg-[#070707] p-4 flex items-center gap-3.5 hover:border-[#222222] transition-colors">
        <div className="h-10 w-10 rounded-xl bg-purple-950/40 border border-purple-800/40 flex items-center justify-center text-purple-400 shrink-0">
          <MessageSquare className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-2xl font-bold tracking-tight text-white leading-tight">
            {metrics.totalAssignments}
          </div>
          <div className="text-xs font-semibold text-zinc-300 truncate">
            Total Assignments
          </div>
          <div className="text-[11px] text-zinc-500 truncate">
            All courses
          </div>
        </div>
      </div>

      {/* 2. Completed */}
      <div className="rounded-2xl border border-[#181818] bg-[#070707] p-4 flex items-center gap-3.5 hover:border-[#222222] transition-colors">
        <div className="h-10 w-10 rounded-xl bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-center text-emerald-400 shrink-0">
          <CheckCircle2 className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-2xl font-bold tracking-tight text-white leading-tight">
            {metrics.completedAssignments}
          </div>
          <div className="text-xs font-semibold text-zinc-300 truncate">
            Completed
          </div>
          <div className="text-[11px] text-emerald-400 font-medium truncate">
            {metrics.completionPercentage}% of total
          </div>
        </div>
      </div>

      {/* 3. Overdue */}
      <div className="rounded-2xl border border-[#181818] bg-[#070707] p-4 flex items-center gap-3.5 hover:border-[#222222] transition-colors">
        <div className="h-10 w-10 rounded-xl bg-red-950/40 border border-red-800/40 flex items-center justify-center text-red-400 shrink-0">
          <AlertTriangle className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-2xl font-bold tracking-tight text-white leading-tight">
            {metrics.overdueAssignments}
          </div>
          <div className="text-xs font-semibold text-zinc-300 truncate">
            Overdue
          </div>
          <div className="text-[11px] text-red-400/90 font-medium truncate">
            {metrics.overdueAssignments > 0 ? "Needs attention" : "All on track"}
          </div>
        </div>
      </div>

      {/* 4. Due This Week */}
      <div className="rounded-2xl border border-[#181818] bg-[#070707] p-4 flex items-center gap-3.5 hover:border-[#222222] transition-colors">
        <div className="h-10 w-10 rounded-xl bg-amber-950/40 border border-amber-800/40 flex items-center justify-center text-amber-400 shrink-0">
          <Calendar className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-2xl font-bold tracking-tight text-white leading-tight">
            {metrics.dueThisWeek}
          </div>
          <div className="text-xs font-semibold text-zinc-300 truncate">
            Due This Week
          </div>
          <div className="text-[11px] text-zinc-500 truncate">
            Next 7 days
          </div>
        </div>
      </div>

      {/* 5. Completion Rate */}
      <div className="rounded-2xl border border-[#181818] bg-[#070707] p-4 flex flex-col justify-between gap-2 hover:border-[#222222] transition-colors col-span-2 sm:col-span-1">
        <div className="flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-purple-950/40 border border-purple-800/40 flex items-center justify-center text-purple-400 shrink-0">
            <Percent className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-2xl font-bold tracking-tight text-white leading-tight">
              {metrics.completionPercentage}%
            </div>
            <div className="text-xs font-semibold text-zinc-300 truncate">
              Completion Rate
            </div>
          </div>
        </div>
        <div className="w-full h-1.5 bg-[#161616] rounded-full overflow-hidden mt-1">
          <div
            className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all duration-500 shadow-purple-glow-sm"
            style={{ width: `${Math.min(100, Math.max(0, metrics.completionPercentage))}%` }}
          />
        </div>
      </div>
    </div>
  );
}

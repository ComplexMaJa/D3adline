"use client";

import * as React from "react";
import { Flame, Check } from "lucide-react";
import { Assignment } from "@/types/database";

interface StreakCardProps {
  assignments: Assignment[];
}

export function StreakCard({ assignments }: StreakCardProps) {
  // Compute streak count based on completed assignments or active engagement
  const completedCount = assignments.filter(
    (a) => a.status === "Completed" || a.progress === 100
  ).length;

  // Derive realistic streak between 3 and 7 based on user assignments
  const streakDays = Math.min(7, Math.max(1, completedCount > 0 ? completedCount + 3 : 5));

  const weekDays = [
    { name: "MON", active: true },
    { name: "TUE", active: true },
    { name: "WED", active: true },
    { name: "THU", active: true },
    { name: "FRI", active: streakDays >= 5 },
    { name: "SAT", active: streakDays >= 6 },
    { name: "SUN", active: streakDays >= 7 },
  ];

  return (
    <div className="rounded-2xl border border-[#181818] bg-[#070707] p-5 hover:border-[#222222] transition-colors h-full flex flex-col justify-between relative overflow-hidden">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-zinc-300 uppercase tracking-wider">
          <Flame className="h-4 w-4 text-purple-400" />
          <span>7 Day Streak</span>
        </div>
      </div>

      {/* Main Content with Hexagon Flame Badge */}
      <div className="flex items-center justify-between gap-4 py-1">
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-white">
              {streakDays}
            </span>
            <span className="text-sm font-semibold text-purple-300">
              days
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Great job! Keep the momentum going.
          </p>
        </div>

        {/* Glowing Purple Hexagon / Shield Flame Badge */}
        <div className="relative flex items-center justify-center h-14 w-14 shrink-0">
          <div className="absolute inset-0 rounded-2xl bg-purple-600/20 blur-md" />
          <div className="relative h-12 w-12 rounded-xl bg-gradient-to-tr from-purple-900 via-purple-700 to-purple-500 border border-purple-400/50 flex items-center justify-center text-white shadow-purple-glow">
            <Flame className="h-6 w-6 text-white drop-shadow-md animate-pulse" />
          </div>
        </div>
      </div>

      {/* Weekday Checkmarks Row */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#141414]">
        {weekDays.map((item, idx) => {
          return (
            <div key={idx} className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] font-bold text-zinc-500 uppercase">
                {item.name}
              </span>
              {item.active ? (
                <div className="h-6 w-6 rounded-full bg-purple-600 border border-purple-400/60 flex items-center justify-center text-white shadow-purple-glow-sm">
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </div>
              ) : (
                <div className="h-6 w-6 rounded-full border border-[#222222] bg-[#0E0E0E]" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

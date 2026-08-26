"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar, Bell, Plus, ChevronDown } from "lucide-react";

interface DashboardHeaderProps {
  displayName: string;
  onCreateAssignment: () => void;
  onCreateCourse?: () => void;
}

export function DashboardHeader({
  displayName,
  onCreateAssignment,
  onCreateCourse,
}: DashboardHeaderProps) {
  const [currentDate, setCurrentDate] = React.useState<string>("");
  const [showDropdown, setShowDropdown] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setCurrentDate(format(new Date(), "EEEE, MMM d, yyyy"));
    const interval = setInterval(() => {
      setCurrentDate(format(new Date(), "EEEE, MMM d, yyyy"));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <span>{getGreeting()}, {displayName}</span>
          <span className="text-2xl animate-bounce">👋</span>
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-zinc-400">
          Here&apos;s what&apos;s happening with your academic journey.
        </p>
      </div>

      {/* Right Utility Actions */}
      <div className="flex items-center gap-3 self-start md:self-auto">
        {/* Date Pill */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#080808] border border-[#1A1A1A] text-zinc-300 text-xs font-medium shadow-sm">
          <Calendar className="h-3.5 w-3.5 text-zinc-400" />
          <span>{currentDate || "Wednesday, Aug 26, 2026"}</span>
        </div>

        {/* Notification Bell */}
        <button
          title="Notifications"
          className="relative p-2.5 rounded-xl bg-[#080808] border border-[#1A1A1A] text-zinc-400 hover:text-zinc-200 hover:border-[#282828] transition-all shadow-sm group"
        >
          <Bell className="h-4 w-4 text-zinc-400 group-hover:text-zinc-200 transition-colors" />
          <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-purple-500 shadow-purple-glow" />
        </button>

        {/* Primary Create Button with dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown((prev) => !prev)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-purple-glow-sm hover:shadow-purple-glow transition-all duration-150 active:scale-[0.98]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Assignment</span>
            <ChevronDown className={`h-3.5 w-3.5 opacity-70 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-1.5 w-44 rounded-xl border border-[#242424] bg-[#0E0E0E] p-1 shadow-2xl z-50 animate-scale-up">
              <button
                onClick={() => {
                  setShowDropdown(false);
                  onCreateAssignment();
                }}
                className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-zinc-200 hover:bg-purple-950/40 hover:text-purple-300 text-left transition-colors font-medium"
              >
                <Plus className="h-3.5 w-3.5 text-purple-400" />
                <span>New Assignment</span>
              </button>
              {onCreateCourse && (
                <button
                  onClick={() => {
                    setShowDropdown(false);
                    onCreateCourse();
                  }}
                  className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-zinc-200 hover:bg-purple-950/40 hover:text-purple-300 text-left transition-colors font-medium"
                >
                  <Plus className="h-3.5 w-3.5 text-blue-400" />
                  <span>New Course</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

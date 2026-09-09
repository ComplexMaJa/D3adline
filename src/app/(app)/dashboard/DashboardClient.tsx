"use client";

import * as React from "react";
import { Assignment, Course, DashboardMetrics } from "@/types/database";
import { useApp } from "@/components/layout/AppShell";
import { seedSampleData } from "@/lib/sample-data";
import { useRouter } from "next/navigation";
import { Sparkles, Database } from "lucide-react";
import { Button } from "@/components/ui/Button";

// Modular Dashboard Components
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { TodaysFocus } from "@/components/dashboard/TodaysFocus";
import { NextDeadline } from "@/components/dashboard/NextDeadline";
import { WeeklyWorkload } from "@/components/dashboard/WeeklyWorkload";
import { CalendarOverview } from "@/components/dashboard/CalendarOverview";
import { CourseProgressCard } from "@/components/dashboard/CourseProgressCard";
import { UpcomingDeadlinesSection } from "@/components/dashboard/UpcomingDeadlinesSection";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { StreakCard } from "@/components/dashboard/StreakCard";
import { parseISO, isPast, isToday, differenceInCalendarDays } from "date-fns";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface DashboardClientProps {
  initialAssignments: Assignment[];
  initialCourses: Course[];
  initialMetrics: DashboardMetrics;
}

export function DashboardClient({
  initialAssignments,
  initialCourses,
  initialMetrics,
}: DashboardClientProps) {
  const { t } = useLanguage();
  const [assignments, setAssignments] = React.useState<Assignment[]>(initialAssignments);
  const [metrics, setMetrics] = React.useState<DashboardMetrics>(initialMetrics);
  const [isSeeding, setIsSeeding] = React.useState(false);

  const [seedError, setSeedError] = React.useState<string | null>(null);
  const [seedSuccess, setSeedSuccess] = React.useState<string | null>(null);

  const {
    profile,
    isTeacher,
    courses,
    refreshCourses,
    openCreateAssignment,
    openCreateCourse,
    openJoinCourse,
  } = useApp();
  const router = useRouter();

  // Sync state with incoming props
  React.useEffect(() => {
    setAssignments(initialAssignments);
    setMetrics(initialMetrics);
  }, [initialAssignments, initialMetrics]);

  // Determine Today's Focus assignment:
  const todaysFocusAssignment = React.useMemo(() => {
    const incomplete = assignments.filter((a) => a.status !== "Completed" && a.progress < 100);
    if (incomplete.length === 0) return null;

    // 1. Highest priority active item
    const highPriority = incomplete.find((a) => a.priority === "High");
    if (highPriority) return highPriority;

    // 2. Urgent / Due today or tomorrow
    const today = new Date();
    const urgent = incomplete.find((a) => {
      const deadline = parseISO(a.due_date);
      const diff = differenceInCalendarDays(deadline, today);
      return diff <= 1 && !isPast(deadline);
    });
    if (urgent) return urgent;

    // 3. Fallback to first incomplete
    return incomplete[0];
  }, [assignments]);

  // Determine Next Deadline assignment:
  // Sort incomplete assignments chronologically and pick the first upcoming one (or the first incomplete one)
  const nextDeadlineAssignment = React.useMemo(() => {
    const incomplete = assignments.filter((a) => a.status !== "Completed" && a.progress < 100);
    if (incomplete.length === 0) return null;

    const sorted = [...incomplete].sort((a, b) => {
      const dateA = `${a.due_date}T${a.due_time || "23:59:00"}`;
      const dateB = `${b.due_date}T${b.due_time || "23:59:00"}`;
      return dateA.localeCompare(dateB);
    });

    // If today's focus is already displayed, pick the next one if available, otherwise pick the nearest
    if (sorted.length > 1 && todaysFocusAssignment && sorted[0].id === todaysFocusAssignment.id) {
      return sorted[1];
    }
    return sorted[0];
  }, [assignments, todaysFocusAssignment]);

  // Handle demo data seeding
  const handleSeedDemo = async () => {
    try {
      setIsSeeding(true);
      setSeedError(null);
      setSeedSuccess(null);
      const result = await seedSampleData();
      await refreshCourses();
      setSeedSuccess(
        `Demo data successfully created (${result.coursesCount} courses, ${result.assignmentsCount} assignments).`
      );
      router.refresh();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error("Error seeding demo data:", errorMsg);
      setSeedError(errorMsg);
    } finally {
      setIsSeeding(false);
    }
  };

  const displayName = profile?.display_name || (isTeacher ? "Instructor" : "Student");

  return (
    <div className="space-y-5 animate-fade-in max-w-[1720px] mx-auto pb-10">
      {/* Top Header */}
      <DashboardHeader
        displayName={displayName}
        isTeacher={isTeacher}
        onCreateAssignment={openCreateAssignment}
        onCreateCourse={openCreateCourse}
        onJoinCourse={openJoinCourse}
      />

      {/* Demo Data Seeder Banner if user has 0 items */}
      {courses.length === 0 && assignments.length === 0 && (
        <div className="rounded-2xl border border-purple-800/40 bg-gradient-to-r from-purple-950/40 via-[#0D0D0D] to-[#0A0A0A] p-5 shadow-purple-glow-sm space-y-3">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-purple-300 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="h-4 w-4 text-purple-400" />
                <span>{t.dashboard.quickStart.badge}</span>
              </div>
              <h3 className="text-sm font-bold text-white">
                {t.dashboard.quickStart.title}
              </h3>
              <p className="text-xs text-zinc-400 max-w-xl">
                {isTeacher
                  ? "Initialize sample courses, distribute assignments, and populate enrolled student submissions for grading."
                  : "Enroll in sample classes and load coursework to test submissions and deadlines."}
              </p>
            </div>
            <Button
              onClick={handleSeedDemo}
              isLoading={isSeeding}
              size="sm"
              className="shrink-0"
            >
              <Database className="h-3.5 w-3.5" />
              <span>{isSeeding ? t.dashboard.quickStart.seeding : t.dashboard.quickStart.button}</span>
            </Button>
          </div>

          {seedError && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center gap-2">
              <span className="font-semibold">Error:</span>
              <span>{seedError}</span>
            </div>
          )}

          {seedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs flex items-center gap-2">
              <span className="font-semibold">Success:</span>
              <span>{seedSuccess}</span>
            </div>
          )}
        </div>
      )}

      {/* 5 KPI Metric Cards Row */}
      <DashboardStats metrics={metrics} />

      {/* Main 2-Column Widescreen Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 items-start">
        {/* Left Column: 2/3 Width (Top focus row + Upcoming Deadlines + Bottom activity row) */}
        <div className="xl:col-span-2 space-y-5">
          {/* Top 3-Card Row: Today's Focus, Next Deadline, Weekly Workload */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
            <TodaysFocus assignment={todaysFocusAssignment} />
            <NextDeadline assignment={nextDeadlineAssignment} />
            <WeeklyWorkload assignments={assignments} />
          </div>

          {/* Large Upcoming Deadlines Filterable Table */}
          <UpcomingDeadlinesSection assignments={assignments} />

          {/* Bottom 2-Card Row: Recent Activity & 7 Day Streak */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
            <RecentActivity assignments={assignments} />
            <StreakCard assignments={assignments} />
          </div>
        </div>

        {/* Right Column: 1/3 Width Utility Area (Calendar Overview + Course Progress) */}
        <div className="xl:col-span-1 space-y-5">
          <CalendarOverview assignments={assignments} />
          <CourseProgressCard courses={courses.length > 0 ? courses : initialCourses} />
        </div>
      </div>
    </div>
  );
}

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
  const [assignments, setAssignments] = React.useState<Assignment[]>(initialAssignments);
  const [metrics, setMetrics] = React.useState<DashboardMetrics>(initialMetrics);
  const [isSeeding, setIsSeeding] = React.useState(false);

  const { profile, courses, refreshCourses, openCreateAssignment, openCreateCourse } = useApp();
  const router = useRouter();

  // Sync state with incoming props
  React.useEffect(() => {
    setAssignments(initialAssignments);
    setMetrics(initialMetrics);
  }, [initialAssignments, initialMetrics]);

  // Determine Today's Focus assignment:
  // Priority: 1. Incomplete Overdue -> 2. Incomplete Due Today -> 3. High Priority Incomplete -> 4. Earliest Incomplete
  const todaysFocusAssignment = React.useMemo(() => {
    const incomplete = assignments.filter((a) => a.status !== "Completed" && a.progress < 100);
    if (incomplete.length === 0) return null;

    const now = new Date();

    // 1. Overdue incomplete
    const overdue = incomplete.find((a) => {
      try {
        const d = parseISO(a.due_date);
        return differenceInCalendarDays(d, now) < 0 || (differenceInCalendarDays(d, now) === 0 && a.status === "Overdue");
      } catch {
        return false;
      }
    });
    if (overdue) return overdue;

    // 2. Due today
    const dueToday = incomplete.find((a) => {
      try {
        const d = parseISO(a.due_date);
        return isToday(d);
      } catch {
        return false;
      }
    });
    if (dueToday) return dueToday;

    // 3. High priority
    const highPri = incomplete.find((a) => a.priority === "High");
    if (highPri) return highPri;

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
      await seedSampleData();
      await refreshCourses();
      router.refresh();
    } catch (err) {
      console.error("Error seeding demo data:", err);
    } finally {
      setIsSeeding(false);
    }
  };

  const displayName = profile?.display_name || "Student";

  return (
    <div className="space-y-5 animate-fade-in max-w-[1720px] mx-auto pb-10">
      {/* Top Header */}
      <DashboardHeader
        displayName={displayName}
        onCreateAssignment={openCreateAssignment}
        onCreateCourse={openCreateCourse}
      />

      {/* Demo Data Seeder Banner if user has 0 items */}
      {courses.length === 0 && assignments.length === 0 && (
        <div className="rounded-2xl border border-purple-800/40 bg-gradient-to-r from-purple-950/40 via-[#0D0D0D] to-[#0A0A0A] p-5 shadow-purple-glow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-purple-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span>Quick Start Available</span>
            </div>
            <h3 className="text-sm font-bold text-white">
              Populate Demo University Courses & Assignments
            </h3>
            <p className="text-xs text-zinc-400 max-w-xl">
              Seed realistic courses like Data Structures, Database Systems, and Calculus II with due dates and problem sets to explore the app instantly.
            </p>
          </div>
          <Button
            onClick={handleSeedDemo}
            isLoading={isSeeding}
            size="sm"
            className="shrink-0"
          >
            <Database className="h-3.5 w-3.5" />
            <span>Seed Demo Data</span>
          </Button>
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

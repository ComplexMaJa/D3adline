"use client";

import * as React from "react";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { StatCard } from "@/components/dashboard/StatCard";
import { UrgentDeadlines } from "@/components/dashboard/UrgentDeadlines";
import { CourseCard } from "@/components/courses/CourseCard";
import { AssignmentCard } from "@/components/assignments/AssignmentCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { useApp } from "@/components/layout/AppShell";
import { Assignment, Course, DashboardMetrics } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { seedSampleData } from "@/lib/sample-data";
import {
  BookOpen,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  Percent,
  Plus,
  Sparkles,
  ArrowRight,
  Database,
  Layers,
} from "lucide-react";
import { useRouter } from "next/navigation";

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
  const supabase = createClient();
  const router = useRouter();

  // Sync state when props change
  React.useEffect(() => {
    setAssignments(initialAssignments);
    setMetrics(initialMetrics);
  }, [initialAssignments, initialMetrics]);

  // Greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Urgent assignments (incomplete, sorted by due_date)
  const urgentAssignments = assignments
    .filter((a) => a.status !== "Completed" && a.progress < 100)
    .slice(0, 5);

  // Recent assignments
  const recentAssignments = assignments.slice(0, 4);

  // Toggle complete handler
  const handleToggleComplete = async (assignment: Assignment) => {
    const isNowCompleted = assignment.status !== "Completed";
    const newStatus = isNowCompleted ? "Completed" : "In Progress";
    const newProgress = isNowCompleted ? 100 : 50;

    // Optimistic update
    setAssignments((prev) =>
      prev.map((a) =>
        a.id === assignment.id
          ? { ...a, status: newStatus, progress: newProgress }
          : a
      )
    );

    try {
      const { error } = await supabase
        .from("assignments")
        .update({
          status: newStatus,
          progress: newProgress,
          updated_at: new Date().toISOString(),
        })
        .eq("id", assignment.id);

      if (error) throw error;
      refreshCourses();
      router.refresh();
    } catch (err) {
      console.error("Error toggling completion:", err);
      // Revert
      setAssignments(initialAssignments);
    }
  };

  // Demo seeder handler
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
    <div className="space-y-8 animate-fade-in">
      {/* Top Header */}
      <Header
        title={`${getGreeting()}, ${displayName} 👋`}
        description="Here is your academic overview and upcoming deadlines for today."
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={openCreateCourse}
              className="hidden sm:inline-flex"
            >
              <Layers className="h-3.5 w-3.5" />
              <span>New Course</span>
            </Button>
            <Button
              size="sm"
              onClick={() => openCreateAssignment()}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Assignment</span>
            </Button>
          </div>
        }
      />

      {/* Seeder Banner if user is brand new */}
      {courses.length === 0 && assignments.length === 0 && (
        <div className="rounded-2xl border border-purple-800/40 bg-gradient-to-r from-purple-950/40 via-[#0D0D0D] to-[#0A0A0A] p-6 shadow-purple-glow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-purple-300 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span>Quick Start Available</span>
            </div>
            <h3 className="text-base font-bold text-white">
              Populate Demo University Courses & Assignments
            </h3>
            <p className="text-xs text-zinc-400 max-w-xl">
              Seed realistic courses like Data Structures, Database Systems, and Calculus II with due dates and problem sets to explore the app instantly.
            </p>
          </div>
          <Button
            onClick={handleSeedDemo}
            isLoading={isSeeding}
            className="shrink-0"
          >
            <Database className="h-4 w-4" />
            <span>Seed Demo Data</span>
          </Button>
        </div>
      )}

      {/* 6 Statistics Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          title="Total Tasks"
          value={metrics.totalAssignments}
          subtitle="All recorded assignments"
          icon={BookOpen}
          variant="purple"
        />
        <StatCard
          title="Completed"
          value={metrics.completedAssignments}
          subtitle={`${metrics.completionPercentage}% of total`}
          icon={CheckCircle2}
          variant="success"
        />
        <StatCard
          title="In Progress"
          value={metrics.pendingAssignments}
          subtitle="Active coursework"
          icon={Clock}
          variant="default"
        />
        <StatCard
          title="Overdue"
          value={metrics.overdueAssignments}
          subtitle="Past due deadline"
          icon={AlertTriangle}
          variant={metrics.overdueAssignments > 0 ? "danger" : "default"}
        />
        <StatCard
          title="Due This Week"
          value={metrics.dueThisWeek}
          subtitle="Next 7 days"
          icon={Calendar}
          variant="warning"
        />
        <StatCard
          title="Completion Rate"
          value={`${metrics.completionPercentage}%`}
          subtitle="Overall academic progress"
          icon={Percent}
          variant="purple"
        />
      </div>

      {/* Main Dashboard Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Urgent Deadlines + Recent Assignments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Urgent Deadlines Component */}
          <UrgentDeadlines
            assignments={urgentAssignments}
            onToggleComplete={handleToggleComplete}
          />

          {/* Recent Assignments Stream */}
          <div className="rounded-xl border border-[#1A1A1A] bg-[#080808] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-zinc-100">
                  Recent Assignments
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Latest tasks and projects on your radar
                </p>
              </div>
              <Link
                href="/assignments"
                className="text-xs font-medium text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
              >
                <span>Full List</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {recentAssignments.length === 0 ? (
              <EmptyState
                title="No assignments yet"
                description="Create your first assignment to begin tracking your coursework."
                action={
                  <Button
                    size="sm"
                    onClick={() => openCreateAssignment()}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Create Assignment</span>
                  </Button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {recentAssignments.map((assignment) => (
                  <AssignmentCard
                    key={assignment.id}
                    assignment={assignment}
                    onToggleComplete={handleToggleComplete}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Course Overview & Quick Stats */}
        <div className="space-y-6">
          {/* Course Overview Card */}
          <div className="rounded-xl border border-[#1A1A1A] bg-[#080808] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-zinc-100">
                  Courses Overview
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Progress by subject
                </p>
              </div>
              <Link
                href="/courses"
                className="text-xs font-medium text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
              >
                <span>Manage</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {courses.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-xs text-zinc-500 mb-3">
                  No courses created yet.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={openCreateCourse}
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add First Course</span>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {courses.slice(0, 4).map((course) => {
                  const total = course.assignments_count || 0;
                  const completed = course.completed_count || 0;
                  const pct = course.completion_percentage || 0;

                  return (
                    <Link
                      key={course.id}
                      href={`/courses/${course.id}`}
                      className="block p-3 rounded-lg border border-[#181818] bg-[#0C0C0C] hover:border-[#282828] hover:bg-[#111111] transition-all group"
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="h-2.5 w-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: course.color || "#8B5CF6" }}
                          />
                          <span className="text-xs font-semibold text-zinc-200 truncate group-hover:text-purple-300 transition-colors">
                            {course.name}
                          </span>
                        </div>
                        <span className="text-[11px] font-medium text-zinc-400 shrink-0">
                          {completed}/{total}
                        </span>
                      </div>

                      <div className="w-full h-1.5 bg-[#1A1A1A] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: course.color || "#8B5CF6",
                          }}
                        />
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Schedule Summary Card */}
          <div className="rounded-xl border border-[#1A1A1A] bg-[#080808] p-5 space-y-3">
            <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-400" />
              <span>Calendar Quick Link</span>
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Visualize your monthly workload and deadlines on the interactive calendar.
            </p>
            <Link
              href="/calendar"
              className="inline-flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg bg-[#141414] border border-[#242424] text-xs font-medium text-zinc-200 hover:bg-[#1C1C1C] hover:text-white transition-colors"
            >
              <span>Open Monthly Calendar</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

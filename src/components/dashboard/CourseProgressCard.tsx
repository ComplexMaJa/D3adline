"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Course } from "@/types/database";

interface CourseProgressCardProps {
  courses: Course[];
}

export function CourseProgressCard({ courses }: CourseProgressCardProps) {
  return (
    <div className="rounded-2xl border border-[#181818] bg-[#070707] p-5 space-y-4 hover:border-[#222222] transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
          Course Progress
        </div>
        <Link
          href="/courses"
          className="text-xs font-medium text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-xs text-zinc-500">No courses created yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {courses.slice(0, 5).map((course) => {
            const pct = course.completion_percentage || 0;
            const courseColor = course.color || "#8B5CF6";

            return (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                className="block group/course space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: courseColor }}
                    />
                    <span className="text-xs font-semibold text-zinc-200 truncate group-hover/course:text-purple-300 transition-colors">
                      {course.name}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-zinc-400 shrink-0">
                    {pct}%
                  </span>
                </div>

                {/* Progress bar with course-specific color */}
                <div className="w-full h-1.5 bg-[#161616] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: courseColor,
                    }}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

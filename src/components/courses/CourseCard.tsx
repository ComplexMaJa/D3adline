"use client";

import * as React from "react";
import Link from "next/link";
import { Course } from "@/types/database";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  BookOpen,
  User,
  MoreVertical,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";

interface CourseCardProps {
  course: Course;
  onEdit?: (course: Course) => void;
  onDelete?: (course: Course) => void;
}

export function CourseCard({ course, onEdit, onDelete }: CourseCardProps) {
  const { t } = useLanguage();
  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const total = course.assignments_count || 0;
  const completed = course.completed_count || 0;
  const pending = total - completed;
  const completionPercentage =
    course.completion_percentage !== undefined
      ? course.completion_percentage
      : total > 0
      ? Math.round((completed / total) * 100)
      : 0;

  return (
    <div className="group relative rounded-xl border border-[#1A1A1A] bg-[#080808] p-5 transition-all duration-200 hover:border-[#2C2C2C] hover:bg-[#0D0D0D] flex flex-col justify-between overflow-hidden">
      {/* Top accent border strip */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{ backgroundColor: course.color || "#8B5CF6" }}
      />

      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {course.code && (
                <span
                  className="px-2 py-0.5 rounded text-[11px] font-bold font-mono tracking-wide"
                  style={{
                    backgroundColor: `${course.color}20`,
                    color: course.color || "#8B5CF6",
                    border: `1px solid ${course.color}40`,
                  }}
                >
                  {course.code}
                </span>
              )}
            </div>
            <Link
              href={`/courses/${course.id}`}
              className="text-base font-bold text-zinc-100 hover:text-purple-300 transition-colors block"
            >
              {course.name}
            </Link>
          </div>

          {/* Action Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-[#181818] transition-colors"
              title="Course Actions"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-32 rounded-lg border border-[#242424] bg-[#121212] p-1 shadow-xl z-20 animate-fade-in text-xs">
                {onEdit && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onEdit(course);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-zinc-300 hover:bg-[#1E1E1E] hover:text-white text-left"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>{t.common.edit}</span>
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onDelete(course);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-red-400 hover:bg-red-950/40 text-left"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>{t.common.delete}</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Instructor */}
        {course.instructor && (
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-2">
            <User className="h-3.5 w-3.5 text-zinc-500" />
            <span>{course.instructor}</span>
          </div>
        )}

        {/* Description */}
        {course.description && (
          <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed mb-4">
            {course.description}
          </p>
        )}
      </div>

      {/* Progress & Stats Footer */}
      <div className="mt-4 pt-3 border-t border-[#141414] space-y-3">
        {/* Assignment Counts */}
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-zinc-300" title={t.courses.workload}>
              <BookOpen className="h-3.5 w-3.5 text-purple-400" />
              <span>{total} {total === 1 ? t.courses.tasksCountSingular : t.courses.tasksCount}</span>
            </span>
            <span className="flex items-center gap-1 text-emerald-400/90" title={t.courses.completed}>
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{completed}</span>
            </span>
            {pending > 0 && (
              <span className="flex items-center gap-1 text-amber-400/90" title={t.courses.inProgress}>
                <Clock className="h-3.5 w-3.5" />
                <span>{pending}</span>
              </span>
            )}
          </div>
          <span className="font-semibold text-zinc-200">{completionPercentage}%</span>
        </div>

        <ProgressBar value={completionPercentage} color={course.color} size="sm" />

        {/* View assignments link */}
        <Link
          href={`/courses/${course.id}`}
          className="flex items-center justify-between text-xs font-medium text-purple-400 hover:text-purple-300 transition-colors pt-1"
        >
          <span>{t.courses.viewCourseAssignments}</span>
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import { Header } from "@/components/layout/Header";
import { CourseCard } from "@/components/courses/CourseCard";
import { CourseDialog } from "@/components/forms/CourseDialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Course } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { useApp } from "@/components/layout/AppShell";
import { Plus, Search, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";

interface CoursesClientProps {
  initialCourses: Course[];
}

export function CoursesClient({ initialCourses }: CoursesClientProps) {
  const [courses, setCourses] = React.useState<Course[]>(initialCourses);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [courseToEdit, setCourseToEdit] = React.useState<Course | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [courseToDelete, setCourseToDelete] = React.useState<Course | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const { refreshCourses, openCreateCourse } = useApp();
  const supabase = createClient();
  const router = useRouter();

  React.useEffect(() => {
    setCourses(initialCourses);
  }, [initialCourses]);

  const filteredCourses = courses.filter((c) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(query) ||
      (c.code && c.code.toLowerCase().includes(query)) ||
      (c.instructor && c.instructor.toLowerCase().includes(query))
    );
  });

  const handleEdit = (course: Course) => {
    setCourseToEdit(course);
    setIsEditDialogOpen(true);
  };

  const handleDeletePrompt = (course: Course) => {
    setCourseToDelete(course);
  };

  const handleConfirmDelete = async () => {
    if (!courseToDelete) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("courses")
        .delete()
        .eq("id", courseToDelete.id);

      if (error) throw error;

      setCourses((prev) => prev.filter((c) => c.id !== courseToDelete.id));
      await refreshCourses();
      router.refresh();
      setCourseToDelete(null);
    } catch (err) {
      console.error("Error deleting course:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Header
        title="Courses & Subjects"
        description="Organize your university curriculum, track workload per subject, and manage instructors."
        action={
          <Button onClick={openCreateCourse} size="sm">
            <Plus className="h-4 w-4" />
            <span>Create Course</span>
          </Button>
        }
      />

      {/* Filter and search bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#080808] p-3 rounded-xl border border-[#1A1A1A]">
        <div className="w-full sm:w-72">
          <Input
            placeholder="Search courses by name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        <div className="text-xs text-zinc-400 self-end sm:self-center">
          Showing <span className="font-semibold text-zinc-200">{filteredCourses.length}</span>{" "}
          of {courses.length} courses
        </div>
      </div>

      {/* Courses Grid */}
      {filteredCourses.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-6 w-6 text-purple-400" />}
          title={searchQuery ? "No courses match your search" : "No courses created yet"}
          description={
            searchQuery
              ? `No subjects matching "${searchQuery}". Try a different keyword.`
              : "Create your subjects to group assignments and monitor completion rates."
          }
          action={
            searchQuery ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery("")}
              >
                Clear Search
              </Button>
            ) : (
              <Button size="sm" onClick={openCreateCourse}>
                <Plus className="h-4 w-4" />
                <span>Create First Course</span>
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onEdit={handleEdit}
              onDelete={handleDeletePrompt}
            />
          ))}
        </div>
      )}

      {/* Edit Course Dialog */}
      <CourseDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setCourseToEdit(null);
        }}
        courseToEdit={courseToEdit}
        onSaved={async () => {
          await refreshCourses();
          router.refresh();
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!courseToDelete}
        onClose={() => setCourseToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Course?"
        description={`Are you sure you want to delete "${courseToDelete?.name}"? All assignments belonging to this course will also be deleted.`}
        confirmText="Delete Course"
        isLoading={isDeleting}
      />
    </div>
  );
}

"use client";

import * as React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { AssignmentDialog } from "@/components/forms/AssignmentDialog";
import { CourseDialog } from "@/components/forms/CourseDialog";
import { Profile, Course, Assignment } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface AppShellProps {
  children: React.ReactNode;
  initialProfile?: Profile | null;
  initialCourses?: Course[];
}

export const AppContext = React.createContext<{
  profile: Profile | null;
  courses: Course[];
  refreshCourses: () => Promise<void>;
  openCreateAssignment: (courseId?: string) => void;
  openCreateCourse: () => void;
}>({
  profile: null,
  courses: [],
  refreshCourses: async () => {},
  openCreateAssignment: () => {},
  openCreateCourse: () => {},
});

export function useApp() {
  return React.useContext(AppContext);
}

export function AppShell({
  children,
  initialProfile = null,
  initialCourses = [],
}: AppShellProps) {
  const [profile, setProfile] = React.useState<Profile | null>(initialProfile);
  const [courses, setCourses] = React.useState<Course[]>(initialCourses);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = React.useState(false);
  const [isCourseModalOpen, setIsCourseModalOpen] = React.useState(false);
  const [selectedCourseId, setSelectedCourseId] = React.useState<string | undefined>();

  const supabase = createClient();
  const router = useRouter();

  // Refresh courses helper
  const refreshCourses = React.useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select(`
          *,
          assignments:assignments(id, status, progress)
        `)
        .order("name", { ascending: true });

      if (!error && data) {
        const enrichedCourses: Course[] = data.map((c: any) => {
          const assignmentsList = c.assignments || [];
          const total = assignmentsList.length;
          const completed = assignmentsList.filter(
            (a: any) => a.status === "Completed" || a.progress === 100
          ).length;
          const completion_percentage =
            total > 0 ? Math.round((completed / total) * 100) : 0;

          return {
            ...c,
            assignments_count: total,
            completed_count: completed,
            completion_percentage,
          };
        });
        setCourses(enrichedCourses);
      }
    } catch (err) {
      console.error("Error refreshing courses:", err);
    }
  }, [supabase]);

  // Initial load
  React.useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: prof } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (prof) {
          setProfile(prof);
        } else {
          setProfile({
            id: user.id,
            email: user.email || null,
            display_name: user.user_metadata?.display_name || user.email?.split("@")[0] || "Student",
            avatar_url: user.user_metadata?.avatar_url || null,
            created_at: user.created_at,
            updated_at: user.created_at,
          });
        }
      }
    }

    if (!profile) {
      loadUser();
    }
    if (courses.length === 0) {
      refreshCourses();
    }
  }, [supabase, profile, courses.length, refreshCourses]);

  const openCreateAssignment = (courseId?: string) => {
    setSelectedCourseId(courseId);
    setIsAssignmentModalOpen(true);
  };

  const openCreateCourse = () => {
    setIsCourseModalOpen(true);
  };

  const handleAssignmentSaved = (assignment: Assignment) => {
    refreshCourses();
    router.refresh();
  };

  const handleCourseSaved = (course: Course) => {
    refreshCourses();
    router.refresh();
  };

  return (
    <AppContext.Provider
      value={{
        profile,
        courses,
        refreshCourses,
        openCreateAssignment,
        openCreateCourse,
      }}
    >
      <div className="min-h-screen bg-black text-[#F5F5F5] flex flex-col md:flex-row">
        {/* Desktop Sidebar */}
        <Sidebar
          profile={profile}
          onOpenCreateAssignment={() => openCreateAssignment()}
        />

        {/* Mobile Top and Bottom Navigation */}
        <MobileNav onOpenCreateAssignment={() => openCreateAssignment()} />

        {/* Main Content Area */}
        <main className="flex-1 md:pl-64 min-h-screen flex flex-col pb-20 md:pb-8">
          <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
            {children}
          </div>
        </main>

        {/* Global Dialogs */}
        <AssignmentDialog
          isOpen={isAssignmentModalOpen}
          onClose={() => {
            setIsAssignmentModalOpen(false);
            setSelectedCourseId(undefined);
          }}
          courses={courses}
          initialCourseId={selectedCourseId}
          onSaved={handleAssignmentSaved}
          onOpenCreateCourse={() => {
            setIsAssignmentModalOpen(false);
            setIsCourseModalOpen(true);
          }}
        />

        <CourseDialog
          isOpen={isCourseModalOpen}
          onClose={() => setIsCourseModalOpen(false)}
          onSaved={handleCourseSaved}
        />
      </div>
    </AppContext.Provider>
  );
}

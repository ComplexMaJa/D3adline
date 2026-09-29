"use client";

import * as React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { AssignmentDialog } from "@/components/forms/AssignmentDialog";
import { CourseDialog } from "@/components/forms/CourseDialog";
import { JoinCourseDialog } from "@/components/forms/JoinCourseDialog";
import { Profile, Course, Assignment, UserRole } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { getDeadlineInfo } from "@/lib/deadline-utils";
import { calculateRoleCourseMetrics } from "@/lib/assignment-state";
import { useRouter } from "next/navigation";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";

interface AppShellProps {
  children: React.ReactNode;
  initialProfile?: Profile | null;
  initialCourses?: Course[];
}

export const AppContext = React.createContext<{
  profile: Profile | null;
  userRole: UserRole;
  isAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
  courses: Course[];
  overdueCount: number;
  refreshCourses: () => Promise<void>;
  openCreateAssignment: (courseId?: string) => void;
  openCreateCourse: () => void;
  openJoinCourse: () => void;
}>({
  profile: null,
  userRole: "student",
  isAdmin: false,
  isTeacher: false,
  isStudent: true,
  courses: [],
  overdueCount: 0,
  refreshCourses: async () => {},
  openCreateAssignment: () => {},
  openCreateCourse: () => {},
  openJoinCourse: () => {},
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
  const [isJoinCourseOpen, setIsJoinCourseOpen] = React.useState(false);
  const [selectedCourseId, setSelectedCourseId] = React.useState<string | undefined>();
  const initialFetchDone = React.useRef(false);

  const supabase = createClient();
  const router = useRouter();

  const userRole: UserRole = profile?.role || "student";

  // Sync state if server layout props change (e.g. after router.refresh())
  React.useEffect(() => {
    setCourses(initialCourses);
  }, [initialCourses]);

  React.useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile);
    }
  }, [initialProfile]);

  // Refresh courses helper - role-aware metrics calculation
  const refreshCourses = React.useCallback(async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: rawCourses, error } = await supabase
        .from("courses")
        .select("*")
        .order("name", { ascending: true });

      if (error || !rawCourses) return;

      let rawAssignments: any[] = [];
      if (rawCourses.length > 0) {
        const courseIds = rawCourses.map((c) => c.id);
        const { data: assignmentsData } = await supabase
          .from("assignments")
          .select(`
            id,
            course_id,
            user_id,
            title,
            description,
            status,
            priority,
            progress,
            due_date,
            due_time,
            created_at,
            updated_at,
            submissions:assignment_submissions(*),
            attachments:assignment_attachments(*)
          `)
          .in("course_id", courseIds)
          .order("due_date", { ascending: true });

        rawAssignments = assignmentsData || [];
      }

      const enrichedCourses = calculateRoleCourseMetrics({
        courses: rawCourses as Course[],
        assignments: rawAssignments,
        userRole,
        userId: user.id,
      });

      setCourses(enrichedCourses);
    } catch (err) {
      console.error("Error refreshing courses:", err);
    }
  }, [supabase, userRole]);

  // Initial load once on mount without loop
  React.useEffect(() => {
    if (initialFetchDone.current) return;
    initialFetchDone.current = true;

    async function loadUser() {
      try {
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
            setProfile({
              ...prof,
              role: prof.role || "student",
              institution: prof.institution || null,
              bio: prof.bio || null,
            });
          } else {
            setProfile((current) => ({
              id: user.id,
              email: user.email || null,
              display_name:
                user.user_metadata?.display_name ||
                user.user_metadata?.full_name ||
                current?.display_name ||
                user.email?.split("@")[0] ||
                "Student",
              avatar_url: user.user_metadata?.avatar_url || current?.avatar_url || null,
              role: current?.role || "student",
              institution: current?.institution || null,
              bio: current?.bio || null,
              created_at: user.created_at,
              updated_at: user.created_at,
            }));
          }
        }
      } catch (err) {
        console.error("Error loading user profile in AppShell:", err);
      }
    }

    loadUser();

    // Listen for auth changes to keep user role in sync
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        loadUser();
      }
    });

    if (initialCourses.length === 0) {
      refreshCourses();
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, initialCourses.length, refreshCourses]);

  const totalOverdueCount = React.useMemo(() => {
    return courses.reduce((acc, c) => acc + (c.overdue_count || 0), 0);
  }, [courses]);

  const isAdmin = userRole === "admin";
  const isTeacher = userRole === "teacher" || isAdmin;
  const isStudent = userRole === "student";

  const openCreateAssignment = (courseId?: string) => {
    if (!isTeacher) return;
    setSelectedCourseId(courseId);
    setIsAssignmentModalOpen(true);
  };

  const openCreateCourse = () => {
    if (!isTeacher) return;
    setIsCourseModalOpen(true);
  };

  const openJoinCourse = () => {
    setIsJoinCourseOpen(true);
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
    <LanguageProvider>
      <AppContext.Provider
        value={{
          profile,
          userRole,
          isAdmin,
          isTeacher,
          isStudent,
          courses,
          overdueCount: totalOverdueCount,
          refreshCourses,
          openCreateAssignment,
          openCreateCourse,
          openJoinCourse,
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
            <div className="flex-1 p-4 sm:p-6 lg:p-7 max-w-[1800px] w-full mx-auto animate-fade-in">
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

          <JoinCourseDialog
            isOpen={isJoinCourseOpen}
            onClose={() => setIsJoinCourseOpen(false)}
            onJoined={() => {
              refreshCourses();
              router.refresh();
            }}
          />
        </div>
      </AppContext.Provider>
    </LanguageProvider>
  );
}

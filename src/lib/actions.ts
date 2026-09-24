"use server";

import { createClient } from "@/lib/supabase/server";
import { UserRole, Course, AssignmentSubmission } from "@/types/database";
import { revalidatePath } from "next/cache";

/**
 * Server Action: Admin updates user role
 * Validates caller is authenticated admin before applying change.
 */
export async function adminSetUserRole(targetUserId: string, targetRole: UserRole) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Authentication required.");
  }

  // Check admin role of caller
  const { data: callerProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (callerProfile?.role !== "admin") {
    throw new Error("Access denied. Only administrators can change user roles.");
  }

  // Prevent admin from accidentally demoting self if sole admin
  if (user.id === targetUserId && targetRole !== "admin") {
    const { count } = await supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");

    if (count !== null && count <= 1) {
      throw new Error("Cannot demote the only remaining administrator account.");
    }
  }

  // Check target user's current role; if teacher is changing role, ensure no active classes are orphaned
  const { data: targetProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", targetUserId)
    .single();

  if (targetProfile?.role === "teacher" && targetRole !== "teacher") {
    const { count: activeCourseCount } = await supabase
      .from("courses")
      .select("id", { count: "exact", head: true })
      .eq("user_id", targetUserId)
      .eq("is_archived", false);

    if (activeCourseCount && activeCourseCount > 0) {
      throw new Error(
        `Cannot change role: this teacher currently owns ${activeCourseCount} active class(es). Please reassign or archive their classes first.`
      );
    }
  }

  // Call security definer RPC
  const { error } = await supabase.rpc("admin_set_user_role", {
    target_user_id: targetUserId,
    target_role: targetRole,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/users");
  revalidatePath("/settings");
  return { success: true };
}

/**
 * Server Action: Student joins course by join code
 */
export async function joinCourseByCode(joinCode: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Authentication required.");
  }

  const { data, error } = await supabase.rpc("enroll_course_by_join_code", {
    p_join_code: joinCode.trim(),
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/courses");
  revalidatePath("/dashboard");
  return { success: true, course: data as unknown as Course };
}

/**
 * Server Action: Teacher or Admin regenerates course join code
 */
export async function regenerateJoinCodeAction(courseId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Authentication required.");
  }

  const { data, error } = await supabase.rpc("regenerate_course_join_code", {
    p_course_id: courseId,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/courses/${courseId}`);
  revalidatePath("/courses");
  return { success: true, newCode: data as string };
}

/**
 * Server Action: Teacher or Admin toggles course archive status
 */
export async function toggleCourseArchivedAction(courseId: string, isArchived: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Authentication required.");
  }

  const { error } = await supabase.rpc("toggle_course_archived", {
    p_course_id: courseId,
    p_is_archived: isArchived,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/courses/${courseId}`);
  revalidatePath("/courses");
  revalidatePath("/admin/courses");
  return { success: true };
}

/**
 * Server Action: Teacher or Admin removes student from course
 */
export async function removeStudentFromCourseAction(courseId: string, studentId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Authentication required.");
  }

  const { error } = await supabase.rpc("remove_student_from_course", {
    p_course_id: courseId,
    p_student_id: studentId,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/courses/${courseId}`);
  revalidatePath("/admin/courses");
  return { success: true };
}

/**
 * Server Action: Teacher or Admin grades student submission
 */
export async function gradeSubmissionAction(
  submissionId: string,
  grade: number | null,
  feedback: string | null
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Authentication required.");
  }

  const { data, error } = await supabase
    .from("assignment_submissions")
    .update({
      grade,
      feedback: feedback?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", submissionId)
    .select(`*, student:profiles(*)`)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/submissions");
  return { success: true, submission: data as AssignmentSubmission };
}

/**
 * Server Action: Teacher or Admin deletes course
 */
export async function deleteCourseAction(courseId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Authentication required.");
  }

  const { error } = await supabase.from("courses").delete().eq("id", courseId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/courses");
  revalidatePath("/admin/courses");
  return { success: true };
}

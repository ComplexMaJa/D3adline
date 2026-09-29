import {
  Assignment,
  AssignmentStatus,
  AssignmentSubmission,
  Attachment,
  Course,
  DashboardMetrics,
  Subtask,
  SubtaskCompletion,
  UserRole,
} from "@/types/database";
import { getDeadlineInfo, parseAssignmentDeadline } from "@/lib/deadline-utils";

/**
 * Validates whether an assignment submission has an official deliverable
 * according to the database invariant:
 * submitted_at != null AND (non-empty written text/note OR at least one valid attachment)
 */
export function isValidSubmission(
  submission?: Partial<AssignmentSubmission> | null,
  attachments?: Attachment[]
): boolean {
  if (!submission || !submission.submitted_at) {
    return false;
  }

  const hasText =
    (submission.submission_text !== null &&
      submission.submission_text !== undefined &&
      submission.submission_text.trim().length > 0) ||
    (submission.submission_note !== null &&
      submission.submission_note !== undefined &&
      submission.submission_note.trim().length > 0);

  const hasAttachment =
    Boolean(attachments && attachments.length > 0) ||
    Boolean(
      attachments &&
        submission.student_id &&
        attachments.some((a) => a.user_id === submission.student_id)
    );

  return hasText || hasAttachment;
}

export interface StudentAssignmentState {
  status: AssignmentStatus;
  progress: number;
  hasSubmitted: boolean;
  isOverdue: boolean;
  grade: number | null;
  feedback: string | null;
  submittedAt: string | null;
  submissionText: string | null;
}

/**
 * Derives the authoritative per-student state for an assignment.
 * For students: personal progress comes from their submission & completions,
 * NEVER from the teacher's master assignment row.
 */
export function deriveStudentAssignmentState(
  assignment: Assignment,
  studentId?: string | null,
  submission?: AssignmentSubmission | AssignmentSubmission[] | null,
  attachments?: Attachment[],
  completions?: SubtaskCompletion[],
  currentTime?: Date
): StudentAssignmentState {
  const resolvedSub = Array.isArray(submission)
    ? submission.find((s) => s.student_id === studentId) || null
    : submission;

  const myAttachments = (attachments || []).filter(
    (a) => a.user_id === studentId
  );
  const myCompletions = (completions || []).filter(
    (c) => c.student_id === studentId && c.completed
  );

  const hasSubmitted = isValidSubmission(resolvedSub, myAttachments);

  // If student has subtasks and completions, subtask completion can drive progress
  // unless explicitly overwritten by an existing submission progress
  let progress = 0;
  if (resolvedSub && typeof resolvedSub.progress === "number") {
    progress = resolvedSub.progress;
  } else if (
    assignment.subtasks &&
    assignment.subtasks.length > 0 &&
    myCompletions.length > 0
  ) {
    progress = Math.round(
      (myCompletions.length / assignment.subtasks.length) * 100
    );
  }

  // Calculate deadline status
  const deadlineInfo = getDeadlineInfo(
    assignment.due_date,
    assignment.due_time,
    undefined,
    undefined,
    currentTime
  );

  let status: AssignmentStatus = "Not Started";

  if (hasSubmitted || resolvedSub?.status === "Completed" || progress === 100) {
    status = "Completed";
    if (progress < 100 && hasSubmitted) {
      progress = 100;
    }
  } else if (resolvedSub?.status === "In Progress" || progress > 0) {
    status = "In Progress";
    if (deadlineInfo.isOverdue) {
      status = "Overdue";
    }
  } else if (deadlineInfo.isOverdue) {
    status = "Overdue";
  } else {
    status = "Not Started";
  }

  return {
    status,
    progress,
    hasSubmitted,
    isOverdue: deadlineInfo.isOverdue && status !== "Completed",
    grade: resolvedSub?.grade ?? null,
    feedback: resolvedSub?.feedback ?? null,
    submittedAt: resolvedSub?.submitted_at ?? null,
    submissionText:
      resolvedSub?.submission_text || resolvedSub?.submission_note || null,
  };
}

export interface CalculateMetricsParams {
  courses: Course[];
  assignments: (Assignment & {
    submissions?: AssignmentSubmission[];
    attachments?: Attachment[];
    subtasks?: Subtask[];
  })[];
  userRole: UserRole;
  userId: string;
  currentTime?: Date;
}

/**
 * Calculates course metrics based on user role.
 * - Students: stats reflect personal submissions and completions.
 * - Teachers: stats reflect the master assignments they teach and submission counts.
 * - Admin: global view.
 */
export function calculateRoleCourseMetrics({
  courses,
  assignments,
  userRole,
  userId,
  currentTime,
}: CalculateMetricsParams): Course[] {
  const isStudent = userRole === "student";

  // Pre-index assignments by course_id
  const assignmentsByCourse = new Map<string, typeof assignments>();
  for (const a of assignments) {
    const list = assignmentsByCourse.get(a.course_id) || [];
    list.push(a);
    assignmentsByCourse.set(a.course_id, list);
  }

  return courses.map((course) => {
    const courseAssignments = assignmentsByCourse.get(course.id) || [];
    const total = courseAssignments.length;

    let completed = 0;
    let overdue = 0;

    for (const a of courseAssignments) {
      if (isStudent) {
        const mySub = a.submissions?.find((s) => s.student_id === userId);
        const myAtts = a.attachments?.filter((att) => att.user_id === userId);
        const state = deriveStudentAssignmentState(
          a,
          userId,
          mySub,
          myAtts,
          undefined,
          currentTime
        );

        if (state.status === "Completed") {
          completed++;
        } else if (state.isOverdue) {
          overdue++;
        }
      } else {
        // Teacher / Admin: evaluates assignment master state
        const deadline = getDeadlineInfo(
          a.due_date,
          a.due_time,
          a.status,
          undefined,
          currentTime
        );
        if (a.status === "Completed" || a.progress === 100) {
          completed++;
        } else if (deadline.isOverdue) {
          overdue++;
        }
      }
    }

    const completionPercentage =
      total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      ...course,
      assignments_count: total,
      completed_count: completed,
      overdue_count: overdue,
      completion_percentage: completionPercentage,
    };
  });
}

/**
 * Calculates dashboard metrics based on user role.
 */
export function calculateRoleDashboardMetrics({
  assignments,
  userRole,
  userId,
  currentTime,
}: {
  assignments: (Assignment & {
    submissions?: AssignmentSubmission[];
    attachments?: Attachment[];
  })[];
  userRole: UserRole;
  userId: string;
  currentTime?: Date;
}): DashboardMetrics {
  const isStudent = userRole === "student";
  const totalAssignments = assignments.length;

  let completedAssignments = 0;
  let overdueAssignments = 0;
  let dueThisWeek = 0;

  for (const a of assignments) {
    let isCompleted = false;
    let isOverdue = false;

    if (isStudent) {
      const mySub = a.submissions?.find((s) => s.student_id === userId);
      const myAtts = a.attachments?.filter((att) => att.user_id === userId);
      const state = deriveStudentAssignmentState(
        a,
        userId,
        mySub,
        myAtts,
        undefined,
        currentTime
      );
      isCompleted = state.status === "Completed";
      isOverdue = state.isOverdue;
    } else {
      isCompleted = a.status === "Completed" || a.progress === 100;
      const deadline = getDeadlineInfo(
        a.due_date,
        a.due_time,
        a.status,
        undefined,
        currentTime
      );
      isOverdue = deadline.isOverdue;
    }

    if (isCompleted) {
      completedAssignments++;
    } else {
      if (isOverdue) {
        overdueAssignments++;
      } else {
        const deadline = getDeadlineInfo(
          a.due_date,
          a.due_time,
          undefined,
          undefined,
          currentTime
        );
        if (deadline.isDueThisWeek) {
          dueThisWeek++;
        }
      }
    }
  }

  const pendingAssignments = totalAssignments - completedAssignments;
  const completionPercentage =
    totalAssignments > 0
      ? Math.round((completedAssignments / totalAssignments) * 100)
      : 0;

  return {
    totalAssignments,
    completedAssignments,
    pendingAssignments,
    overdueAssignments,
    dueThisWeek,
    completionPercentage,
  };
}

import { describe, it, expect } from "vitest";
import {
  isValidSubmission,
  deriveStudentAssignmentState,
  calculateRoleCourseMetrics,
  calculateRoleDashboardMetrics,
} from "@/lib/assignment-state";
import { Assignment, AssignmentSubmission, Attachment, Course } from "@/types/database";

describe("Authoritative Assignment State & Metrics", () => {
  describe("isValidSubmission", () => {
    it("returns false if submission is missing or submitted_at is null", () => {
      expect(isValidSubmission(null, [])).toBe(false);
      expect(isValidSubmission(undefined, [])).toBe(false);
      expect(
        isValidSubmission({ submitted_at: null, submission_text: "some text" }, [])
      ).toBe(false);
    });

    it("returns true when submitted_at is present and non-empty submission text exists", () => {
      expect(
        isValidSubmission(
          {
            submitted_at: "2026-10-15T10:00:00Z",
            submission_text: "Here is my final essay.",
          },
          []
        )
      ).toBe(true);

      expect(
        isValidSubmission(
          {
            submitted_at: "2026-10-15T10:00:00Z",
            submission_note: "Here is the drive link",
          },
          []
        )
      ).toBe(true);
    });

    it("returns true when submitted_at is present and valid student attachment exists", () => {
      const attachments = [
        {
          id: "att-1",
          user_id: "student-1",
          assignment_id: "asg-1",
          file_name: "solution.pdf",
          file_path: "student-1/asg-1/solution.pdf",
          file_size: 1024,
          file_type: "pdf",
          created_at: "2026-10-15T09:00:00Z",
        },
      ];

      expect(
        isValidSubmission(
          {
            student_id: "student-1",
            submitted_at: "2026-10-15T10:00:00Z",
            submission_text: "",
            submission_note: null,
          },
          attachments as Attachment[]
        )
      ).toBe(true);
    });

    it("returns false for submitted_at with empty text and no attachments (invalid submission)", () => {
      expect(
        isValidSubmission(
          {
            student_id: "student-1",
            submitted_at: "2026-10-15T10:00:00Z",
            submission_text: "   ",
            submission_note: "",
          },
          []
        )
      ).toBe(false);
    });
  });

  describe("deriveStudentAssignmentState", () => {
    const baseAssignment: Assignment = {
      id: "asg-1",
      user_id: "teacher-1",
      course_id: "course-1",
      title: "Math Assignment 1",
      description: "Solve problem set 1",
      status: "In Progress", // Teacher assignment status
      priority: "High",
      progress: 60, // Teacher master progress
      due_date: "2026-10-25",
      due_time: "23:59:00",
      created_at: "2026-10-01T00:00:00Z",
      updated_at: "2026-10-01T00:00:00Z",
    };

    it("ensures student progress comes from their personal submission and NOT teacher progress", () => {
      const studentSub: AssignmentSubmission = {
        id: "sub-1",
        assignment_id: "asg-1",
        student_id: "student-1",
        status: "Not Started",
        progress: 0,
        submission_text: null,
        submission_note: null,
        submitted_at: null,
        grade: null,
        feedback: null,
        created_at: "2026-10-02T00:00:00Z",
        updated_at: "2026-10-02T00:00:00Z",
      };

      const state = deriveStudentAssignmentState(baseAssignment, "student-1", [studentSub], []);
      // Should reflect student's personal progress (0), NOT teacher's (60)
      expect(state.progress).toBe(0);
      expect(state.status).toBe("Not Started");
      expect(state.hasSubmitted).toBe(false);
    });

    it("marks completed when student has submitted valid deliverable", () => {
      const studentSub: AssignmentSubmission = {
        id: "sub-1",
        assignment_id: "asg-1",
        student_id: "student-1",
        status: "Completed",
        progress: 100,
        submission_text: "Done",
        submission_note: null,
        submitted_at: "2026-10-10T12:00:00Z",
        grade: 95,
        feedback: "Excellent work!",
        created_at: "2026-10-02T00:00:00Z",
        updated_at: "2026-10-10T12:00:00Z",
      };

      const state = deriveStudentAssignmentState(baseAssignment, "student-1", [studentSub], []);
      expect(state.hasSubmitted).toBe(true);
      expect(state.progress).toBe(100);
      expect(state.status).toBe("Completed");
      expect(state.grade).toBe(95);
      expect(state.feedback).toBe("Excellent work!");
    });
  });

  describe("calculateRoleCourseMetrics", () => {
    it("student metrics use student personal submission state", () => {
      const course: Course = {
        id: "c-1",
        user_id: "teacher-1",
        name: "Physics 101",
        code: "PHY101",
        color: "#8B5CF6",
        instructor: "Dr. Smith",
        description: null,
        join_code: "PHY123",
        is_archived: false,
        created_at: "2026-10-01T00:00:00Z",
        updated_at: "2026-10-01T00:00:00Z",
      };

      const courseAssignments = [
        {
          id: "a-1",
          user_id: "teacher-1",
          course_id: "c-1",
          title: "Lab 1",
          status: "Completed" as const, // Teacher status is Completed
          progress: 100,
          priority: "Medium" as const,
          due_date: "2026-10-25",
          due_time: "23:59:00",
          created_at: "2026-10-01T00:00:00Z",
          updated_at: "2026-10-01T00:00:00Z",
          submissions: [
            {
              id: "s-1",
              assignment_id: "a-1",
              student_id: "student-1",
              status: "In Progress" as const,
              progress: 25,
              submission_text: null,
              submission_note: null,
              submitted_at: null,
              grade: null,
              feedback: null,
              created_at: "2026-10-02T00:00:00Z",
              updated_at: "2026-10-02T00:00:00Z",
            },
          ],
        },
      ];

      const [studentCourse] = calculateRoleCourseMetrics({
        courses: [course],
        assignments: courseAssignments as any,
        userRole: "student",
        userId: "student-1",
      });
      // For student-1, the assignment is in progress, NOT completed
      expect(studentCourse.completed_count).toBe(0);
      expect(studentCourse.completion_percentage).toBe(0);

      const [teacherCourse] = calculateRoleCourseMetrics({
        courses: [course],
        assignments: courseAssignments as any,
        userRole: "teacher",
        userId: "teacher-1",
      });
      // For teacher-1, master assignment is completed
      expect(teacherCourse.completed_count).toBe(1);
      expect(teacherCourse.completion_percentage).toBe(100);
    });
  });
});

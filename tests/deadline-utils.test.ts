import { describe, it, expect } from "vitest";
import {
  parseAssignmentDeadline,
  getDeadlineInfo,
  getUrgencyLevel,
} from "@/lib/deadline-utils";

describe("Authoritative Deadline & Timezone Utilities", () => {
  describe("parseAssignmentDeadline", () => {
    it("parses date string with explicit time using local wall clock", () => {
      const parsed = parseAssignmentDeadline("2026-10-15", "14:30:00");
      expect(parsed).not.toBeNull();
      expect(parsed.getFullYear()).toBe(2026);
      expect(parsed.getMonth()).toBe(9); // 0-indexed: October is 9
      expect(parsed.getDate()).toBe(15);
      expect(parsed.getHours()).toBe(14);
      expect(parsed.getMinutes()).toBe(30);
    });

    it("defaults to 23:59:00 if due_time is not provided", () => {
      const parsed = parseAssignmentDeadline("2026-10-15", null);
      expect(parsed).not.toBeNull();
      expect(parsed.getFullYear()).toBe(2026);
      expect(parsed.getMonth()).toBe(9);
      expect(parsed.getDate()).toBe(15);
      expect(parsed.getHours()).toBe(23);
      expect(parsed.getMinutes()).toBe(59);
      expect(parsed.getSeconds()).toBe(0);
    });
  });

  describe("getDeadlineInfo logic", () => {
    it("correctly identifies due today BEFORE deadline", () => {
      // Reference time: 2026-10-15 10:00:00
      const refTime = new Date(2026, 9, 15, 10, 0, 0);
      const info = getDeadlineInfo("2026-10-15", "17:00:00", "Not Started", "en", refTime);

      expect(info.isOverdue).toBe(false);
      expect(info.isDueToday).toBe(true);
      expect(info.isDueTomorrow).toBe(false);
      expect(info.daysRemaining).toBe(0);
    });

    it("correctly identifies due today AFTER deadline as overdue", () => {
      // Reference time: 2026-10-15 18:00:00, deadline was 17:00:00
      const refTime = new Date(2026, 9, 15, 18, 0, 0);
      const info = getDeadlineInfo("2026-10-15", "17:00:00", "Not Started", "en", refTime);

      expect(info.isOverdue).toBe(true);
      // Crucial invariant: overdue assignments cannot masquerade as due today
      expect(info.isDueToday).toBe(false);
      expect(info.urgencyLevel).toBe("critical");
    });

    it("correctly identifies overdue yesterday", () => {
      // Reference time: 2026-10-16 10:00:00, deadline was 2026-10-15 23:59:00
      const refTime = new Date(2026, 9, 16, 10, 0, 0);
      const info = getDeadlineInfo("2026-10-15", null, "Not Started", "en", refTime);

      expect(info.isOverdue).toBe(true);
      expect(info.isDueToday).toBe(false);
      expect(info.isDueTomorrow).toBe(false);
      expect(info.daysRemaining).toBe(-1);
    });

    it("correctly identifies overdue multiple days", () => {
      // Reference time: 2026-10-20, deadline was 2026-10-15
      const refTime = new Date(2026, 9, 20, 10, 0, 0);
      const info = getDeadlineInfo("2026-10-15", "12:00:00", "Not Started", "en", refTime);

      expect(info.isOverdue).toBe(true);
      expect(info.daysRemaining).toBe(-5);
    });

    it("correctly identifies due tomorrow", () => {
      // Reference time: 2026-10-15 10:00:00, deadline: 2026-10-16
      const refTime = new Date(2026, 9, 15, 10, 0, 0);
      const info = getDeadlineInfo("2026-10-16", "23:59:00", "Not Started", "en", refTime);

      expect(info.isOverdue).toBe(false);
      expect(info.isDueToday).toBe(false);
      expect(info.isDueTomorrow).toBe(true);
      expect(info.daysRemaining).toBe(1);
    });

    it("completed assignment is never treated as overdue", () => {
      // Reference time: after deadline
      const refTime = new Date(2026, 10, 1, 10, 0, 0);
      const info = getDeadlineInfo("2026-10-15", "17:00:00", "Completed", "en", refTime);

      expect(info.isOverdue).toBe(false);
      expect(info.urgencyLevel).toBe("completed");
    });
  });

  describe("getUrgencyLevel", () => {
    it("returns 'critical' for past uncompleted deadlines", () => {
      const refTime = new Date(2026, 9, 20);
      expect(getUrgencyLevel("2026-10-15", "12:00:00", "Not Started", refTime)).toBe("critical");
    });

    it("returns 'high' for deadlines today before the hour", () => {
      const refTime = new Date(2026, 9, 15, 9, 0, 0);
      expect(getUrgencyLevel("2026-10-15", "18:00:00", "Not Started", refTime)).toBe("high");
    });

    it("returns 'completed' when status is Completed regardless of date", () => {
      const refTime = new Date(2026, 9, 20);
      expect(getUrgencyLevel("2026-10-15", "12:00:00", "Completed", refTime)).toBe("completed");
    });
  });
});

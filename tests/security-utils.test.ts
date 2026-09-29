import { describe, it, expect } from "vitest";
import { sanitizeRedirectUrl } from "@/lib/utils";

describe("Security Utilities", () => {
  describe("sanitizeRedirectUrl", () => {
    it("allows valid internal relative paths", () => {
      expect(sanitizeRedirectUrl("/dashboard")).toBe("/dashboard");
      expect(sanitizeRedirectUrl("/courses/c-123")).toBe("/courses/c-123");
      expect(sanitizeRedirectUrl("/assignments?status=In%20Progress")).toBe(
        "/assignments?status=In%20Progress"
      );
    });

    it("defaults to /dashboard for empty or null input", () => {
      expect(sanitizeRedirectUrl(null)).toBe("/dashboard");
      expect(sanitizeRedirectUrl("")).toBe("/dashboard");
      expect(sanitizeRedirectUrl(undefined)).toBe("/dashboard");
    });

    it("rejects open redirect attacks with external protocols or schemas", () => {
      expect(sanitizeRedirectUrl("https://evil.attacker.com")).toBe("/dashboard");
      expect(sanitizeRedirectUrl("http://evil.attacker.com")).toBe("/dashboard");
      expect(sanitizeRedirectUrl("//evil.attacker.com")).toBe("/dashboard");
      expect(sanitizeRedirectUrl("javascript:alert(1)")).toBe("/dashboard");
      expect(sanitizeRedirectUrl("data:text/html,<script>alert(1)</script>")).toBe(
        "/dashboard"
      );
    });
  });
});

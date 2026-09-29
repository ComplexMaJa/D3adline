import { describe, it, expect } from "vitest";
import {
  validateDeliverableFile,
  MAX_FILE_SIZE_BYTES,
  BLOCKED_EXTENSIONS,
} from "@/lib/file-validation";

describe("File Validation & Storage Security", () => {
  it("allows valid student deliverable files within 25 MB", () => {
    const validPdf = { name: "research-paper.pdf", size: 5 * 1024 * 1024 };
    const res = validateDeliverableFile(validPdf);
    expect(res.valid).toBe(true);
    expect(res.sanitizedName).toBe("research-paper.pdf");
    expect(res.extension).toBe("pdf");
  });

  it("blocks files exceeding the 25 MB limit", () => {
    const hugeFile = { name: "huge-dataset.zip", size: MAX_FILE_SIZE_BYTES + 100 };
    const res = validateDeliverableFile(hugeFile);
    expect(res.valid).toBe(false);
    expect(res.error).toContain("25 MB");
  });

  it("blocks zero-byte empty files", () => {
    const emptyFile = { name: "empty.txt", size: 0 };
    const res = validateDeliverableFile(emptyFile);
    expect(res.valid).toBe(false);
    expect(res.error).toBeDefined();
  });

  it("blocks dangerous executable file formats", () => {
    for (const ext of ["exe", "bat", "cmd", "sh", "msi", "vbs", "ps1"]) {
      const execFile = { name: `malicious_script.${ext}`, size: 1024 };
      const res = validateDeliverableFile(execFile);
      expect(res.valid).toBe(false);
      expect(res.error?.toLowerCase()).toContain("executable");
    }
  });

  it("prevents directory traversal attacks in filenames", () => {
    const traversalFile = {
      name: "../../../etc/passwd.pdf",
      size: 1024,
    };
    const res = validateDeliverableFile(traversalFile);
    expect(res.valid).toBe(true);
    expect(res.sanitizedName).not.toContain("../");
    expect(res.sanitizedName).not.toContain("..\\");
    expect(res.sanitizedName).toBe("passwd.pdf");
  });

  it("sanitizes unsafe characters in filename", () => {
    const weirdFile = {
      name: "my assignment (version 1) & notes [final]!.docx",
      size: 2048,
    };
    const res = validateDeliverableFile(weirdFile);
    expect(res.valid).toBe(true);
    expect(res.sanitizedName).toMatch(/^[a-zA-Z0-9_\-\.]+\.docx$/);
  });
});

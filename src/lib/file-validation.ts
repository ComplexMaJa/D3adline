/**
 * File validation and storage sanitization utilities
 */

export const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

export const BLOCKED_EXTENSIONS = new Set([
  "exe",
  "bat",
  "cmd",
  "sh",
  "msi",
  "vbs",
  "scr",
  "com",
  "pif",
  "dll",
  "so",
  "dylib",
  "ps1",
  "vbe",
  "wsf",
  "hta",
  "cpl",
  "jar",
  "reg",
]);

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  sanitizedName?: string;
  extension?: string;
}

/**
 * Validates file size, extension, and produces a safe sanitized filename.
 * Prevents directory traversal attacks (../, ..\, etc.) and unsafe characters.
 */
export function validateDeliverableFile(
  file: { name: string; size: number; type?: string },
  language: "en" | "id" = "en"
): FileValidationResult {
  const isId = language === "id";

  if (!file || !file.name) {
    return {
      valid: false,
      error: isId ? "Berkas tidak valid." : "Invalid file.",
    };
  }

  // 1. Check file size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: isId
        ? "Ukuran berkas melebihi batas maksimum 25 MB."
        : "File size exceeds the 25 MB maximum limit.",
    };
  }

  if (file.size <= 0) {
    return {
      valid: false,
      error: isId ? "Berkas kosong tidak dapat diunggah." : "Empty files cannot be uploaded.",
    };
  }

  // 2. Extract and check extension
  const rawName = file.name.trim();
  // Strip path characters to prevent traversal attacks
  const baseName = rawName.replace(/^.*[\\/]/, "");
  const dotIndex = baseName.lastIndexOf(".");

  if (dotIndex === -1 || dotIndex === baseName.length - 1) {
    return {
      valid: false,
      error: isId
        ? "Berkas harus memiliki ekstensi yang valid (mis. .pdf, .docx, .zip)."
        : "File must have a valid file extension (e.g. .pdf, .docx, .zip).",
    };
  }

  const ext = baseName.slice(dotIndex + 1).toLowerCase();

  if (BLOCKED_EXTENSIONS.has(ext)) {
    return {
      valid: false,
      error: isId
        ? `Tipe berkas executable (.${ext}) tidak diizinkan demi keamanan.`
        : `Executable file type (.${ext}) is blocked for security reasons.`,
    };
  }

  // 3. Sanitize filename: replace spaces, punctuation, special chars
  const nameWithoutExt = baseName.slice(0, dotIndex);
  const sanitizedBase = nameWithoutExt
    .replace(/[^a-zA-Z0-9_\-\.]/g, "_")
    .replace(/_{2,}/g, "_")
    .slice(0, 80);

  const finalName = `${sanitizedBase || "file"}.${ext}`;

  return {
    valid: true,
    sanitizedName: finalName,
    extension: ext,
  };
}

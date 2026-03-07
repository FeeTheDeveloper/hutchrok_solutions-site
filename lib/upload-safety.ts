/**
 * File upload safety utilities.
 *
 * Server-side validation of file content independent of client-provided
 * MIME type. Checks magic bytes (file signatures) to confirm actual
 * file type matches the claimed MIME type.
 */

// ── Magic byte signatures for allowed types ──

const FILE_SIGNATURES: { mime: string; bytes: number[]; offset?: number }[] = [
  // PDF: starts with %PDF
  { mime: "application/pdf", bytes: [0x25, 0x50, 0x44, 0x46] },
  // JPEG: starts with FF D8 FF
  { mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  // PNG: starts with 89 50 4E 47 0D 0A 1A 0A
  { mime: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
];

/**
 * Detect actual file type from content bytes, independent of client-provided MIME.
 * Returns the matched MIME type or null if unrecognized.
 */
export function detectMimeFromBytes(data: Uint8Array): string | null {
  for (const sig of FILE_SIGNATURES) {
    const offset = sig.offset ?? 0;
    if (data.length < offset + sig.bytes.length) continue;
    const match = sig.bytes.every((b, i) => data[offset + i] === b);
    if (match) return sig.mime;
  }
  return null;
}

/**
 * Validate that a file's actual content matches its claimed MIME type.
 * Returns an error message if invalid, or null if OK.
 */
export function validateFileContent(
  data: Uint8Array,
  claimedMime: string,
): string | null {
  const actualMime = detectMimeFromBytes(data);

  if (!actualMime) {
    return "File content does not match any allowed type (PDF, JPG, PNG).";
  }

  if (actualMime !== claimedMime) {
    return `File content is ${actualMime} but was submitted as ${claimedMime}.`;
  }

  return null;
}

// ── Filename safety ──

/** Allowed file extensions (lowercase, with dot) */
const SAFE_EXTENSIONS = new Set([".pdf", ".jpg", ".jpeg", ".png"]);

/**
 * Sanitize a filename for safe storage.
 * - Strips path traversal characters
 * - Replaces unsafe characters
 * - Validates extension against whitelist
 * Returns the safe filename or null if the extension is not allowed.
 */
export function sanitizeFilename(filename: string): string | null {
  // Strip any path components
  const basename = filename.split(/[/\\]/).pop() || filename;

  // Replace unsafe characters
  const safe = basename.replace(/[^a-zA-Z0-9._-]/g, "_");

  // Check extension
  const dotIndex = safe.lastIndexOf(".");
  if (dotIndex === -1) return null;

  const ext = safe.slice(dotIndex).toLowerCase();
  if (!SAFE_EXTENSIONS.has(ext)) return null;

  return safe;
}

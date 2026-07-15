const HTML_TAG_PATTERN = /<[^>]*>/g;
const CONTROL_CHARS_PATTERN = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/** Strips HTML tags, control characters, and normalizes whitespace for user-generated text. */
export function sanitizePlainText(value: string, maxLength?: number): string {
  let sanitized = value
    .replace(HTML_TAG_PATTERN, "")
    .replace(CONTROL_CHARS_PATTERN, "")
    .replace(/\s+/g, " ")
    .trim();

  if (maxLength !== undefined && sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }

  return sanitized;
}

/** Returns trimmed sanitized text or null when empty after sanitization. */
export function sanitizeOptionalText(value: string | null | undefined, maxLength?: number): string | null {
  if (typeof value !== "string") return null;
  const sanitized = sanitizePlainText(value, maxLength);
  return sanitized.length > 0 ? sanitized : null;
}

/** Validates email shape after trimming; returns null when invalid. */
export function sanitizeEmail(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().toLowerCase();
  if (trimmed.length === 0 || trimmed.length > 254) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return null;
  return trimmed;
}

/** Client-safe form helpers shared by server actions and client upload components. */

import { sanitizeOptionalText, sanitizePlainText } from "@/lib/security/sanitize";

export function optionalString(formData: FormData, key: string, maxLength?: number): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  return sanitizeOptionalText(value, maxLength);
}

export function requiredString(formData: FormData, key: string, maxLength?: number): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const sanitized = sanitizePlainText(value, maxLength);
  return sanitized.length > 0 ? sanitized : null;
}

export function optionalNumber(formData: FormData, key: string): number | null {
  const value = optionalString(formData, key);
  if (value === null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

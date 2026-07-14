/**
 * Deterministic time parsing/formatting shared by the converter engine.
 * Recipe forms store brew/bloom times as free text like `"3:30"` (see
 * `app/components/recipes/recipe-form.tsx`), so we parse defensively and
 * fall back to `null` for anything we can't confidently read.
 */

/** Parses `"M:SS"`, `"H:MM:SS"`, or a plain number of seconds into total seconds. Returns `null` if `value` is missing/unparseable. */
export function parseTimeToSeconds(value: string | null | undefined): number | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (/^\d+(\.\d+)?$/.test(trimmed)) {
    return Math.round(Number(trimmed));
  }

  const parts = trimmed.split(":").map((part) => Number(part.trim()));
  if (parts.length < 2 || parts.length > 3 || parts.some((part) => Number.isNaN(part))) {
    return null;
  }

  return parts.reduce((totalSeconds, part) => totalSeconds * 60 + part, 0);
}

/** Formats total seconds as `"M:SS"` (or `"H:MM:SS"` past one hour, e.g. cold brew steeps). */
export function formatSecondsAsTime(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

/** Formats long steeps (cold brew) as `"12h"` / `"8h 30m"` instead of a clock-style timestamp. */
export function formatSecondsAsDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds));
  if (seconds < 3600) {
    return formatSecondsAsTime(seconds);
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Position of `value` within `[min, max]`, normalized to 0-1 and clamped -- used to proportionally map a value from one method's range into another's. */
export function normalizePosition(value: number, min: number, max: number): number {
  if (max === min) return 0.5;
  return clamp((value - min) / (max - min), 0, 1);
}

/** Inverse of `normalizePosition`: maps a 0-1 position back into `[min, max]`. */
export function denormalizePosition(position: number, min: number, max: number): number {
  return min + clamp(position, 0, 1) * (max - min);
}

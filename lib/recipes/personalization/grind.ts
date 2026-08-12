/**
 * Relative grind personalization — never invents absolute grinder settings.
 */

export const MIN_GRIND_OFFSET = -2;
export const MAX_GRIND_OFFSET = 2;

export function clampGrindOffset(value: number | null | undefined): number {
  if (value == null || !Number.isFinite(value)) return 0;
  return Math.min(MAX_GRIND_OFFSET, Math.max(MIN_GRIND_OFFSET, Math.round(value)));
}

/** Human-readable grind label relative to the official recommendation. */
export function grindLabelForOffset(
  officialGrind: string | null | undefined,
  offset: number,
): string | null {
  const base = officialGrind?.trim() || null;
  const clamped = clampGrindOffset(offset);
  if (clamped === 0) return base;

  const relative =
    clamped <= -2
      ? "much finer than recommended"
      : clamped === -1
        ? "finer than recommended"
        : clamped === 1
          ? "coarser than recommended"
          : "much coarser than recommended";

  return base ? `${base} · ${relative}` : relative;
}

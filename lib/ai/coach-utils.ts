import type { CoachMetricKey, CoachMetricStatus } from "@/types/coach";

/**
 * Small pure helpers shared by `lib/ai/coach-engine.ts` (scoring) and
 * `lib/ai/coach-messages.ts` (copy generation) -- split out purely to
 * avoid a circular import between those two files.
 */

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

export const METRIC_LABELS: Record<CoachMetricKey, string> = {
  brewRatio: "Brew Ratio",
  extraction: "Extraction",
  grindSize: "Grind Size",
  bloom: "Bloom",
  waterTemperature: "Water Temperature",
  pouringStructure: "Pouring Structure",
  brewTime: "Brew Time",
  agitation: "Agitation",
  strength: "Strength",
  clarity: "Clarity",
  sweetness: "Sweetness",
  acidity: "Acidity",
  bitterness: "Bitterness",
  body: "Body",
  balance: "Balance",
};

/**
 * Two-sided score: 100 inside `range`, decreasing the further outside it
 * a value falls. `softness` scales how forgiving the drop-off is,
 * relative to the range's own span (e.g. `0.5` means falling one full
 * range-width outside costs 100 points).
 */
export function scoreWithinRange(value: number, range: [number, number], softness: number): number {
  const [min, max] = range;
  if (value >= min && value <= max) return 100;
  const span = Math.max(max - min, 0.001);
  const distance = value < min ? min - value : value - max;
  return clamp(100 - (distance / (span * softness)) * 100, 0, 100);
}

/** One-sided score: 100 at or below `max`, decreasing above it. Used where only the upper tail is a flaw (bitterness, flavor imbalance). */
export function scoreCeiling(value: number, max: number, softness: number): number {
  if (value <= max) return 100;
  return clamp(100 - ((value - max) / (max * softness)) * 100, 0, 100);
}

export function statusFromScore(score: number | null): CoachMetricStatus {
  if (score === null) return "unknown";
  if (score >= 85) return "excellent";
  if (score >= 70) return "good";
  if (score >= 50) return "needs_attention";
  return "poor";
}

const GRIND_SCALE_LABELS = ["Extra Fine", "Fine", "Medium-Fine", "Medium", "Medium-Coarse", "Coarse", "Extra Coarse"];

export function grindRangeLabel(range: [number, number]): string {
  const [min, max] = range;
  const from = GRIND_SCALE_LABELS[clamp(Math.round(min), 1, 7) - 1];
  const to = GRIND_SCALE_LABELS[clamp(Math.round(max), 1, 7) - 1];
  return from === to ? from : `${from} to ${to}`;
}

export function formatSeconds(seconds: number): string {
  if (seconds >= 3600) return `${round1(seconds / 3600)} hr`;
  if (seconds >= 60) return `${Math.floor(seconds / 60)}:${String(Math.round(seconds % 60)).padStart(2, "0")}`;
  return `${Math.round(seconds)}s`;
}

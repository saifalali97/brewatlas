import { clamp } from "@/lib/converter/time";
import type { GrindResult } from "@/lib/converter/types";

/**
 * Normalized 0 (finest) - 10 (coarsest) grind scale the engine uses
 * internally to convert grind size between brew methods. Bands match the
 * free-text labels already used by the recipe form/DB (`Fine`,
 * `Medium-Fine`, ...), so parsing existing recipe data and displaying
 * engine output both round-trip through the same vocabulary.
 */
const GRIND_BANDS: Array<{ maxIndex: number; label: string }> = [
  { maxIndex: 1, label: "Extra Fine" },
  { maxIndex: 3, label: "Fine" },
  { maxIndex: 4.5, label: "Medium-Fine" },
  { maxIndex: 5.5, label: "Medium" },
  { maxIndex: 7, label: "Medium-Coarse" },
  { maxIndex: 9, label: "Coarse" },
  { maxIndex: 10, label: "Extra Coarse" },
];

/** Illustrative micron estimate for a grind index -- linear 200-1200µm across the 0-10 scale. Not a lab measurement, just enough to make the UI feel concrete. */
export function grindIndexToMicrons(index: number): number {
  const clamped = clamp(index, 0, 10);
  return Math.round(200 + clamped * 100);
}

export function grindIndexToLabel(index: number): string {
  const clamped = clamp(index, 0, 10);
  const band = GRIND_BANDS.find((candidate) => clamped <= candidate.maxIndex);
  return band?.label ?? "Medium";
}

export function grindIndexToResult(index: number): GrindResult {
  const clamped = clamp(index, 0, 10);
  const label = grindIndexToLabel(clamped);
  const microns = grindIndexToMicrons(clamped);
  return { index: Math.round(clamped * 10) / 10, label, microns, display: `${label} (~${microns}µm)` };
}

/** Best-effort keyword match from free-text grind size (e.g. from a recipe's `grind_size` field) to a grind index. Returns `fallback` if nothing matches. */
export function parseGrindLabel(value: string | null | undefined, fallback: number): number {
  if (!value) return fallback;
  const normalized = value.trim().toLowerCase();

  if (normalized.includes("extra fine") || normalized.includes("extra-fine")) return 0.5;
  if (normalized.includes("medium-fine") || normalized.includes("medium fine")) return 3.75;
  if (normalized.includes("medium-coarse") || normalized.includes("medium coarse")) return 6.25;
  if (normalized.includes("extra coarse") || normalized.includes("extra-coarse")) return 9.5;
  if (normalized.includes("fine")) return 2;
  if (normalized.includes("medium")) return 5;
  if (normalized.includes("coarse")) return 8;

  return fallback;
}

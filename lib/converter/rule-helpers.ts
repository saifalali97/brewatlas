import { clamp, denormalizePosition, normalizePosition } from "@/lib/converter/time";
import type { BrewMethodProfile, DeviceComputationResult, NumericRange, PourStage } from "@/lib/converter/types";

/**
 * Shared plumbing every device rule module builds on top of. None of this
 * decides *how* a device reacts to a source recipe or a preference --
 * that's each device's own `computeTarget` in `lib/converter/rules/`. This
 * file only provides the generic math/formatting every one of those
 * modules would otherwise have to reimplement.
 */

/** Carries a value's relative position inside `sourceRange` over into the equivalent position inside `targetRange` (e.g. "75% of the way from fine to coarse" on one device becomes the same 75% position on another). */
export function mapRange(value: number, sourceRange: NumericRange, targetRange: NumericRange): number {
  const position = normalizePosition(value, sourceRange.min, sourceRange.max);
  return denormalizePosition(position, targetRange.min, targetRange.max);
}

export function clampToRange(value: number, range: NumericRange): number {
  return clamp(value, range.min, range.max);
}

/** Formats a coffee:water ratio as `"16"` or `"9.5"` -- whole numbers drop the decimal, everything else keeps one. */
export function formatRatio(ratio: number): string {
  const rounded = Math.round(ratio * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded}` : rounded.toFixed(1);
}

const ABSOLUTE_RATIO_RANGE: NumericRange = { min: 1, max: 20, default: 16 };

/**
 * Final safety net (Phase 17.3 requirement #5): clamps every dimension of
 * a device's raw computed result into that device's own realistic
 * envelope, on top of whatever clamping the device rule already did
 * internally. Also enforces the two cross-field constraints no single
 * range can express on its own: bloom water can never exceed total water,
 * and ratio never drifts outside an absolute sane bound even if a
 * device's own profile were ever misconfigured.
 */
export function applySafetyLimits(
  raw: DeviceComputationResult,
  profile: BrewMethodProfile,
  doseG: number,
): DeviceComputationResult {
  const ratio = clampToRange(clampToRange(raw.ratio, profile.ratio), ABSOLUTE_RATIO_RANGE);
  const waterG = doseG * ratio;

  const bloomGrams =
    raw.bloomGrams === null || !profile.supportsBloom
      ? null
      : Math.min(Math.max(0, Math.round(raw.bloomGrams)), Math.round(waterG * 0.9));

  const bloomTimeSeconds = bloomGrams === null ? null : Math.max(10, Math.round(raw.bloomTimeSeconds ?? profile.defaultBloomTimeSeconds));

  return {
    ratio,
    grindIndex: clampToRange(raw.grindIndex, profile.grind),
    temperatureC: clampToRange(raw.temperatureC, profile.temperatureC),
    brewTimeSeconds: Math.round(clampToRange(raw.brewTimeSeconds, profile.brewTimeSeconds)),
    bloomGrams,
    bloomTimeSeconds,
    poursCount: profile.supportsPours ? Math.max(0, Math.round(raw.poursCount)) : 0,
    pourStyle: raw.pourStyle,
  };
}

/**
 * Turns a device's bloom/pour decision into a concrete, timed water
 * schedule. The *decisions* (whether to bloom, how many pours, how they're
 * spaced) are each device's own; this just lays them out on a timeline.
 */
export function buildPourStages(params: {
  waterGrams: number;
  bloomGrams: number | null;
  bloomTimeSeconds: number | null;
  mainPoursCount: number;
  totalBrewTimeSeconds: number;
}): PourStage[] {
  const stages: PourStage[] = [];
  let remainingWater = params.waterGrams;
  let elapsed = 0;

  if (params.bloomGrams !== null && params.bloomTimeSeconds !== null && params.bloomGrams > 0) {
    stages.push({ label: "bloom", waterGrams: Math.round(params.bloomGrams), atSeconds: 0 });
    remainingWater = Math.max(0, params.waterGrams - params.bloomGrams);
    elapsed = params.bloomTimeSeconds;
  }

  if (params.mainPoursCount <= 0) {
    if (remainingWater > 0) {
      stages.push({ label: "pour", waterGrams: Math.round(remainingWater), atSeconds: Math.round(elapsed) });
    }
    return stages;
  }

  const perPourWater = remainingWater / params.mainPoursCount;
  const remainingTime = Math.max(0, params.totalBrewTimeSeconds - elapsed);
  const interval = remainingTime / (params.mainPoursCount + 1);

  for (let i = 0; i < params.mainPoursCount; i += 1) {
    elapsed += interval;
    stages.push({ label: "pour", waterGrams: Math.round(perPourWater), atSeconds: Math.round(elapsed) });
  }

  return stages;
}

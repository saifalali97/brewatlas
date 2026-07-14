import { BREW_METHOD_PROFILES } from "@/lib/converter/brew-profiles";
import { grindIndexToResult, parseGrindLabel } from "@/lib/converter/grind-scale";
import { resolveBrewMethod } from "@/lib/converter/resolve-brew-method";
import {
  clamp,
  denormalizePosition,
  formatSecondsAsDuration,
  normalizePosition,
  parseTimeToSeconds,
} from "@/lib/converter/time";
import type { BrewMethodProfile, ConversionInput, ConversionResult } from "@/lib/converter/types";

const MIN_DOSE_G = 5;
const MAX_DOSE_G = 60;

/**
 * Converts a recipe from one brew method to another using deterministic
 * extraction rules (Phase 17.2 -- see `lib/converter/brew-profiles.ts` for
 * the per-method numbers this is built on). No AI, no randomness: the same
 * input always produces the same output.
 *
 * Coffee dose is preserved as-is (converting devices doesn't change how
 * much coffee you have); every other field is recalculated to match the
 * target method's ideal extraction window, nudged by the user's
 * preserve-body/sweetness/acidity preferences.
 */
export function convertRecipe(input: ConversionInput): ConversionResult {
  const sourceMethod = resolveBrewMethod(input.sourceMethod);
  const targetMethod = resolveBrewMethod(input.targetMethod);
  const source = BREW_METHOD_PROFILES[sourceMethod];
  const target = BREW_METHOD_PROFILES[targetMethod];

  if (!source || !target) {
    return { supported: false, reason: "unsupported-method" };
  }

  const { preferences } = input;

  const doseG = clamp(input.doseG ?? target.defaultDoseG, MIN_DOSE_G, MAX_DOSE_G);

  const ratio = resolveTargetRatio(target, preferences);
  const waterG = Math.round(doseG * ratio);

  const sourceGrindIndex = clamp(
    parseGrindLabel(input.grindSize, source.grind.default),
    source.grind.min,
    source.grind.max,
  );
  const grind = resolveTargetGrind(source, target, sourceGrindIndex, preferences);

  const sourceTemperatureC = clamp(input.temperatureC ?? source.temperatureC.default, source.temperatureC.min, source.temperatureC.max);
  const temperatureC = resolveTargetTemperature(source, target, sourceTemperatureC, preferences);

  const sourceBrewTimeSeconds = parseTimeToSeconds(input.brewTime) ?? source.brewTimeSeconds.default;
  const brewTimeSeconds = resolveTargetBrewTime(source, target, sourceBrewTimeSeconds, preferences);

  const bloom = resolveTargetBloom(target, doseG, preferences);
  const pours = resolveTargetPours(target);

  return {
    supported: true,
    sourceMethod,
    targetMethod,
    targetCategory: target.category,
    dose: { grams: doseG, display: `${doseG}g` },
    water: { grams: waterG, display: `${waterG}g` },
    grindSize: grindIndexToResult(grind),
    temperature: { celsius: Math.round(temperatureC * 2) / 2, display: `${Math.round(temperatureC)}°C` },
    bloom,
    brewTime: { seconds: brewTimeSeconds, display: formatSecondsAsDuration(brewTimeSeconds) },
    pours,
  };
}

function resolveTargetRatio(
  target: BrewMethodProfile,
  preferences: ConversionInput["preferences"],
): number {
  let ratio = target.ratio.default;

  // Stronger (lower) ratio reads as more body; lighter (higher) ratio lets acidity/delicate notes shine through.
  if (preferences.preserveBody) {
    ratio = (target.ratio.min + ratio) / 2;
  }
  if (preferences.preserveAcidity) {
    ratio = (ratio + target.ratio.max) / 2;
  }

  return clamp(ratio, target.ratio.min, target.ratio.max);
}

function resolveTargetGrind(
  source: BrewMethodProfile,
  target: BrewMethodProfile,
  sourceGrindIndex: number,
  preferences: ConversionInput["preferences"],
): number {
  const position = normalizePosition(sourceGrindIndex, source.grind.min, source.grind.max);
  let grind = denormalizePosition(position, target.grind.min, target.grind.max);

  // Finer grind extracts more (fuller body); slightly coarser reduces bitterness so acidity stands out.
  if (preferences.preserveBody) grind -= 0.4;
  if (preferences.preserveAcidity) grind += 0.3;

  return clamp(grind, target.grind.min, target.grind.max);
}

function resolveTargetTemperature(
  source: BrewMethodProfile,
  target: BrewMethodProfile,
  sourceTemperatureC: number,
  preferences: ConversionInput["preferences"],
): number {
  // Cold brew's temperature is a fixed ambient/cold steep, not something preferences should nudge.
  if (target.category === "coldBrew") {
    return target.temperatureC.default;
  }

  const position = normalizePosition(sourceTemperatureC, source.temperatureC.min, source.temperatureC.max);
  let temperatureC = denormalizePosition(position, target.temperatureC.min, target.temperatureC.max);

  if (preferences.preserveAcidity) temperatureC -= 2;
  if (preferences.preserveBody) temperatureC += 1.5;

  return clamp(temperatureC, target.temperatureC.min, target.temperatureC.max);
}

function resolveTargetBrewTime(
  source: BrewMethodProfile,
  target: BrewMethodProfile,
  sourceBrewTimeSeconds: number,
  preferences: ConversionInput["preferences"],
): number {
  // Proportional scaling only makes sense within the same brewing style; across styles (e.g. pour-over -> cold
  // brew) fall back to the target's own standard time rather than a meaningless scaled-up/down number.
  let brewTimeSeconds =
    source.category === target.category
      ? denormalizePosition(
          normalizePosition(sourceBrewTimeSeconds, source.brewTimeSeconds.min, source.brewTimeSeconds.max),
          target.brewTimeSeconds.min,
          target.brewTimeSeconds.max,
        )
      : target.brewTimeSeconds.default;

  if (preferences.preserveBody) brewTimeSeconds *= 1.08;
  if (preferences.preserveAcidity) brewTimeSeconds *= 0.92;

  return Math.round(clamp(brewTimeSeconds, target.brewTimeSeconds.min, target.brewTimeSeconds.max));
}

function resolveTargetBloom(
  target: BrewMethodProfile,
  doseG: number,
  preferences: ConversionInput["preferences"],
): { grams: number | null; timeSeconds: number | null; display: string } {
  if (!target.supportsBloom) {
    return { grams: null, timeSeconds: null, display: "N/A" };
  }

  const grams = Math.round(doseG * target.bloomMultiplier);
  // A slightly longer bloom lets CO2 escape more evenly, which favors sweeter extraction.
  const timeSeconds = target.defaultBloomTimeSeconds + (preferences.preserveSweetness ? 10 : 0);

  return { grams, timeSeconds, display: `${grams}g / ${timeSeconds}s` };
}

function resolveTargetPours(target: BrewMethodProfile): { count: number; display: string } {
  if (!target.supportsPours) {
    return { count: 0, display: target.category === "coldBrew" ? "Single steep" : "Single pour" };
  }

  const count = target.defaultPoursCount;
  return { count, display: `${count} pours` };
}

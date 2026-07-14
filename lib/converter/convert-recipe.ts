import { DEVICE_RULES } from "@/lib/converter/rules";
import { applySafetyLimits, buildPourStages, clampToRange } from "@/lib/converter/rule-helpers";
import { grindIndexToResult, parseGrindLabel } from "@/lib/converter/grind-scale";
import { resolveBrewMethod } from "@/lib/converter/resolve-brew-method";
import { formatSecondsAsDuration, parseTimeToSeconds } from "@/lib/converter/time";
import type { ConversionInput, ConversionResult, DeviceComputationContext } from "@/lib/converter/types";

const MIN_DOSE_G = 5;
const MAX_DOSE_G = 60;

/**
 * Converts a recipe from one brew method to another using each target
 * device's own rule module (`lib/converter/rules/`, Phase 17.3). No AI, no
 * randomness: the same input always produces the same output.
 *
 * This function is intentionally thin -- it only resolves method names,
 * builds the shared `DeviceComputationContext` from whatever source
 * numbers are available (falling back to the source device's own
 * profile), hands it to the target device's `computeTarget`, and clamps
 * the result through `applySafetyLimits`. Every actual brewing decision
 * lives in the per-device rule module, not here.
 */
export function convertRecipe(input: ConversionInput): ConversionResult {
  const sourceMethod = resolveBrewMethod(input.sourceMethod);
  const targetMethod = resolveBrewMethod(input.targetMethod);
  const sourceRule = DEVICE_RULES[sourceMethod];
  const targetRule = DEVICE_RULES[targetMethod];

  if (!sourceRule || !targetRule) {
    return { supported: false, reason: "unsupported-method" };
  }

  const sourceProfile = sourceRule.profile;
  const doseG = clampToRange(input.doseG ?? targetRule.profile.defaultDoseG, { min: MIN_DOSE_G, max: MAX_DOSE_G, default: targetRule.profile.defaultDoseG });

  const context: DeviceComputationContext = {
    doseG,
    sourceGrindIndex: clampToRange(parseGrindLabel(input.grindSize, sourceProfile.grind.default), sourceProfile.grind),
    sourceCategory: sourceProfile.category,
    sourceProfile,
    sourceTemperatureC: clampToRange(input.temperatureC ?? sourceProfile.temperatureC.default, sourceProfile.temperatureC),
    sourceBrewTimeSeconds: parseTimeToSeconds(input.brewTime) ?? sourceProfile.brewTimeSeconds.default,
    preferences: input.preferences,
  };

  const raw = targetRule.computeTarget(context);
  const result = applySafetyLimits(raw, targetRule.profile, doseG);

  const waterG = Math.round(doseG * result.ratio);
  const pourStages = buildPourStages({
    waterGrams: waterG,
    bloomGrams: result.bloomGrams,
    bloomTimeSeconds: result.bloomTimeSeconds,
    mainPoursCount: result.poursCount,
    totalBrewTimeSeconds: result.brewTimeSeconds,
  });

  const bloomDisplay =
    result.bloomGrams === null || result.bloomTimeSeconds === null
      ? "N/A"
      : `${result.bloomGrams}g / ${result.bloomTimeSeconds}s`;

  const poursDisplay =
    result.poursCount > 0
      ? `${result.poursCount} pours`
      : targetRule.profile.category === "coldBrew"
        ? "Single steep"
        : targetRule.profile.category === "pressurized"
          ? "Continuous flow"
          : "Single pour";

  return {
    supported: true,
    sourceMethod,
    targetMethod,
    targetCategory: targetRule.profile.category,
    dose: { grams: doseG, display: `${doseG}g` },
    water: { grams: waterG, ratio: Math.round(result.ratio * 10) / 10, display: `${waterG}g` },
    grindSize: grindIndexToResult(result.grindIndex),
    temperature: { celsius: Math.round(result.temperatureC * 2) / 2, display: `${Math.round(result.temperatureC)}°C` },
    bloom: { grams: result.bloomGrams, timeSeconds: result.bloomTimeSeconds, display: bloomDisplay },
    brewTime: { seconds: result.brewTimeSeconds, display: formatSecondsAsDuration(result.brewTimeSeconds) },
    pours: {
      count: result.poursCount,
      style: result.pourStyle,
      stages: pourStages,
      display: poursDisplay,
    },
  };
}

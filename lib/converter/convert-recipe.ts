import { grindIndexToResult, parseGrindLabel } from "@/lib/converter/grind-scale";
import {
  buildFieldInsight,
  computeConfidence,
  computeWarnings,
  isMeaningfulChange,
  reasonForBloomField,
  reasonForGeneralField,
} from "@/lib/converter/insights";
import { resolveBrewMethod } from "@/lib/converter/resolve-brew-method";
import { applySafetyLimits, buildPourStages, clampToRange, formatRatio } from "@/lib/converter/rule-helpers";
import { DEVICE_RULES } from "@/lib/converter/rules";
import { formatSecondsAsDuration, parseTimeToSeconds } from "@/lib/converter/time";
import type { ConversionInput, ConversionResult, DeviceComputationContext } from "@/lib/converter/types";

const MIN_DOSE_G = 5;
const MAX_DOSE_G = 60;

/**
 * Converts a recipe from one brew method to another using each target
 * device's own rule module (`lib/converter/rules/`, Phase 17.3), then
 * explains the result (Phase 18): which fields actually changed from the
 * source recipe, why, how confident the recommendation is, and whether
 * any realistic extraction limit had to step in. No AI, no randomness --
 * the same input always produces the same output.
 *
 * This function stays thin -- it only resolves method names, builds the
 * shared `DeviceComputationContext`, hands it to the target device's
 * `computeTarget`, clamps the result through `applySafetyLimits`, and
 * then diffs before/after to build the explainability layer. Every
 * actual brewing decision lives in the per-device rule module, not here.
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
  const targetProfile = targetRule.profile;

  const requestedDoseG = input.doseG ?? targetProfile.defaultDoseG;
  const doseG = clampToRange(requestedDoseG, { min: MIN_DOSE_G, max: MAX_DOSE_G, default: targetProfile.defaultDoseG });

  const context: DeviceComputationContext = {
    doseG,
    sourceGrindIndex: clampToRange(parseGrindLabel(input.grindSize, sourceProfile.grind.default), sourceProfile.grind),
    sourceCategory: sourceProfile.category,
    sourceProfile,
    sourceTemperatureC: clampToRange(input.temperatureC ?? sourceProfile.temperatureC.default, sourceProfile.temperatureC),
    sourceBrewTimeSeconds: parseTimeToSeconds(input.brewTime) ?? sourceProfile.brewTimeSeconds.default,
    preferences: input.preferences,
  };

  // What the source recipe's own bloom/pour count would be, purely for the "did this change" comparison below --
  // the target device's rule module never reads these, it decides bloom/pours on its own brewing logic.
  const sourceBloomGrams = input.bloomAmountG ?? (sourceProfile.supportsBloom ? doseG * sourceProfile.bloomMultiplier : null);
  const sourceBloomTimeSeconds =
    parseTimeToSeconds(input.bloomTime) ?? (sourceProfile.supportsBloom ? sourceProfile.defaultBloomTimeSeconds : null);
  const sourcePoursCount = input.poursCount ?? sourceProfile.defaultPoursCount;
  const sourceRatio = input.waterG && input.doseG ? input.waterG / input.doseG : sourceProfile.ratio.default;

  const raw = targetRule.computeTarget(context);
  const result = applySafetyLimits(raw, targetProfile, doseG);

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
      : targetProfile.category === "coldBrew"
        ? "Single steep"
        : targetProfile.category === "pressurized"
          ? "Continuous flow"
          : "Single pour";

  // -- Phase 18: explainability (confidence, warnings, per-field insights) --

  const categoryChanged = sourceProfile.category !== targetProfile.category;
  const conflictingPreferences = input.preferences.preserveBody && input.preferences.preserveAcidity;
  const missingSourceDataCount = [input.doseG, input.grindSize, input.temperatureC, input.brewTime].filter(
    (value) => value === null || value === undefined,
  ).length;

  const ratioClamped = Math.abs(raw.ratio - result.ratio) > 0.05;
  const grindClamped = Math.abs(raw.grindIndex - result.grindIndex) > 0.05;
  const temperatureClamped = Math.abs(raw.temperatureC - result.temperatureC) > 0.1;
  const brewTimeClamped = Math.abs(raw.brewTimeSeconds - result.brewTimeSeconds) > 1;
  const bloomCapped =
    raw.bloomGrams !== null && result.bloomGrams !== null && Math.abs(raw.bloomGrams - result.bloomGrams) > 0.5;

  const warnings = computeWarnings({
    categoryChanged,
    conflictingPreferences,
    ratioClamped,
    grindClamped,
    temperatureClamped,
    brewTimeClamped,
    bloomCapped,
  });

  const confidence = computeConfidence({
    categoryChanged,
    anyClamped: ratioClamped || grindClamped || temperatureClamped || brewTimeClamped || bloomCapped,
    conflictingPreferences,
    missingSourceDataCount,
  });

  const generalReason = reasonForGeneralField(input.preferences, categoryChanged);
  const bloomReason = reasonForBloomField(input.preferences, categoryChanged);

  const doseChanged = isMeaningfulChange(requestedDoseG, doseG, 1);
  const waterChanged = isMeaningfulChange(sourceRatio, result.ratio, 0.5);
  const grindChanged = isMeaningfulChange(context.sourceGrindIndex, result.grindIndex, 0.3);
  const temperatureChanged = isMeaningfulChange(context.sourceTemperatureC, result.temperatureC, 1);
  const brewTimeChanged = isMeaningfulChange(context.sourceBrewTimeSeconds, result.brewTimeSeconds, 10);
  const poursChanged = sourcePoursCount !== result.poursCount;
  const bloomChanged =
    (sourceBloomGrams === null) !== (result.bloomGrams === null) ||
    (sourceBloomGrams !== null &&
      result.bloomGrams !== null &&
      (isMeaningfulChange(sourceBloomGrams, result.bloomGrams, 3) ||
        isMeaningfulChange(sourceBloomTimeSeconds ?? 0, result.bloomTimeSeconds ?? 0, 5)));

  const sourceBloomDisplay =
    sourceBloomGrams === null || sourceBloomTimeSeconds === null ? "N/A" : `${Math.round(sourceBloomGrams)}g / ${sourceBloomTimeSeconds}s`;

  const insights = {
    dose: buildFieldInsight(doseChanged, "targetDeviceProfile", `${Math.round(requestedDoseG)}g`),
    water: buildFieldInsight(
      waterChanged,
      generalReason,
      `${Math.round(doseG * sourceRatio)}g (1:${formatRatio(sourceRatio)})`,
    ),
    grindSize: buildFieldInsight(grindChanged, generalReason, grindIndexToResult(context.sourceGrindIndex).display),
    temperature: buildFieldInsight(temperatureChanged, generalReason, `${Math.round(context.sourceTemperatureC)}°C`),
    bloom: buildFieldInsight(bloomChanged, bloomReason, sourceBloomDisplay),
    pours: buildFieldInsight(poursChanged, generalReason, `${sourcePoursCount}`),
    brewTime: buildFieldInsight(brewTimeChanged, generalReason, formatSecondsAsDuration(context.sourceBrewTimeSeconds)),
  };

  return {
    supported: true,
    sourceMethod,
    targetMethod,
    targetCategory: targetProfile.category,
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
    confidence,
    warnings,
    insights,
  };
}

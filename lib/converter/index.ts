/**
 * Universal Recipe Converter engine (Phase 17.2 base engine, Phase 17.3
 * smart device rules) -- deterministic, AI-free brew method conversion.
 */
export { convertRecipe } from "@/lib/converter/convert-recipe";
export { grindIndexToLabel, grindIndexToMicrons, grindIndexToResult, parseGrindLabel } from "@/lib/converter/grind-scale";
export { applySafetyLimits, buildPourStages, clampToRange, mapRange } from "@/lib/converter/rule-helpers";
export { DEVICE_RULES } from "@/lib/converter/rules";
export { resolveBrewMethod } from "@/lib/converter/resolve-brew-method";
export { formatSecondsAsDuration, formatSecondsAsTime, parseTimeToSeconds } from "@/lib/converter/time";
export type {
  BrewCategory,
  BrewMethodId,
  BrewMethodProfile,
  ConversionFailure,
  ConversionInput,
  ConversionPreferences,
  ConversionResult,
  ConversionSuccess,
  DeviceComputationContext,
  DeviceComputationResult,
  DeviceRule,
  GrindResult,
  NumericRange,
  PourStage,
  PourStyle,
} from "@/lib/converter/types";

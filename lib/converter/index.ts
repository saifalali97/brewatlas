/**
 * Universal Recipe Converter engine (Phase 17.2 base engine, Phase 17.3
 * smart device rules, Phase 18 explainability layer) -- deterministic,
 * AI-free brew method conversion.
 */
export { convertRecipe } from "@/lib/converter/convert-recipe";
export { grindIndexToLabel, grindIndexToMicrons, grindIndexToResult, parseGrindLabel } from "@/lib/converter/grind-scale";
export {
  computeConfidence,
  computeWarnings,
  isMeaningfulChange,
  reasonForBloomField,
  reasonForGeneralField,
} from "@/lib/converter/insights";
export { applySafetyLimits, buildPourStages, clampToRange, formatRatio, mapRange } from "@/lib/converter/rule-helpers";
export { DEVICE_RULES } from "@/lib/converter/rules";
export { resolveBrewMethod } from "@/lib/converter/resolve-brew-method";
export { formatSecondsAsDuration, formatSecondsAsTime, parseTimeToSeconds } from "@/lib/converter/time";
export type {
  BrewCategory,
  BrewMethodId,
  BrewMethodProfile,
  ChangeReasonCode,
  ConfidenceLevel,
  ConversionFailure,
  ConversionInput,
  ConversionInsights,
  ConversionPreferences,
  ConversionResult,
  ConversionSuccess,
  ConversionWarningCode,
  DeviceComputationContext,
  DeviceComputationResult,
  DeviceRule,
  FieldInsight,
  GrindResult,
  NumericRange,
  PourStage,
  PourStyle,
} from "@/lib/converter/types";

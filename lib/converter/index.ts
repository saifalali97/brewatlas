/** Universal Recipe Converter engine (Phase 17.2) -- deterministic, AI-free brew method conversion. */
export { BREW_METHOD_PROFILES } from "@/lib/converter/brew-profiles";
export { convertRecipe } from "@/lib/converter/convert-recipe";
export { grindIndexToLabel, grindIndexToMicrons, grindIndexToResult, parseGrindLabel } from "@/lib/converter/grind-scale";
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
  GrindResult,
  NumericRange,
} from "@/lib/converter/types";

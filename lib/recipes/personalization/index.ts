/**
 * BrewAtlas Recipe Personalization Engine / Dynamic Recipe System.
 *
 * Converts an official recipe into an in-memory personalized brew snapshot.
 * Dose, ratio, and hot/iced flash brew update live — official recipes stay immutable.
 */

export { personalizeBrewSnapshot } from "@/lib/recipes/personalization/apply";
export {
  brewSnapshotFromDbRecipe,
  brewSnapshotFromPlaceholder,
  displayBloom,
  displayDose,
  displayIce,
  displayTemperature,
  displayWater,
  poursForUi,
} from "@/lib/recipes/personalization/adapters";
export {
  buildDynamicBrewSnapshot,
  calculateBeverageWaterG,
  calculateFlashSplit,
  DOSE_PRESETS_G,
  DYNAMIC_BREW_METHODS,
  extractRatioDenominator,
  extractionGuidance,
  extractionGuidanceLabels,
  methodLabel,
  parseBrewMethodLabel,
  RATIO_PRESETS,
} from "@/lib/recipes/personalization/dynamic-brew";
export {
  calculateTotalWaterG,
  DEFAULT_PERSONALIZATION_CONFIG,
  extractRatioDenominator as extractOfficialRatioDenominator,
  inferOfficialRatio,
  personalizeBrewSnapshot as personalizeBrewSnapshotEngine,
  roundBrewValue,
  scalePoursProportionally,
  splitHotAndIce,
  validatePersonalizationInputs,
} from "@/lib/recipes/personalization/engine";
export {
  buildPourGramReplacements,
  rewriteBrewNoteGrams,
  rewriteScaledPourNotes,
} from "@/lib/recipes/personalization/scale-notes";
export { personalizationConfigFromRecipe } from "@/lib/recipes/personalization/config";
export {
  formatBeverageRatio,
  formatCelsius,
  formatGrams,
  parseBloom,
  parseFirstNumber,
  parseHotAndIce,
} from "@/lib/recipes/personalization/parse";
export {
  baselinePourCount,
  buildPoursForCount,
  clampPourCount,
  countNumericPours,
  DEFAULT_DERIVED_POUR_COUNT,
  distributeBrewWater,
  MAX_POUR_COUNT,
  MIN_POUR_COUNT,
} from "@/lib/recipes/personalization/pours";
export {
  clampTemperatureC,
  temperatureBoundsForRecipe,
  type TemperatureBounds,
} from "@/lib/recipes/personalization/temperature";
export {
  clampGrindOffset,
  grindLabelForOffset,
  MAX_GRIND_OFFSET,
  MIN_GRIND_OFFSET,
} from "@/lib/recipes/personalization/grind";
export {
  calculateTasteDirection,
  type TasteDirectionResult,
  type TasteMetric,
  type TasteMetricKey,
} from "@/lib/recipes/personalization/taste-direction";
export {
  cloneSnapshot,
  convertServingStyle,
  FLASH_HOT_WATER_FRACTION,
  waterAmountDisplay,
} from "@/lib/recipes/personalization/serving-style";
export type {
  BrewSnapshot,
  DynamicBrewMethod,
  PersonalizationAdjustments,
  PersonalizationConfig,
  PersonalizationCopy,
  PersonalizationResult,
  PersonalizedEquipmentItem,
  PersonalizedPour,
  RecipeServingStyle,
} from "@/lib/recipes/personalization/types";

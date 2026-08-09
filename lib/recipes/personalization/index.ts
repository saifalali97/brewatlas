/**
 * BrewAtlas Recipe Personalization Engine / Dynamic Recipe System.
 *
 * Converts an official recipe into an in-memory personalized brew snapshot.
 * Dose, ratio, brew method, and hot/iced flash brew update live.
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
  methodLabel,
  parseBrewMethodLabel,
  RATIO_PRESETS,
} from "@/lib/recipes/personalization/dynamic-brew";
export {
  formatBeverageRatio,
  formatCelsius,
  formatGrams,
  parseBloom,
  parseFirstNumber,
  parseHotAndIce,
} from "@/lib/recipes/personalization/parse";
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
  PersonalizationCopy,
  PersonalizationResult,
  PersonalizedEquipmentItem,
  PersonalizedPour,
  RecipeServingStyle,
} from "@/lib/recipes/personalization/types";

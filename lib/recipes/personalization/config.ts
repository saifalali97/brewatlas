import {
  DEFAULT_PERSONALIZATION_CONFIG,
} from "@/lib/recipes/personalization/engine";
import type { PersonalizationConfig } from "@/lib/recipes/personalization/types";
import type { RecipeFullDetail } from "@/types/recipe";

function clampPercent(value: number | null | undefined): number {
  if (value == null || !Number.isFinite(value)) {
    return DEFAULT_PERSONALIZATION_CONFIG.icedWaterPercentage;
  }
  return Math.min(100, Math.max(0, value));
}

/** Resolve personalization policy from a DB recipe (safe defaults when unset). */
export function personalizationConfigFromRecipe(
  recipe: Pick<
    RecipeFullDetail,
    | "personalizationEnabled"
    | "personalizationHotSupported"
    | "personalizationIcedSupported"
    | "personalizationIcedWaterPercentage"
    | "personalizationDoseScalable"
    | "personalizationRatioScalable"
    | "personalizationPoursScalable"
  >,
): PersonalizationConfig {
  return {
    enabled: recipe.personalizationEnabled ?? DEFAULT_PERSONALIZATION_CONFIG.enabled,
    hotSupported: recipe.personalizationHotSupported ?? DEFAULT_PERSONALIZATION_CONFIG.hotSupported,
    icedSupported:
      recipe.personalizationIcedSupported ?? DEFAULT_PERSONALIZATION_CONFIG.icedSupported,
    icedWaterPercentage: clampPercent(recipe.personalizationIcedWaterPercentage),
    doseScalable: recipe.personalizationDoseScalable ?? DEFAULT_PERSONALIZATION_CONFIG.doseScalable,
    ratioScalable:
      recipe.personalizationRatioScalable ?? DEFAULT_PERSONALIZATION_CONFIG.ratioScalable,
    poursScalable:
      recipe.personalizationPoursScalable ?? DEFAULT_PERSONALIZATION_CONFIG.poursScalable,
    temperatureScalable: DEFAULT_PERSONALIZATION_CONFIG.temperatureScalable,
    grindScalable: DEFAULT_PERSONALIZATION_CONFIG.grindScalable,
  };
}

export { DEFAULT_PERSONALIZATION_CONFIG };

import type { UserBrewingSetup } from "@/types/brewing-setup";
import type { RecipeFullDetail } from "@/types/recipe";
import { getDefaultEquipmentItem } from "@/lib/data/brewing-setup";
import type { RecipeSetupCompatibility } from "@/types/brewing-setup";

export function evaluateRecipeSetupCompatibility(
  recipe: Pick<
    RecipeFullDetail,
    "deviceId" | "deviceName" | "grinderId" | "grinderName" | "filterTypeId" | "filterTypeName" | "waterProfileId" | "waterProfileName"
  >,
  setup: UserBrewingSetup | null,
): RecipeSetupCompatibility | null {
  if (!setup) return null;
  if (!setup.profile && setup.equipment.length === 0) return null;

  const warnings: string[] = [];
  const matches: string[] = [];
  let score = 0;

  const userBrewer = getDefaultEquipmentItem(setup, "brewer");
  const userGrinder = getDefaultEquipmentItem(setup, "grinder");
  const userFilter = getDefaultEquipmentItem(setup, "filter");
  const userWater = setup.profile?.preferredWaterProfileName ?? null;

  if (recipe.deviceId && userBrewer?.deviceId) {
    if (recipe.deviceId === userBrewer.deviceId) {
      matches.push(`Brewer: ${userBrewer.displayName}`);
      score += 3;
    } else {
      warnings.push(`Recipe calls for ${recipe.deviceName ?? "a different brewer"}; your default is ${userBrewer.displayName}.`);
    }
  } else if (recipe.deviceName && userBrewer) {
    matches.push(`Your brewer: ${userBrewer.displayName}`);
    score += 1;
  }

  if (recipe.grinderId && userGrinder?.grinderId) {
    if (recipe.grinderId === userGrinder.grinderId) {
      matches.push(`Grinder: ${userGrinder.displayName}`);
      score += 2;
    } else {
      warnings.push(`Recipe recommends ${recipe.grinderName ?? "another grinder"}; you use ${userGrinder.displayName}.`);
    }
  } else if (recipe.grinderName && userGrinder) {
    score += 1;
  }

  if (recipe.filterTypeId && userFilter?.filterTypeId) {
    if (recipe.filterTypeId === userFilter.filterTypeId) {
      matches.push(`Filter: ${userFilter.displayName}`);
      score += 1;
    } else {
      warnings.push(`Filter mismatch: recipe uses ${recipe.filterTypeName ?? "another filter"}.`);
    }
  }

  if (recipe.waterProfileId && setup.profile?.preferredWaterProfileId) {
    if (recipe.waterProfileId === setup.profile.preferredWaterProfileId) {
      matches.push(`Water: ${userWater ?? "matched profile"}`);
      score += 1;
    } else if (recipe.waterProfileName && userWater) {
      warnings.push(`Water profile differs (${recipe.waterProfileName} vs ${userWater}).`);
    }
  }

  const compatible = warnings.length === 0 && (matches.length > 0 || score > 0);
  const summary =
    matches.length > 0
      ? compatible
        ? "Compatible with your setup"
        : "Partially compatible with your setup"
      : userBrewer || userGrinder
        ? "Review equipment recommendations below"
        : "Add your equipment in My Coffee Setup for personalized checks";

  return {
    compatible,
    score,
    summary,
    recommendedGrinder: recipe.grinderName ?? userGrinder?.displayName ?? null,
    recommendedBrewer: recipe.deviceName ?? userBrewer?.displayName ?? null,
    warnings,
    matches,
  };
}

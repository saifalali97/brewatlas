import type { PlaceholderRecipeDetail } from "@/lib/gulf-directory/placeholder-recipe-types";
import {
  formatCelsius,
  formatGrams,
  parseBloom,
  parseFirstNumber,
  parseHotAndIce,
} from "@/lib/recipes/personalization/parse";
import { waterAmountDisplay } from "@/lib/recipes/personalization/serving-style";
import type {
  BrewSnapshot,
  PersonalizationCopy,
  PersonalizedPour,
} from "@/lib/recipes/personalization/types";
import type { PourRow, RecipeFullDetail } from "@/types/recipe";

function tipsFromText(value: string | null | undefined): string[] {
  if (!value?.trim()) return [];
  return value
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}

/** Maps a Gulf/placeholder recipe into the personalization brew snapshot. */
export function brewSnapshotFromPlaceholder(recipe: PlaceholderRecipeDetail): BrewSnapshot {
  const { hotWaterG, iceG } = parseHotAndIce(recipe.waterAmount);
  const bloom = parseBloom(recipe.bloom);
  const servingStyle = recipe.isIced || (iceG !== null && iceG > 0) ? "iced" : "hot";

  const pours: PersonalizedPour[] = recipe.steps.map((step) => {
    const amount = parseFirstNumber(step.waterAmount);
    const isNumericLabel = amount !== null && /^\s*\d/.test(step.waterAmount);
    return {
      id: step.id,
      pourNumber: step.pourNumber,
      waterAmountG: isNumericLabel ? amount : null,
      waterAmountLabel: step.waterAmount,
      timeLabel: step.timeLabel,
      notes: step.notes,
      atSeconds: step.atSeconds,
      durationSeconds: step.durationSeconds,
    };
  });

  return {
    servingStyle,
    coffeeDoseG: parseFirstNumber(recipe.dose),
    hotWaterG: servingStyle === "iced" ? hotWaterG : hotWaterG ?? parseFirstNumber(recipe.waterAmount),
    iceG: servingStyle === "iced" ? iceG : null,
    temperatureC: parseFirstNumber(recipe.temperature),
    temperatureLabel: recipe.temperature,
    ratioLabel: recipe.ratio,
    grindSize: recipe.grindSize,
    bloomAmountG: bloom.bloomAmountG,
    bloomTimeLabel: bloom.bloomTimeLabel,
    brewTimeLabel: recipe.brewTime,
    totalBrewTimeLabel: recipe.totalBrewTime,
    pours,
    equipment: recipe.equipment.map((item) => ({ ...item })),
    brewingTips: tipsFromText(recipe.brewingTips),
    extractionNotes: tipsFromText(recipe.extractionYield),
    waterProfileLabel: recipe.water,
  };
}

function poursFromDb(pours: PourRow[]): PersonalizedPour[] {
  return pours.map((pour, index) => ({
    id: pour.id,
    pourNumber: pour.pour_number,
    waterAmountG: pour.water_amount,
    waterAmountLabel:
      pour.water_amount !== null ? (formatGrams(pour.water_amount) ?? `${pour.water_amount} g`) : "—",
    timeLabel: pour.time_label ?? "",
    notes: pour.notes ?? "",
    atSeconds: index === 0 ? 0 : index * 40,
    durationSeconds: pour.duration_seconds ?? 40,
  }));
}

/** Maps a DB `RecipeFullDetail` into the personalization brew snapshot. */
export function brewSnapshotFromDbRecipe(recipe: RecipeFullDetail): BrewSnapshot {
  const servingStyle =
    recipe.servingStyle === "iced" || (recipe.iceAmount !== null && recipe.iceAmount > 0)
      ? "iced"
      : "hot";

  return {
    servingStyle,
    coffeeDoseG: recipe.coffeeDose,
    hotWaterG: recipe.waterAmount,
    iceG: recipe.iceAmount && recipe.iceAmount > 0 ? recipe.iceAmount : null,
    temperatureC: recipe.waterTemperature,
    temperatureLabel: formatCelsius(recipe.waterTemperature),
    ratioLabel: recipe.ratio,
    grindSize: recipe.grindSize,
    bloomAmountG: recipe.bloomAmount,
    bloomTimeLabel: recipe.bloomTime,
    brewTimeLabel: recipe.totalBrewTime ?? recipe.estimatedBrewTime,
    totalBrewTimeLabel: recipe.totalBrewTime ?? recipe.estimatedBrewTime,
    pours: poursFromDb(recipe.pours),
    equipment: [
      ...(recipe.deviceName ? [{ name: recipe.deviceName, detail: recipe.brewingMethodName ?? "" }] : []),
      ...(recipe.grinderName
        ? [{ name: recipe.grinderName, detail: recipe.grindSize ?? "" }]
        : []),
      ...(recipe.filterTypeName ? [{ name: recipe.filterTypeName, detail: "" }] : []),
    ],
    brewingTips: tipsFromText(recipe.equipmentNotes),
    extractionNotes: tipsFromText(recipe.finishNotes),
    waterProfileLabel: recipe.waterProfileName,
  };
}

/** Display helpers shared by recipe detail personalization panels. */
export function displayDose(snapshot: BrewSnapshot): string | null {
  return formatGrams(snapshot.coffeeDoseG);
}

export function displayWater(snapshot: BrewSnapshot, copy: PersonalizationCopy): string | null {
  return waterAmountDisplay(snapshot, copy);
}

export function displayTemperature(snapshot: BrewSnapshot): string | null {
  return snapshot.temperatureLabel ?? formatCelsius(snapshot.temperatureC);
}

export function displayBloom(snapshot: BrewSnapshot): string | null {
  if (snapshot.bloomAmountG === null && !snapshot.bloomTimeLabel) return null;
  const amount = formatGrams(snapshot.bloomAmountG);
  if (amount && snapshot.bloomTimeLabel) return `${amount} / ${snapshot.bloomTimeLabel}`;
  return amount ?? snapshot.bloomTimeLabel;
}

export function displayIce(snapshot: BrewSnapshot): string | null {
  return formatGrams(snapshot.iceG);
}

export function poursForUi(snapshot: BrewSnapshot) {
  return snapshot.pours.map((pour) => ({
    id: pour.id,
    pourNumber: pour.pourNumber,
    waterAmount: pour.waterAmountLabel,
    timeLabel: pour.timeLabel,
    notes: pour.notes,
    atSeconds: pour.atSeconds,
    durationSeconds: pour.durationSeconds,
  }));
}

import { formatBeverageRatio, formatCelsius, formatGrams } from "@/lib/recipes/personalization/parse";
import type {
  BrewSnapshot,
  PersonalizationCopy,
  PersonalizedPour,
  RecipeServingStyle,
} from "@/lib/recipes/personalization/types";

/**
 * Flash-brew split: of the original hot brew water, keep this fraction as
 * hot pour water and convert the remainder to ice in the server.
 * Matches BrewAtlas iced templates (~200 hot + 120 ice ≈ 62.5 / 37.5).
 */
export const FLASH_HOT_WATER_FRACTION = 0.625;

function roundGrams(value: number): number {
  return Math.max(0, Math.round(value));
}

function scalePourWater(
  pours: PersonalizedPour[],
  fromWaterG: number,
  toWaterG: number,
): PersonalizedPour[] {
  if (fromWaterG <= 0 || toWaterG <= 0 || fromWaterG === toWaterG) {
    return pours.map((pour) => ({ ...pour }));
  }

  const factor = toWaterG / fromWaterG;
  return pours.map((pour) => {
    if (pour.waterAmountG === null) return { ...pour };
    const next = roundGrams(pour.waterAmountG * factor);
    return {
      ...pour,
      waterAmountG: next,
      waterAmountLabel: formatGrams(next) ?? pour.waterAmountLabel,
    };
  });
}

function stripIcePrepPours(pours: PersonalizedPour[]): PersonalizedPour[] {
  return pours
    .filter((pour) => {
      const label = `${pour.waterAmountLabel} ${pour.notes}`.toLowerCase();
      const isPrepIce =
        label.includes("ice") &&
        (label.includes("prep") || pour.waterAmountLabel.toLowerCase() === "prep");
      const isSwirlFinish =
        pour.waterAmountLabel.toLowerCase() === "swirl" && label.includes("ice");
      return !isPrepIce && !isSwirlFinish;
    })
    .map((pour, index) => ({
      ...pour,
      id: pour.id.startsWith("pers-") ? pour.id : `pers-${pour.id}`,
      pourNumber: index + 1,
    }));
}

function buildFlashPours(
  official: BrewSnapshot,
  hotWaterG: number,
  iceG: number,
  copy: PersonalizationCopy,
): PersonalizedPour[] {
  const sourceWater = official.hotWaterG && official.hotWaterG > 0 ? official.hotWaterG : hotWaterG;
  const scaled = scalePourWater(stripIcePrepPours(official.pours), sourceWater, hotWaterG).filter(
    (pour) => pour.waterAmountG !== null || !/prep|swirl/i.test(pour.waterAmountLabel),
  );

  const prep: PersonalizedPour = {
    id: "pers-flash-prep",
    pourNumber: 1,
    waterAmountG: null,
    waterAmountLabel: "Prep",
    timeLabel: "Prep",
    notes: copy.flashPrepNotesTemplate.replace("{ice}", formatGrams(iceG) ?? `${iceG} g`),
    atSeconds: 0,
    durationSeconds: 20,
  };

  const numbered = scaled.map((pour, index) => ({
    ...pour,
    id: `pers-flash-${pour.id}`,
    pourNumber: index + 2,
    atSeconds: pour.atSeconds + 20,
  }));

  const last = numbered[numbered.length - 1];
  const swirlStart = last ? last.atSeconds + last.durationSeconds : 120;
  const swirl: PersonalizedPour = {
    id: "pers-flash-swirl",
    pourNumber: numbered.length + 2,
    waterAmountG: null,
    waterAmountLabel: "Swirl",
    timeLabel: "Finish",
    notes: copy.flashSwirlNotes,
    atSeconds: swirlStart,
    durationSeconds: 40,
  };

  return [prep, ...numbered, swirl];
}

function withFlashEquipment(
  equipment: BrewSnapshot["equipment"],
  iceG: number,
  copy: PersonalizationCopy,
): BrewSnapshot["equipment"] {
  const withoutIce = equipment.filter((item) => !/ice/i.test(item.name));
  return [
    ...withoutIce,
    {
      name: copy.iceEquipmentName,
      detail: copy.iceEquipmentDetailTemplate.replace("{ice}", formatGrams(iceG) ?? `${iceG} g`),
    },
  ];
}

function toHotFromIced(official: BrewSnapshot, copy: PersonalizationCopy): BrewSnapshot {
  const hotWaterG = official.hotWaterG;
  const iceG = official.iceG ?? 0;
  const total =
    hotWaterG !== null && iceG > 0
      ? hotWaterG + iceG
      : hotWaterG;

  const pours = scalePourWater(
    stripIcePrepPours(official.pours),
    hotWaterG && hotWaterG > 0 ? hotWaterG : total ?? 0,
    total ?? hotWaterG ?? 0,
  );

  return {
    ...official,
    servingStyle: "hot",
    hotWaterG: total,
    iceG: null,
    temperatureLabel: formatCelsius(official.temperatureC) ?? official.temperatureLabel?.replace(/\s*→\s*ice/i, "") ?? null,
    ratioLabel: formatBeverageRatio(official.coffeeDoseG, total) ?? official.ratioLabel,
    pours,
    equipment: official.equipment.filter((item) => !/ice/i.test(item.name)),
    brewingTips: [copy.hotTipRestore, ...official.brewingTips.filter((tip) => !/ice|flash/i.test(tip))],
    extractionNotes: [copy.hotExtractionNote],
    waterProfileLabel: official.waterProfileLabel,
  };
}

function toIcedFromHot(official: BrewSnapshot, copy: PersonalizationCopy): BrewSnapshot {
  const sourceWater = official.hotWaterG;
  if (sourceWater === null || sourceWater <= 0) {
    return {
      ...official,
      servingStyle: "iced",
      brewingTips: [copy.flashTipScale, ...official.brewingTips],
      extractionNotes: [copy.flashExtractionNote],
    };
  }

  const hotWaterG = roundGrams(sourceWater * FLASH_HOT_WATER_FRACTION);
  const iceG = Math.max(0, sourceWater - hotWaterG);
  const beverageG = hotWaterG + iceG;
  const tempLabel = official.temperatureC
    ? `${formatCelsius(official.temperatureC)} → ice`
    : official.temperatureLabel
      ? `${official.temperatureLabel.replace(/\s*→\s*ice/i, "")} → ice`
      : "Hot → ice";

  return {
    ...official,
    servingStyle: "iced",
    hotWaterG,
    iceG,
    temperatureLabel: tempLabel,
    ratioLabel: formatBeverageRatio(official.coffeeDoseG, beverageG) ?? official.ratioLabel,
    bloomAmountG:
      official.bloomAmountG !== null
        ? roundGrams(Math.min(official.bloomAmountG, hotWaterG * 0.25))
        : null,
    pours: buildFlashPours(official, hotWaterG, iceG, copy),
    equipment: withFlashEquipment(official.equipment, iceG, copy),
    brewingTips: [copy.flashTipScale, copy.flashTipChill, ...official.brewingTips],
    extractionNotes: [copy.flashExtractionNote],
    waterProfileLabel: copy.hotWaterLabel,
  };
}

/**
 * Converts an official brew snapshot to the requested serving style.
 * Returns the official snapshot unchanged when styles already match.
 */
export function convertServingStyle(
  official: BrewSnapshot,
  target: RecipeServingStyle,
  copy: PersonalizationCopy,
): BrewSnapshot {
  if (official.servingStyle === target) {
    return cloneSnapshot(official);
  }

  if (target === "iced") {
    return toIcedFromHot(official, copy);
  }

  return toHotFromIced(official, copy);
}

export function cloneSnapshot(snapshot: BrewSnapshot): BrewSnapshot {
  return {
    ...snapshot,
    rpm: snapshot.rpm ?? null,
    pours: snapshot.pours.map((pour) => ({ ...pour })),
    equipment: snapshot.equipment.map((item) => ({ ...item })),
    brewingTips: [...snapshot.brewingTips],
    extractionNotes: [...snapshot.extractionNotes],
  };
}

export function waterAmountDisplay(
  snapshot: BrewSnapshot,
  copy: PersonalizationCopy,
): string | null {
  if (snapshot.servingStyle === "iced" && snapshot.hotWaterG !== null && snapshot.iceG !== null) {
    const hot = formatGrams(snapshot.hotWaterG);
    const ice = formatGrams(snapshot.iceG);
    if (!hot || !ice) return null;
    return `${hot} ${copy.hotWaterLabel.toLowerCase()} + ${ice} ${copy.iceLabel.toLowerCase()}`;
  }
  return formatGrams(snapshot.hotWaterG);
}

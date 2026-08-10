/**
 * BrewAtlas Recipe Personalization Engine — core calculation.
 *
 * Official recipes stay immutable. All outputs are derived snapshots.
 * water = coffeeDose × brewRatio
 * Pours scale by original percentages; the last numeric pour absorbs rounding.
 */

import { formatBeverageRatio, formatGrams } from "@/lib/recipes/personalization/parse";
import { rewriteScaledPourNotes } from "@/lib/recipes/personalization/scale-notes";
import { cloneSnapshot } from "@/lib/recipes/personalization/serving-style";
import type {
  BrewSnapshot,
  PersonalizationAdjustments,
  PersonalizationConfig,
  PersonalizationCopy,
  PersonalizationResult,
  PersonalizedPour,
  RecipeServingStyle,
} from "@/lib/recipes/personalization/types";

export const DEFAULT_PERSONALIZATION_CONFIG: PersonalizationConfig = {
  enabled: true,
  hotSupported: true,
  icedSupported: true,
  /** Percent of total brew water that becomes ice in iced/flash mode. */
  icedWaterPercentage: 50,
  doseScalable: true,
  ratioScalable: true,
  poursScalable: true,
  temperatureScalable: false,
  grindScalable: false,
};

/** Round brew grams to one decimal without floating noise (112.5, not 112.499999). */
export function roundBrewValue(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 10) / 10;
}

export function calculateTotalWaterG(doseG: number, ratio: number): number {
  if (!(doseG > 0) || !(ratio > 0)) return 0;
  return roundBrewValue(doseG * ratio);
}

export function extractRatioDenominator(ratioLabel: string | null | undefined): number | null {
  if (!ratioLabel) return null;
  const match = ratioLabel.match(/1\s*:\s*(\d+(?:\.\d+)?)/i);
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) && value > 0 ? roundBrewValue(value) : null;
}

export function inferOfficialRatio(official: BrewSnapshot): number | null {
  const labeled = extractRatioDenominator(official.ratioLabel);
  if (labeled) return labeled;
  const dose = official.coffeeDoseG;
  const beverage =
    official.servingStyle === "iced" && official.hotWaterG != null
      ? official.hotWaterG + (official.iceG ?? 0)
      : official.hotWaterG;
  if (dose && dose > 0 && beverage && beverage > 0) {
    return roundBrewValue(beverage / dose);
  }
  return null;
}

export function validatePersonalizationInputs(input: {
  doseG: number;
  ratio: number;
  icedWaterPercentage: number;
}): { ok: true } | { ok: false; reason: string } {
  if (!(input.doseG > 0) || !Number.isFinite(input.doseG)) {
    return { ok: false, reason: "dose must be > 0" };
  }
  if (!(input.ratio > 0) || !Number.isFinite(input.ratio)) {
    return { ok: false, reason: "ratio must be > 0" };
  }
  if (
    !Number.isFinite(input.icedWaterPercentage) ||
    input.icedWaterPercentage < 0 ||
    input.icedWaterPercentage > 100
  ) {
    return { ok: false, reason: "icedWaterPercentage must be between 0 and 100" };
  }
  const total = calculateTotalWaterG(input.doseG, input.ratio);
  if (!(total > 0) || !Number.isFinite(total)) {
    return { ok: false, reason: "calculated water must be > 0" };
  }
  return { ok: true };
}

/**
 * Split total brew water into hot pour water + ice using icedWaterPercentage.
 * Ice percentage is of total beverage water; hot water is the remainder.
 * Rounding ensures hot + ice === total.
 */
export function splitHotAndIce(
  totalWaterG: number,
  icedWaterPercentage: number,
): { hotWaterG: number; iceG: number } {
  const total = roundBrewValue(totalWaterG);
  const icePct = Math.min(100, Math.max(0, icedWaterPercentage));
  const iceG = roundBrewValue((total * icePct) / 100);
  const hotWaterG = roundBrewValue(total - iceG);
  return { hotWaterG, iceG };
}

function sumNumericPours(pours: PersonalizedPour[]): number {
  return pours.reduce((sum, pour) => sum + (pour.waterAmountG ?? 0), 0);
}

/**
 * Scale numeric pour grams by original percentages.
 * Non-numeric pours (Prep / Swirl / Drawdown) keep labels/timing.
 * Last numeric pour absorbs rounding so totals match target exactly.
 */
export function scalePoursProportionally(
  pours: PersonalizedPour[],
  fromWaterG: number,
  toWaterG: number,
): PersonalizedPour[] {
  const target = roundBrewValue(toWaterG);
  const source = fromWaterG > 0 ? fromWaterG : sumNumericPours(pours);
  if (!(source > 0) || !(target >= 0)) {
    return pours.map((pour) => ({ ...pour }));
  }

  const numericIndexes = pours
    .map((pour, index) => (pour.waterAmountG !== null && pour.waterAmountG > 0 ? index : -1))
    .filter((index) => index >= 0);

  if (numericIndexes.length === 0) {
    return pours.map((pour) => ({ ...pour }));
  }

  const next = pours.map((pour) => ({ ...pour }));
  let allocated = 0;

  numericIndexes.forEach((index, order) => {
    const original = pours[index]!.waterAmountG!;
    const isLast = order === numericIndexes.length - 1;
    if (isLast) {
      const remainder = roundBrewValue(target - allocated);
      next[index] = {
        ...next[index]!,
        waterAmountG: Math.max(0, remainder),
        waterAmountLabel: formatGrams(Math.max(0, remainder)) ?? next[index]!.waterAmountLabel,
      };
      return;
    }
    const scaled = roundBrewValue((original / source) * target);
    allocated = roundBrewValue(allocated + scaled);
    next[index] = {
      ...next[index]!,
      waterAmountG: scaled,
      waterAmountLabel: formatGrams(scaled) ?? next[index]!.waterAmountLabel,
    };
  });

  // Keep instructional note text, but rewrite gram tags that match structured pour totals.
  return rewriteScaledPourNotes(pours, next);
}

function ensureIcePrepPours(
  pours: PersonalizedPour[],
  iceG: number,
  copy: PersonalizationCopy,
): PersonalizedPour[] {
  const hasPrep = pours.some((pour) => pour.waterAmountLabel.toLowerCase() === "prep");
  const hasSwirl = pours.some(
    (pour) =>
      pour.waterAmountLabel.toLowerCase() === "swirl" &&
      `${pour.notes}`.toLowerCase().includes("ice"),
  );

  const next = [...pours];
  if (!hasPrep) {
    next.unshift({
      id: "pers-flash-prep",
      pourNumber: 0,
      waterAmountG: null,
      waterAmountLabel: "Prep",
      timeLabel: "Prep",
      notes: copy.flashPrepNotesTemplate.replace("{ice}", formatGrams(iceG) ?? `${iceG} g`),
      atSeconds: 0,
      durationSeconds: 20,
    });
  }
  if (!hasSwirl) {
    next.push({
      id: "pers-flash-swirl",
      pourNumber: next.length + 1,
      waterAmountG: null,
      waterAmountLabel: "Swirl",
      timeLabel: "Finish",
      notes: copy.flashSwirlNotes,
      atSeconds: next[next.length - 1]?.atSeconds ?? 0,
      durationSeconds: 10,
    });
  }

  return next.map((pour, index) => ({ ...pour, pourNumber: index + 1 }));
}

function stripIceOnlyPours(pours: PersonalizedPour[]): PersonalizedPour[] {
  return pours
    .filter((pour) => {
      const label = `${pour.waterAmountLabel} ${pour.notes}`.toLowerCase();
      const isPrepIce =
        pour.waterAmountLabel.toLowerCase() === "prep" ||
        (label.includes("ice") && label.includes("prep"));
      const isSwirlIce =
        pour.waterAmountLabel.toLowerCase() === "swirl" && label.includes("ice");
      return !isPrepIce && !isSwirlIce;
    })
    .map((pour, index) => ({ ...pour, pourNumber: index + 1 }));
}

function officialPourWater(official: BrewSnapshot): number {
  const pourSum = sumNumericPours(official.pours);
  if (pourSum > 0) return pourSum;
  if (official.hotWaterG && official.hotWaterG > 0) return official.hotWaterG;
  if (official.servingStyle === "iced") {
    return (official.hotWaterG ?? 0) + (official.iceG ?? 0);
  }
  return 0;
}

function resolveStyle(
  official: BrewSnapshot,
  adjustments: PersonalizationAdjustments,
  config: PersonalizationConfig,
): RecipeServingStyle {
  const requested = adjustments.servingStyle ?? official.servingStyle;
  if (requested === "iced" && !config.icedSupported) return "hot";
  if (requested === "hot" && !config.hotSupported && config.icedSupported) return "iced";
  return requested;
}

function hasActiveAdjustments(
  official: BrewSnapshot,
  adjustments: PersonalizationAdjustments,
  doseG: number,
  ratio: number,
  style: RecipeServingStyle,
): boolean {
  const officialDose = official.coffeeDoseG;
  const officialRatio = inferOfficialRatio(official);
  // When the official recipe omits dose/ratio, compare against the same
  // engine fallbacks used for display — missing data must not look "dirty".
  const baselineDose =
    officialDose != null && officialDose > 0 ? officialDose : 20;
  const baselineRatio = officialRatio != null && officialRatio > 0 ? officialRatio : 15;
  if (style !== official.servingStyle) return true;
  if (roundBrewValue(doseG) !== roundBrewValue(baselineDose)) return true;
  if (roundBrewValue(ratio) !== roundBrewValue(baselineRatio)) return true;
  if (adjustments.brewTemperatureC !== undefined) return true;
  if (adjustments.grinderLabel !== undefined) return true;
  return false;
}

/**
 * Pure personalization entry point. Never mutates `official`.
 */
export function personalizeBrewSnapshot(
  official: BrewSnapshot,
  adjustments: PersonalizationAdjustments,
  copy: PersonalizationCopy,
  config: PersonalizationConfig = DEFAULT_PERSONALIZATION_CONFIG,
): PersonalizationResult {
  const base = cloneSnapshot(official);
  if (!config.enabled) {
    return {
      official: base,
      personalized: cloneSnapshot(official),
      adjustments: { servingStyle: official.servingStyle },
      isPersonalized: false,
      activeServingStyle: official.servingStyle,
    };
  }

  const style = resolveStyle(official, adjustments, config);
  const officialRatio = inferOfficialRatio(official) ?? 15;
  const doseG =
    config.doseScalable && adjustments.coffeeDoseG !== undefined && adjustments.coffeeDoseG > 0
      ? roundBrewValue(adjustments.coffeeDoseG)
      : official.coffeeDoseG && official.coffeeDoseG > 0
        ? official.coffeeDoseG
        : 20;
  const ratio =
    config.ratioScalable && adjustments.brewRatio !== undefined && adjustments.brewRatio > 0
      ? roundBrewValue(adjustments.brewRatio)
      : officialRatio;

  const validation = validatePersonalizationInputs({
    doseG,
    ratio,
    icedWaterPercentage: config.icedWaterPercentage,
  });
  if (!validation.ok) {
    return {
      official: base,
      personalized: cloneSnapshot(official),
      adjustments: { ...adjustments, servingStyle: style, coffeeDoseG: doseG, brewRatio: ratio },
      isPersonalized: false,
      activeServingStyle: style,
    };
  }

  const isPersonalized = hasActiveAdjustments(official, adjustments, doseG, ratio, style);
  if (!isPersonalized) {
    return {
      official: base,
      personalized: cloneSnapshot(official),
      adjustments: {
        ...adjustments,
        servingStyle: style,
        coffeeDoseG: doseG,
        brewRatio: ratio,
      },
      isPersonalized: false,
      activeServingStyle: style,
    };
  }

  const totalWaterG = calculateTotalWaterG(doseG, ratio);
  const iced = style === "iced";
  const split = iced
    ? splitHotAndIce(totalWaterG, config.icedWaterPercentage)
    : { hotWaterG: totalWaterG, iceG: 0 };

  const sourcePourWater = officialPourWater(official);
  let pours = stripIceOnlyPours(official.pours);

  if (config.poursScalable && sourcePourWater > 0) {
    pours = scalePoursProportionally(pours, sourcePourWater, split.hotWaterG);
  }

  if (iced) {
    pours = ensureIcePrepPours(pours, split.iceG, copy);
  }

  const bloomScale =
    sourcePourWater > 0 && official.bloomAmountG != null
      ? split.hotWaterG / sourcePourWater
      : doseG / (official.coffeeDoseG && official.coffeeDoseG > 0 ? official.coffeeDoseG : doseG);
  const bloomAmountG =
    official.bloomAmountG != null
      ? roundBrewValue(official.bloomAmountG * bloomScale)
      : null;

  const temperatureC =
    config.temperatureScalable && adjustments.brewTemperatureC !== undefined
      ? adjustments.brewTemperatureC
      : official.temperatureC;
  const grindSize =
    config.grindScalable && adjustments.grinderLabel
      ? adjustments.grinderLabel
      : official.grindSize;

  const styleChanged = style !== official.servingStyle;
  const equipment = official.equipment.map((item) => ({ ...item }));
  if (iced) {
    const iceDetail = copy.iceEquipmentDetailTemplate.replace(
      "{ice}",
      formatGrams(split.iceG) ?? `${split.iceG} g`,
    );
    if (!equipment.some((item) => item.name === copy.iceEquipmentName)) {
      equipment.push({ name: copy.iceEquipmentName, detail: iceDetail });
    }
  }

  const personalized: BrewSnapshot = {
    servingStyle: style,
    coffeeDoseG: doseG,
    hotWaterG: split.hotWaterG,
    iceG: iced ? split.iceG : null,
    temperatureC,
    temperatureLabel: iced
      ? temperatureC != null
        ? `${Math.round(temperatureC)}°C → ice`
        : official.temperatureLabel
      : styleChanged
        ? (official.temperatureLabel?.replace(/\s*→\s*ice/i, "") ??
          (temperatureC != null ? `${Math.round(temperatureC)}°C` : null))
        : official.temperatureLabel ??
          (temperatureC != null ? `${Math.round(temperatureC)}°C` : null),
    ratioLabel: formatBeverageRatio(doseG, totalWaterG),
    grindSize,
    bloomAmountG,
    bloomTimeLabel: official.bloomTimeLabel,
    brewTimeLabel: official.brewTimeLabel,
    totalBrewTimeLabel: official.totalBrewTimeLabel,
    pours,
    equipment,
    brewingTips: styleChanged
      ? [
          ...official.brewingTips,
          ...(iced ? [copy.flashTipScale, copy.flashTipChill] : [copy.hotTipRestore]),
        ]
      : [...official.brewingTips],
    extractionNotes: styleChanged
      ? [
          ...official.extractionNotes,
          iced ? copy.flashExtractionNote : copy.hotExtractionNote,
        ]
      : [...official.extractionNotes],
    waterProfileLabel: official.waterProfileLabel,
    rpm: official.rpm ?? null,
  };

  return {
    official: base,
    personalized,
    adjustments: {
      ...adjustments,
      servingStyle: style,
      coffeeDoseG: doseG,
      brewRatio: ratio,
    },
    isPersonalized: true,
    activeServingStyle: style,
  };
}

import {
  buildDynamicBrewSnapshot,
  extractRatioDenominator,
  parseBrewMethodLabel,
} from "@/lib/recipes/personalization/dynamic-brew";
import { formatBeverageRatio, formatGrams } from "@/lib/recipes/personalization/parse";
import { cloneSnapshot, convertServingStyle } from "@/lib/recipes/personalization/serving-style";
import type {
  BrewSnapshot,
  DynamicBrewMethod,
  PersonalizationAdjustments,
  PersonalizationCopy,
  PersonalizationResult,
} from "@/lib/recipes/personalization/types";

function hasActiveAdjustments(
  official: BrewSnapshot,
  adjustments: PersonalizationAdjustments,
): boolean {
  if (adjustments.servingStyle && adjustments.servingStyle !== official.servingStyle) return true;
  if (adjustments.brewMethod) {
    const officialMethod = parseBrewMethodLabel(official.equipment[0]?.name ?? null);
    if (adjustments.brewMethod !== officialMethod) return true;
  }
  if (adjustments.coffeeDoseG !== undefined) {
    if (official.coffeeDoseG == null || adjustments.coffeeDoseG !== official.coffeeDoseG) {
      return true;
    }
  }
  if (adjustments.brewRatio !== undefined) {
    const officialRatio = extractRatioDenominator(official.ratioLabel);
    if (officialRatio == null || adjustments.brewRatio !== officialRatio) return true;
  }
  if (adjustments.waterAmountG !== undefined) return true;
  if (adjustments.strength !== undefined && adjustments.strength !== 1) return true;
  if (adjustments.brewTemperatureC !== undefined) return true;
  if (adjustments.yieldG !== undefined) return true;
  if (adjustments.cups !== undefined) return true;
  if (adjustments.grinderLabel !== undefined) return true;
  return false;
}

/**
 * Applies future numeric knobs after serving-style conversion.
 * Keeps pours proportional when dose/water/strength change.
 */
function applyNumericAdjustments(
  snapshot: BrewSnapshot,
  adjustments: PersonalizationAdjustments,
): BrewSnapshot {
  const next = cloneSnapshot(snapshot);

  if (adjustments.grinderLabel) {
    next.grindSize = adjustments.grinderLabel;
  }

  if (adjustments.brewTemperatureC !== undefined) {
    next.temperatureC = adjustments.brewTemperatureC;
    next.temperatureLabel =
      next.servingStyle === "iced"
        ? `${Math.round(adjustments.brewTemperatureC)}°C → ice`
        : `${Math.round(adjustments.brewTemperatureC)}°C`;
  }

  const doseScale =
    adjustments.coffeeDoseG !== undefined && next.coffeeDoseG && next.coffeeDoseG > 0
      ? adjustments.coffeeDoseG / next.coffeeDoseG
      : 1;

  const strength = adjustments.strength && adjustments.strength > 0 ? adjustments.strength : 1;

  if (adjustments.coffeeDoseG !== undefined) {
    next.coffeeDoseG = adjustments.coffeeDoseG;
  }

  let waterScale = doseScale / strength;

  if (adjustments.waterAmountG !== undefined && next.hotWaterG && next.hotWaterG > 0) {
    waterScale = adjustments.waterAmountG / next.hotWaterG;
    next.hotWaterG = adjustments.waterAmountG;
  } else if (waterScale !== 1 && next.hotWaterG !== null) {
    next.hotWaterG = Math.round(next.hotWaterG * waterScale);
  }

  if (waterScale !== 1 && next.iceG !== null) {
    next.iceG = Math.round(next.iceG * waterScale);
  }

  if (waterScale !== 1 && next.bloomAmountG !== null) {
    next.bloomAmountG = Math.round(next.bloomAmountG * waterScale);
  }

  if (waterScale !== 1) {
    next.pours = next.pours.map((pour) => {
      if (pour.waterAmountG === null) return pour;
      const grams = Math.round(pour.waterAmountG * waterScale);
      return {
        ...pour,
        waterAmountG: grams,
        waterAmountLabel: formatGrams(grams) ?? pour.waterAmountLabel,
      };
    });
  }

  if (adjustments.yieldG !== undefined && next.coffeeDoseG) {
    const beverage =
      next.servingStyle === "iced" && next.hotWaterG !== null
        ? (next.hotWaterG ?? 0) + (next.iceG ?? 0)
        : next.hotWaterG;
    if (beverage && beverage > 0 && next.hotWaterG !== null) {
      const factor = adjustments.yieldG / beverage;
      next.hotWaterG = Math.round(next.hotWaterG * factor);
      if (next.iceG !== null) next.iceG = Math.round(next.iceG * factor);
    }
  }

  const beverageG =
    next.servingStyle === "iced" && next.hotWaterG !== null
      ? next.hotWaterG + (next.iceG ?? 0)
      : next.hotWaterG;
  next.ratioLabel = formatBeverageRatio(next.coffeeDoseG, beverageG) ?? next.ratioLabel;

  return next;
}

function resolveDoseG(official: BrewSnapshot, adjustments: PersonalizationAdjustments): number {
  if (adjustments.coffeeDoseG !== undefined) return adjustments.coffeeDoseG;
  return official.coffeeDoseG && official.coffeeDoseG > 0 ? official.coffeeDoseG : 20;
}

function resolveRatio(official: BrewSnapshot, adjustments: PersonalizationAdjustments): number {
  if (adjustments.brewRatio !== undefined) return adjustments.brewRatio;
  return extractRatioDenominator(official.ratioLabel) ?? 15;
}

function resolveMethod(
  official: BrewSnapshot,
  adjustments: PersonalizationAdjustments,
): DynamicBrewMethod {
  if (adjustments.brewMethod) return adjustments.brewMethod;
  return parseBrewMethodLabel(official.equipment[0]?.name ?? official.grindSize);
}

function shouldRebuildDynamic(
  official: BrewSnapshot,
  adjustments: PersonalizationAdjustments,
): boolean {
  const officialMethod = parseBrewMethodLabel(official.equipment[0]?.name ?? null);
  const officialRatio = extractRatioDenominator(official.ratioLabel);

  const methodChanged =
    adjustments.brewMethod !== undefined && adjustments.brewMethod !== officialMethod;
  const doseChanged =
    adjustments.coffeeDoseG !== undefined &&
    (official.coffeeDoseG == null || adjustments.coffeeDoseG !== official.coffeeDoseG);
  const ratioChanged =
    adjustments.brewRatio !== undefined &&
    (officialRatio == null || adjustments.brewRatio !== officialRatio);

  return methodChanged || doseChanged || ratioChanged;
}

/**
 * Pure personalization entry point. Never mutates `official`.
 */
export function personalizeBrewSnapshot(
  official: BrewSnapshot,
  adjustments: PersonalizationAdjustments,
  copy: PersonalizationCopy,
): PersonalizationResult {
  const activeServingStyle = adjustments.servingStyle ?? official.servingStyle;

  let personalized: BrewSnapshot;

  if (shouldRebuildDynamic(official, adjustments)) {
    personalized = buildDynamicBrewSnapshot({
      method: resolveMethod(official, adjustments),
      doseG: resolveDoseG(official, adjustments),
      ratio: resolveRatio(official, adjustments),
      servingStyle: activeServingStyle,
      grindOverride: adjustments.grinderLabel ?? official.grindSize,
      tempOverrideC: adjustments.brewTemperatureC ?? official.temperatureC,
    });
  } else {
    personalized = convertServingStyle(official, activeServingStyle, copy);
    personalized = applyNumericAdjustments(personalized, {
      ...adjustments,
      servingStyle: activeServingStyle,
    });
  }

  return {
    official: cloneSnapshot(official),
    personalized,
    adjustments: { ...adjustments, servingStyle: activeServingStyle },
    isPersonalized: hasActiveAdjustments(official, {
      ...adjustments,
      servingStyle: activeServingStyle,
    }),
    activeServingStyle,
  };
}

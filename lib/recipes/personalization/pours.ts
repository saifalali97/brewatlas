/**
 * Variable pour-count redistribution for the personalization engine.
 * Official pour arrays are never mutated — callers always receive new objects.
 */

import { formatGrams } from "@/lib/recipes/personalization/parse";
import type { BrewSnapshot, PersonalizedPour } from "@/lib/recipes/personalization/types";

export const MIN_POUR_COUNT = 1;
export const MAX_POUR_COUNT = 5;

function roundBrewValue(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.round(value * 10) / 10;
}

/** Default derived pour count when the official recipe has no structured pours. */
export const DEFAULT_DERIVED_POUR_COUNT = 3;

export function clampPourCount(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_DERIVED_POUR_COUNT;
  return Math.min(MAX_POUR_COUNT, Math.max(MIN_POUR_COUNT, Math.round(value)));
}

export function countNumericPours(pours: PersonalizedPour[]): number {
  return pours.filter((pour) => pour.waterAmountG != null && pour.waterAmountG > 0).length;
}

export function baselinePourCount(official: BrewSnapshot): number {
  const count = countNumericPours(official.pours);
  return count > 0 ? clampPourCount(count) : DEFAULT_DERIVED_POUR_COUNT;
}

/**
 * Split total brew water across N pours.
 * When a bloom amount is provided and count ≥ 2, pour 1 keeps the bloom and
 * the remainder is split evenly across the other pours (last absorbs rounding).
 */
export function distributeBrewWater(
  totalWaterG: number,
  pourCount: number,
  options?: { bloomAmountG?: number | null },
): number[] {
  const count = clampPourCount(pourCount);
  const total = roundBrewValue(Math.max(0, totalWaterG));
  if (!(total > 0)) return Array.from({ length: count }, () => 0);
  if (count === 1) return [total];

  const bloomRaw = options?.bloomAmountG;
  const bloom =
    bloomRaw != null && bloomRaw > 0
      ? roundBrewValue(Math.min(bloomRaw, roundBrewValue(total * 0.45)))
      : null;

  if (bloom != null && bloom > 0 && count >= 2) {
    const remaining = roundBrewValue(Math.max(0, total - bloom));
    const restCount = count - 1;
    const amounts = [bloom];
    let allocated = 0;
    for (let index = 0; index < restCount; index += 1) {
      if (index === restCount - 1) {
        amounts.push(roundBrewValue(remaining - allocated));
      } else {
        const part = roundBrewValue(remaining / restCount);
        amounts.push(part);
        allocated = roundBrewValue(allocated + part);
      }
    }
    return amounts;
  }

  const amounts: number[] = [];
  let allocated = 0;
  for (let index = 0; index < count; index += 1) {
    if (index === count - 1) {
      amounts.push(roundBrewValue(total - allocated));
    } else {
      const part = roundBrewValue(total / count);
      amounts.push(part);
      allocated = roundBrewValue(allocated + part);
    }
  }
  return amounts;
}

function stripNonBrewPours(pours: PersonalizedPour[]): PersonalizedPour[] {
  return pours.filter((pour) => {
    const label = `${pour.waterAmountLabel} ${pour.notes}`.toLowerCase();
    const isPrep =
      pour.waterAmountLabel.toLowerCase() === "prep" ||
      (label.includes("ice") && label.includes("prep"));
    const isSwirl =
      pour.waterAmountLabel.toLowerCase() === "swirl" && label.includes("ice");
    return !isPrep && !isSwirl;
  });
}

/**
 * Build a new pour list for the requested count, preserving bloom concept and
 * timing/notes from the official template when available.
 */
export function buildPoursForCount(
  totalWaterG: number,
  pourCount: number,
  official: BrewSnapshot,
): PersonalizedPour[] {
  const count = clampPourCount(pourCount);
  const template = stripNonBrewPours(official.pours).filter(
    (pour) => pour.waterAmountG != null && pour.waterAmountG > 0,
  );
  const officialWater =
    template.reduce((sum, pour) => sum + (pour.waterAmountG ?? 0), 0) ||
    (official.hotWaterG && official.hotWaterG > 0 ? official.hotWaterG : totalWaterG);

  let bloomAmountG: number | null = null;
  if (official.bloomAmountG != null && official.bloomAmountG > 0 && officialWater > 0) {
    bloomAmountG = roundBrewValue(official.bloomAmountG * (totalWaterG / officialWater));
  } else if (template[0]?.waterAmountG != null && officialWater > 0 && count >= 2) {
    // Treat the first structured pour as the bloom concept when bloom field is absent.
    bloomAmountG = roundBrewValue(template[0].waterAmountG * (totalWaterG / officialWater));
  }

  const amounts = distributeBrewWater(totalWaterG, count, { bloomAmountG });

  return amounts.map((amount, index) => {
    const tpl = template[Math.min(index, Math.max(0, template.length - 1))];
    const isBloom = index === 0 && bloomAmountG != null;
    return {
      id: template[index]?.id ?? `derived-pour-${index + 1}`,
      pourNumber: index + 1,
      waterAmountG: amount,
      waterAmountLabel: formatGrams(amount) ?? `${amount} g`,
      timeLabel: template[index]?.timeLabel ?? tpl?.timeLabel ?? "",
      notes: isBloom
        ? template[0]?.notes || "Bloom"
        : (template[index]?.notes ?? ""),
      atSeconds: template[index]?.atSeconds ?? index * 40,
      durationSeconds: template[index]?.durationSeconds ?? tpl?.durationSeconds ?? 40,
    };
  });
}

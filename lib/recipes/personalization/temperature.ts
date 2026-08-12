/**
 * Temperature personalization bounds — relative to the official recipe.
 */

import type { BrewSnapshot, DynamicBrewMethod } from "@/lib/recipes/personalization/types";

export type TemperatureBounds = {
  min: number;
  max: number;
  step: number;
  officialC: number;
};

function methodHint(official: BrewSnapshot, brewMethod?: DynamicBrewMethod | null): string {
  if (brewMethod) return brewMethod;
  const fromEquipment = official.equipment.map((item) => item.name).join(" ").toLowerCase();
  return fromEquipment;
}

/**
 * Sensible editable range around the official temperature.
 * Returns null when the official recipe has no usable temperature.
 */
export function temperatureBoundsForRecipe(
  official: BrewSnapshot,
  brewMethod?: DynamicBrewMethod | null,
): TemperatureBounds | null {
  const officialC = official.temperatureC;
  if (officialC == null || !Number.isFinite(officialC)) return null;

  const hint = methodHint(official, brewMethod);
  const isImmersion =
    hint.includes("french") || hint.includes("aero") || hint.includes("immersion");
  const isEspresso = hint.includes("espresso") || hint.includes("lever");

  let pad = 6;
  let floor = 80;
  let ceiling = 98;
  if (isImmersion) {
    pad = 5;
    floor = 82;
    ceiling = 96;
  } else if (isEspresso) {
    pad = 3;
    floor = 88;
    ceiling = 96;
  }

  return {
    officialC: Math.round(officialC),
    min: Math.max(floor, Math.round(officialC) - pad),
    max: Math.min(ceiling, Math.round(officialC) + pad),
    step: 1,
  };
}

export function clampTemperatureC(value: number, bounds: TemperatureBounds): number {
  if (!Number.isFinite(value)) return bounds.officialC;
  return Math.min(bounds.max, Math.max(bounds.min, Math.round(value)));
}

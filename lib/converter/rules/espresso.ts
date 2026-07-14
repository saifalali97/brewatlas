import { mapRange } from "@/lib/converter/rule-helpers";
import type { DeviceRule } from "@/lib/converter/types";

/**
 * Espresso -- high-pressure (~9 bar) extraction through a very fine,
 * compacted puck. Grind is already parked near the practical fine limit,
 * so it has little room left to move; instead, body/acidity are mostly
 * dialled through the shot ratio itself -- a shorter, more concentrated
 * ristretto-style pull for body, a longer, more diluted lungo-style pull
 * for acidity/clarity -- which is the opposite lever priority from every
 * gravity-fed method above.
 */
export const ESPRESSO_RULE: DeviceRule = {
  id: "espresso",
  profile: {
    id: "espresso",
    category: "pressurized",
    ratio: { min: 1.5, max: 2.5, default: 2 },
    temperatureC: { min: 90, max: 96, default: 93 },
    grind: { min: 0.3, max: 1.5, default: 0.8 },
    brewTimeSeconds: { min: 22, max: 32, default: 27 },
    defaultDoseG: 18,
    supportsBloom: false,
    bloomMultiplier: 0,
    defaultBloomTimeSeconds: 0,
    supportsPours: false,
    defaultPoursCount: 0,
  },
  computeTarget(context) {
    const { preferences, sourceProfile } = context;
    const profile = ESPRESSO_RULE.profile;

    // Ratio does most of the work here: ristretto (lower ratio) for body, lungo (higher ratio) for acidity/clarity.
    let ratio = profile.ratio.default;
    if (preferences.preserveBody) ratio -= 0.35;
    if (preferences.preserveAcidity) ratio += 0.35;

    // Grind only gets a small nudge -- it's already near the finest practical setting for the puck to hold back at 9 bar.
    let grindIndex = mapRange(context.sourceGrindIndex, sourceProfile.grind, profile.grind);
    if (preferences.preserveBody) grindIndex -= 0.15;
    if (preferences.preserveAcidity) grindIndex += 0.15;

    let temperatureC = mapRange(context.sourceTemperatureC, sourceProfile.temperatureC, profile.temperatureC);
    if (preferences.preserveAcidity) temperatureC -= 1.5;

    let brewTimeSeconds = profile.brewTimeSeconds.default;
    if (preferences.preserveBody) brewTimeSeconds *= 1.08;
    if (preferences.preserveAcidity) brewTimeSeconds *= 0.92;

    return {
      ratio,
      grindIndex,
      temperatureC,
      brewTimeSeconds,
      bloomGrams: null,
      bloomTimeSeconds: null,
      poursCount: 0,
      pourStyle: "pressurized",
    };
  },
};

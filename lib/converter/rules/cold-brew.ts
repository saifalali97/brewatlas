import type { DeviceRule } from "@/lib/converter/types";

/**
 * Cold Brew -- long steep at ambient/cold temperature, so heat isn't a
 * lever at all and a very coarse grind is fixed for practicality (fines
 * would make a long steep muddy and near-impossible to filter cleanly).
 * That leaves concentration (ratio) and steep duration as the only real
 * levers: a stronger, longer steep for body; a lighter, shorter steep to
 * avoid the muddiness that over-extracted cold brew is prone to and keep
 * acidity/clarity intact.
 */
export const COLD_BREW_RULE: DeviceRule = {
  id: "coldBrew",
  profile: {
    id: "coldBrew",
    category: "coldBrew",
    ratio: { min: 7, max: 9, default: 8 },
    temperatureC: { min: 4, max: 22, default: 20 },
    grind: { min: 8.5, max: 10, default: 9.2 },
    brewTimeSeconds: { min: 43200, max: 86400, default: 64800 },
    defaultDoseG: 100,
    supportsBloom: false,
    bloomMultiplier: 0,
    defaultBloomTimeSeconds: 0,
    supportsPours: false,
    defaultPoursCount: 0,
  },
  computeTarget(context) {
    const { preferences } = context;
    const profile = COLD_BREW_RULE.profile;

    let ratio = profile.ratio.default;
    if (preferences.preserveBody) ratio -= 0.75;
    if (preferences.preserveAcidity) ratio += 0.75;

    // Grind stays essentially fixed -- only a token nudge, since coarse is a practical requirement here, not a lever.
    let grindIndex = profile.grind.default;
    if (preferences.preserveAcidity) grindIndex += 0.2;

    // No heat lever at all: temperature is a fixed ambient/fridge steep regardless of preferences.
    const temperatureC = profile.temperatureC.default;

    let brewTimeSeconds = profile.brewTimeSeconds.default;
    if (preferences.preserveBody) brewTimeSeconds *= 1.15;
    if (preferences.preserveAcidity) brewTimeSeconds *= 0.85;

    return {
      ratio,
      grindIndex,
      temperatureC,
      brewTimeSeconds,
      bloomGrams: null,
      bloomTimeSeconds: null,
      poursCount: 0,
      pourStyle: "steep",
    };
  },
};

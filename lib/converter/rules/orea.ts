import { mapRange } from "@/lib/converter/rule-helpers";
import type { DeviceRule } from "@/lib/converter/types";

/**
 * Orea -- lightweight conical dripper with even bigger drainage holes than
 * a V60, so it runs faster still. It needs the finest default grind of
 * any conical dripper here to hold enough contact time, and reacts to
 * grind changes the most aggressively of the pour-over family -- with
 * flow this fast, grind is nearly the only lever that matters.
 */
export const OREA_RULE: DeviceRule = {
  id: "orea",
  profile: {
    id: "orea",
    category: "pourOver",
    ratio: { min: 15, max: 17, default: 16 },
    temperatureC: { min: 92, max: 96, default: 94 },
    grind: { min: 3.5, max: 5, default: 4.4 },
    brewTimeSeconds: { min: 150, max: 200, default: 170 },
    defaultDoseG: 15,
    supportsBloom: true,
    bloomMultiplier: 2.5,
    defaultBloomTimeSeconds: 30,
    supportsPours: true,
    defaultPoursCount: 3,
  },
  computeTarget(context) {
    const { preferences, sourceProfile } = context;
    const profile = OREA_RULE.profile;

    let ratio = profile.ratio.default;
    if (preferences.preserveBody) ratio -= 1;
    if (preferences.preserveAcidity) ratio += 1;

    let grindIndex = mapRange(context.sourceGrindIndex, sourceProfile.grind, profile.grind);
    if (preferences.preserveBody) grindIndex -= 0.65;
    if (preferences.preserveAcidity) grindIndex += 0.3;

    let temperatureC = mapRange(context.sourceTemperatureC, sourceProfile.temperatureC, profile.temperatureC);
    if (preferences.preserveAcidity) temperatureC -= 1.5;

    let brewTimeSeconds = profile.brewTimeSeconds.default;
    if (preferences.preserveBody) brewTimeSeconds *= 1.1;
    if (preferences.preserveAcidity) brewTimeSeconds *= 0.9;

    const poursCount = profile.defaultPoursCount;

    const bloomGrams = context.doseG * profile.bloomMultiplier;
    const bloomTimeSeconds = profile.defaultBloomTimeSeconds + (preferences.preserveSweetness ? 5 : 0);

    return {
      ratio,
      grindIndex,
      temperatureC,
      brewTimeSeconds,
      bloomGrams,
      bloomTimeSeconds,
      poursCount,
      pourStyle: "spiral",
    };
  },
};

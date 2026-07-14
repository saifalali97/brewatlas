import { mapRange } from "@/lib/converter/rule-helpers";
import type { DeviceRule } from "@/lib/converter/types";

/**
 * AeroPress -- short, forced-pressure extraction. Because the plunge
 * pushes water through regardless of gravity, grind changes hit
 * extraction much harder and much faster than on a gravity dripper, so
 * this rule leans almost entirely on grind (and a shorter/longer steep
 * before the plunge) rather than pour count. Being such a short brew, it's
 * also the most temperature-sensitive device in the lineup for acidity.
 */
export const AEROPRESS_RULE: DeviceRule = {
  id: "aeropress",
  profile: {
    id: "aeropress",
    category: "immersion",
    ratio: { min: 12, max: 16, default: 14 },
    temperatureC: { min: 80, max: 90, default: 85 },
    grind: { min: 3, max: 5, default: 4 },
    brewTimeSeconds: { min: 60, max: 150, default: 90 },
    defaultDoseG: 16,
    supportsBloom: true,
    bloomMultiplier: 1.5,
    defaultBloomTimeSeconds: 20,
    supportsPours: true,
    defaultPoursCount: 1,
  },
  computeTarget(context) {
    const { preferences, sourceProfile } = context;
    const profile = AEROPRESS_RULE.profile;

    let ratio = profile.ratio.default;
    if (preferences.preserveBody) ratio -= 1.5;
    if (preferences.preserveAcidity) ratio += 1.5;

    // Pressure amplifies grind changes -- the biggest grind swing of any device here.
    let grindIndex = mapRange(context.sourceGrindIndex, sourceProfile.grind, profile.grind);
    if (preferences.preserveBody) grindIndex -= 0.8;
    if (preferences.preserveAcidity) grindIndex += 0.6;

    // Short brew = very sensitive to starting temperature; acidity gets the largest cooldown of any pour method.
    let temperatureC = mapRange(context.sourceTemperatureC, sourceProfile.temperatureC, profile.temperatureC);
    if (preferences.preserveAcidity) temperatureC -= 3;
    if (preferences.preserveBody) temperatureC += 2;

    let brewTimeSeconds = profile.brewTimeSeconds.default;
    if (preferences.preserveBody) brewTimeSeconds *= 1.2;
    if (preferences.preserveAcidity) brewTimeSeconds *= 0.85;

    // A second, smaller top-up pour (rather than one full fill) evens out saturation for a sweeter cup.
    let poursCount = profile.defaultPoursCount;
    if (preferences.preserveSweetness) poursCount = 2;

    const bloomGrams = context.doseG * profile.bloomMultiplier;
    const bloomTimeSeconds = profile.defaultBloomTimeSeconds + (preferences.preserveSweetness ? 10 : 0);

    return {
      ratio,
      grindIndex,
      temperatureC,
      brewTimeSeconds,
      bloomGrams,
      bloomTimeSeconds,
      poursCount,
      pourStyle: "pulse",
    };
  },
};

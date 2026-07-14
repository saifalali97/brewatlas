import { mapRange } from "@/lib/converter/rule-helpers";
import type { DeviceRule } from "@/lib/converter/types";

/**
 * Origami -- fluted cone with a wide open bottom, so it drains even
 * faster than a V60. To compensate, it wants a slightly finer default
 * grind and is brewed with more frequent small pulses (rather than a V60's
 * fewer, bigger pours) to keep enough contact time despite the faster
 * flow -- the flutes settle the bed well, so it tolerates that without
 * clogging.
 */
export const ORIGAMI_RULE: DeviceRule = {
  id: "origami",
  profile: {
    id: "origami",
    category: "pourOver",
    ratio: { min: 15, max: 17, default: 16 },
    temperatureC: { min: 92, max: 96, default: 94 },
    grind: { min: 3.3, max: 4.8, default: 4 },
    brewTimeSeconds: { min: 140, max: 200, default: 165 },
    defaultDoseG: 15,
    supportsBloom: true,
    bloomMultiplier: 2.5,
    defaultBloomTimeSeconds: 30,
    supportsPours: true,
    defaultPoursCount: 4,
  },
  computeTarget(context) {
    const { preferences, sourceProfile } = context;
    const profile = ORIGAMI_RULE.profile;

    let ratio = profile.ratio.default;
    if (preferences.preserveBody) ratio -= 1;
    if (preferences.preserveAcidity) ratio += 0.75;

    // Fast flow means grind is the primary lever here -- pulling it finer has an outsized effect on contact time.
    let grindIndex = mapRange(context.sourceGrindIndex, sourceProfile.grind, profile.grind);
    if (preferences.preserveBody) grindIndex -= 0.6;
    if (preferences.preserveAcidity) grindIndex += 0.3;

    let temperatureC = mapRange(context.sourceTemperatureC, sourceProfile.temperatureC, profile.temperatureC);
    if (preferences.preserveAcidity) temperatureC -= 1.5;

    let brewTimeSeconds = profile.brewTimeSeconds.default;
    if (preferences.preserveBody) brewTimeSeconds *= 1.08;
    if (preferences.preserveAcidity) brewTimeSeconds *= 0.92;

    let poursCount = profile.defaultPoursCount;
    if (preferences.preserveSweetness) poursCount += 1;

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
      pourStyle: "pulse",
    };
  },
};

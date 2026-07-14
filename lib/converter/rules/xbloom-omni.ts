import { mapRange } from "@/lib/converter/rule-helpers";
import type { DeviceRule } from "@/lib/converter/types";

/**
 * xBloom Omni -- the precision model: tighter flow-rate control supports
 * a finer usable grind and more, smaller machine-timed pours than the
 * Studio/Original. That extra precision means preference adjustments can
 * be applied at a slightly larger magnitude than the Studio's without
 * risking an uneven pour -- the hardware can actually execute the finer
 * distinction.
 */
export const XBLOOM_OMNI_RULE: DeviceRule = {
  id: "xbloomOmni",
  profile: {
    id: "xbloomOmni",
    category: "pourOver",
    ratio: { min: 15, max: 17, default: 16 },
    temperatureC: { min: 85, max: 96, default: 93 },
    grind: { min: 3.2, max: 4.8, default: 4.2 },
    brewTimeSeconds: { min: 150, max: 210, default: 180 },
    defaultDoseG: 15,
    supportsBloom: true,
    bloomMultiplier: 2.5,
    defaultBloomTimeSeconds: 30,
    supportsPours: true,
    defaultPoursCount: 4,
  },
  computeTarget(context) {
    const { preferences, sourceProfile } = context;
    const profile = XBLOOM_OMNI_RULE.profile;

    let ratio = profile.ratio.default;
    if (preferences.preserveBody) ratio -= 1;
    if (preferences.preserveAcidity) ratio += 1;

    // Precise flow control tolerates a bigger grind swing than the Studio without unevenness.
    let grindIndex = mapRange(context.sourceGrindIndex, sourceProfile.grind, profile.grind);
    if (preferences.preserveBody) grindIndex -= 0.6;
    if (preferences.preserveAcidity) grindIndex += 0.45;

    let temperatureC = mapRange(context.sourceTemperatureC, sourceProfile.temperatureC, profile.temperatureC);
    if (preferences.preserveAcidity) temperatureC -= 2;
    if (preferences.preserveBody) temperatureC += 1;

    let brewTimeSeconds = profile.brewTimeSeconds.default;
    if (preferences.preserveBody) brewTimeSeconds *= 1.1;
    if (preferences.preserveAcidity) brewTimeSeconds *= 0.9;

    // More precise pour staging than the Studio -- an extra pulse in either direction rather than a flat count.
    let poursCount = profile.defaultPoursCount;
    if (preferences.preserveBody) poursCount = 3;
    else if (preferences.preserveAcidity) poursCount = 5;

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
      pourStyle: "centerPulse",
    };
  },
};

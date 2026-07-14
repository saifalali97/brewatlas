import { mapRange } from "@/lib/converter/rule-helpers";
import type { DeviceRule } from "@/lib/converter/types";

/**
 * xBloom Studio -- the balanced, general-purpose model in the lineup:
 * automated multi-stage pours give it consistent, machine-repeatable
 * pour-over extraction, applying preference adjustments at full strength
 * (unlike a flat-bed dripper, there's no bed geometry to buffer them) but
 * without the extra pour-stage precision of the Omni.
 */
export const XBLOOM_STUDIO_RULE: DeviceRule = {
  id: "xbloomStudio",
  profile: {
    id: "xbloomStudio",
    category: "pourOver",
    ratio: { min: 15, max: 17, default: 16 },
    temperatureC: { min: 85, max: 96, default: 93 },
    grind: { min: 3.5, max: 5, default: 4.5 },
    brewTimeSeconds: { min: 150, max: 210, default: 180 },
    defaultDoseG: 15,
    supportsBloom: true,
    bloomMultiplier: 2.5,
    defaultBloomTimeSeconds: 30,
    supportsPours: true,
    defaultPoursCount: 3,
  },
  computeTarget(context) {
    const { preferences, sourceProfile } = context;
    const profile = XBLOOM_STUDIO_RULE.profile;

    let ratio = profile.ratio.default;
    if (preferences.preserveBody) ratio -= 1;
    if (preferences.preserveAcidity) ratio += 1;

    let grindIndex = mapRange(context.sourceGrindIndex, sourceProfile.grind, profile.grind);
    if (preferences.preserveBody) grindIndex -= 0.5;
    if (preferences.preserveAcidity) grindIndex += 0.4;

    // Programmable heater covers a wider band than a kettle, so the full source temperature range carries through.
    let temperatureC = mapRange(context.sourceTemperatureC, sourceProfile.temperatureC, profile.temperatureC);
    if (preferences.preserveAcidity) temperatureC -= 2;
    if (preferences.preserveBody) temperatureC += 1;

    let brewTimeSeconds = profile.brewTimeSeconds.default;
    if (preferences.preserveBody) brewTimeSeconds *= 1.1;
    if (preferences.preserveAcidity) brewTimeSeconds *= 0.9;

    const poursCount = profile.defaultPoursCount;

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

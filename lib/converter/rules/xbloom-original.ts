import { mapRange } from "@/lib/converter/rule-helpers";
import type { DeviceRule } from "@/lib/converter/types";

/**
 * xBloom Original -- the first-generation model: simpler heating element
 * than the Studio/Omni, so its actual water temperature overshoots and
 * settles less precisely. Rather than pretend that precision exists, this
 * rule gives temperature the widest working range and the biggest
 * preference swing of any xBloom variant, while keeping grind/pour
 * adjustments more conservative to compensate for the coarser hardware
 * control elsewhere.
 */
export const XBLOOM_ORIGINAL_RULE: DeviceRule = {
  id: "xbloomOriginal",
  profile: {
    id: "xbloomOriginal",
    category: "pourOver",
    ratio: { min: 15, max: 17, default: 16 },
    temperatureC: { min: 85, max: 96, default: 93 },
    grind: { min: 3.5, max: 5.2, default: 4.6 },
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
    const profile = XBLOOM_ORIGINAL_RULE.profile;

    let ratio = profile.ratio.default;
    if (preferences.preserveBody) ratio -= 1;
    if (preferences.preserveAcidity) ratio += 1;

    // Conservative grind swing -- the simpler heater already introduces more temperature variance than the newer models.
    let grindIndex = mapRange(context.sourceGrindIndex, sourceProfile.grind, profile.grind);
    if (preferences.preserveBody) grindIndex -= 0.4;
    if (preferences.preserveAcidity) grindIndex += 0.3;

    // Widest temperature swing of any xBloom variant, since the first-gen heater doesn't hold a setpoint as tightly anyway.
    let temperatureC = mapRange(context.sourceTemperatureC, sourceProfile.temperatureC, profile.temperatureC);
    if (preferences.preserveAcidity) temperatureC -= 3;
    if (preferences.preserveBody) temperatureC += 2;

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

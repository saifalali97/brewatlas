import { mapRange } from "@/lib/converter/rule-helpers";
import type { DeviceRule } from "@/lib/converter/types";

/**
 * Kalita Wave -- flat-bottomed bed with a small, wave-ridged base. The
 * flat bed extracts far more evenly than a cone, which makes it forgiving:
 * grind changes matter less here than on a V60, so this rule dampens the
 * grind response and leans on pulse count/timing instead. Body comes from
 * fewer, larger pulses that let the flat bed sit in more water; acidity
 * comes from many small, gentle pulses that never let it fully drain.
 */
export const KALITA_WAVE_RULE: DeviceRule = {
  id: "kalitaWave",
  profile: {
    id: "kalitaWave",
    category: "pourOver",
    ratio: { min: 15, max: 17, default: 16 },
    temperatureC: { min: 92, max: 96, default: 94 },
    grind: { min: 3.5, max: 5, default: 4.3 },
    brewTimeSeconds: { min: 170, max: 220, default: 195 },
    defaultDoseG: 15,
    supportsBloom: true,
    bloomMultiplier: 2.5,
    defaultBloomTimeSeconds: 35,
    supportsPours: true,
    defaultPoursCount: 5,
  },
  computeTarget(context) {
    const { preferences, sourceProfile } = context;
    const profile = KALITA_WAVE_RULE.profile;

    let ratio = profile.ratio.default;
    if (preferences.preserveBody) ratio -= 1;
    if (preferences.preserveAcidity) ratio += 1;

    // The flat bed buffers grind changes -- a much smaller bias than a cone dripper needs for the same effect.
    let grindIndex = mapRange(context.sourceGrindIndex, sourceProfile.grind, profile.grind);
    if (preferences.preserveBody) grindIndex -= 0.25;
    if (preferences.preserveAcidity) grindIndex += 0.2;

    let temperatureC = mapRange(context.sourceTemperatureC, sourceProfile.temperatureC, profile.temperatureC);
    if (preferences.preserveAcidity) temperatureC -= 2;

    let brewTimeSeconds = profile.brewTimeSeconds.default;
    if (preferences.preserveBody) brewTimeSeconds *= 1.1;
    if (preferences.preserveAcidity) brewTimeSeconds *= 0.92;

    // Fewer, larger pulses keep the flat bed pooled longer (more body). More, smaller pulses keep it draining evenly (brighter, cleaner).
    let poursCount = profile.defaultPoursCount;
    if (preferences.preserveBody) poursCount = 4;
    else if (preferences.preserveAcidity) poursCount = 6;

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

import { mapRange } from "@/lib/converter/rule-helpers";
import type { DeviceRule } from "@/lib/converter/types";

/**
 * Hario V60 -- fast, conical, single large hole. Water finds the fastest
 * path down the cone easily (bypass/channeling), so extraction leans on
 * pour technique more than raw contact time: fewer, bigger pours agitate
 * and re-saturate the bed for more body; more, gentler pours protect
 * clarity and brightness.
 */
export const V60_RULE: DeviceRule = {
  id: "v60",
  profile: {
    id: "v60",
    category: "pourOver",
    ratio: { min: 15, max: 17, default: 16 },
    temperatureC: { min: 92, max: 96, default: 94 },
    grind: { min: 3.5, max: 5, default: 4.2 },
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
    const profile = V60_RULE.profile;

    let ratio = profile.ratio.default;
    if (preferences.preserveBody) ratio -= 1;
    if (preferences.preserveAcidity) ratio += 1;

    let grindIndex = mapRange(context.sourceGrindIndex, sourceProfile.grind, profile.grind);
    if (preferences.preserveBody) grindIndex -= 0.5;
    if (preferences.preserveAcidity) grindIndex += 0.4;

    let temperatureC = mapRange(context.sourceTemperatureC, sourceProfile.temperatureC, profile.temperatureC);
    if (preferences.preserveAcidity) temperatureC -= 2;
    if (preferences.preserveBody) temperatureC += 1;

    let brewTimeSeconds = profile.brewTimeSeconds.default;
    if (preferences.preserveBody) brewTimeSeconds *= 1.12;
    if (preferences.preserveAcidity) brewTimeSeconds *= 0.9;

    // Fewer, bigger pours = more turbulence and re-saturation (more body). More, gentler pours = more even, cleaner extraction (brighter).
    let poursCount = profile.defaultPoursCount;
    if (preferences.preserveBody) poursCount = 2;
    else if (preferences.preserveAcidity) poursCount = 4;

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
      pourStyle: "spiral",
    };
  },
};

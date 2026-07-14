import { mapRange } from "@/lib/converter/rule-helpers";
import type { DeviceRule } from "@/lib/converter/types";

/**
 * French Press -- full immersion through a coarse metal mesh (no paper,
 * so oils and fines pass straight into the cup). Grind has a narrow safe
 * window: too fine and the mesh lets through silty sediment or the plunger
 * jams, so this rule barely touches grind and instead does almost all of
 * its body/acidity work through steep time -- the single biggest brew-time
 * swing of any device here, since immersion has no drawdown to fall back
 * on.
 */
export const FRENCH_PRESS_RULE: DeviceRule = {
  id: "frenchPress",
  profile: {
    id: "frenchPress",
    category: "immersion",
    ratio: { min: 12, max: 15, default: 13 },
    temperatureC: { min: 92, max: 96, default: 94 },
    grind: { min: 7, max: 8.5, default: 7.5 },
    brewTimeSeconds: { min: 210, max: 270, default: 240 },
    defaultDoseG: 20,
    supportsBloom: false,
    bloomMultiplier: 0,
    defaultBloomTimeSeconds: 0,
    supportsPours: false,
    defaultPoursCount: 0,
  },
  computeTarget(context) {
    const { preferences, sourceProfile } = context;
    const profile = FRENCH_PRESS_RULE.profile;

    let ratio = profile.ratio.default;
    if (preferences.preserveBody) ratio -= 1;
    if (preferences.preserveAcidity) ratio += 1;

    // Deliberately the smallest grind swing of any device -- the metal mesh can't safely go much finer.
    let grindIndex = mapRange(context.sourceGrindIndex, sourceProfile.grind, profile.grind);
    if (preferences.preserveBody) grindIndex -= 0.2;
    if (preferences.preserveAcidity) grindIndex += 0.2;

    let temperatureC = mapRange(context.sourceTemperatureC, sourceProfile.temperatureC, profile.temperatureC);
    if (preferences.preserveAcidity) temperatureC -= 1.5;

    // Time is the primary lever for immersion: the longest steep extension, and the sharpest cut for brightness.
    let brewTimeSeconds = profile.brewTimeSeconds.default;
    if (preferences.preserveBody) brewTimeSeconds *= 1.2;
    if (preferences.preserveAcidity) brewTimeSeconds *= 0.82;

    return {
      ratio,
      grindIndex,
      temperatureC,
      brewTimeSeconds,
      bloomGrams: null,
      bloomTimeSeconds: null,
      poursCount: 0,
      pourStyle: "immersion",
    };
  },
};

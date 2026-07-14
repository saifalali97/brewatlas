import { mapRange } from "@/lib/converter/rule-helpers";
import type { DeviceRule } from "@/lib/converter/types";

/**
 * Moka Pot -- stovetop steam pressure (roughly 1-1.5 bar) forces water up
 * through a compact puck continuously, closer in spirit to espresso than
 * to any gravity method, but far gentler. Temperature is basically fixed
 * by the boiling water/steam driving it, so body/acidity are carried by
 * grind and how long it's left on the heat -- a finer grind builds more
 * resistance against the modest pressure (more extraction), while pulling
 * it off the heat sooner protects brightness before bitterness sets in.
 */
export const MOKA_POT_RULE: DeviceRule = {
  id: "mokaPot",
  profile: {
    id: "mokaPot",
    category: "pressurized",
    ratio: { min: 7, max: 10, default: 9 },
    temperatureC: { min: 95, max: 100, default: 98 },
    grind: { min: 1.5, max: 3, default: 2.2 },
    brewTimeSeconds: { min: 240, max: 360, default: 300 },
    defaultDoseG: 16,
    supportsBloom: false,
    bloomMultiplier: 0,
    defaultBloomTimeSeconds: 0,
    supportsPours: false,
    defaultPoursCount: 0,
  },
  computeTarget(context) {
    const { preferences, sourceProfile } = context;
    const profile = MOKA_POT_RULE.profile;

    let ratio = profile.ratio.default;
    if (preferences.preserveBody) ratio -= 1;
    if (preferences.preserveAcidity) ratio += 1;

    let grindIndex = mapRange(context.sourceGrindIndex, sourceProfile.grind, profile.grind);
    if (preferences.preserveBody) grindIndex -= 0.5;
    if (preferences.preserveAcidity) grindIndex += 0.35;

    // Temperature is dictated by the water boiling to drive the steam pressure -- preferences barely move it.
    let temperatureC = profile.temperatureC.default;
    if (preferences.preserveAcidity) temperatureC -= 1;

    let brewTimeSeconds = profile.brewTimeSeconds.default;
    if (preferences.preserveBody) brewTimeSeconds *= 1.1;
    if (preferences.preserveAcidity) brewTimeSeconds *= 0.88;

    return {
      ratio,
      grindIndex,
      temperatureC,
      brewTimeSeconds,
      bloomGrams: null,
      bloomTimeSeconds: null,
      poursCount: 0,
      pourStyle: "pressurized",
    };
  },
};

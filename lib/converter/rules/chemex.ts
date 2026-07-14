import { mapRange } from "@/lib/converter/rule-helpers";
import type { DeviceRule } from "@/lib/converter/types";

/**
 * Chemex -- proprietary filter is roughly twice as thick as standard
 * paper, so it already strips oils/fines and slows the drawdown a lot.
 * Grinding much finer risks stalling or clogging it entirely, so body
 * here comes mostly from a longer, hotter, more concentrated brew rather
 * than a big grind shift. A generous bloom matters more than on thinner
 * filters, since the thick paper needs the bed evenly saturated before
 * the slow draw-down starts.
 */
export const CHEMEX_RULE: DeviceRule = {
  id: "chemex",
  profile: {
    id: "chemex",
    category: "pourOver",
    ratio: { min: 15, max: 17, default: 16 },
    temperatureC: { min: 92, max: 96, default: 94 },
    grind: { min: 5, max: 6.5, default: 5.6 },
    brewTimeSeconds: { min: 210, max: 270, default: 240 },
    defaultDoseG: 30,
    supportsBloom: true,
    bloomMultiplier: 2.5,
    defaultBloomTimeSeconds: 45,
    supportsPours: true,
    defaultPoursCount: 3,
  },
  computeTarget(context) {
    const { preferences, sourceProfile } = context;
    const profile = CHEMEX_RULE.profile;

    let ratio = profile.ratio.default;
    if (preferences.preserveBody) ratio -= 1;
    if (preferences.preserveAcidity) ratio += 1;

    // Deliberately smaller grind swing than a V60/Origami -- too fine and the thick filter stalls the draw-down.
    let grindIndex = mapRange(context.sourceGrindIndex, sourceProfile.grind, profile.grind);
    if (preferences.preserveBody) grindIndex -= 0.3;
    if (preferences.preserveAcidity) grindIndex += 0.4;

    let temperatureC = mapRange(context.sourceTemperatureC, sourceProfile.temperatureC, profile.temperatureC);
    if (preferences.preserveAcidity) temperatureC -= 2;
    if (preferences.preserveBody) temperatureC += 1;

    // Time carries most of the body adjustment here, since grind is intentionally conservative.
    let brewTimeSeconds = profile.brewTimeSeconds.default;
    if (preferences.preserveBody) brewTimeSeconds *= 1.15;
    if (preferences.preserveAcidity) brewTimeSeconds *= 0.9;

    const poursCount = profile.defaultPoursCount;

    const bloomGrams = context.doseG * profile.bloomMultiplier;
    const bloomTimeSeconds = profile.defaultBloomTimeSeconds + (preferences.preserveSweetness ? 15 : 0);

    return {
      ratio,
      grindIndex,
      temperatureC,
      brewTimeSeconds,
      bloomGrams,
      bloomTimeSeconds,
      poursCount,
      pourStyle: "singlePour",
    };
  },
};

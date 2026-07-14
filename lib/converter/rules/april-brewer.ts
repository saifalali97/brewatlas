import { mapRange } from "@/lib/converter/rule-helpers";
import type { DeviceRule } from "@/lib/converter/types";

/**
 * April Brewer -- flat-bottomed like a Kalita Wave, but conventionally
 * brewed with the opposite pour philosophy: a handful of big, deliberate
 * pours rather than many small pulses. That makes it more forgiving of
 * pour technique but more reliant on grind for fine-tuning, so this rule
 * mirrors Kalita's flat-bed evenness while keeping pour count small and
 * putting more of the adjustment weight on grind instead.
 */
export const APRIL_BREWER_RULE: DeviceRule = {
  id: "aprilBrewer",
  profile: {
    id: "aprilBrewer",
    category: "pourOver",
    ratio: { min: 15, max: 17, default: 16 },
    temperatureC: { min: 92, max: 96, default: 94 },
    grind: { min: 3.8, max: 5.2, default: 4.6 },
    brewTimeSeconds: { min: 160, max: 210, default: 185 },
    defaultDoseG: 16,
    supportsBloom: true,
    bloomMultiplier: 2.5,
    defaultBloomTimeSeconds: 35,
    supportsPours: true,
    defaultPoursCount: 2,
  },
  computeTarget(context) {
    const { preferences, sourceProfile } = context;
    const profile = APRIL_BREWER_RULE.profile;

    let ratio = profile.ratio.default;
    if (preferences.preserveBody) ratio -= 1;
    if (preferences.preserveAcidity) ratio += 1;

    // Flat bed is forgiving like Kalita's, but pour count stays low here, so grind carries more of the adjustment.
    let grindIndex = mapRange(context.sourceGrindIndex, sourceProfile.grind, profile.grind);
    if (preferences.preserveBody) grindIndex -= 0.45;
    if (preferences.preserveAcidity) grindIndex += 0.3;

    let temperatureC = mapRange(context.sourceTemperatureC, sourceProfile.temperatureC, profile.temperatureC);
    if (preferences.preserveAcidity) temperatureC -= 1.5;

    let brewTimeSeconds = profile.brewTimeSeconds.default;
    if (preferences.preserveBody) brewTimeSeconds *= 1.1;
    if (preferences.preserveAcidity) brewTimeSeconds *= 0.9;

    // Big, few pours by convention -- body nudges it to just one, acidity opens it up to three for gentler flow.
    let poursCount = profile.defaultPoursCount;
    if (preferences.preserveBody) poursCount = 1;
    else if (preferences.preserveAcidity) poursCount = 3;

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
      pourStyle: "singlePour",
    };
  },
};

import { mapRange } from "@/lib/converter/rule-helpers";
import type { DeviceRule } from "@/lib/converter/types";

/**
 * Hario Switch -- a valve-controlled hybrid: brew with the valve closed
 * as a full immersion, then open it to drain like a pour-over. Since most
 * of the extraction actually happens during the closed-valve immersion
 * phase, "brew time" here really means "how long the valve stays closed"
 * -- so body/acidity lean on that closed-phase duration (immersion-style,
 * the second-largest time swing after a true French Press) rather than
 * grind, while still keeping a couple of pour-over-style pours to
 * agitate the bed before closing the valve.
 */
export const SWITCH_RULE: DeviceRule = {
  id: "switch",
  profile: {
    id: "switch",
    category: "hybrid",
    ratio: { min: 14, max: 17, default: 15.5 },
    temperatureC: { min: 90, max: 95, default: 93 },
    grind: { min: 4, max: 5.5, default: 4.7 },
    brewTimeSeconds: { min: 180, max: 260, default: 220 },
    defaultDoseG: 18,
    supportsBloom: true,
    bloomMultiplier: 2.5,
    defaultBloomTimeSeconds: 30,
    supportsPours: true,
    defaultPoursCount: 2,
  },
  computeTarget(context) {
    const { preferences, sourceProfile } = context;
    const profile = SWITCH_RULE.profile;

    let ratio = profile.ratio.default;
    if (preferences.preserveBody) ratio -= 1;
    if (preferences.preserveAcidity) ratio += 1;

    let grindIndex = mapRange(context.sourceGrindIndex, sourceProfile.grind, profile.grind);
    if (preferences.preserveBody) grindIndex -= 0.4;
    if (preferences.preserveAcidity) grindIndex += 0.3;

    let temperatureC = mapRange(context.sourceTemperatureC, sourceProfile.temperatureC, profile.temperatureC);
    if (preferences.preserveAcidity) temperatureC -= 2;

    // Keeping the valve closed longer is this device's real body lever -- more immersion contact before any drawdown starts.
    let brewTimeSeconds = profile.brewTimeSeconds.default;
    if (preferences.preserveBody) brewTimeSeconds *= 1.18;
    if (preferences.preserveAcidity) brewTimeSeconds *= 0.85;

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
      pourStyle: "immersion",
    };
  },
};

import { mapRange } from "@/lib/converter/rule-helpers";
import type { DeviceRule } from "@/lib/converter/types";

/**
 * Clever Dripper -- full immersion like a French Press, but drains through
 * a paper filter once the valve opens, which caps body well below what a
 * metal mesh allows and yields a cleaner cup. Because the paper already
 * limits maximum body, this rule spreads the body/acidity adjustment
 * across steep time AND a modest grind shift (a middle ground between
 * French Press's time-only approach and a dripper's grind-only approach).
 */
export const CLEVER_DRIPPER_RULE: DeviceRule = {
  id: "cleverDripper",
  profile: {
    id: "cleverDripper",
    category: "immersion",
    ratio: { min: 14, max: 16, default: 15 },
    temperatureC: { min: 90, max: 94, default: 92 },
    grind: { min: 4.5, max: 6, default: 5 },
    brewTimeSeconds: { min: 180, max: 240, default: 210 },
    defaultDoseG: 18,
    supportsBloom: true,
    bloomMultiplier: 2,
    defaultBloomTimeSeconds: 30,
    supportsPours: false,
    defaultPoursCount: 1,
  },
  computeTarget(context) {
    const { preferences, sourceProfile } = context;
    const profile = CLEVER_DRIPPER_RULE.profile;

    let ratio = profile.ratio.default;
    if (preferences.preserveBody) ratio -= 0.75;
    if (preferences.preserveAcidity) ratio += 0.75;

    let grindIndex = mapRange(context.sourceGrindIndex, sourceProfile.grind, profile.grind);
    if (preferences.preserveBody) grindIndex -= 0.35;
    if (preferences.preserveAcidity) grindIndex += 0.3;

    let temperatureC = mapRange(context.sourceTemperatureC, sourceProfile.temperatureC, profile.temperatureC);
    if (preferences.preserveAcidity) temperatureC -= 2;

    let brewTimeSeconds = profile.brewTimeSeconds.default;
    if (preferences.preserveBody) brewTimeSeconds *= 1.1;
    if (preferences.preserveAcidity) brewTimeSeconds *= 0.88;

    const bloomGrams = context.doseG * profile.bloomMultiplier;
    const bloomTimeSeconds = profile.defaultBloomTimeSeconds + (preferences.preserveSweetness ? 10 : 0);

    return {
      ratio,
      grindIndex,
      temperatureC,
      brewTimeSeconds,
      bloomGrams,
      bloomTimeSeconds,
      poursCount: 0,
      pourStyle: "immersion",
    };
  },
};

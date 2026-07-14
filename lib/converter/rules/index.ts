import { AEROPRESS_RULE } from "@/lib/converter/rules/aeropress";
import { APRIL_BREWER_RULE } from "@/lib/converter/rules/april-brewer";
import { CHEMEX_RULE } from "@/lib/converter/rules/chemex";
import { CLEVER_DRIPPER_RULE } from "@/lib/converter/rules/clever-dripper";
import { COLD_BREW_RULE } from "@/lib/converter/rules/cold-brew";
import { ESPRESSO_RULE } from "@/lib/converter/rules/espresso";
import { FRENCH_PRESS_RULE } from "@/lib/converter/rules/french-press";
import { KALITA_WAVE_RULE } from "@/lib/converter/rules/kalita-wave";
import { MOKA_POT_RULE } from "@/lib/converter/rules/moka-pot";
import { OREA_RULE } from "@/lib/converter/rules/orea";
import { ORIGAMI_RULE } from "@/lib/converter/rules/origami";
import { SWITCH_RULE } from "@/lib/converter/rules/switch";
import { V60_RULE } from "@/lib/converter/rules/v60";
import { XBLOOM_OMNI_RULE } from "@/lib/converter/rules/xbloom-omni";
import { XBLOOM_ORIGINAL_RULE } from "@/lib/converter/rules/xbloom-original";
import { XBLOOM_STUDIO_RULE } from "@/lib/converter/rules/xbloom-studio";
import type { BrewMethodId, DeviceRule } from "@/lib/converter/types";

/**
 * Every supported brew method's brewing intelligence, one dedicated rule
 * module each (Phase 17.3). No shared formula: each module decides for
 * itself how body/sweetness/acidity preferences map onto ratio, grind,
 * temperature, bloom, brew time, and pour structure for that specific
 * device. Adding a new device means adding one file here -- never a
 * branch in a shared switch statement.
 */
export const DEVICE_RULES: Record<BrewMethodId, DeviceRule> = {
  v60: V60_RULE,
  origami: ORIGAMI_RULE,
  kalitaWave: KALITA_WAVE_RULE,
  chemex: CHEMEX_RULE,
  aeropress: AEROPRESS_RULE,
  cleverDripper: CLEVER_DRIPPER_RULE,
  frenchPress: FRENCH_PRESS_RULE,
  switch: SWITCH_RULE,
  mokaPot: MOKA_POT_RULE,
  orea: OREA_RULE,
  aprilBrewer: APRIL_BREWER_RULE,
  xbloomStudio: XBLOOM_STUDIO_RULE,
  xbloomOmni: XBLOOM_OMNI_RULE,
  xbloomOriginal: XBLOOM_ORIGINAL_RULE,
  espresso: ESPRESSO_RULE,
  coldBrew: COLD_BREW_RULE,
};

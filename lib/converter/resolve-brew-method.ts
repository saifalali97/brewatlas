import type { BrewMethodId } from "@/lib/converter/types";

/**
 * Deterministic keyword matching from a recipe's free-text brew
 * method/device name (e.g. `"Hario V60"`, `"Pour Over"`, `"Toddy Cold
 * Brew System"` -- see `supabase/migrations/*_seed_*.sql`) to one of the
 * engine's canonical profiles. Ordered most-specific-first; the first
 * match wins. Falls back to `"v60"` (the most common baseline pour-over
 * profile) so the engine never fails to resolve a source method.
 */
const ALIAS_RULES: Array<{ pattern: RegExp; id: BrewMethodId }> = [
  { pattern: /xbloom.*omni|omni.*xbloom/, id: "xbloomOmni" },
  { pattern: /xbloom.*original|original.*xbloom/, id: "xbloomOriginal" },
  { pattern: /xbloom/, id: "xbloomStudio" },
  { pattern: /kalita/, id: "kalitaWave" },
  { pattern: /chemex/, id: "chemex" },
  { pattern: /origami/, id: "origami" },
  { pattern: /clever/, id: "cleverDripper" },
  { pattern: /orea/, id: "orea" },
  { pattern: /april/, id: "aprilBrewer" },
  { pattern: /aero\s*press/, id: "aeropress" },
  { pattern: /french\s*press/, id: "frenchPress" },
  { pattern: /cold\s*brew|toddy|yama/, id: "coldBrew" },
  { pattern: /espresso|marzocco|flair|nanopresso|moka/, id: "espresso" },
  { pattern: /v60/, id: "v60" },
  // Hybrid immersion/pour-over devices without a dedicated profile -- Clever Dripper is the closest analog.
  { pattern: /switch|immersion/, id: "cleverDripper" },
  // Vacuum/siphon brewing shares V60's clarity-focused, full-control profile closely enough to reuse it.
  { pattern: /siphon/, id: "v60" },
  // Modern high-flow conical/flat drippers without a dedicated profile default to the V60 baseline.
  { pattern: /pour\s*over|stagg|beehouse|melodrip|crystal eye|flower|dripper/, id: "v60" },
];

/** Resolves free-text brew method/device names to a canonical `BrewMethodId`. Always returns a valid id -- unknown text falls back to `"v60"`. */
export function resolveBrewMethod(value: string | null | undefined): BrewMethodId {
  const normalized = (value ?? "").trim().toLowerCase();

  for (const rule of ALIAS_RULES) {
    if (rule.pattern.test(normalized)) return rule.id;
  }

  return "v60";
}

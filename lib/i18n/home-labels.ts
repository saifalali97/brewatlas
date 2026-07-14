import type { Difficulty } from "@/types/homepage";
import type { DictionaryKey } from "@/lib/i18n/types";

/**
 * `FeaturedRecipe.brewMethod` and `FeaturedRecipe["difficulty"]` /
 * `BrewingMethod["difficulty"]` stay in their canonical English form in
 * every locale's `lib/i18n/home-content/*` (see the comment atop
 * `lib/i18n/home-content/ar.ts`) because they double as comparison keys
 * (the featured-recipe filter chips, `<DifficultyIndicator>`'s dot count).
 * These lookups turn that canonical value into the translated label to
 * *display*, without touching the underlying value used for logic.
 */
const BREW_METHOD_KEYS: Record<string, DictionaryKey> = {
  "V60": "homeFilters.v60",
  "Espresso": "homeFilters.espresso",
  "Chemex": "homeFilters.chemex",
  "Aeropress": "homeFilters.aeropress",
  "Cold Brew": "homeFilters.coldBrew",
  "Moka Pot": "homeFilters.mokaPot",
};

const DIFFICULTY_KEYS: Record<Difficulty, DictionaryKey> = {
  Beginner: "homeDifficulty.beginner",
  Intermediate: "homeDifficulty.intermediate",
  Advanced: "homeDifficulty.advanced",
};

export function brewMethodLabelKey(method: string): DictionaryKey | null {
  return BREW_METHOD_KEYS[method] ?? null;
}

export function difficultyLabelKey(level: Difficulty): DictionaryKey {
  return DIFFICULTY_KEYS[level];
}

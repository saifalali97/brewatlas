import type { GulfHeritagePageSlug } from "@/types/gulf-heritage";
import type { GulfHeritageRecipeReference } from "@/types/gulf-heritage-recipe";

/**
 * Recipe source catalog — only entries with verification.status === "verified" render on pages.
 * Pending sources remain in research/gulf-heritage/uae/recipes/index.json for editorial review.
 */
export const UAE_PAGE_RECIPES: Record<GulfHeritagePageSlug, readonly GulfHeritageRecipeReference[]> = {
  "emirati-arabic-coffee": [],
  dallah: [],
  finjan: [],
  mihmas: [],
  cardamom: [],
  saffron: [],
  "coffee-hospitality": [],
  "coffee-etiquette": [],
  "coffee-serving-traditions": [],
  "karak-chai": [],
  "black-tea": [],
  "milk-tea": [],
  "saffron-tea": [],
  "mint-tea": [],
  "adani-tea": [],
  "raw-coffee-company": [],
  "the-espresso-lab": [],
  "seven-fortunes": [],
  "cypher-roastery": [],
  "boom-coffee": [],
  "gold-box-roastery": [],
  "nightjar-coffee": [],
};

export function getUaePageRecipes(slug: GulfHeritagePageSlug): readonly GulfHeritageRecipeReference[] {
  return UAE_PAGE_RECIPES[slug] ?? [];
}

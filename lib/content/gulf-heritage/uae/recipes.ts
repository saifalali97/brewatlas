import type { GulfHeritagePageSlug } from "@/types/gulf-heritage";
import { createUnverifiedRecipeReference } from "@/types/gulf-heritage-recipe";
import type { GulfHeritageRecipeReference } from "@/types/gulf-heritage-recipe";
import { gulfHeritageRecipeTitlesEn } from "@/lib/i18n/gulf-heritage-copy-en";
import { getUaeVerifiedRecipe } from "@/lib/content/gulf-heritage/uae/verified-recipes";
import type { Locale } from "@/types/i18n";
import { DEFAULT_LOCALE } from "@/types/i18n";

function pendingRecipe(slug: string, status: "pending-review" | "coming-soon" | "blocked" = "pending-review") {
  const title = gulfHeritageRecipeTitlesEn[slug] ?? slug;
  return createUnverifiedRecipeReference(slug, title, status);
}

function resolveRecipe(
  slug: string,
  locale: Locale,
  pendingStatus: "pending-review" | "coming-soon" | "blocked" = "pending-review",
): GulfHeritageRecipeReference {
  return getUaeVerifiedRecipe(slug, locale) ?? pendingRecipe(slug, pendingStatus);
}

type PageRecipeEntry = {
  slug: string;
  status?: "pending-review" | "coming-soon" | "blocked";
};

/**
 * Recipe catalog — only entries with verification.status === "verified" render as complete recipes.
 * Pending sources remain in research/gulf-heritage/uae/recipes/index.json for editorial review.
 */
export const UAE_PAGE_RECIPE_CATALOG: Record<GulfHeritagePageSlug, readonly PageRecipeEntry[]> = {
  "emirati-arabic-coffee": [
    { slug: "dct-al-gahwa-activity-guide", status: "pending-review" },
    { slug: "dct-gahwa-arabic-coffee-publication", status: "pending-review" },
  ],
  dallah: [],
  finjan: [],
  mihmas: [],
  cardamom: [],
  saffron: [],
  "coffee-hospitality": [],
  "coffee-etiquette": [],
  "coffee-serving-traditions": [],
  "karak-chai": [
    { slug: "smithsonian-karak-chai" },
    { slug: "table-tales-karak-chai", status: "pending-review" },
  ],
  "black-tea": [],
  "milk-tea": [],
  "saffron-tea": [],
  "mint-tea": [],
  "adani-tea": [{ slug: "adani-tea-recipe", status: "blocked" }],
  "raw-coffee-company": [
    { slug: "raw-6-simple-brewing", status: "pending-review" },
    { slug: "raw-cold-brew-recipes", status: "pending-review" },
    { slug: "raw-espresso-martini", status: "pending-review" },
  ],
  "the-espresso-lab": [],
  "seven-fortunes": [],
  "cypher-roastery": [],
  "boom-coffee": [],
  "gold-box-roastery": [],
  "nightjar-coffee": [],
};

export function getUaePageRecipes(
  slug: GulfHeritagePageSlug,
  locale: Locale = DEFAULT_LOCALE,
): readonly GulfHeritageRecipeReference[] {
  const catalog = UAE_PAGE_RECIPE_CATALOG[slug] ?? [];
  return catalog.map((entry) => resolveRecipe(entry.slug, locale, entry.status ?? "pending-review"));
}

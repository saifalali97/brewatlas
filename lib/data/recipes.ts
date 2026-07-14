import { featuredRecipes } from "@/data/homepage";
import { slugify } from "@/lib/utils/slugify";
import type { FeaturedRecipe } from "@/types/homepage";

export function getRecipeSlug(recipe: FeaturedRecipe): string {
  return slugify(recipe.name);
}

export function getRecipeBySlug(slug: string): FeaturedRecipe | undefined {
  return featuredRecipes.find((recipe) => getRecipeSlug(recipe) === slug);
}

export function getAllRecipeSlugs(): string[] {
  return featuredRecipes.map(getRecipeSlug);
}

/**
 * Slugs are always derived from the canonical English recipe name (see
 * `getRecipeSlug`) so a static recipe's URL never changes across locales.
 * To render translated content at that same URL, callers need the recipe's
 * position in `featuredRecipes` -- which is index-identical to
 * `HomeContent["featuredRecipes"]` for every locale (see
 * `lib/i18n/home-content/*`) -- so they can pull the localized copy for
 * display while the slug itself stays English-canonical.
 */
export function getStaticRecipeIndexBySlug(slug: string): number {
  return featuredRecipes.findIndex((recipe) => getRecipeSlug(recipe) === slug);
}

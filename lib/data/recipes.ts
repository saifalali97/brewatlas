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

import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  countGulfRecipes,
  getFeaturedRecipes,
  getRecipe,
  getRecipesByCountry,
  getRecipesByRoaster,
} from "@/lib/data/recipes/queries";
import {
  getGulfRecipeDetail,
  listFeaturedGulfRecipesForCountry,
  listGulfRecipeDetails,
  listGulfRecipesForRoaster,
} from "@/lib/data/directory/seeds/recipe-library";
import type { GulfDirectoryCountrySlug } from "@/lib/gulf-directory/countries";
import type { PlaceholderRecipeDetail } from "@/lib/gulf-directory/placeholder-recipe-types";

/** DB-first recipe detail with TypeScript seed fallback. */
export async function getRecipeWithFallback(
  supabase: SupabaseClient,
  slug: string,
): Promise<PlaceholderRecipeDetail | null> {
  const live = await getRecipe(supabase, slug);
  if (live) return live;
  return getGulfRecipeDetail(slug);
}

/** DB-first roaster recipes with seed fallback when the DB library is empty. */
export async function getRecipesByRoasterWithFallback(
  supabase: SupabaseClient,
  roasterSlug: string,
): Promise<PlaceholderRecipeDetail[]> {
  const live = await getRecipesByRoaster(supabase, roasterSlug);
  if (live.length > 0) return live;

  const total = await countGulfRecipes(supabase);
  if (total > 0) return live; // DB is populated but this roaster has none yet
  return listGulfRecipesForRoaster(roasterSlug);
}

/** DB-first country recipes with seed fallback. */
export async function getRecipesByCountryWithFallback(
  supabase: SupabaseClient,
  countrySlug: GulfDirectoryCountrySlug,
): Promise<PlaceholderRecipeDetail[]> {
  const live = await getRecipesByCountry(supabase, countrySlug);
  if (live.length > 0) return live;

  const total = await countGulfRecipes(supabase);
  if (total > 0) return live;
  return listGulfRecipeDetails().filter((recipe) => recipe.countrySlug === countrySlug);
}

/** DB-first featured recipes with seed fallback. */
export async function getFeaturedRecipesWithFallback(
  supabase: SupabaseClient,
  countrySlug?: GulfDirectoryCountrySlug,
): Promise<PlaceholderRecipeDetail[]> {
  const live = await getFeaturedRecipes(supabase, countrySlug);
  if (live.length > 0) return live;

  const total = await countGulfRecipes(supabase);
  if (total > 0) {
    // Prefer any country recipes when none are flagged featured yet.
    if (countrySlug) return getRecipesByCountry(supabase, countrySlug);
    return [];
  }

  if (countrySlug) return listFeaturedGulfRecipesForCountry(countrySlug);
  return listGulfRecipeDetails().filter((recipe) => recipe.featured);
}

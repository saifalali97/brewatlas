import "server-only";

import { unstable_cache } from "next/cache";
import {
  getFeaturedRecipesWithFallback,
  getRecipeWithFallback,
  getRecipesByCountryWithFallback,
  getRecipesByRoasterWithFallback,
} from "@/lib/data/recipes/with-fallback";
import type { GulfDirectoryCountrySlug } from "@/lib/gulf-directory/countries";
import type { PlaceholderRecipeDetail } from "@/lib/gulf-directory/placeholder-recipe-types";
import { createPublicClient } from "@/lib/supabase/public";

const RECIPE_CACHE_TTL = 300;
const RECIPE_TAGS = ["gulf-recipes", "gulf-directory"] as const;

export async function getCachedRecipeDetail(
  slug: string,
): Promise<PlaceholderRecipeDetail | null> {
  return unstable_cache(
    async () => {
      const supabase = createPublicClient();
      return getRecipeWithFallback(supabase, slug);
    },
    ["cached-gulf-recipe", slug],
    { revalidate: RECIPE_CACHE_TTL, tags: [...RECIPE_TAGS, `gulf-recipe-${slug}`] },
  )();
}

export async function getCachedRecipesByRoaster(
  roasterSlug: string,
): Promise<PlaceholderRecipeDetail[]> {
  return unstable_cache(
    async () => {
      const supabase = createPublicClient();
      return getRecipesByRoasterWithFallback(supabase, roasterSlug);
    },
    ["cached-gulf-recipes-roaster", roasterSlug],
    {
      revalidate: RECIPE_CACHE_TTL,
      tags: [...RECIPE_TAGS, `gulf-roaster-recipes-${roasterSlug}`],
    },
  )();
}

export async function getCachedRecipesByCountry(
  countrySlug: GulfDirectoryCountrySlug,
): Promise<PlaceholderRecipeDetail[]> {
  return unstable_cache(
    async () => {
      const supabase = createPublicClient();
      return getRecipesByCountryWithFallback(supabase, countrySlug);
    },
    ["cached-gulf-recipes-country", countrySlug],
    {
      revalidate: RECIPE_CACHE_TTL,
      tags: [...RECIPE_TAGS, `gulf-country-recipes-${countrySlug}`],
    },
  )();
}

export async function getCachedFeaturedRecipes(
  countrySlug?: GulfDirectoryCountrySlug,
): Promise<PlaceholderRecipeDetail[]> {
  return unstable_cache(
    async () => {
      const supabase = createPublicClient();
      return getFeaturedRecipesWithFallback(supabase, countrySlug);
    },
    ["cached-gulf-featured-recipes", countrySlug ?? "all"],
    { revalidate: RECIPE_CACHE_TTL, tags: [...RECIPE_TAGS] },
  )();
}

import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { getDirectoryCitiesByCountrySlug } from "@/lib/data/directory/cities";
import { getDirectoryCountryBySlug } from "@/lib/data/directory/countries";
import { specialtyFromDescription } from "@/lib/data/directory/mappers";
import { getDirectoryRoastersByCountrySlug } from "@/lib/data/directory/roasters";
import {
  getFeaturedRecipesWithFallback,
  getRecipesByRoasterWithFallback,
} from "@/lib/data/recipes/with-fallback";
import type { DirectoryRoaster } from "@/lib/data/directory/types";
import { resolveGulfCountryBanner } from "@/lib/gulf-directory/country-images";
import type {
  GulfCountryPageData,
  GulfCountryPageRecipe,
  GulfCountryPageRoaster,
} from "@/lib/gulf-directory/country-page-types";
import type { GulfDirectoryCountrySlug } from "@/lib/gulf-directory/countries";
import type { PlaceholderRecipeDetail } from "@/lib/gulf-directory/placeholder-recipe-types";
import type { Difficulty } from "@/types/homepage";

function toCountryPageRecipe(recipe: PlaceholderRecipeDetail): GulfCountryPageRecipe {
  return {
    id: `recipe-${recipe.slug}`,
    slug: recipe.slug,
    name: recipe.name,
    brewMethod: recipe.brewMethod,
    difficulty: recipe.difficulty,
    image: recipe.image,
    roasterName: recipe.roasterName,
    roasterSlug: recipe.roasterSlug,
    countrySlug: recipe.countrySlug,
    isIced: recipe.isIced,
  };
}

async function toPageRoaster(
  supabase: SupabaseClient,
  roaster: DirectoryRoaster,
): Promise<GulfCountryPageRoaster> {
  const seedRecipes = await getRecipesByRoasterWithFallback(supabase, roaster.slug);
  const recipeCount = roaster.recipeCount > 0 ? roaster.recipeCount : seedRecipes.length;

  return {
    id: roaster.id,
    name: roaster.name,
    slug: roaster.slug,
    city: roaster.city?.trim() || "—",
    logoUrl: roaster.logoUrl,
    recipeCount,
    specialty: roaster.specialty?.trim() || specialtyFromDescription(roaster.description),
    brewMethods: [...new Set(seedRecipes.map((recipe) => recipe.brewMethod))].sort(),
    difficulties: [...new Set(seedRecipes.map((recipe) => recipe.difficulty))] as Difficulty[],
  };
}

/**
 * Build country page payload from Supabase countries/cities/roasters.
 * Recipes come from the Gulf recipe repository (DB-first, seed fallback).
 */
export async function getSupabaseGulfCountryPageData(
  supabase: SupabaseClient,
  slug: GulfDirectoryCountrySlug,
): Promise<GulfCountryPageData | null> {
  const [country, cities, roasters] = await Promise.all([
    getDirectoryCountryBySlug(supabase, slug),
    getDirectoryCitiesByCountrySlug(supabase, slug),
    getDirectoryRoastersByCountrySlug(supabase, slug),
  ]);

  if (!country || roasters.length === 0) {
    return null;
  }

  const cityNames = [
    ...new Set(
      [
        ...cities.map((city) => city.name),
        ...roasters.map((roaster) => roaster.city?.trim() ?? ""),
      ].filter(Boolean),
    ),
  ].sort((a, b) => a.localeCompare(b));

  const pageRoasters = await Promise.all(
    roasters.map((roaster) => toPageRoaster(supabase, roaster)),
  );
  const totalRecipes = pageRoasters.reduce((sum, roaster) => sum + roaster.recipeCount, 0);
  const brewMethods = [...new Set(pageRoasters.flatMap((roaster) => roaster.brewMethods))].sort();
  const difficulties = [
    ...new Set(pageRoasters.flatMap((roaster) => roaster.difficulties)),
  ] as Difficulty[];

  const featuredRecipes = (await getFeaturedRecipesWithFallback(supabase, slug))
    .map(toCountryPageRecipe)
    .slice(0, 3);

  const fallbackFeatured =
    featuredRecipes.length > 0
      ? featuredRecipes
      : (
          await Promise.all(
            roasters.map((roaster) => getRecipesByRoasterWithFallback(supabase, roaster.slug)),
          )
        )
          .map((recipes) => recipes[0])
          .filter((recipe): recipe is PlaceholderRecipeDetail => recipe != null)
          .map(toCountryPageRecipe)
          .slice(0, 3);

  return {
    slug,
    flag: country.flag,
    dbCountry: country.name,
    coverImage: resolveGulfCountryBanner(slug),
    totalRoasters: roasters.length,
    totalRecipes,
    citiesCovered: cityNames.length,
    cities: cityNames,
    brewMethods,
    difficulties,
    roasters: pageRoasters,
    featuredRecipes: featuredRecipes.length > 0 ? featuredRecipes : fallbackFeatured,
  };
}

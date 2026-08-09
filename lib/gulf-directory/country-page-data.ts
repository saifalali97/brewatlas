import { getCachedSupabaseGulfCountryPageData } from "@/lib/data/cached-directory";
import { buildSeedGulfCountryPageData } from "@/lib/data/directory/seeds/country-page";
import {
  getPlaceholderRecipeDetail,
  listPlaceholderRecipeDetails,
  toCountryPageRecipe,
} from "@/lib/gulf-directory/placeholder-library";
import type { GulfDirectoryCountrySlug } from "@/lib/gulf-directory/countries";
import type {
  GulfCountryPageData,
  GulfCountryPageRecipe,
  GulfCountryPageRoaster,
} from "@/lib/gulf-directory/country-page-types";

export type {
  GulfCountryPageData,
  GulfCountryPageRecipe,
  GulfCountryPageRoaster,
} from "@/lib/gulf-directory/country-page-types";

/** Sync seed payload — used when Supabase has no directory rows. */
export function getPlaceholderGulfCountryPageData(
  slug: GulfDirectoryCountrySlug,
): GulfCountryPageData {
  return buildSeedGulfCountryPageData(slug);
}

/**
 * Country page payload: live Supabase data when roasters exist,
 * otherwise the full placeholder Gulf library.
 */
export async function getGulfCountryPageData(
  slug: GulfDirectoryCountrySlug,
): Promise<GulfCountryPageData> {
  const live = await getCachedSupabaseGulfCountryPageData(slug);
  if (live && live.roasters.length > 0) return live;
  return getPlaceholderGulfCountryPageData(slug);
}

export function findPlaceholderGulfCountryPageRoaster(
  countrySlug: GulfDirectoryCountrySlug,
  roasterSlug: string,
): GulfCountryPageRoaster | null {
  return (
    getPlaceholderGulfCountryPageData(countrySlug).roasters.find(
      (roaster) => roaster.slug === roasterSlug,
    ) ?? null
  );
}

/** @deprecated Prefer async country page loader + directory roaster queries. */
export function findGulfCountryPageRoaster(
  countrySlug: GulfDirectoryCountrySlug,
  roasterSlug: string,
): GulfCountryPageRoaster | null {
  return findPlaceholderGulfCountryPageRoaster(countrySlug, roasterSlug);
}

export function findGulfCountryPageRecipe(recipeSlug: string): GulfCountryPageRecipe | null {
  const detail = getPlaceholderRecipeDetail(recipeSlug);
  return detail ? toCountryPageRecipe(detail) : null;
}

export function findPlaceholderGulfCountrySlugForRoaster(
  roasterSlug: string,
): GulfDirectoryCountrySlug | null {
  for (const country of [
    "uae",
    "saudi-arabia",
    "kuwait",
    "qatar",
    "bahrain",
    "oman",
  ] as const) {
    if (findPlaceholderGulfCountryPageRoaster(country, roasterSlug)) {
      return country;
    }
  }
  return null;
}

/** @deprecated Prefer directory roaster countrySlug. */
export function findGulfCountrySlugForRoaster(
  roasterSlug: string,
): GulfDirectoryCountrySlug | null {
  return findPlaceholderGulfCountrySlugForRoaster(roasterSlug);
}

export function getGulfCountryPageRecipesForRoaster(
  countrySlug: GulfDirectoryCountrySlug,
  roasterSlug: string,
): GulfCountryPageRecipe[] {
  return listPlaceholderRecipeDetails()
    .filter(
      (recipe) => recipe.countrySlug === countrySlug && recipe.roasterSlug === roasterSlug,
    )
    .map(toCountryPageRecipe);
}

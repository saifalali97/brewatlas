import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { getDirectoryCitiesByCountrySlug } from "@/lib/data/directory/cities";
import { getDirectoryCountryBySlug } from "@/lib/data/directory/countries";
import { specialtyFromDescription } from "@/lib/data/directory/mappers";
import { getDirectoryRoastersByCountrySlug } from "@/lib/data/directory/roasters";
import type { DirectoryRoaster } from "@/lib/data/directory/types";
import { resolveGulfCountryBanner } from "@/lib/gulf-directory/country-images";
import type {
  GulfCountryPageData,
  GulfCountryPageRoaster,
} from "@/lib/gulf-directory/country-page-types";
import type { GulfDirectoryCountrySlug } from "@/lib/gulf-directory/countries";
import type { Difficulty } from "@/types/homepage";

function toPageRoaster(roaster: DirectoryRoaster): GulfCountryPageRoaster {
  return {
    id: roaster.id,
    name: roaster.name,
    slug: roaster.slug,
    city: roaster.city?.trim() || "—",
    logoUrl: roaster.logoUrl,
    recipeCount: roaster.recipeCount,
    specialty: specialtyFromDescription(roaster.description),
    // Recipe-derived filters arrive in a later phase.
    brewMethods: [],
    difficulties: [],
  };
}

/**
 * Build country page payload from Supabase countries/cities/roasters.
 * Returns null when the country has no published verified roasters
 * (caller should fall back to placeholder data).
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

  const totalRecipes = roasters.reduce((sum, roaster) => sum + roaster.recipeCount, 0);

  return {
    slug,
    flag: country.flag,
    dbCountry: country.name,
    coverImage: resolveGulfCountryBanner(slug),
    totalRoasters: roasters.length,
    totalRecipes,
    citiesCovered: cityNames.length,
    cities: cityNames,
    brewMethods: [],
    // Brew-method / difficulty filters are populated once recipes are wired.
    difficulties: [] as Difficulty[],
    roasters: roasters.map(toPageRoaster),
    featuredRecipes: [],
  };
}

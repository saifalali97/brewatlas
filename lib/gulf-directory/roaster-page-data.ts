import {
  getCachedDirectoryRoasterBySlug,
  getCachedDirectoryRoastersByCountrySlug,
} from "@/lib/data/cached-directory";
import { getCachedRecipesByRoaster } from "@/lib/data/cached-recipes";
import type { DirectoryRoaster } from "@/lib/data/directory/types";
import {
  GULF_ROASTER_SEEDS,
  getGulfRoasterSeedBySlug,
} from "@/lib/data/directory/seeds/gulf-roasters";
import { specialtyFromDescription } from "@/lib/data/directory/mappers";
import { resolveGulfCountryBanner } from "@/lib/gulf-directory/country-images";
import {
  findGulfCountryBySlug,
  type GulfDirectoryCountrySlug,
} from "@/lib/gulf-directory/countries";
import type { GulfCountryPageRoaster } from "@/lib/gulf-directory/country-page-types";
import {
  buildPlaceholderRoasterPageData,
  listAllPlaceholderRoasterParams,
  toRoasterPageRecipe,
  type GulfRoasterPageData,
  type GulfRoasterPageRecipe,
} from "@/lib/gulf-directory/placeholder-library";

export type { GulfRoasterPageData, GulfRoasterPageRecipe };

function toRelatedRoaster(roaster: DirectoryRoaster): GulfCountryPageRoaster {
  return {
    id: roaster.id,
    name: roaster.name,
    slug: roaster.slug,
    city: roaster.city?.trim() || "—",
    logoUrl: roaster.logoUrl,
    recipeCount: roaster.recipeCount,
    specialty: roaster.specialty?.trim() || specialtyFromDescription(roaster.description),
    brewMethods: [],
    difficulties: [],
  };
}

async function buildLiveRoasterPageData(
  countrySlug: GulfDirectoryCountrySlug,
  roaster: DirectoryRoaster,
  related: DirectoryRoaster[],
): Promise<GulfRoasterPageData> {
  const country = findGulfCountryBySlug(countrySlug)!;
  const seed = getGulfRoasterSeedBySlug(roaster.slug);
  const recipeDetails = await getCachedRecipesByRoaster(roaster.slug);
  const placeholderRecipes = recipeDetails.map(toRoasterPageRecipe);
  const brewMethods = [...new Set(placeholderRecipes.map((recipe) => recipe.brewMethod))].sort();

  return {
    id: roaster.id,
    slug: roaster.slug,
    name: roaster.name,
    city: roaster.city?.trim() || seed?.city || "—",
    countrySlug,
    dbCountry: country.dbCountry,
    specialty:
      roaster.specialty?.trim() ||
      seed?.specialty ||
      specialtyFromDescription(roaster.description),
    logoUrl: roaster.logoUrl,
    coverImage:
      roaster.bannerImageUrl?.trim() ||
      seed?.coverImage ||
      resolveGulfCountryBanner(countrySlug),
    website: roaster.website,
    instagram: roaster.instagram,
    about: roaster.description?.trim() || seed?.description || "",
    foundedYear: roaster.foundedYear ?? seed?.foundedYear ?? null,
    locationLabel: [roaster.city, country.dbCountry].filter(Boolean).join(", "),
    brewingStyles: brewMethods,
    totalRecipes: placeholderRecipes.length || roaster.recipeCount,
    recipes: placeholderRecipes,
    featuredRecipeSlug:
      recipeDetails.find((recipe) => recipe.featured)?.slug ??
      recipeDetails[0]?.slug ??
      null,
    relatedRoasters: related.map(toRelatedRoaster),
  };
}

/**
 * Roaster page payload from Supabase when available.
 * Falls back to TypeScript seeds / placeholder library before migrations land.
 */
export async function getGulfRoasterPageData(
  countrySlug: GulfDirectoryCountrySlug,
  roasterSlug: string,
): Promise<GulfRoasterPageData | null> {
  const live = await getCachedDirectoryRoasterBySlug(roasterSlug);
  if (live?.countrySlug === countrySlug) {
    const countryRoasters = await getCachedDirectoryRoastersByCountrySlug(countrySlug);
    const related = countryRoasters
      .filter((roaster) => roaster.slug !== roasterSlug)
      .slice(0, 3);
    return buildLiveRoasterPageData(countrySlug, live, related);
  }

  const seed = getGulfRoasterSeedBySlug(roasterSlug);
  if (seed?.countrySlug === countrySlug) {
    const related = GULF_ROASTER_SEEDS.filter(
      (roaster) => roaster.countrySlug === countrySlug && roaster.slug !== roasterSlug,
    )
      .slice(0, 3)
      .map(
        (item): DirectoryRoaster => ({
          id: `seed-${item.slug}`,
          name: item.name,
          slug: item.slug,
          country: item.country,
          countryId: null,
          countrySlug: item.countrySlug,
          emirate: item.emirate,
          city: item.city,
          cityId: null,
          website: item.website,
          instagram: item.instagram,
          logoUrl: item.logoUrl,
          bannerImageUrl: item.coverImage,
          description: item.description,
          specialty: item.specialty,
          foundedYear: item.foundedYear,
          featured: item.featured,
          verified: item.verified,
          recipeCount: 0,
        }),
      );

    const asDirectory: DirectoryRoaster = {
      id: `seed-${seed.slug}`,
      name: seed.name,
      slug: seed.slug,
      country: seed.country,
      countryId: null,
      countrySlug: seed.countrySlug,
      emirate: seed.emirate,
      city: seed.city,
      cityId: null,
      website: seed.website,
      instagram: seed.instagram,
      logoUrl: seed.logoUrl,
      bannerImageUrl: seed.coverImage,
      description: seed.description,
      specialty: seed.specialty,
      foundedYear: seed.foundedYear,
      featured: seed.featured,
      verified: seed.verified,
      recipeCount: 0,
    };

    return buildLiveRoasterPageData(countrySlug, asDirectory, related);
  }

  return buildPlaceholderRoasterPageData(countrySlug, roasterSlug);
}

export function listGulfRoasterPageParams(): Array<{
  countrySlug: GulfDirectoryCountrySlug;
  roasterSlug: string;
}> {
  const fromSeeds = GULF_ROASTER_SEEDS.map((roaster) => ({
    countrySlug: roaster.countrySlug,
    roasterSlug: roaster.slug,
  }));

  // Keep legacy placeholder params so older recipe-linked routes still resolve.
  const fromPlaceholders = listAllPlaceholderRoasterParams();
  const seen = new Set(fromSeeds.map((item) => `${item.countrySlug}:${item.roasterSlug}`));
  for (const item of fromPlaceholders) {
    const key = `${item.countrySlug}:${item.roasterSlug}`;
    if (!seen.has(key)) {
      fromSeeds.push(item);
      seen.add(key);
    }
  }

  return fromSeeds;
}

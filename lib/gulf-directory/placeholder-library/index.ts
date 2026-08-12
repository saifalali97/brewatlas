import {
  getGulfRecipeDetail,
  listGulfRecipeDetails,
  listGulfRecipesForRoaster,
} from "@/lib/data/directory/seeds/recipe-library";
import {
  getPlaceholderRoasterBySlug,
  getPlaceholderRoastersByCountry,
  PLACEHOLDER_ROASTERS,
  toCountryPageRoaster,
  type PlaceholderRoasterProfile,
} from "@/lib/gulf-directory/placeholder-library/roasters";
import { resolveGulfCountryBanner } from "@/lib/gulf-directory/country-images";
import {
  findGulfCountryBySlug,
  GULF_DIRECTORY_COUNTRIES,
  type GulfDirectoryCountrySlug,
} from "@/lib/gulf-directory/countries";
import type {
  GulfCountryPageData,
  GulfCountryPageRecipe,
  GulfCountryPageRoaster,
} from "@/lib/gulf-directory/country-page-types";
import type { GulfDirectoryCountrySummary } from "@/lib/data/gulf-directory";
import { GULF_FEATURED_ROASTER_LOOKUP } from "@/lib/gulf-directory/featured-roasters";
import type { PlaceholderRecipeDetail } from "@/lib/gulf-directory/placeholder-recipe-types";
import type { Difficulty } from "@/types/homepage";

/** Recipe card model for a Gulf roaster page (placeholder → future Supabase). */
export type GulfRoasterPageRecipe = {
  id: string;
  slug: string;
  name: string;
  coffeeName: string;
  brewMethod: string;
  difficulty: Difficulty;
  rating: number;
  brewTime: string;
  image: string;
  isIced: boolean;
  lead: string;
  origin: string | null;
  variety: string | null;
  process: string | null;
  roastLevel: string | null;
  flavorNotes: string[];
};

export type GulfRoasterPageData = {
  id: string;
  slug: string;
  name: string;
  city: string;
  countrySlug: GulfDirectoryCountrySlug;
  dbCountry: string;
  specialty: string;
  logoUrl: string | null;
  coverImage: string;
  website: string | null;
  instagram: string | null;
  about: string;
  foundedYear: number | null;
  locationLabel: string;
  brewingStyles: string[];
  totalRecipes: number;
  recipes: GulfRoasterPageRecipe[];
  featuredRecipeSlug: string | null;
  relatedRoasters: GulfCountryPageRoaster[];
};

/** Gulf seed recipe library — single source for directory recipe UI. */
export function listPlaceholderRecipeDetails(): PlaceholderRecipeDetail[] {
  return listGulfRecipeDetails();
}

export function getPlaceholderRecipeDetail(slug: string): PlaceholderRecipeDetail | null {
  return getGulfRecipeDetail(slug);
}

export function listPlaceholderRecipesForRoaster(
  roasterSlug: string,
): PlaceholderRecipeDetail[] {
  return listGulfRecipesForRoaster(roasterSlug);
}

export function toCountryPageRecipe(recipe: PlaceholderRecipeDetail): GulfCountryPageRecipe {
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

function cleanCardMeta(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed || trimmed === "—" || trimmed === "-") return null;
  return trimmed;
}

export function toRoasterPageRecipe(recipe: PlaceholderRecipeDetail): GulfRoasterPageRecipe {
  const processRaw = cleanCardMeta(recipe.process);
  const variety = cleanCardMeta(recipe.variety);
  // Process field sometimes already embeds variety ("Washed · Heirloom").
  const process =
    processRaw && variety && processRaw.includes(variety)
      ? processRaw.split("·")[0]?.trim() || processRaw
      : processRaw;

  return {
    id: `recipe-${recipe.slug}`,
    slug: recipe.slug,
    name: recipe.name,
    coffeeName: recipe.coffeeBeans,
    brewMethod: recipe.brewMethod,
    difficulty: recipe.difficulty,
    rating: recipe.rating,
    brewTime: recipe.brewTime,
    image: recipe.image,
    isIced: recipe.isIced,
    lead: recipe.lead,
    origin: cleanCardMeta(recipe.origin),
    variety,
    process,
    roastLevel: cleanCardMeta(recipe.roastLevel),
    flavorNotes: recipe.flavorTags.filter(Boolean).slice(0, 4),
  };
}

function recipeMetaForRoaster(roasterSlug: string) {
  const recipes = listPlaceholderRecipesForRoaster(roasterSlug);
  const brewMethods = [...new Set(recipes.map((recipe) => recipe.brewMethod))].sort();
  const difficulties = [
    ...new Set(recipes.map((recipe) => recipe.difficulty)),
  ] as Difficulty[];
  return {
    recipeCount: recipes.length,
    brewMethods,
    difficulties,
  };
}

export function buildPlaceholderCountryPageData(
  slug: GulfDirectoryCountrySlug,
): GulfCountryPageData {
  const country = findGulfCountryBySlug(slug)!;
  const roasters = getPlaceholderRoastersByCountry(slug).map((roaster) =>
    toCountryPageRoaster(roaster, recipeMetaForRoaster(roaster.slug)),
  );
  const recipes = listPlaceholderRecipeDetails().filter(
    (recipe) => recipe.countrySlug === slug,
  );
  const featuredRecipes = recipes
    .filter((recipe) => recipe.featured)
    .map(toCountryPageRecipe)
    .slice(0, 3);

  const fallbackFeatured =
    featuredRecipes.length > 0
      ? featuredRecipes
      : roasters
          .map((roaster) => listPlaceholderRecipesForRoaster(roaster.slug)[0])
          .filter((recipe): recipe is PlaceholderRecipeDetail => recipe != null)
          .map(toCountryPageRecipe)
          .slice(0, 3);

  const cities = [...new Set(roasters.map((roaster) => roaster.city))].sort();
  const brewMethods = [...new Set(recipes.map((recipe) => recipe.brewMethod))].sort();
  const difficulties = [
    ...new Set(recipes.map((recipe) => recipe.difficulty)),
  ] as Difficulty[];

  return {
    slug,
    flag: country.flag,
    dbCountry: country.dbCountry,
    coverImage: resolveGulfCountryBanner(slug),
    totalRoasters: roasters.length,
    totalRecipes: recipes.length,
    citiesCovered: cities.length,
    cities,
    brewMethods,
    difficulties,
    roasters,
    featuredRecipes: featuredRecipes.length > 0 ? featuredRecipes : fallbackFeatured,
  };
}

export function getPlaceholderGulfDirectorySummaries(): GulfDirectoryCountrySummary[] {
  return GULF_DIRECTORY_COUNTRIES.map((country) => {
    const page = buildPlaceholderCountryPageData(country.slug);
    const featuredConfig = GULF_FEATURED_ROASTER_LOOKUP[country.slug];
    const featured =
      page.roasters.find((roaster) =>
        roaster.name.toLowerCase().includes(featuredConfig.nameMatch.toLowerCase()),
      ) ?? page.roasters[0];

    return {
      slug: country.slug,
      dbCountry: country.dbCountry,
      flag: country.flag,
      bannerImage: resolveGulfCountryBanner(country.slug),
      roasterCount: page.totalRoasters,
      recipeCount: page.totalRecipes,
      featuredRoaster: featured
        ? {
            name: featured.name,
            logoUrl: featured.logoUrl ?? featuredConfig.fallbackLogoImage ?? null,
          }
        : {
            name: featuredConfig.displayName,
            logoUrl: featuredConfig.fallbackLogoImage ?? null,
          },
    };
  });
}

export function buildPlaceholderRoasterPageData(
  countrySlug: GulfDirectoryCountrySlug,
  roasterSlug: string,
): GulfRoasterPageData | null {
  const profile = getPlaceholderRoasterBySlug(roasterSlug);
  if (!profile || profile.countrySlug !== countrySlug) return null;

  const country = findGulfCountryBySlug(countrySlug)!;
  const recipeDetails = listPlaceholderRecipesForRoaster(roasterSlug);
  const recipes = recipeDetails.map(toRoasterPageRecipe);
  const countryPage = buildPlaceholderCountryPageData(countrySlug);
  const relatedRoasters = countryPage.roasters
    .filter((roaster) => roaster.slug !== roasterSlug)
    .slice(0, 3);
  const meta = recipeMetaForRoaster(roasterSlug);

  return {
    id: profile.id,
    slug: profile.slug,
    name: profile.name,
    city: profile.city,
    countrySlug,
    dbCountry: country.dbCountry,
    specialty: profile.specialty,
    logoUrl: profile.logoUrl,
    coverImage: resolveGulfCountryBanner(countrySlug),
    website: profile.website,
    instagram: profile.instagram,
    about: profile.about,
    foundedYear: profile.foundedYear,
    locationLabel: profile.locationLabel,
    brewingStyles: meta.brewMethods,
    totalRecipes: recipes.length,
    recipes,
    featuredRecipeSlug:
      recipeDetails.find((recipe) => recipe.featured)?.slug ??
      recipeDetails[0]?.slug ??
      null,
    relatedRoasters,
  };
}

export function listAllPlaceholderRoasterParams(): Array<{
  countrySlug: GulfDirectoryCountrySlug;
  roasterSlug: string;
}> {
  return PLACEHOLDER_ROASTERS.map((roaster) => ({
    countrySlug: roaster.countrySlug,
    roasterSlug: roaster.slug,
  }));
}

export {
  PLACEHOLDER_ROASTERS,
  getPlaceholderRoasterBySlug,
  getPlaceholderRoastersByCountry,
  toCountryPageRoaster,
  type PlaceholderRoasterProfile,
};

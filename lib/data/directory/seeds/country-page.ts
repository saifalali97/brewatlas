import {
  GULF_ROASTER_SEEDS,
  listGulfRoasterSeedsByCountry,
  type GulfRoasterSeed,
} from "@/lib/data/directory/seeds/gulf-roasters";
import {
  listFeaturedGulfRecipesForCountry,
  listGulfRecipesForRoaster,
} from "@/lib/data/directory/seeds/recipe-library";
import type { GulfDirectoryCountrySummary } from "@/lib/data/gulf-directory";
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
import { GULF_FEATURED_ROASTER_LOOKUP } from "@/lib/gulf-directory/featured-roasters";
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

function toPageRoaster(seed: GulfRoasterSeed): GulfCountryPageRoaster {
  const recipes = listGulfRecipesForRoaster(seed.slug);
  return {
    id: `seed-${seed.slug}`,
    name: seed.name,
    slug: seed.slug,
    city: seed.city,
    logoUrl: seed.logoUrl,
    recipeCount: recipes.length,
    specialty: seed.specialty,
    brewMethods: [...new Set(recipes.map((recipe) => recipe.brewMethod))].sort(),
    difficulties: [...new Set(recipes.map((recipe) => recipe.difficulty))] as Difficulty[],
  };
}

/** Country page payload built from canonical TypeScript Gulf seeds. */
export function buildSeedGulfCountryPageData(
  slug: GulfDirectoryCountrySlug,
): GulfCountryPageData {
  const country = findGulfCountryBySlug(slug)!;
  const seeds = listGulfRoasterSeedsByCountry(slug);
  const roasters = seeds.map(toPageRoaster);
  const cities = [...new Set(seeds.map((seed) => seed.city))].sort();
  const brewMethods = [...new Set(roasters.flatMap((roaster) => roaster.brewMethods))].sort();
  const difficulties = [
    ...new Set(roasters.flatMap((roaster) => roaster.difficulties)),
  ] as Difficulty[];

  const featuredRecipes = listFeaturedGulfRecipesForCountry(slug)
    .map(toCountryPageRecipe)
    .slice(0, 3);

  const fallbackFeatured =
    featuredRecipes.length > 0
      ? featuredRecipes
      : seeds
          .map((seed) => listGulfRecipesForRoaster(seed.slug)[0])
          .filter((recipe): recipe is NonNullable<typeof recipe> => recipe != null)
          .map(toCountryPageRecipe)
          .slice(0, 3);

  return {
    slug,
    flag: country.flag,
    dbCountry: country.dbCountry,
    coverImage: resolveGulfCountryBanner(slug),
    totalRoasters: roasters.length,
    totalRecipes: roasters.reduce((sum, roaster) => sum + roaster.recipeCount, 0),
    citiesCovered: cities.length,
    cities,
    brewMethods,
    difficulties,
    roasters,
    featuredRecipes: featuredRecipes.length > 0 ? featuredRecipes : fallbackFeatured,
  };
}

export function getSeedGulfDirectorySummaries(): GulfDirectoryCountrySummary[] {
  return GULF_DIRECTORY_COUNTRIES.map((country) => {
    const page = buildSeedGulfCountryPageData(country.slug);
    const featuredConfig = GULF_FEATURED_ROASTER_LOOKUP[country.slug];
    const featured =
      page.roasters.find((roaster) =>
        roaster.name.toLowerCase().includes(featuredConfig.nameMatch.toLowerCase()),
      ) ??
      page.roasters.find((roaster) =>
        GULF_ROASTER_SEEDS.some((seed) => seed.slug === roaster.slug && seed.featured),
      ) ??
      page.roasters[0];

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

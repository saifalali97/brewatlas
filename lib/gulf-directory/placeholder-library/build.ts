import { METHOD_TEMPLATES } from "@/lib/gulf-directory/placeholder-library/method-templates";
import { RECIPE_SEEDS } from "@/lib/gulf-directory/placeholder-library/recipes-data";
import {
  getPlaceholderRoasterBySlug,
  PLACEHOLDER_ROASTERS,
} from "@/lib/gulf-directory/placeholder-library/roasters";
import type { PlaceholderRecipeDetail } from "@/lib/gulf-directory/placeholder-recipe-types";

function buildSimilarSlugs(slug: string, roasterSlug: string, countrySlug: string): string[] {
  const sameRoaster = RECIPE_SEEDS.filter(
    (seed) => seed.roasterSlug === roasterSlug && seed.slug !== slug,
  ).map((seed) => seed.slug);

  if (sameRoaster.length >= 2) return sameRoaster.slice(0, 2);

  const sameCountry = RECIPE_SEEDS.filter((seed) => {
    if (seed.slug === slug) return false;
    const roaster = getPlaceholderRoasterBySlug(seed.roasterSlug);
    return roaster?.countrySlug === countrySlug;
  }).map((seed) => seed.slug);

  return [...new Set([...sameRoaster, ...sameCountry])].slice(0, 2);
}

/** Expand compact seeds into full PlaceholderRecipeDetail records. */
export function buildPlaceholderRecipeLibrary(): PlaceholderRecipeDetail[] {
  const missingRoasters: string[] = [];

  const recipes = RECIPE_SEEDS.map((seed) => {
    const roaster = getPlaceholderRoasterBySlug(seed.roasterSlug);
    if (!roaster) {
      missingRoasters.push(seed.roasterSlug);
      return null;
    }

    const method = METHOD_TEMPLATES[seed.methodKey];

    const detail: PlaceholderRecipeDetail = {
      slug: seed.slug,
      name: seed.name,
      lead: seed.lead,
      image: method.image,
      roasterName: roaster.name,
      roasterSlug: roaster.slug,
      countrySlug: roaster.countrySlug,
      city: roaster.city,
      brewMethod: method.brewMethod,
      difficulty: seed.difficulty,
      rating: seed.rating,
      brewTime: method.brewTime,
      isIced: method.isIced,
      coffeeBeans: seed.coffeeBeans,
      roastLevel: seed.roastLevel,
      origin: seed.origin,
      process: seed.process,
      roastDate: "Within 7–28 days",
      water: method.water,
      grinder: method.grinder,
      brewer: method.brewer,
      filter: method.filter,
      dose: method.dose,
      waterAmount: method.waterAmount,
      temperature: method.temperature,
      ratio: method.ratio,
      grindSize: method.grindSize,
      bloom: method.bloom,
      totalBrewTime: method.totalBrewTime,
      steps: method.steps,
      flavorProfile: method.defaultFlavor,
      tastingNotes: seed.tastingNotes,
      flavorTags: seed.flavorTags,
      equipment: method.equipment,
      similarSlugs: [],
    };

    return detail;
  }).filter((recipe): recipe is PlaceholderRecipeDetail => recipe != null);

  if (missingRoasters.length > 0) {
    const unique = [...new Set(missingRoasters)];
    throw new Error(
      `Placeholder recipes reference unknown roasters: ${unique.join(", ")}`,
    );
  }

  // Second pass for similar slugs once the full set exists.
  return recipes.map((recipe) => ({
    ...recipe,
    similarSlugs: buildSimilarSlugs(recipe.slug, recipe.roasterSlug, recipe.countrySlug),
  }));
}

/** Validate every roaster owns recipes and featured slugs resolve. */
export function assertPlaceholderLibraryIntegrity(recipes: PlaceholderRecipeDetail[]) {
  const slugs = new Set(recipes.map((recipe) => recipe.slug));
  const recipesByRoaster = new Map<string, number>();
  for (const recipe of recipes) {
    recipesByRoaster.set(
      recipe.roasterSlug,
      (recipesByRoaster.get(recipe.roasterSlug) ?? 0) + 1,
    );
  }

  for (const roaster of PLACEHOLDER_ROASTERS) {
    if ((recipesByRoaster.get(roaster.slug) ?? 0) < 1) {
      throw new Error(`Roaster ${roaster.slug} has no placeholder recipes`);
    }
    if (!slugs.has(roaster.featuredRecipeSlug)) {
      throw new Error(
        `Roaster ${roaster.slug} featuredRecipeSlug missing: ${roaster.featuredRecipeSlug}`,
      );
    }
  }
}

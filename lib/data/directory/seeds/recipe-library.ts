import {
  GULF_COFFEE_CATALOG_SEEDS,
  type GulfCoffeeCatalogSeed,
} from "@/lib/data/directory/seeds/gulf-coffee-catalog";
import {
  GULF_ROASTER_SEEDS,
  getGulfRoasterSeedBySlug,
} from "@/lib/data/directory/seeds/gulf-roasters";
import { GULF_RECIPE_SEEDS } from "@/lib/data/directory/seeds/gulf-recipes-data";
import type { GulfRecipeSeed } from "@/lib/data/directory/seeds/gulf-recipe-types";
import { GULF_METHOD_TEMPLATES } from "@/lib/data/directory/seeds/recipe-methods";
import type { GulfDirectoryCountrySlug } from "@/lib/gulf-directory/countries";
import { resolveRecipeCardImage } from "@/lib/gulf-directory/recipe-card-image";
import type {
  PlaceholderRecipeDetail,
  PlaceholderRecipeStep,
} from "@/lib/gulf-directory/placeholder-recipe-types";

const COVERAGE_MINIMUM: Record<GulfDirectoryCountrySlug, number> = {
  uae: 4,
  "saudi-arabia": 3,
  kuwait: 3,
  qatar: 3,
  bahrain: 3,
  oman: 3,
};

function buildSimilarSlugs(
  slug: string,
  roasterSlug: string,
  countrySlug: GulfDirectoryCountrySlug,
): string[] {
  const sameRoaster = GULF_RECIPE_SEEDS.filter(
    (seed) => seed.roasterSlug === roasterSlug && seed.slug !== slug,
  ).map((seed) => seed.slug);

  if (sameRoaster.length >= 2) return sameRoaster.slice(0, 2);

  const sameCountry = GULF_RECIPE_SEEDS.filter((seed) => {
    if (seed.slug === slug) return false;
    const roaster = getGulfRoasterSeedBySlug(seed.roasterSlug);
    return roaster?.countrySlug === countrySlug;
  }).map((seed) => seed.slug);

  return [...new Set([...sameRoaster, ...sameCountry])].slice(0, 2);
}

function findCatalogCoffee(seed: GulfRecipeSeed): GulfCoffeeCatalogSeed | null {
  const prefix = `${seed.roasterSlug}-`;
  const suffix = "-v60-hot";
  if (seed.slug.startsWith(prefix) && seed.slug.endsWith(suffix)) {
    const coffeeSlug = seed.slug.slice(prefix.length, seed.slug.length - suffix.length);
    return (
      GULF_COFFEE_CATALOG_SEEDS.find(
        (coffee) => coffee.roasterSlug === seed.roasterSlug && coffee.slug === coffeeSlug,
      ) ?? null
    );
  }
  return (
    GULF_COFFEE_CATALOG_SEEDS.find(
      (coffee) => coffee.roasterSlug === seed.roasterSlug && coffee.name === seed.coffeeBeans,
    ) ?? null
  );
}

function officialSteps(
  coffee: GulfCoffeeCatalogSeed,
  prefix: string,
): PlaceholderRecipeStep[] | null {
  const official = coffee.officialRecipe;
  if (!official) return null;
  // Absolute-style cumulative totals: "40 > 160 > 240 > 300"
  const totals = official.pourStructure
    .split(/>|→/)
    .map((part) => Number(part.replace(/[^\d.]/g, "")))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (totals.length < 2) return null;

  const steps: PlaceholderRecipeStep[] = [];
  let prev = 0;
  let at = 0;
  totals.forEach((total, index) => {
    const amount = Math.max(0, Math.round(total - prev));
    prev = total;
    const duration = index === 0 ? 45 : 35;
    steps.push({
      id: `${prefix}-${index + 1}`,
      pourNumber: index + 1,
      waterAmount: `${amount} g`,
      timeLabel: index === 0 ? "0:00–0:45" : `${Math.floor(at / 60)}:${String(at % 60).padStart(2, "0")}`,
      notes:
        index === 0
          ? "Bloom gently and swirl once to degas."
          : index === totals.length - 1
            ? "Final pour to target; keep the bed flat."
            : "Center pour in slow circles toward the next total.",
      atSeconds: at,
      durationSeconds: duration,
    });
    at += duration;
  });
  steps.push({
    id: `${prefix}-drawdown`,
    pourNumber: steps.length + 1,
    waterAmount: "Drawdown",
    timeLabel: official.brewTime,
    notes: "Finish with a gentle swirl; target drawdown in the window above.",
    atSeconds: at,
    durationSeconds: 45,
  });
  return steps;
}

function expandSeed(seed: GulfRecipeSeed): PlaceholderRecipeDetail | null {
  const roaster = getGulfRoasterSeedBySlug(seed.roasterSlug);
  if (!roaster) return null;

  const method = GULF_METHOD_TEMPLATES[seed.methodKey];
  const catalog = findCatalogCoffee(seed);
  const official = catalog?.officialRecipe ?? null;
  const coffeeLabel = [seed.coffeeBeans, seed.producer].filter(Boolean).join(" · ");
  const image = resolveRecipeCardImage({
    productImageUrl: catalog?.productImageUrl,
    recipeImageUrl: null,
    fallbackImageUrl: method.image,
  });
  const steps = (catalog && officialSteps(catalog, seed.slug)) || method.steps;

  return {
    slug: seed.slug,
    name: seed.name,
    lead: seed.lead,
    image,
    roasterName: roaster.name,
    roasterSlug: roaster.slug,
    countrySlug: roaster.countrySlug,
    city: roaster.city,
    brewMethod: method.brewMethod,
    difficulty: seed.difficulty,
    rating: seed.rating,
    brewTime: official?.brewTime ?? method.brewTime,
    isIced: method.isIced,
    coffeeBeans: coffeeLabel,
    roastLevel: seed.roastLevel,
    origin: seed.origin,
    process: seed.variety ? `${seed.process} · ${seed.variety}` : seed.process,
    roastDate: "Within 7–28 days",
    water: method.water,
    grinder: method.grinder,
    brewer: method.brewer,
    filter: method.filter,
    dose: official ? `${official.doseG} g` : method.dose,
    waterAmount: official ? `${official.waterG} g` : method.waterAmount,
    temperature: official ? `${official.tempC}°C` : method.temperature,
    ratio: official ? `1:${official.ratio}` : method.ratio,
    grindSize: seed.grindSetting ?? official?.grindNote ?? method.grindSize,
    bloom: official
      ? `${Math.max(20, Math.round(official.doseG * 2))} g / 0:45`
      : method.bloom,
    totalBrewTime: official?.brewTime ?? method.totalBrewTime,
    steps,
    flavorProfile: method.defaultFlavor,
    tastingNotes: seed.brewingTips
      ? `${seed.tastingNotes} Tip: ${seed.brewingTips}`
      : seed.tastingNotes,
    flavorTags: seed.flavorTags,
    equipment: method.equipment,
    similarSlugs: [],
    producer: seed.producer,
    variety: seed.variety,
    tds: seed.tds,
    extractionYield: seed.extractionYield,
    brewingTips: seed.brewingTips,
    featured: seed.featured,
  };
}

/** Expand Gulf recipe seeds into PlaceholderRecipeDetail records. */
export function buildGulfRecipeLibrary(): PlaceholderRecipeDetail[] {
  const missingRoasters: string[] = [];

  const recipes = GULF_RECIPE_SEEDS.map((seed) => {
    const detail = expandSeed(seed);
    if (!detail) missingRoasters.push(seed.roasterSlug);
    return detail;
  }).filter((recipe): recipe is PlaceholderRecipeDetail => recipe != null);

  if (missingRoasters.length > 0) {
    throw new Error(
      `Gulf recipes reference unknown roasters: ${[...new Set(missingRoasters)].join(", ")}`,
    );
  }

  return recipes.map((recipe) => ({
    ...recipe,
    similarSlugs: buildSimilarSlugs(recipe.slug, recipe.roasterSlug, recipe.countrySlug),
  }));
}

/** Validate coverage targets and that every seed roaster owns recipes. */
export function assertGulfRecipeLibraryIntegrity(recipes: PlaceholderRecipeDetail[]) {
  const byRoaster = new Map<string, number>();
  for (const recipe of recipes) {
    byRoaster.set(recipe.roasterSlug, (byRoaster.get(recipe.roasterSlug) ?? 0) + 1);
  }

  for (const roaster of GULF_ROASTER_SEEDS) {
    const count = byRoaster.get(roaster.slug) ?? 0;
    const minimum = COVERAGE_MINIMUM[roaster.countrySlug];
    if (count < minimum) {
      throw new Error(
        `Roaster ${roaster.slug} has ${count} recipes; ${roaster.countrySlug} requires ≥${minimum}`,
      );
    }
  }

  const orphan = [...byRoaster.keys()].filter(
    (slug) => !GULF_ROASTER_SEEDS.some((roaster) => roaster.slug === slug),
  );
  if (orphan.length > 0) {
    throw new Error(`Recipes attached to unknown roasters: ${orphan.join(", ")}`);
  }
}

const GULF_RECIPES = buildGulfRecipeLibrary();
assertGulfRecipeLibraryIntegrity(GULF_RECIPES);

export function listGulfRecipeDetails(): PlaceholderRecipeDetail[] {
  return GULF_RECIPES;
}

export function getGulfRecipeDetail(slug: string): PlaceholderRecipeDetail | null {
  return GULF_RECIPES.find((recipe) => recipe.slug === slug) ?? null;
}

export function listGulfRecipesForRoaster(roasterSlug: string): PlaceholderRecipeDetail[] {
  return GULF_RECIPES.filter((recipe) => recipe.roasterSlug === roasterSlug);
}

export function listFeaturedGulfRecipesForCountry(
  countrySlug: GulfDirectoryCountrySlug,
): PlaceholderRecipeDetail[] {
  return GULF_RECIPES.filter(
    (recipe) => recipe.countrySlug === countrySlug && recipe.featured,
  );
}

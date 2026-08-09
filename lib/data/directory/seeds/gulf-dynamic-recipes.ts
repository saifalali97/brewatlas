import type { GulfRecipeSeed } from "@/lib/data/directory/seeds/gulf-recipe-types";
import { GULF_COFFEE_CATALOG_SEEDS } from "@/lib/data/directory/seeds/gulf-coffee-catalog";

function flavorTags(notes: string[]): string[] {
  return notes.slice(0, 4);
}

function originLabel(coffee: (typeof GULF_COFFEE_CATALOG_SEEDS)[number]): string {
  if (coffee.region) return `${coffee.region}, ${coffee.originCountry}`;
  return coffee.originCountry;
}

function tastingNotes(coffee: (typeof GULF_COFFEE_CATALOG_SEEDS)[number]): string {
  if (coffee.flavorNotes.length > 0) {
    return `${coffee.flavorNotes.join(", ")}.`;
  }
  return `Filter profile for ${coffee.name} from ${coffee.originCountry}.`;
}

/**
 * Official / BrewAtlas V60 recipes for the Dynamic Recipe System coffee catalog.
 * When a roaster publishes a V60 recipe, dose/ratio/grind are carried into the seed.
 */
export const GULF_DYNAMIC_RECIPE_SEEDS: GulfRecipeSeed[] = GULF_COFFEE_CATALOG_SEEDS.map((coffee) => {
  const official = coffee.officialRecipe;
  const slug = `${coffee.roasterSlug}-${coffee.slug}-v60-hot`;
  const notes = tastingNotes(coffee);
  return {
    slug,
    name: `${coffee.name} V60`,
    roasterSlug: coffee.roasterSlug,
    methodKey: "v60-hot" as const,
    difficulty: "Intermediate" as const,
    coffeeBeans: coffee.name,
    producer: coffee.producer,
    variety: coffee.variety,
    roastLevel: coffee.roastLevel ?? "Light-medium",
    origin: originLabel(coffee),
    process: coffee.process ?? "Not published",
    tastingNotes: notes,
    flavorTags: flavorTags(coffee.flavorNotes),
    lead: official
      ? `Roaster Recommended V60 for ${coffee.name} — ${official.doseG} g at 1:${official.ratio}, ${official.brewTime}.`
      : `BrewAtlas filter guide for ${coffee.name} from ${coffee.originCountry} — customize dose, ratio, method, and hot/iced live.`,
    brewingTips: official?.grindNote
      ? `Roaster grind: ${official.grindNote}. Pour structure: ${official.pourStructure}.`
      : "Start with the suggested dose and ratio, then personalize pour structure for your grinder.",
    grindSetting: official?.grindNote ?? null,
    tds: null,
    extractionYield: null,
    rating: coffee.available ? 4.6 : 4.4,
    featured: coffee.available && Boolean(official),
  };
});

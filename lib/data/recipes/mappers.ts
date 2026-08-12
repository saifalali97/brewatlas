import type { GulfRecipeRow } from "@/lib/data/recipes/types";
import {
  findGulfCountryBySlug,
  type GulfDirectoryCountrySlug,
} from "@/lib/gulf-directory/countries";
import { resolveRecipeCardImage } from "@/lib/gulf-directory/recipe-card-image";
import type { PlaceholderRecipeDetail } from "@/lib/gulf-directory/placeholder-recipe-types";
import type { Difficulty } from "@/types/homepage";

function brewVar(row: GulfRecipeRow, key: string, fallback = "—"): string {
  const match = (row.recipe_brew_variables ?? []).find((item) => item.key === key);
  return match?.value?.trim() || fallback;
}

function formatGramsLabel(value: number | null | undefined): string | null {
  if (value == null || !Number.isFinite(Number(value)) || Number(value) <= 0) return null;
  return `${Number(value)} g`;
}

function formatCelsiusLabel(value: number | null | undefined): string | null {
  if (value == null || !Number.isFinite(Number(value))) return null;
  return `${Number(value)}°C`;
}

function asDifficulty(value: string | null | undefined): Difficulty {
  if (value === "Beginner" || value === "Advanced" || value === "Intermediate") {
    return value;
  }
  return "Intermediate";
}

function asCountrySlug(row: GulfRecipeRow): GulfDirectoryCountrySlug | null {
  const slug = row.countries?.slug;
  if (!slug) return null;
  return findGulfCountryBySlug(slug)?.slug ?? null;
}

/** Prefer 0–100 Gulf flavor columns; fall back to 1–10 recipe scores × 10. */
function flavorScore(
  hundred: number | null | undefined,
  tenScale: number | null | undefined,
  fallback: number,
): number {
  if (hundred != null) return hundred;
  if (tenScale != null) {
    return tenScale <= 10 ? Math.round(tenScale * 10) : tenScale;
  }
  return fallback;
}

/** Map a Gulf DB recipe (+ children) into the existing PlaceholderRecipeDetail UI model. */
export function mapGulfRecipeRowToPlaceholderDetail(
  row: GulfRecipeRow,
): PlaceholderRecipeDetail | null {
  const countrySlug = asCountrySlug(row);
  const roasterSlug = row.roasters?.slug;
  if (!countrySlug || !roasterSlug) return null;

  const steps = [...(row.recipe_steps ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order || a.pour_number - b.pour_number)
    .map((step) => ({
      id: step.step_key ?? step.id,
      pourNumber: step.pour_number,
      waterAmount: step.water_amount ?? "—",
      timeLabel: step.time_label ?? "—",
      notes: step.notes,
      atSeconds: step.at_seconds,
      durationSeconds: step.duration_seconds,
    }));

  const equipment = [...(row.recipe_equipment ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((item) => ({ name: item.name, detail: item.detail }));

  const coffee = row.coffees;
  const flavorTagsFromRecipe = [...(row.recipe_flavor_notes ?? [])]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((item) => item.note);
  const flavorTags =
    flavorTagsFromRecipe.length > 0
      ? flavorTagsFromRecipe
      : (coffee?.flavor_notes ?? []).filter(Boolean);
  const process =
    row.process?.trim() ||
    coffee?.process?.trim() ||
    "—";
  const variety = row.variety?.trim() || coffee?.variety?.trim() || null;
  const roastLevel = row.roast_level?.trim() || coffee?.roast_level?.trim() || "—";

  return {
    slug: row.slug,
    name: row.title,
    lead: row.description?.trim() || "",
    image: resolveRecipeCardImage({
      productImageUrl: coffee?.product_image_url,
      recipeImageUrl: row.cover_image_url,
      fallbackImageUrl: "/images/methods/pour-over.webp",
    }),
    roasterName: row.roasters?.name ?? "Roaster",
    roasterSlug,
    countrySlug,
    city: row.cities?.name ?? row.roasters?.city ?? "—",
    brewMethod: row.brew_method ?? "V60",
    difficulty: asDifficulty(row.difficulty),
    rating: row.rating ?? 4.5,
    brewTime: brewVar(row, "brewTime", row.estimated_brew_time ?? "—"),
    isIced: row.is_iced,
    coffeeBeans: row.coffee_beans ?? coffee?.name ?? "—",
    roastLevel,
    origin: row.bean_origin ?? "—",
    process: variety ? `${process} · ${variety}` : process,
    roastDate: row.roast_date_label ?? "Within 7–28 days",
    water: brewVar(row, "water", row.water_recommendation ?? "—"),
    grinder: brewVar(row, "grinder", "Burr grinder"),
    brewer: brewVar(row, "brewer", row.equipment_notes ?? "—"),
    filter: brewVar(row, "filter", "—"),
    dose: brewVar(row, "dose", formatGramsLabel(row.coffee_dose) ?? "—"),
    waterAmount: brewVar(row, "waterAmount", formatGramsLabel(row.water_amount) ?? "—"),
    temperature: brewVar(row, "temperature", formatCelsiusLabel(row.water_temperature) ?? "—"),
    ratio: brewVar(row, "ratio", row.ratio ?? "—"),
    grindSize: brewVar(row, "grindSize", row.grind_size ?? "—"),
    bloom: brewVar(row, "bloom"),
    totalBrewTime: brewVar(row, "totalBrewTime", row.total_brew_time ?? "—"),
    steps,
    flavorProfile: {
      sweetness: flavorScore(row.flavor_sweetness, row.sweetness, 70),
      acidity: flavorScore(row.flavor_acidity, row.acidity, 70),
      body: flavorScore(row.flavor_body, row.body, 60),
      bitterness: flavorScore(row.flavor_bitterness, row.bitterness, 25),
      finish: flavorScore(row.flavor_finish, null, 65),
    },
    tastingNotes: row.tasting_notes ?? "",
    flavorTags,
    equipment,
    similarSlugs: row.similar_slugs ?? [],
    producer: row.producer,
    variety,
    tds: brewVar(row, "tds", "") || null,
    extractionYield: brewVar(row, "extractionYield", "") || null,
    brewingTips: row.brewing_tips,
    featured: row.featured,
    sourceUrl: row.source_url ?? null,
  };
}

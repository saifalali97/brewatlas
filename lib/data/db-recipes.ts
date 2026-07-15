import type { SupabaseClient } from "@supabase/supabase-js";
import { getAllRecipeSlugs } from "@/lib/data/recipes";
import { processScheduledRecipePublishes } from "@/lib/data/recipe-publishing";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import type { Dictionary } from "@/lib/i18n/types";
import { slugify } from "@/lib/utils/slugify";
import { toSafeArray } from "@/lib/utils/arrays";
import {
  RECIPE_IMAGE_PLACEHOLDER,
  type DbRecipeRow,
  type LookupOption,
  type RecipeFullDetail,
  type RecipeListItem,
} from "@/types/recipe";

export const RECIPE_SELECT = `
  id, title, slug, description, video_url, difficulty, estimated_brew_time,
  author_id, coffee_dose, water_amount, ice_amount, grind_size, water_temperature,
  ratio, bloom_amount, bloom_time, total_brew_time, beverage_weight, tds,
  extraction_percentage, tasting_notes, instructions, cover_image_url, cover_media_asset_id,
  cover_image_width, cover_image_height, cover_image_alt, cover_image_blur,
  sweetness, acidity, body, bitterness,
  featured, premium_only, published,
  status, scheduled_publish_at, archived_at,
  seo_title, seo_description, canonical_url,
  created_at, updated_at,
  brewing_methods ( id, name ),
  devices ( id, name ),
  grinders ( id, name ),
  filter_types ( id, name ),
  water_profiles ( id, name ),
  coffees (
    id, name, farm, producer, variety, process, altitude, roast_level, roast_date,
    roasters ( id, name ),
    origins ( id, country, region )
  ),
  recipe_pours ( id, pour_number, water_amount, time_label, notes ),
  recipe_images ( id, url, position, media_asset_id, width, height, alt_text, blur_data_url ),
  recipe_tags ( tags ( id, name, slug ) ),
  xbloom_profiles ( id )
`;

function computeRatio(row: DbRecipeRow): string {
  if (row.ratio) return row.ratio;
  if (row.coffee_dose && row.water_amount) {
    return `1:${Math.round((row.water_amount / row.coffee_dose) * 10) / 10}`;
  }
  return "—";
}

/** Maps a raw DB `recipes` row (with lookup joins) into the shape shared with static catalog recipes. `dictionary` supplies locale-aware fallback copy for fields the row doesn't have (e.g. no linked origin/brewing method). */
export function mapDbRecipeToListItem(row: DbRecipeRow, dictionary: Dictionary): RecipeListItem {
  const tags = toSafeArray(row.recipe_tags)
    .map((rt) => rt.tags?.name)
    .filter((name): name is string => Boolean(name));
  const hasXBloomProfile = toSafeArray(row.xbloom_profiles).length > 0;

  return {
    name: row.title,
    country: row.coffees?.origins?.country ?? dictionary.recipeDetail.dashValue,
    origin: row.coffees?.origins
      ? `${row.coffees.origins.region}, ${row.coffees.origins.country}`
      : dictionary.recipesPage.originNotSpecified,
    brewMethod: row.brewing_methods?.name ?? dictionary.recipeDetail.customValue,
    roastLevel: row.coffees?.roast_level ?? dictionary.recipesPage.communityRoast,
    difficulty: row.difficulty ?? "Intermediate",
    ratio: computeRatio(row),
    time: row.total_brew_time ?? row.estimated_brew_time ?? dictionary.recipeDetail.dashValue,
    notes: row.tasting_notes ?? row.description ?? dictionary.recipeDetail.noTastingNotes,
    image: row.cover_image_url ?? RECIPE_IMAGE_PLACEHOLDER,
    imageBlur: row.cover_image_blur ?? null,
    imageWidth: row.cover_image_width ?? null,
    imageHeight: row.cover_image_height ?? null,
    premium: row.premium_only,
    featured: row.featured,
    slug: row.slug,
    source: "db",
    id: row.id,
    authorId: row.author_id,
    published: row.published,
    roasterName: row.coffees?.roasters?.name,
    deviceName: row.devices?.name,
    instructions: row.instructions,
    tags,
    searchableExtras: [
      row.coffees?.name,
      row.coffees?.farm,
      row.coffees?.producer,
      row.coffees?.variety,
      row.coffees?.process,
      row.grinders?.name,
      row.filter_types?.name,
      row.water_profiles?.name,
      row.description,
      hasXBloomProfile ? "xBloom" : null,
      ...tags,
    ].filter((value): value is string => Boolean(value)),
  };
}

/** Maps a raw DB `recipes` row into the fully expanded shape used by the detail page and edit form. */
export function mapDbRecipeToFullDetail(row: DbRecipeRow): RecipeFullDetail {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    videoUrl: row.video_url,
    difficulty: row.difficulty,
    estimatedBrewTime: row.estimated_brew_time,
    authorId: row.author_id,
    published: row.published,
    status: row.status ?? (row.published ? "published" : "draft"),
    scheduledPublishAt: row.scheduled_publish_at ?? null,
    archivedAt: row.archived_at ?? null,
    featured: row.featured,
    premiumOnly: row.premium_only,
    coverImageUrl: row.cover_image_url,
    coverMediaAssetId: row.cover_media_asset_id ?? null,
    coverImageWidth: row.cover_image_width ?? null,
    coverImageHeight: row.cover_image_height ?? null,
    coverImageAlt: row.cover_image_alt ?? null,
    coverImageBlur: row.cover_image_blur ?? null,
    images: toSafeArray(row.recipe_images)
      .sort((a, b) => a.position - b.position)
      .map((image) => ({
        id: image.id,
        url: image.url,
        position: image.position,
        mediaAssetId: image.media_asset_id ?? null,
        width: image.width ?? null,
        height: image.height ?? null,
        altText: image.alt_text ?? null,
        blurDataUrl: image.blur_data_url ?? null,
      })),

    brewingMethodId: row.brewing_methods?.id ?? null,
    brewingMethodName: row.brewing_methods?.name ?? null,
    deviceId: row.devices?.id ?? null,
    deviceName: row.devices?.name ?? null,
    grinderId: row.grinders?.id ?? null,
    grinderName: row.grinders?.name ?? null,
    filterTypeId: row.filter_types?.id ?? null,
    filterTypeName: row.filter_types?.name ?? null,
    waterProfileId: row.water_profiles?.id ?? null,
    waterProfileName: row.water_profiles?.name ?? null,
    grindSize: row.grind_size,
    waterTemperature: row.water_temperature,
    coffeeDose: row.coffee_dose,
    waterAmount: row.water_amount,
    ratio: computeRatio(row),
    iceAmount: row.ice_amount,
    bloomAmount: row.bloom_amount,
    bloomTime: row.bloom_time,

    coffeeId: row.coffees?.id ?? null,
    coffeeName: row.coffees?.name ?? null,
    roasterId: row.coffees?.roasters?.id ?? null,
    roasterName: row.coffees?.roasters?.name ?? null,
    originId: row.coffees?.origins?.id ?? null,
    originLabel: row.coffees?.origins ? `${row.coffees.origins.region}, ${row.coffees.origins.country}` : null,
    farm: row.coffees?.farm ?? null,
    producer: row.coffees?.producer ?? null,
    variety: row.coffees?.variety ?? null,
    process: row.coffees?.process ?? null,
    altitude: row.coffees?.altitude ?? null,
    roastLevel: row.coffees?.roast_level ?? null,
    roastDate: row.coffees?.roast_date ?? null,

    pours: toSafeArray(row.recipe_pours).sort((a, b) => a.pour_number - b.pour_number),
    tags: toSafeArray(row.recipe_tags)
      .map((rt) => rt.tags)
      .filter((tag): tag is NonNullable<typeof tag> => tag !== null),

    totalBrewTime: row.total_brew_time,
    beverageWeight: row.beverage_weight,
    tds: row.tds,
    extractionPercentage: row.extraction_percentage,
    tastingNotes: row.tasting_notes,
    instructions: row.instructions,
    sweetness: row.sweetness,
    acidity: row.acidity,
    body: row.body,
    bitterness: row.bitterness,

    seoTitle: row.seo_title ?? null,
    seoDescription: row.seo_description ?? null,
    canonicalUrl: row.canonical_url ?? null,

    tagIds: toSafeArray(row.recipe_tags)
      .map((rt) => rt.tags?.id)
      .filter((id): id is string => Boolean(id)),
  };
}

/** Published recipes visible to everyone (RLS enforces this even without the `.eq` below, but it's explicit here). */
export async function getPublishedDbRecipes(supabase: SupabaseClient): Promise<RecipeListItem[]> {
  await processScheduledRecipePublishes(supabase);

  const { data, error } = await supabase
    .from("recipes")
    .select(RECIPE_SELECT)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getPublishedDbRecipes failed", error);
    return [];
  }

  const dictionary = await getDictionary(await getLocale());
  return (data as unknown as DbRecipeRow[]).map((row) => mapDbRecipeToListItem(row, dictionary));
}

/** All recipes (draft + published) authored by a given user, for their "My Recipes" dashboard. */
export async function getUserRecipes(
  supabase: SupabaseClient,
  userId: string,
): Promise<RecipeListItem[]> {
  const { data, error } = await supabase
    .from("recipes")
    .select(RECIPE_SELECT)
    .eq("author_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getUserRecipes failed", error);
    return [];
  }

  const dictionary = await getDictionary(await getLocale());
  return (data as unknown as DbRecipeRow[]).map((row) => mapDbRecipeToListItem(row, dictionary));
}

/** Published recipes authored by a user, for public profile pages. */
export async function getUserPublishedRecipes(
  supabase: SupabaseClient,
  userId: string,
  options: { limit?: number } = {},
): Promise<RecipeListItem[]> {
  let query = supabase
    .from("recipes")
    .select(RECIPE_SELECT)
    .eq("author_id", userId)
    .eq("status", "published")
    .order("created_at", { ascending: false });

  if (options.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error("getUserPublishedRecipes failed", error);
    return [];
  }

  const dictionary = await getDictionary(await getLocale());
  return (data as unknown as DbRecipeRow[]).map((row) => mapDbRecipeToListItem(row, dictionary));
}

/** Looks up a single DB recipe by slug, fully expanded. RLS decides visibility. */
export async function getDbRecipeDetailBySlug(
  supabase: SupabaseClient,
  slug: string,
): Promise<RecipeFullDetail | null> {
  await processScheduledRecipePublishes(supabase);

  const { data, error } = await supabase
    .from("recipes")
    .select(RECIPE_SELECT)
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;
  return mapDbRecipeToFullDetail(data as unknown as DbRecipeRow);
}

/** A lightweight (card-shaped) lookup by slug, used where the full detail isn't needed. */
export async function getDbRecipeBySlug(
  supabase: SupabaseClient,
  slug: string,
): Promise<RecipeListItem | null> {
  const { data, error } = await supabase
    .from("recipes")
    .select(RECIPE_SELECT)
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) return null;
  const dictionary = await getDictionary(await getLocale());
  return mapDbRecipeToListItem(data as unknown as DbRecipeRow, dictionary);
}

/** Raw, fully expanded recipe by id, used by the edit form. */
export async function getRecipeFullDetailById(
  supabase: SupabaseClient,
  id: string,
): Promise<RecipeFullDetail | null> {
  const { data, error } = await supabase.from("recipes").select(RECIPE_SELECT).eq("id", id).maybeSingle();

  if (error || !data) return null;
  return mapDbRecipeToFullDetail(data as unknown as DbRecipeRow);
}

type FavoriteJoinRow = { recipe_id: string; recipes: DbRecipeRow | null };

/** Recipes a user has favorited, most recent first. */
export async function getUserFavoriteRecipes(
  supabase: SupabaseClient,
  userId: string,
): Promise<RecipeListItem[]> {
  const { data, error } = await supabase
    .from("favorites")
    .select(`recipe_id, recipes ( ${RECIPE_SELECT} )`)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getUserFavoriteRecipes failed", error);
    return [];
  }

  const dictionary = await getDictionary(await getLocale());
  return (data as unknown as FavoriteJoinRow[])
    .map((row) => row.recipes)
    .filter((row): row is DbRecipeRow => row !== null)
    .map((row) => mapDbRecipeToListItem(row, dictionary));
}

/** Set of recipe ids a user has favorited, for marking hearts as filled in listings. */
export async function getUserFavoriteRecipeIds(
  supabase: SupabaseClient,
  userId: string,
): Promise<Set<string>> {
  const { data, error } = await supabase.from("favorites").select("recipe_id").eq("user_id", userId);
  if (error) return new Set();
  return new Set((data ?? []).map((row) => row.recipe_id as string));
}

/** Total number of users who have favorited a given recipe. */
export async function getFavoritesCount(supabase: SupabaseClient, recipeId: string): Promise<number> {
  const { data, error } = await supabase.rpc("recipe_favorites_count", { recipe: recipeId });
  if (error) return 0;
  return typeof data === "number" ? data : Number(data ?? 0);
}

export async function getBrewingMethodOptions(supabase: SupabaseClient): Promise<LookupOption[]> {
  const { data } = await supabase.from("brewing_methods").select("id, name").order("name");
  return data ?? [];
}

export async function getDeviceOptions(supabase: SupabaseClient): Promise<LookupOption[]> {
  const { data } = await supabase.from("devices").select("id, name").order("name");
  return data ?? [];
}

export async function getOriginOptions(supabase: SupabaseClient): Promise<LookupOption[]> {
  const { data } = await supabase.from("origins").select("id, country, region").order("country");
  return (data ?? []).map((row) => ({ id: row.id as string, name: `${row.region}, ${row.country}` }));
}

export async function getRoasterOptions(supabase: SupabaseClient): Promise<LookupOption[]> {
  const { data } = await supabase.from("roasters").select("id, name").order("name");
  return data ?? [];
}

export async function getGrinderOptions(supabase: SupabaseClient): Promise<LookupOption[]> {
  const { data } = await supabase.from("grinders").select("id, name").order("name");
  return data ?? [];
}

export async function getFilterTypeOptions(supabase: SupabaseClient): Promise<LookupOption[]> {
  const { data } = await supabase.from("filter_types").select("id, name").order("name");
  return data ?? [];
}

export async function getWaterProfileOptions(supabase: SupabaseClient): Promise<LookupOption[]> {
  const { data } = await supabase.from("water_profiles").select("id, name").order("name");
  return data ?? [];
}

export async function getTagOptions(supabase: SupabaseClient): Promise<LookupOption[]> {
  const { data } = await supabase.from("tags").select("id, name").order("name");
  return data ?? [];
}

type CoffeeOptionRow = { id: string; name: string; roasters: { name: string } | null };

/** Existing coffees a user can reuse on a new recipe, labeled "Roaster — Coffee name". */
export async function getCoffeeOptions(supabase: SupabaseClient): Promise<LookupOption[]> {
  const { data } = await supabase.from("coffees").select("id, name, roasters ( name )").order("name");
  return ((data as unknown as CoffeeOptionRow[]) ?? []).map((row) => ({
    id: row.id,
    name: row.roasters?.name ? `${row.roasters.name} — ${row.name}` : row.name,
  }));
}

export type NewCoffeeInput = {
  name: string;
  roasterId: string | null;
  originId: string | null;
  farm: string | null;
  producer: string | null;
  variety: string | null;
  process: string | null;
  altitude: string | null;
  roastLevel: string | null;
  roastDate: string | null;
};

/** Creates a new coffee lot entry (used when a recipe author doesn't pick an existing one). */
export async function createCoffee(
  supabase: SupabaseClient,
  userId: string,
  input: NewCoffeeInput,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("coffees")
    .insert({
      name: input.name,
      roaster_id: input.roasterId,
      origin_id: input.originId,
      farm: input.farm,
      producer: input.producer,
      variety: input.variety,
      process: input.process,
      altitude: input.altitude,
      roast_level: input.roastLevel,
      roast_date: input.roastDate,
      created_by: userId,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("createCoffee failed", error);
    return null;
  }

  return data.id as string;
}

/**
 * Builds a URL-safe slug for a new/renamed recipe that doesn't collide with
 * either another DB recipe or one of the static catalog's slugs (both are
 * resolved through the same `/recipes/[slug]` route).
 */
export async function generateUniqueRecipeSlug(
  supabase: SupabaseClient,
  title: string,
  excludeId?: string,
): Promise<string> {
  const base = slugify(title) || "recipe";
  const staticSlugs = new Set(getAllRecipeSlugs());

  let candidate = base;
  for (let suffix = 2; suffix <= 51; suffix += 1) {
    if (!staticSlugs.has(candidate)) {
      let query = supabase.from("recipes").select("id").eq("slug", candidate).limit(1);
      if (excludeId) query = query.neq("id", excludeId);
      const { data } = await query.maybeSingle();
      if (!data) return candidate;
    }
    candidate = `${base}-${suffix}`;
  }

  return `${base}-${Date.now()}`;
}

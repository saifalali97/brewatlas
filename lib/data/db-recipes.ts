import type { SupabaseClient } from "@supabase/supabase-js";
import { getAllRecipeSlugs } from "@/lib/data/recipes";
import { slugify } from "@/lib/utils/slugify";
import { RECIPE_IMAGE_PLACEHOLDER, type DbRecipeRow, type LookupOption, type RecipeListItem } from "@/types/recipe";

const RECIPE_SELECT = `
  id, title, slug, author_id, coffee_dose, water, ice, grind_size, temperature,
  bloom, brew_time, tasting_notes, instructions, image_url, featured,
  premium_only, published, created_at, updated_at,
  brewing_methods ( id, name ),
  devices ( id, name ),
  origins ( id, country, region ),
  roasters ( id, name )
`;

/** Maps a raw DB `recipes` row (with lookup joins) into the shape shared with static catalog recipes. */
export function mapDbRecipeToListItem(row: DbRecipeRow): RecipeListItem {
  const ratio =
    row.coffee_dose && row.water
      ? `1:${Math.round((row.water / row.coffee_dose) * 10) / 10}`
      : "—";

  return {
    name: row.title,
    country: row.origins?.country ?? "—",
    origin: row.origins ? `${row.origins.region}, ${row.origins.country}` : "Origin not specified",
    brewMethod: row.brewing_methods?.name ?? "Custom",
    roastLevel: "Community Roast",
    difficulty: "Intermediate",
    ratio,
    time: row.brew_time ?? "—",
    notes: row.tasting_notes ?? "No tasting notes yet.",
    image: row.image_url ?? RECIPE_IMAGE_PLACEHOLDER,
    premium: row.premium_only,
    featured: row.featured,
    slug: row.slug,
    source: "db",
    id: row.id,
    authorId: row.author_id,
    published: row.published,
    roasterName: row.roasters?.name,
    deviceName: row.devices?.name,
    instructions: row.instructions,
  };
}

/** Published recipes visible to everyone (RLS enforces this even without the `.eq` below, but it's explicit here). */
export async function getPublishedDbRecipes(supabase: SupabaseClient): Promise<RecipeListItem[]> {
  const { data, error } = await supabase
    .from("recipes")
    .select(RECIPE_SELECT)
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getPublishedDbRecipes failed", error);
    return [];
  }

  return (data as unknown as DbRecipeRow[]).map(mapDbRecipeToListItem);
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

  return (data as unknown as DbRecipeRow[]).map(mapDbRecipeToListItem);
}

/** Looks up a single DB recipe by slug. RLS decides visibility (published, own draft, or admin). */
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
  return mapDbRecipeToListItem(data as unknown as DbRecipeRow);
}

/** A single DB recipe by id, used by the edit form (ownership is checked by the caller). */
export async function getDbRecipeById(
  supabase: SupabaseClient,
  id: string,
): Promise<RecipeListItem | null> {
  const { data, error } = await supabase.from("recipes").select(RECIPE_SELECT).eq("id", id).maybeSingle();

  if (error || !data) return null;
  return mapDbRecipeToListItem(data as unknown as DbRecipeRow);
}

/**
 * Raw (unmapped) recipe row by id, used by the edit form which needs the
 * lookup *ids* to pre-select `<select>` options rather than their display
 * names.
 */
export async function getRawDbRecipeById(
  supabase: SupabaseClient,
  id: string,
): Promise<DbRecipeRow | null> {
  const { data, error } = await supabase.from("recipes").select(RECIPE_SELECT).eq("id", id).maybeSingle();

  if (error || !data) return null;
  return data as unknown as DbRecipeRow;
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

  return (data as unknown as FavoriteJoinRow[])
    .map((row) => row.recipes)
    .filter((row): row is DbRecipeRow => row !== null)
    .map(mapDbRecipeToListItem);
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

/**
 * Total number of users who have favorited a given recipe. Goes through
 * the `recipe_favorites_count` RPC (a SECURITY DEFINER function) because
 * the `favorites` table's RLS only lets a user see their own rows, which
 * would otherwise make a direct count come back as 0 for anyone but the
 * recipe's own favoriters.
 */
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

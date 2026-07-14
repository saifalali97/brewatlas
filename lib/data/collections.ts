import type { SupabaseClient } from "@supabase/supabase-js";
import { mapDbRecipeToListItem, RECIPE_SELECT } from "@/lib/data/db-recipes";
import { toSafeArray } from "@/lib/utils/arrays";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import type {
  DbRecipeCollectionDetailRow,
  DbRecipeCollectionRow,
  RecipeCollectionDetail,
  RecipeCollectionRow,
} from "@/types/collection";
import type { DbRecipeRow } from "@/types/recipe";

/**
 * Data-access layer for user recipe collections (`recipe_collections` +
 * `recipe_collection_items`), backing `/dashboard/collections`.
 */

const COLLECTION_LIST_SELECT = `
  id, user_id, name, created_at, updated_at,
  recipe_collection_items ( recipe_id )
`;

const COLLECTION_DETAIL_SELECT = `
  id, user_id, name, created_at, updated_at,
  recipe_collection_items (
    recipe_id,
    recipes ( ${RECIPE_SELECT} )
  )
`;

function mapDbCollectionToRow(row: DbRecipeCollectionRow): RecipeCollectionRow {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    recipeCount: toSafeArray(row.recipe_collection_items).length,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** All collections owned by a user, most recently updated first. */
export async function getUserCollections(
  supabase: SupabaseClient,
  userId: string,
): Promise<RecipeCollectionRow[]> {
  const { data, error } = await supabase
    .from("recipe_collections")
    .select(COLLECTION_LIST_SELECT)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("getUserCollections failed", error);
    return [];
  }

  return (data as unknown as DbRecipeCollectionRow[]).map(mapDbCollectionToRow);
}

/** A single collection the caller owns, with its recipes, for the detail page. */
export async function getCollectionById(
  supabase: SupabaseClient,
  collectionId: string,
  userId: string,
): Promise<RecipeCollectionDetail | null> {
  const { data, error } = await supabase
    .from("recipe_collections")
    .select(COLLECTION_DETAIL_SELECT)
    .eq("id", collectionId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as unknown as DbRecipeCollectionDetailRow;
  const dictionary = await getDictionary(await getLocale());
  const recipes = toSafeArray(row.recipe_collection_items)
    .map((item) => item.recipes)
    .filter((recipe): recipe is DbRecipeRow => recipe !== null)
    .map((recipe) => mapDbRecipeToListItem(recipe, dictionary));

  return {
    ...mapDbCollectionToRow(row),
    recipes,
  };
}

/** Recipe ids already in a collection, for excluding them from the add-recipe picker. */
export async function getCollectionRecipeIds(
  supabase: SupabaseClient,
  collectionId: string,
  userId: string,
): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("recipe_collection_items")
    .select("recipe_id, recipe_collections!inner(user_id)")
    .eq("collection_id", collectionId)
    .eq("recipe_collections.user_id", userId);

  if (error) return new Set();
  return new Set((data ?? []).map((row) => row.recipe_id as string));
}

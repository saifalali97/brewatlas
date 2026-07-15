import type { SupabaseClient } from "@supabase/supabase-js";
import { processScheduledRecipePublishes } from "@/lib/data/recipe-publishing";
import { mapDbRecipeToListItem, RECIPE_SELECT } from "@/lib/data/db-recipes";
import type { DbRecipeRow } from "@/types/recipe";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import type { SearchFilters } from "@/types/search";
import type { RecipeListItem } from "@/types/recipe";

function parseNumber(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export type PaginatedRecipeSearchResult = {
  recipes: RecipeListItem[];
  dbTotalCount: number;
};

export function computeDbPagination(staticCount: number, page: number, pageSize: number) {
  const staticOnFirstPage = page === 1 ? staticCount : 0;
  const dbLimit = Math.max(0, pageSize - staticOnFirstPage);
  const dbOffset =
    page === 1
      ? 0
      : Math.max(0, pageSize - staticCount) + (page - 2) * pageSize;

  return { dbOffset, dbLimit };
}

/** Server-side filtered, sorted, and paginated published recipe search via Postgres RPC. */
export async function searchPublishedRecipesPaginated(
  supabase: SupabaseClient,
  filters: SearchFilters,
  options: { page: number; pageSize: number; staticCount?: number },
): Promise<PaginatedRecipeSearchResult> {
  await processScheduledRecipePublishes(supabase);

  const staticCount = options.staticCount ?? 0;
  const { dbOffset, dbLimit } = computeDbPagination(staticCount, options.page, options.pageSize);

  if (dbLimit === 0) {
    const { data: countProbe } = await supabase.rpc("search_published_recipes", {
      p_q: filters.q || null,
      p_brewing_method_id: filters.brewingMethodId || null,
      p_device_id: filters.deviceId || null,
      p_grinder_id: filters.grinderId || null,
      p_difficulty: filters.difficulty || null,
      p_country: filters.country || null,
      p_region: filters.region || null,
      p_origin_id: filters.originId || null,
      p_roaster_id: filters.roasterId || null,
      p_roast_level: filters.roastLevel || null,
      p_process: filters.process || null,
      p_tag_id: filters.tagId || null,
      p_tasting_notes: filters.tastingNotes || null,
      p_brew_time_max: parseNumber(filters.brewTimeMax),
      p_dose_min: parseNumber(filters.doseMin),
      p_dose_max: parseNumber(filters.doseMax),
      p_water_min: parseNumber(filters.waterMin),
      p_water_max: parseNumber(filters.waterMax),
      p_temp_min: parseNumber(filters.tempMin),
      p_temp_max: parseNumber(filters.tempMax),
      p_premium_only: filters.premiumOnly,
      p_featured_only: filters.featuredOnly,
      p_sort: filters.sort,
      p_limit: 1,
      p_offset: 0,
    });

    const dbTotalCount = (countProbe?.[0] as { total_count?: number } | undefined)?.total_count ?? 0;
    return { recipes: [], dbTotalCount: Number(dbTotalCount) };
  }

  const { data, error } = await supabase.rpc("search_published_recipes", {
    p_q: filters.q || null,
    p_brewing_method_id: filters.brewingMethodId || null,
    p_device_id: filters.deviceId || null,
    p_grinder_id: filters.grinderId || null,
    p_difficulty: filters.difficulty || null,
    p_country: filters.country || null,
    p_region: filters.region || null,
    p_origin_id: filters.originId || null,
    p_roaster_id: filters.roasterId || null,
    p_roast_level: filters.roastLevel || null,
    p_process: filters.process || null,
    p_tag_id: filters.tagId || null,
    p_tasting_notes: filters.tastingNotes || null,
    p_brew_time_max: parseNumber(filters.brewTimeMax),
    p_dose_min: parseNumber(filters.doseMin),
    p_dose_max: parseNumber(filters.doseMax),
    p_water_min: parseNumber(filters.waterMin),
    p_water_max: parseNumber(filters.waterMax),
    p_temp_min: parseNumber(filters.tempMin),
    p_temp_max: parseNumber(filters.tempMax),
    p_premium_only: filters.premiumOnly,
    p_featured_only: filters.featuredOnly,
    p_sort: filters.sort,
    p_limit: dbLimit,
    p_offset: dbOffset,
  });

  if (error) {
    console.error("searchPublishedRecipesPaginated failed", error);
    return { recipes: [], dbTotalCount: 0 };
  }

  const rows = (data ?? []) as Array<{ recipe_id: string; total_count: number | string }>;
  const dbTotalCount = Number(rows[0]?.total_count ?? 0);
  const ids = rows.map((row) => row.recipe_id).filter(Boolean);

  if (ids.length === 0) {
    return { recipes: [], dbTotalCount };
  }

  const { data: recipeRows, error: fetchError } = await supabase
    .from("recipes")
    .select(RECIPE_SELECT)
    .in("id", ids);

  if (fetchError || !recipeRows) {
    console.error("searchPublishedRecipesPaginated hydrate failed", fetchError);
    return { recipes: [], dbTotalCount };
  }

  const dictionary = await getDictionary(await getLocale());
  const byId = new Map(
    (recipeRows as unknown as DbRecipeRow[]).map((row) => [row.id, mapDbRecipeToListItem(row, dictionary)]),
  );

  const recipes = ids.map((id) => byId.get(id)).filter((recipe): recipe is RecipeListItem => Boolean(recipe));

  return { recipes, dbTotalCount };
}

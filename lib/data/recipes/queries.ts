import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  GULF_RECIPE_SELECT,
  type GulfRecipeListFilters,
  type GulfRecipeRow,
} from "@/lib/data/recipes/types";
import { mapGulfRecipeRowToPlaceholderDetail } from "@/lib/data/recipes/mappers";
import type { GulfDirectoryCountrySlug } from "@/lib/gulf-directory/countries";
import type { PlaceholderRecipeDetail } from "@/lib/gulf-directory/placeholder-recipe-types";

function asSingle<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function normalizeRow(row: GulfRecipeRow): GulfRecipeRow {
  return {
    ...row,
    roasters: asSingle(row.roasters as GulfRecipeRow["roasters"] | GulfRecipeRow["roasters"][]),
    countries: asSingle(row.countries as GulfRecipeRow["countries"] | GulfRecipeRow["countries"][]),
    cities: asSingle(row.cities as GulfRecipeRow["cities"] | GulfRecipeRow["cities"][]),
    coffees: asSingle(row.coffees as GulfRecipeRow["coffees"] | GulfRecipeRow["coffees"][]),
    recipe_steps: [...(row.recipe_steps ?? [])].sort(
      (a, b) => a.sort_order - b.sort_order || a.pour_number - b.pour_number,
    ),
    recipe_equipment: [...(row.recipe_equipment ?? [])].sort(
      (a, b) => a.sort_order - b.sort_order,
    ),
    recipe_flavor_notes: [...(row.recipe_flavor_notes ?? [])].sort(
      (a, b) => a.sort_order - b.sort_order,
    ),
    recipe_brew_variables: [...(row.recipe_brew_variables ?? [])].sort(
      (a, b) => a.sort_order - b.sort_order,
    ),
  };
}

async function queryGulfRecipes(
  supabase: SupabaseClient,
  filters: GulfRecipeListFilters = {},
): Promise<PlaceholderRecipeDetail[]> {
  let query = supabase
    .from("recipes")
    .select(GULF_RECIPE_SELECT)
    .eq("status", "published")
    .eq("recipe_kind", "official")
    .is("deleted_at", null)
    .not("roaster_id", "is", null)
    .order("title", { ascending: true });

  if (filters.featuredOnly) {
    query = query.eq("featured", true);
  }

  if (filters.countrySlug) {
    const { data: country } = await supabase
      .from("countries")
      .select("id")
      .eq("slug", filters.countrySlug)
      .maybeSingle();
    if (!country?.id) return [];
    query = query.eq("country_id", country.id);
  }

  if (filters.roasterSlug) {
    const { data: roaster } = await supabase
      .from("roasters")
      .select("id")
      .eq("slug", filters.roasterSlug)
      .is("deleted_at", null)
      .maybeSingle();
    if (!roaster?.id) return [];
    query = query.eq("roaster_id", roaster.id);
  }

  const { data, error } = await query;
  if (error) {
    // Schema may not be migrated yet — caller falls back to TypeScript seeds.
    console.error("queryGulfRecipes failed", error);
    return [];
  }

  return ((data as unknown as GulfRecipeRow[] | null) ?? [])
    .map(normalizeRow)
    .map(mapGulfRecipeRowToPlaceholderDetail)
    .filter((recipe): recipe is PlaceholderRecipeDetail => recipe != null);
}

/** Single Gulf recipe by slug. */
export async function getRecipe(
  supabase: SupabaseClient,
  slug: string,
): Promise<PlaceholderRecipeDetail | null> {
  const { data, error } = await supabase
    .from("recipes")
    .select(GULF_RECIPE_SELECT)
    .eq("slug", slug)
    .eq("status", "published")
    .eq("recipe_kind", "official")
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    console.error("getRecipe failed", error);
    return null;
  }
  if (!data) return null;

  return mapGulfRecipeRowToPlaceholderDetail(
    normalizeRow(data as unknown as GulfRecipeRow),
  );
}

/** All published Gulf recipes for a roaster slug. */
export async function getRecipesByRoaster(
  supabase: SupabaseClient,
  roasterSlug: string,
): Promise<PlaceholderRecipeDetail[]> {
  return queryGulfRecipes(supabase, { roasterSlug });
}

/** Featured published Gulf recipes, optionally scoped to a country. */
export async function getFeaturedRecipes(
  supabase: SupabaseClient,
  countrySlug?: GulfDirectoryCountrySlug,
): Promise<PlaceholderRecipeDetail[]> {
  return queryGulfRecipes(supabase, {
    featuredOnly: true,
    countrySlug,
  });
}

/** All published Gulf recipes for a Gulf country. */
export async function getRecipesByCountry(
  supabase: SupabaseClient,
  countrySlug: GulfDirectoryCountrySlug,
): Promise<PlaceholderRecipeDetail[]> {
  return queryGulfRecipes(supabase, { countrySlug });
}

/** Count published official Gulf recipes (used for empty-DB detection). */
export async function countGulfRecipes(supabase: SupabaseClient): Promise<number> {
  const { count, error } = await supabase
    .from("recipes")
    .select("id", { count: "exact", head: true })
    .eq("status", "published")
    .eq("recipe_kind", "official")
    .is("deleted_at", null)
    .not("country_id", "is", null);

  if (error) {
    console.error("countGulfRecipes failed", error);
    return 0;
  }
  return count ?? 0;
}

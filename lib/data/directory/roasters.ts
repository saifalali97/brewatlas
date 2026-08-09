import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { mapDirectoryRoaster } from "@/lib/data/directory/mappers";
import { getDirectoryCountryBySlug } from "@/lib/data/directory/countries";
import {
  DIRECTORY_ROASTER_FIELDS,
  DIRECTORY_ROASTER_FIELDS_LEGACY,
  type DirectoryRoaster,
  type DirectoryRoasterRow,
} from "@/lib/data/directory/types";

function asDirectoryRoasterRow(
  row: Omit<DirectoryRoasterRow, "country_id" | "city_id" | "specialty" | "founded_year"> & {
    country_id?: string | null;
    city_id?: string | null;
    specialty?: string | null;
    founded_year?: number | null;
  },
): DirectoryRoasterRow {
  return {
    ...row,
    country_id: row.country_id ?? null,
    city_id: row.city_id ?? null,
    specialty: row.specialty ?? null,
    founded_year: row.founded_year ?? null,
  };
}
import {
  findGulfCountryBySlug,
  type GulfDirectoryCountrySlug,
} from "@/lib/gulf-directory/countries";

async function countRecipesForRoasterIds(
  supabase: SupabaseClient,
  roasterIds: string[],
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (roasterIds.length === 0) return counts;

  const recipeIdsByRoaster = new Map<string, Set<string>>();

  const { data: directRows, error: directError } = await supabase
    .from("recipes")
    .select("id, roaster_id")
    .eq("status", "published")
    .is("deleted_at", null)
    .in("roaster_id", roasterIds);

  if (directError) {
    console.error("directory countRecipesForRoasterIds direct failed", directError);
  } else {
    for (const row of directRows ?? []) {
      const roasterId = row.roaster_id as string;
      const recipeId = row.id as string;
      const bucket = recipeIdsByRoaster.get(roasterId) ?? new Set<string>();
      bucket.add(recipeId);
      recipeIdsByRoaster.set(roasterId, bucket);
    }
  }

  const { data: coffeeRows, error: coffeeError } = await supabase
    .from("recipes")
    .select("id, coffees!inner ( roaster_id )")
    .eq("status", "published")
    .is("deleted_at", null)
    .in("coffees.roaster_id", roasterIds);

  if (coffeeError) {
    console.error("directory countRecipesForRoasterIds coffee failed", coffeeError);
  } else {
    for (const row of coffeeRows ?? []) {
      const coffee = row.coffees as unknown as { roaster_id: string };
      const roasterId = coffee.roaster_id;
      const recipeId = row.id as string;
      const bucket = recipeIdsByRoaster.get(roasterId) ?? new Set<string>();
      bucket.add(recipeId);
      recipeIdsByRoaster.set(roasterId, bucket);
    }
  }

  for (const roasterId of roasterIds) {
    counts.set(roasterId, recipeIdsByRoaster.get(roasterId)?.size ?? 0);
  }

  return counts;
}

async function withRecipeCounts(
  supabase: SupabaseClient,
  rows: DirectoryRoasterRow[],
): Promise<DirectoryRoaster[]> {
  const recipeCounts = await countRecipesForRoasterIds(
    supabase,
    rows.map((row) => row.id),
  );

  return rows
    .map((row) => mapDirectoryRoaster(row, recipeCounts.get(row.id) ?? 0))
    .filter((roaster): roaster is DirectoryRoaster => roaster != null);
}

/** Verified published roasters for a Gulf country slug. */
export async function getDirectoryRoastersByCountrySlug(
  supabase: SupabaseClient,
  countrySlug: GulfDirectoryCountrySlug,
): Promise<DirectoryRoaster[]> {
  const country = await getDirectoryCountryBySlug(supabase, countrySlug);
  const fallback = findGulfCountryBySlug(countrySlug);
  if (!country && !fallback) return [];

  const dbCountry = country?.name ?? fallback!.dbCountry;

  let query = supabase
    .from("roasters")
    .select(DIRECTORY_ROASTER_FIELDS)
    .eq("published", true)
    .eq("verified", true)
    .is("deleted_at", null)
    .order("name", { ascending: true });

  if (country?.id) {
    query = query.eq("country_id", country.id);
  } else {
    query = query.eq("country", dbCountry);
  }

  const { data, error } = await query;

  async function loadByCountryText(): Promise<DirectoryRoaster[]> {
    const legacy = await supabase
      .from("roasters")
      .select(DIRECTORY_ROASTER_FIELDS_LEGACY)
      .eq("published", true)
      .eq("verified", true)
      .is("deleted_at", null)
      .eq("country", dbCountry)
      .order("name", { ascending: true });

    if (legacy.error) {
      console.error("getDirectoryRoastersByCountrySlug legacy failed", legacy.error);
      return [];
    }

    const legacyRows = (legacy.data ?? []).map((row) =>
      asDirectoryRoasterRow(
        row as Omit<DirectoryRoasterRow, "country_id" | "city_id" | "specialty" | "founded_year">,
      ),
    );

    return withRecipeCounts(supabase, legacyRows);
  }

  if (error) {
    // Newer columns / country_id may be missing before migration — retry legacy.
    console.error("getDirectoryRoastersByCountrySlug failed", error);
    return loadByCountryText();
  }

  const rows = (data ?? []).map((row) => asDirectoryRoasterRow(row as DirectoryRoasterRow));
  if (rows.length === 0 && country?.id) {
    // FKs not backfilled yet — fall back to legacy text country match.
    return loadByCountryText();
  }

  return withRecipeCounts(supabase, rows);
}

/** Verified published roaster by slug. */
export async function getDirectoryRoasterBySlug(
  supabase: SupabaseClient,
  slug: string,
): Promise<DirectoryRoaster | null> {
  const { data, error } = await supabase
    .from("roasters")
    .select(DIRECTORY_ROASTER_FIELDS)
    .eq("published", true)
    .eq("verified", true)
    .is("deleted_at", null)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("getDirectoryRoasterBySlug failed", error);
    const legacy = await supabase
      .from("roasters")
      .select(DIRECTORY_ROASTER_FIELDS_LEGACY)
      .eq("published", true)
      .eq("verified", true)
      .is("deleted_at", null)
      .eq("slug", slug)
      .maybeSingle();

    if (legacy.error || !legacy.data) {
      if (legacy.error) console.error("getDirectoryRoasterBySlug legacy failed", legacy.error);
      return null;
    }

    const row = asDirectoryRoasterRow(
      legacy.data as Omit<
        DirectoryRoasterRow,
        "country_id" | "city_id" | "specialty" | "founded_year"
      >,
    );
    const [mapped] = await withRecipeCounts(supabase, [row]);
    return mapped ?? null;
  }

  if (!data) return null;
  const [mapped] = await withRecipeCounts(supabase, [
    asDirectoryRoasterRow(data as DirectoryRoasterRow),
  ]);
  return mapped ?? null;
}

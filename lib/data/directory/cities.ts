import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { mapCityRow, slugifyCityName } from "@/lib/data/directory/mappers";
import { getDirectoryCountryBySlug } from "@/lib/data/directory/countries";
import {
  DIRECTORY_CITY_FIELDS,
  type CityRow,
  type DirectoryCity,
} from "@/lib/data/directory/types";
import {
  findGulfCountryBySlug,
  type GulfDirectoryCountrySlug,
} from "@/lib/gulf-directory/countries";

async function citiesFromRoasterText(
  supabase: SupabaseClient,
  countrySlug: GulfDirectoryCountrySlug,
): Promise<DirectoryCity[]> {
  const country = findGulfCountryBySlug(countrySlug);
  if (!country) return [];

  const { data, error } = await supabase
    .from("roasters")
    .select("city")
    .eq("published", true)
    .eq("verified", true)
    .eq("country", country.dbCountry)
    .not("city", "is", null);

  if (error) {
    console.error("citiesFromRoasterText failed", error);
    return [];
  }

  const names = [
    ...new Set(
      (data ?? [])
        .map((row) => (row.city as string | null)?.trim() ?? "")
        .filter(Boolean),
    ),
  ].sort((a, b) => a.localeCompare(b));

  return names.map((name) => ({
    id: null,
    countryId: null,
    countrySlug,
    name,
    slug: slugifyCityName(name),
  }));
}

/** Published cities for a country slug (catalog table, else distinct roaster cities). */
export async function getDirectoryCitiesByCountrySlug(
  supabase: SupabaseClient,
  countrySlug: GulfDirectoryCountrySlug,
): Promise<DirectoryCity[]> {
  const country = await getDirectoryCountryBySlug(supabase, countrySlug);
  if (!country) return [];

  if (country.id) {
    const { data, error } = await supabase
      .from("cities")
      .select(DIRECTORY_CITY_FIELDS)
      .eq("published", true)
      .eq("country_id", country.id)
      .order("name", { ascending: true });

    if (error) {
      console.error("getDirectoryCitiesByCountrySlug failed", error);
      return citiesFromRoasterText(supabase, countrySlug);
    }

    const rows = (data ?? []) as CityRow[];
    if (rows.length > 0) {
      return rows.map((row) => mapCityRow(row, countrySlug));
    }
  }

  return citiesFromRoasterText(supabase, countrySlug);
}

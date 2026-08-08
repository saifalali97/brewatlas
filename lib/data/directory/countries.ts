import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { mapCountryRow, staticDirectoryCountries } from "@/lib/data/directory/mappers";
import {
  DIRECTORY_COUNTRY_FIELDS,
  type CountryRow,
  type DirectoryCountry,
} from "@/lib/data/directory/types";
import type { GulfDirectoryCountrySlug } from "@/lib/gulf-directory/countries";

/** Published directory countries, ordered for hub/country navigation. */
export async function getDirectoryCountries(
  supabase: SupabaseClient,
): Promise<DirectoryCountry[]> {
  const { data, error } = await supabase
    .from("countries")
    .select(DIRECTORY_COUNTRY_FIELDS)
    .eq("published", true)
    .order("sort_order", { ascending: true });

  if (error) {
    console.error("getDirectoryCountries failed", error);
    return staticDirectoryCountries();
  }

  const mapped = ((data ?? []) as CountryRow[])
    .map(mapCountryRow)
    .filter((country): country is DirectoryCountry => country != null);

  return mapped.length > 0 ? mapped : staticDirectoryCountries();
}

/** Single published country by Gulf directory slug. */
export async function getDirectoryCountryBySlug(
  supabase: SupabaseClient,
  slug: GulfDirectoryCountrySlug,
): Promise<DirectoryCountry | null> {
  const { data, error } = await supabase
    .from("countries")
    .select(DIRECTORY_COUNTRY_FIELDS)
    .eq("published", true)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("getDirectoryCountryBySlug failed", error);
    return staticDirectoryCountries().find((country) => country.slug === slug) ?? null;
  }

  if (!data) {
    return staticDirectoryCountries().find((country) => country.slug === slug) ?? null;
  }

  return mapCountryRow(data as CountryRow);
}

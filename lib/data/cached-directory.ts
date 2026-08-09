import "server-only";

import { unstable_cache } from "next/cache";
import {
  getDirectoryCitiesByCountrySlug,
  getDirectoryCountries,
  getDirectoryCountryBySlug,
  getDirectoryRoasterBySlug,
  getDirectoryRoastersByCountrySlug,
  getSupabaseGulfCountryPageData,
} from "@/lib/data/directory";
import type {
  DirectoryCity,
  DirectoryCountry,
  DirectoryRoaster,
} from "@/lib/data/directory/types";
import {
  getGulfDirectoryCountrySummaries,
  getGulfDirectoryGlobalStats,
  type GulfDirectoryCountrySummary,
  type GulfDirectoryGlobalStats,
} from "@/lib/data/gulf-directory";
import type { GulfCountryPageData } from "@/lib/gulf-directory/country-page-types";
import type { GulfDirectoryCountrySlug } from "@/lib/gulf-directory/countries";
import { getSeedGulfDirectorySummaries } from "@/lib/data/directory/seeds/country-page";
import { createPublicClient } from "@/lib/supabase/public";

function withSeedDirectoryFallback(
  countries: GulfDirectoryCountrySummary[],
): GulfDirectoryCountrySummary[] {
  const hasLiveRows = countries.some((country) => country.roasterCount > 0);
  return hasLiveRows ? countries : getSeedGulfDirectorySummaries();
}

function seedGlobalStats(
  countries: GulfDirectoryCountrySummary[],
): GulfDirectoryGlobalStats {
  const verifiedRoasteries = countries.reduce((sum, country) => sum + country.roasterCount, 0);
  const testedRecipes = countries.reduce((sum, country) => sum + country.recipeCount, 0);
  return {
    verifiedRoasteries,
    testedRecipes,
    brewedWithLove: testedRecipes,
  };
}

const DIRECTORY_CACHE_TTL = 300;
const DIRECTORY_TAGS = ["gulf-directory", "gulf-countries", "gulf-cities", "gulf-roasters"] as const;

export async function getCachedDirectoryCountries(): Promise<DirectoryCountry[]> {
  return unstable_cache(
    async () => {
      const supabase = createPublicClient();
      return getDirectoryCountries(supabase);
    },
    ["cached-directory-countries"],
    { revalidate: DIRECTORY_CACHE_TTL, tags: [...DIRECTORY_TAGS, "gulf-countries"] },
  )();
}

export async function getCachedDirectoryCountryBySlug(
  slug: GulfDirectoryCountrySlug,
): Promise<DirectoryCountry | null> {
  return unstable_cache(
    async () => {
      const supabase = createPublicClient();
      return getDirectoryCountryBySlug(supabase, slug);
    },
    ["cached-directory-country", slug],
    { revalidate: DIRECTORY_CACHE_TTL, tags: [...DIRECTORY_TAGS, "gulf-countries", `gulf-country-${slug}`] },
  )();
}

export async function getCachedDirectoryCitiesByCountrySlug(
  slug: GulfDirectoryCountrySlug,
): Promise<DirectoryCity[]> {
  return unstable_cache(
    async () => {
      const supabase = createPublicClient();
      return getDirectoryCitiesByCountrySlug(supabase, slug);
    },
    ["cached-directory-cities", slug],
    { revalidate: DIRECTORY_CACHE_TTL, tags: [...DIRECTORY_TAGS, "gulf-cities", `gulf-country-${slug}`] },
  )();
}

export async function getCachedDirectoryRoastersByCountrySlug(
  slug: GulfDirectoryCountrySlug,
): Promise<DirectoryRoaster[]> {
  return unstable_cache(
    async () => {
      const supabase = createPublicClient();
      return getDirectoryRoastersByCountrySlug(supabase, slug);
    },
    ["cached-directory-roasters", slug],
    { revalidate: DIRECTORY_CACHE_TTL, tags: [...DIRECTORY_TAGS, "gulf-roasters", `gulf-country-${slug}`] },
  )();
}

export async function getCachedDirectoryRoasterBySlug(
  slug: string,
): Promise<DirectoryRoaster | null> {
  return unstable_cache(
    async () => {
      const supabase = createPublicClient();
      return getDirectoryRoasterBySlug(supabase, slug);
    },
    ["cached-directory-roaster", slug],
    { revalidate: DIRECTORY_CACHE_TTL, tags: [...DIRECTORY_TAGS, "gulf-roasters"] },
  )();
}

/** Cached country page payload from Supabase, or null when empty (use placeholders). */
export async function getCachedSupabaseGulfCountryPageData(
  slug: GulfDirectoryCountrySlug,
): Promise<GulfCountryPageData | null> {
  return unstable_cache(
    async () => {
      const supabase = createPublicClient();
      return getSupabaseGulfCountryPageData(supabase, slug);
    },
    ["cached-gulf-country-page", slug],
    {
      revalidate: DIRECTORY_CACHE_TTL,
      tags: [...DIRECTORY_TAGS, `gulf-country-${slug}`],
    },
  )();
}

export async function getCachedGulfDirectoryCountrySummaries(): Promise<
  GulfDirectoryCountrySummary[]
> {
  return unstable_cache(
    async () => {
      const supabase = createPublicClient();
      const live = await getGulfDirectoryCountrySummaries(supabase);
      return withSeedDirectoryFallback(live);
    },
    ["cached-gulf-directory-summaries"],
    { revalidate: DIRECTORY_CACHE_TTL, tags: [...DIRECTORY_TAGS] },
  )();
}

export async function getCachedGulfDirectoryGlobalStats(): Promise<GulfDirectoryGlobalStats> {
  return unstable_cache(
    async () => {
      const supabase = createPublicClient();
      const live = await getGulfDirectoryGlobalStats(supabase);
      if (live.verifiedRoasteries > 0) return live;
      return seedGlobalStats(getSeedGulfDirectorySummaries());
    },
    ["cached-gulf-directory-stats"],
    { revalidate: DIRECTORY_CACHE_TTL, tags: [...DIRECTORY_TAGS] },
  )();
}

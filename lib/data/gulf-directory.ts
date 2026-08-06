import type { SupabaseClient } from "@supabase/supabase-js";
import { mapDbRecipeToListItem, RECIPE_SELECT } from "@/lib/data/db-recipes";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import type { Locale } from "@/types/i18n";
import type { DbRecipeRow, RecipeListItem } from "@/types/recipe";
import {
  GULF_DIRECTORY_COUNTRIES,
  type GulfDirectoryCountrySlug,
} from "@/lib/gulf-directory/countries";
import { resolveGulfCountryBanner } from "@/lib/gulf-directory/country-images";
import {
  GULF_FEATURED_ROASTER_LOOKUP,
} from "@/lib/gulf-directory/featured-roasters";

const ROASTER_FIELDS =
  "id, name, slug, country, emirate, city, website, instagram, logo_url, banner_image_url, description, featured, is_uae, verified, published";

export type GulfDirectoryRoaster = {
  id: string;
  name: string;
  slug: string | null;
  country: string | null;
  emirate: string | null;
  city: string | null;
  website: string | null;
  instagram: string | null;
  description: string | null;
  verified: boolean;
  recipeCount: number;
};

export type GulfDirectoryFeaturedRoaster = {
  name: string;
  logoUrl: string | null;
};

export type GulfDirectoryCountrySummary = {
  slug: GulfDirectoryCountrySlug;
  dbCountry: string;
  flag: string;
  bannerImage: string;
  roasterCount: number;
  recipeCount: number;
  featuredRoaster: GulfDirectoryFeaturedRoaster | null;
};

export type GulfDirectoryGlobalStats = {
  verifiedRoasteries: number;
  testedRecipes: number;
  brewedWithLove: number;
};

export type RoasteryRecipeItem = RecipeListItem & {
  coffeeName: string | null;
  isIced: boolean;
  averageRating: number | null;
  reviewCount: number;
};

type RoasterRow = {
  id: string;
  name: string;
  slug: string | null;
  country: string | null;
  emirate: string | null;
  city: string | null;
  website: string | null;
  instagram: string | null;
  logo_url: string | null;
  featured: boolean;
  description: string | null;
  verified: boolean;
};

function resolveFeaturedRoaster(
  slug: GulfDirectoryCountrySlug,
  rows: RoasterRow[],
): GulfDirectoryFeaturedRoaster | null {
  const config = GULF_FEATURED_ROASTER_LOOKUP[slug];
  const match =
    rows.find((row) => row.name.toLowerCase().includes(config.nameMatch.toLowerCase())) ??
    rows.find((row) => row.featured) ??
    rows[0];

  if (match) {
    return {
      name: match.name,
      logoUrl: match.logo_url ?? config.fallbackLogoImage ?? null,
    };
  }

  return {
    name: config.displayName,
    logoUrl: config.fallbackLogoImage ?? null,
  };
}

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
    .in("roaster_id", roasterIds);

  if (directError) {
    console.error("countRecipesForRoasterIds direct failed", directError);
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
    .in("coffees.roaster_id", roasterIds);

  if (coffeeError) {
    console.error("countRecipesForRoasterIds coffee failed", coffeeError);
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

function mapRoaster(row: RoasterRow, recipeCount: number): GulfDirectoryRoaster {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    country: row.country,
    emirate: row.emirate,
    city: row.city,
    website: row.website,
    instagram: row.instagram,
    description: row.description,
    verified: row.verified,
    recipeCount,
  };
}

/** Summaries for all GCC directory countries with live roaster/recipe counts. */
export async function getGulfDirectoryCountrySummaries(
  supabase: SupabaseClient,
): Promise<GulfDirectoryCountrySummary[]> {
  const { data, error } = await supabase
    .from("roasters")
    .select("id, name, country, logo_url, featured")
    .eq("published", true)
    .eq("verified", true)
    .in(
      "country",
      GULF_DIRECTORY_COUNTRIES.map((country) => country.dbCountry),
    );

  if (error) {
    console.error("getGulfDirectoryCountrySummaries failed", error);
    return GULF_DIRECTORY_COUNTRIES.map((country) => ({
      slug: country.slug,
      dbCountry: country.dbCountry,
      flag: country.flag,
      bannerImage: resolveGulfCountryBanner(country.slug),
      roasterCount: 0,
      recipeCount: 0,
      featuredRoaster: null,
    }));
  }

  const roastersByCountry = new Map<string, RoasterRow[]>();
  for (const row of data ?? []) {
    const country = row.country as string;
    const list = roastersByCountry.get(country) ?? [];
    list.push(row as RoasterRow);
    roastersByCountry.set(country, list);
  }

  const allRoasterIds = (data ?? []).map((row) => row.id as string);
  const recipeCounts = await countRecipesForRoasterIds(supabase, allRoasterIds);

  return GULF_DIRECTORY_COUNTRIES.map((country) => {
    const roasterRows = roastersByCountry.get(country.dbCountry) ?? [];
    const roasterIds = roasterRows.map((row) => row.id);
    const recipeCount = roasterIds.reduce((sum, id) => sum + (recipeCounts.get(id) ?? 0), 0);
    return {
      slug: country.slug,
      dbCountry: country.dbCountry,
      flag: country.flag,
      bannerImage: resolveGulfCountryBanner(country.slug),
      roasterCount: roasterIds.length,
      recipeCount,
      featuredRoaster: resolveFeaturedRoaster(country.slug, roasterRows),
    };
  });
}

/** Live directory totals for the recipes hub verified section. */
export async function getGulfDirectoryGlobalStats(
  supabase: SupabaseClient,
): Promise<GulfDirectoryGlobalStats> {
  const countries = await getGulfDirectoryCountrySummaries(supabase);
  const verifiedRoasteries = countries.reduce((sum, country) => sum + country.roasterCount, 0);
  const testedRecipes = countries.reduce((sum, country) => sum + country.recipeCount, 0);

  const gulfCountries = GULF_DIRECTORY_COUNTRIES.map((country) => country.dbCountry);
  const { data: roasterRows } = await supabase
    .from("roasters")
    .select("id")
    .eq("published", true)
    .eq("verified", true)
    .in("country", gulfCountries);

  const roasterIds = (roasterRows ?? []).map((row) => row.id as string);
  let brewedWithLove = 0;

  if (roasterIds.length > 0) {
    const recipeIds = new Set<string>();

    const { data: directRecipes } = await supabase
      .from("recipes")
      .select("id")
      .eq("status", "published")
      .in("roaster_id", roasterIds);

    for (const row of directRecipes ?? []) {
      recipeIds.add(row.id as string);
    }

    const { data: coffeeRecipes } = await supabase
      .from("recipes")
      .select("id, coffees!inner ( roaster_id )")
      .eq("status", "published")
      .in("coffees.roaster_id", roasterIds);

    for (const row of coffeeRecipes ?? []) {
      recipeIds.add(row.id as string);
    }

    if (recipeIds.size > 0) {
      const { count, error: favoritesError } = await supabase
        .from("favorites")
        .select("id", { count: "exact", head: true })
        .in("recipe_id", [...recipeIds]);

      if (favoritesError) {
        console.error("getGulfDirectoryGlobalStats favorites failed", favoritesError);
      } else {
        brewedWithLove = count ?? 0;
      }
    }
  }

  return {
    verifiedRoasteries,
    testedRecipes,
    brewedWithLove,
  };
}

/** Verified published roasters in a GCC country, sorted by name. */
export async function getGulfDirectoryRoastersByCountry(
  supabase: SupabaseClient,
  dbCountry: string,
): Promise<GulfDirectoryRoaster[]> {
  const { data, error } = await supabase
    .from("roasters")
    .select(ROASTER_FIELDS)
    .eq("published", true)
    .eq("verified", true)
    .eq("country", dbCountry)
    .order("name", { ascending: true });

  if (error) {
    console.error("getGulfDirectoryRoastersByCountry failed", error);
    return [];
  }

  const rows = (data ?? []) as RoasterRow[];
  const recipeCounts = await countRecipesForRoasterIds(
    supabase,
    rows.map((row) => row.id),
  );

  return rows.map((row) => mapRoaster(row, recipeCounts.get(row.id) ?? 0));
}

/** Lookup a verified published roaster by slug. */
export async function getGulfDirectoryRoasterBySlug(
  supabase: SupabaseClient,
  slug: string,
): Promise<GulfDirectoryRoaster | null> {
  const { data, error } = await supabase
    .from("roasters")
    .select(ROASTER_FIELDS)
    .eq("published", true)
    .eq("verified", true)
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("getGulfDirectoryRoasterBySlug failed", error);
    return null;
  }

  if (!data) return null;

  const row = data as RoasterRow;
  const recipeCounts = await countRecipesForRoasterIds(supabase, [row.id]);
  return mapRoaster(row, recipeCounts.get(row.id) ?? 0);
}

/** Published recipes for a roaster, enriched with coffee, temperature, and ratings. */
export async function getRoasteryRecipes(
  supabase: SupabaseClient,
  roasterId: string,
  options: { locale?: Locale } = {},
): Promise<RoasteryRecipeItem[]> {
  const locale = options.locale ?? (await getLocale());
  const dictionary = await getDictionary(locale);

  const { data: coffees, error: coffeeError } = await supabase
    .from("coffees")
    .select("id")
    .eq("roaster_id", roasterId);

  if (coffeeError) {
    console.error("getRoasteryRecipes coffees failed", coffeeError);
    return [];
  }

  const coffeeIds = (coffees ?? []).map((row) => row.id as string);
  if (coffeeIds.length === 0) return [];

  const { data, error } = await supabase
    .from("recipes")
    .select(RECIPE_SELECT)
    .eq("status", "published")
    .in("coffee_id", coffeeIds)
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getRoasteryRecipes failed", error);
    return [];
  }

  const rows = (data ?? []) as unknown as DbRecipeRow[];
  const recipeIds = rows.map((row) => row.id);

  const ratingMap = new Map<string, { averageRating: number | null; reviewCount: number }>();
  if (recipeIds.length > 0) {
    const { data: ratings, error: ratingError } = await supabase
      .from("recipe_rating_summary")
      .select("recipe_id, review_count, average_rating")
      .in("recipe_id", recipeIds);

    if (ratingError) {
      console.error("getRoasteryRecipes ratings failed", ratingError);
    } else {
      for (const row of ratings ?? []) {
        ratingMap.set(row.recipe_id as string, {
          averageRating: (row.average_rating as number | null) ?? null,
          reviewCount: (row.review_count as number) ?? 0,
        });
      }
    }
  }

  return rows.map((row) => {
    const base = mapDbRecipeToListItem(row, dictionary);
    const rating = ratingMap.get(row.id);
    return {
      ...base,
      coffeeName: row.coffees?.name ?? null,
      isIced: Boolean(row.ice_amount && row.ice_amount > 0),
      averageRating: rating?.averageRating ?? null,
      reviewCount: rating?.reviewCount ?? 0,
    };
  });
}

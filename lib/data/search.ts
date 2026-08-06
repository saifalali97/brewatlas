import { searchCommunityUsers, searchPublicCollections } from "@/lib/data/community-platform";
import { resolveDeviceImage, resolveOriginImage } from "@/lib/media/page-images";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getBrewingMethodOptions,
  getDeviceOptions,
  getGrinderOptions,
} from "@/lib/data/db-recipes";
import { searchPublishedRecipesPaginated } from "@/lib/data/recipe-search";
import { SEARCH_PAGE_SIZE } from "@/lib/search/params";
import type { CoffeeOrigin, TopRoaster } from "@/types/homepage";
import type { RecipeListItem } from "@/types/recipe";
import type {
  DeviceSearchHit,
  FlavorSearchHit,
  SearchFilterOptions,
  SearchFilters,
  SearchResults,
  VarietySearchHit,
} from "@/types/search";
import { toSafeArray } from "@/lib/utils/arrays";

function matchesQuery(haystack: string, query: string): boolean {
  if (!query) return true;
  return haystack.toLowerCase().includes(query.toLowerCase());
}

function filterStaticRoasters(roasters: TopRoaster[], q: string, country: string): TopRoaster[] {
  return roasters.filter((roaster) => {
    if (country && roaster.country !== country) return false;
    const haystack = [roaster.name, roaster.country, roaster.specialty, roaster.description].filter(Boolean).join(" ");
    return matchesQuery(haystack, q);
  });
}

function filterStaticOrigins(origins: CoffeeOrigin[], filters: SearchFilters): CoffeeOrigin[] {
  return origins.filter((origin) => {
    if (filters.country && origin.country !== filters.country) return false;
    if (filters.region && !origin.region.toLowerCase().includes(filters.region.toLowerCase())) return false;
    if (filters.roastLevel && origin.roastRecommendation !== filters.roastLevel) return false;
    if (filters.process && origin.process !== filters.process) return false;
    const haystack = [origin.country, origin.region, origin.process, origin.roastRecommendation, origin.tastingProfile].join(" ");
    return matchesQuery(haystack, filters.q);
  });
}

async function searchDbRoasters(supabase: SupabaseClient, q: string, country: string): Promise<TopRoaster[]> {
  let query = supabase.from("roasters").select("id, name, country, website, logo_url").order("name");
  if (country) query = query.eq("country", country);
  if (q) {
    const pattern = `%${q}%`;
    query = query.or(`name.ilike.${pattern},country.ilike.${pattern}`);
  }

  const { data, error } = await query;
  if (error) {
    console.error("searchDbRoasters failed", error);
    return [];
  }

  return (data ?? []).map((row) => ({
    name: row.name as string,
    country: (row.country as string) ?? "—",
    specialty: "—",
    founded: "—",
    recipes: "0",
    rating: "—",
    premium: false,
    image: (row.logo_url as string) ?? "/images/hero/home-hero.webp",
    description: "",
  }));
}

async function searchDbOrigins(supabase: SupabaseClient, filters: SearchFilters): Promise<CoffeeOrigin[]> {
  let query = supabase.from("origins").select("id, country, region, description").order("country");
  if (filters.country) query = query.eq("country", filters.country);
  if (filters.region) query = query.ilike("region", `%${filters.region}%`);
  if (filters.q) {
    const pattern = `%${filters.q}%`;
    query = query.or(`country.ilike.${pattern},region.ilike.${pattern},description.ilike.${pattern}`);
  }

  const { data, error } = await query;
  if (error) {
    console.error("searchDbOrigins failed", error);
    return [];
  }

  return (data ?? []).map((row) => ({
    country: row.country as string,
    region: row.region as string,
    tastingProfile: (row.description as string) ?? "",
    altitude: "—",
    process: filters.process || "—",
    roastRecommendation: filters.roastLevel || "—",
    brewingMethod: "—",
    premium: false,
    image: resolveOriginImage(row.country as string),
  }));
}

async function searchDbDevices(supabase: SupabaseClient, q: string): Promise<DeviceSearchHit[]> {
  let query = supabase.from("devices").select("id, name, slug, manufacturer").order("name");
  if (q) {
    const pattern = `%${q}%`;
    query = query.or(`name.ilike.${pattern},manufacturer.ilike.${pattern}`);
  }

  const { data, error } = await query;
  if (error) {
    console.error("searchDbDevices failed", error);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    slug: row.slug as string,
    manufacturer: (row.manufacturer as string) ?? null,
    source: "db" as const,
    image: resolveDeviceImage(row.name as string),
  }));
}

async function searchVarieties(supabase: SupabaseClient, filters: SearchFilters): Promise<VarietySearchHit[]> {
  let query = supabase
    .from("coffees")
    .select("id, name, variety, process, roast_level, roasters ( name ), origins ( country, region )")
    .order("name");

  if (filters.country) query = query.eq("origins.country", filters.country);
  if (filters.region) query = query.ilike("origins.region", `%${filters.region}%`);
  if (filters.roastLevel) query = query.eq("roast_level", filters.roastLevel);
  if (filters.process) query = query.eq("process", filters.process);

  if (filters.q) {
    const pattern = `%${filters.q}%`;
    query = query.or(`name.ilike.${pattern},variety.ilike.${pattern},process.ilike.${pattern}`);
  }

  const { data, error } = await query;
  if (error) {
    console.error("searchVarieties failed", error);
    return [];
  }

  type CoffeeRow = {
    id: string;
    name: string;
    variety: string | null;
    process: string | null;
    roast_level: string | null;
    roasters: { name: string } | null;
    origins: { country: string; region: string } | null;
  };

  return ((data ?? []) as unknown as CoffeeRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    variety: row.variety,
    process: row.process,
    roastLevel: row.roast_level,
    roasterName: row.roasters?.name ?? null,
    country: row.origins?.country ?? null,
    region: row.origins?.region ?? null,
  }));
}

async function searchFlavors(supabase: SupabaseClient, filters: SearchFilters): Promise<FlavorSearchHit[]> {
  let query = supabase
    .from("recipes")
    .select("id, title, slug, tasting_notes, recipe_tags ( tags ( id, name ) )")
    .eq("status", "published")
    .not("tasting_notes", "is", null);

  if (filters.tastingNotes) {
    query = query.ilike("tasting_notes", `%${filters.tastingNotes}%`);
  } else if (filters.q) {
    query = query.ilike("tasting_notes", `%${filters.q}%`);
  }

  const { data, error } = await query.limit(48);
  if (error) {
    console.error("searchFlavors failed", error);
    return [];
  }

  type FlavorRow = {
    id: string;
    title: string;
    slug: string;
    tasting_notes: string | null;
    recipe_tags: { tags: { id: string; name: string } | null }[] | null;
  };

  return ((data ?? []) as unknown as FlavorRow[])
    .filter((row) => row.tasting_notes)
    .filter((row) => {
      if (!filters.tagId) return true;
      return toSafeArray(row.recipe_tags).some((entry) => entry.tags?.id === filters.tagId);
    })
    .map((row) => ({
      id: row.id,
      recipeSlug: row.slug,
      recipeName: row.title,
      flavorText: row.tasting_notes ?? "",
      tags: toSafeArray(row.recipe_tags)
        .map((entry) => entry.tags?.name)
        .filter((name): name is string => Boolean(name)),
    }))
    .filter((row) => !filters.q || matchesQuery(`${row.flavorText} ${row.tags.join(" ")}`, filters.q));
}

export async function getSearchFilterOptions(supabase: SupabaseClient): Promise<SearchFilterOptions> {
  const [{ data: origins }, { data: coffees }, { data: roasters }, { data: tags }, brewingMethods, devices, grinders] =
    await Promise.all([
      supabase.from("origins").select("id, country, region").order("country"),
      supabase.from("coffees").select("process, roast_level").not("process", "is", null),
      supabase.from("roasters").select("id, name").order("name"),
      supabase.from("tags").select("id, name").order("name"),
      getBrewingMethodOptions(supabase),
      getDeviceOptions(supabase),
      getGrinderOptions(supabase),
    ]);

  const countries = [...new Set((origins ?? []).map((row) => row.country as string))].sort();
  const regions = [...new Set((origins ?? []).map((row) => row.region as string))].sort();
  const originOptions = (origins ?? [])
    .map((row) => ({
      id: row.id as string,
      label: `${row.country as string} — ${row.region as string}`,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
  const processes = [...new Set((coffees ?? []).map((row) => row.process as string).filter(Boolean))].sort();
  const roastLevels = [...new Set((coffees ?? []).map((row) => row.roast_level as string).filter(Boolean))].sort();

  return {
    countries,
    regions,
    originOptions,
    roasters: (roasters ?? []).map((row) => ({ id: row.id as string, name: row.name as string })),
    tags: (tags ?? []).map((row) => ({ id: row.id as string, name: row.name as string })),
    roastLevels,
    processes,
    brewingMethods,
    devices,
    grinders,
    difficulties: ["Beginner", "Intermediate", "Advanced"],
  };
}

export type RunGlobalSearchInput = {
  supabase: SupabaseClient;
  filters: SearchFilters;
  staticRoasters: TopRoaster[];
  staticOrigins: CoffeeOrigin[];
  staticDevices: DeviceSearchHit[];
};

/** Runs a unified global search across recipes, roasters, origins, devices, varieties, and flavor notes. */
export async function runGlobalSearch(input: RunGlobalSearchInput): Promise<SearchResults> {
  const { supabase, filters, staticRoasters, staticOrigins, staticDevices } = input;
  const { category, page } = filters;
  const previewLimit = category === "all" ? 6 : SEARCH_PAGE_SIZE;

  const needsRecipes = category === "all" || category === "recipes";
  const needsRoasters = category === "all" || category === "roasters";
  const needsOrigins = category === "all" || category === "origins";
  const needsDevices = category === "all" || category === "devices";
  const needsVarieties = category === "all" || category === "varieties";
  const needsFlavors = category === "all" || category === "flavors";
  const needsUsers = category === "all" || category === "users";
  const needsCollections = category === "all" || category === "collections";

  const [
    dbRoasters,
    staticRoastersFiltered,
    dbOrigins,
    staticOriginsFiltered,
    dbDevices,
    varieties,
    flavors,
    users,
    collections,
  ] = await Promise.all([
    needsRoasters ? searchDbRoasters(supabase, filters.q, filters.country) : Promise.resolve([]),
    needsRoasters ? Promise.resolve(filterStaticRoasters(staticRoasters, filters.q, filters.country)) : Promise.resolve([]),
    needsOrigins ? searchDbOrigins(supabase, filters) : Promise.resolve([]),
    needsOrigins ? Promise.resolve(filterStaticOrigins(staticOrigins, filters)) : Promise.resolve([]),
    needsDevices ? searchDbDevices(supabase, filters.q) : Promise.resolve([]),
    needsVarieties ? searchVarieties(supabase, filters) : Promise.resolve([]),
    needsFlavors ? searchFlavors(supabase, filters) : Promise.resolve([]),
    needsUsers ? searchCommunityUsers(supabase, filters.q, previewLimit) : Promise.resolve([]),
    needsCollections ? searchPublicCollections(supabase, filters.q, previewLimit) : Promise.resolve([]),
  ]);

  let recipes: RecipeListItem[] = [];
  let totalRecipes = 0;

  if (needsRecipes) {
    const paginated = await searchPublishedRecipesPaginated(supabase, filters, {
      page: category === "all" ? 1 : page,
      pageSize: category === "all" ? previewLimit : SEARCH_PAGE_SIZE,
      staticCount: 0,
    });

    recipes = paginated.recipes;
    totalRecipes = paginated.dbTotalCount;
  }

  const roasterNames = new Set<string>();
  const roasters = [...staticRoastersFiltered, ...dbRoasters].filter((roaster) => {
    const key = roaster.name.toLowerCase();
    if (roasterNames.has(key)) return false;
    roasterNames.add(key);
    return true;
  }).slice(0, previewLimit);

  const originKeys = new Set<string>();
  const origins = [...staticOriginsFiltered, ...dbOrigins].filter((origin) => {
    const key = `${origin.country}-${origin.region}`.toLowerCase();
    if (originKeys.has(key)) return false;
    originKeys.add(key);
    return true;
  }).slice(0, previewLimit);

  const deviceNames = new Set<string>();
  const staticDeviceHits = staticDevices.filter((device) => matchesQuery(`${device.name} ${device.description ?? ""}`, filters.q));
  const devices = [...staticDeviceHits, ...dbDevices].filter((device) => {
    const key = device.name.toLowerCase();
    if (deviceNames.has(key)) return false;
    deviceNames.add(key);
    return true;
  }).slice(0, previewLimit);

  return {
    recipes,
    users: users.map((user) => ({
      id: user.id,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      country: user.country,
      bio: user.bio,
      followersCount: user.followersCount,
      brewScore: user.brewScore,
    })),
    collections: collections.map((collection) => ({
      id: collection.id,
      name: collection.name,
      description: collection.description,
      shareSlug: collection.shareSlug,
      ownerName: collection.ownerName,
      recipeCount: collection.recipeCount,
    })),
    roasters,
    origins,
    devices,
    varieties: varieties.slice(0, previewLimit),
    flavors: flavors.slice(0, previewLimit),
    totalRecipes,
    page,
    pageSize: SEARCH_PAGE_SIZE,
  };
}

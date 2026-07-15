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
  SearchSort,
  VarietySearchHit,
} from "@/types/search";
import { toSafeArray } from "@/lib/utils/arrays";

type RatingRow = { recipe_id: string; average_rating: number; review_count: number };
type FavoriteRow = { recipe_id: string };

function parseNumber(value: string): number | null {
  if (!value.trim()) return null;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parseBrewTimeMinutes(time: string | null | undefined): number {
  if (!time) return Number.POSITIVE_INFINITY;
  const colon = time.match(/(\d+)\s*:\s*(\d+)/);
  if (colon) return Number.parseInt(colon[1], 10) * 60 + Number.parseInt(colon[2], 10);
  const minutes = time.match(/(\d+)\s*min/i);
  if (minutes) return Number.parseInt(minutes[1], 10);
  const digits = Number.parseInt(time, 10);
  return Number.isFinite(digits) ? digits : Number.POSITIVE_INFINITY;
}

function matchesQuery(haystack: string, query: string): boolean {
  if (!query) return true;
  return haystack.toLowerCase().includes(query.toLowerCase());
}

function buildRecipeHaystack(recipe: RecipeListItem): string {
  return [
    recipe.name,
    recipe.roasterName,
    recipe.origin,
    recipe.country,
    recipe.brewMethod,
    recipe.deviceName,
    recipe.roastLevel,
    recipe.difficulty,
    recipe.notes,
    ...(recipe.tags ?? []),
    ...(recipe.searchableExtras ?? []),
  ]
    .filter(Boolean)
    .join(" ");
}

function recipePassesFilters(recipe: RecipeListItem, filters: SearchFilters): boolean {
  if (filters.country && recipe.country !== filters.country) return false;
  if (filters.region && !recipe.origin.toLowerCase().includes(filters.region.toLowerCase())) return false;
  if (filters.roastLevel && recipe.roastLevel !== filters.roastLevel) return false;
  if (filters.difficulty && recipe.difficulty !== filters.difficulty) return false;
  if (filters.premiumOnly && !recipe.premium) return false;
  if (filters.featuredOnly && !recipe.featured) return false;

  const brewTimeMax = parseNumber(filters.brewTimeMax);
  if (brewTimeMax !== null && parseBrewTimeMinutes(recipe.time) > brewTimeMax) return false;

  if (filters.process) {
    const haystack = buildRecipeHaystack(recipe).toLowerCase();
    if (!haystack.includes(filters.process.toLowerCase())) return false;
  }

  if (filters.tastingNotes && !matchesQuery(recipe.notes ?? "", filters.tastingNotes)) return false;

  if (filters.q && !matchesQuery(buildRecipeHaystack(recipe), filters.q)) return false;

  return true;
}

async function loadRecipeSortMaps(supabase: SupabaseClient) {
  const [{ data: ratings }, { data: favorites }] = await Promise.all([
    supabase.from("recipe_rating_summary").select("recipe_id, average_rating, review_count"),
    supabase.from("favorites").select("recipe_id"),
  ]);

  const ratingById = new Map<string, RatingRow>();
  for (const row of (ratings ?? []) as RatingRow[]) {
    ratingById.set(row.recipe_id, row);
  }

  const favoriteCounts = new Map<string, number>();
  for (const row of (favorites ?? []) as FavoriteRow[]) {
    favoriteCounts.set(row.recipe_id, (favoriteCounts.get(row.recipe_id) ?? 0) + 1);
  }

  return { ratingById, favoriteCounts };
}

function sortRecipes(
  recipes: RecipeListItem[],
  sort: SearchSort,
  ratingById: Map<string, RatingRow>,
  favoriteCounts: Map<string, number>,
): RecipeListItem[] {
  const sorted = [...recipes];

  sorted.sort((a, b) => {
    if (sort === "alphabetical") return a.name.localeCompare(b.name);
    if (sort === "fastest") {
      return parseBrewTimeMinutes(a.time) - parseBrewTimeMinutes(b.time);
    }
    if (sort === "rated") {
      const aRating = a.id ? ratingById.get(a.id)?.average_rating ?? 0 : 0;
      const bRating = b.id ? ratingById.get(b.id)?.average_rating ?? 0 : 0;
      return bRating - aRating;
    }
    if (sort === "popular") {
      const aPop = a.id ? favoriteCounts.get(a.id) ?? 0 : 0;
      const bPop = b.id ? favoriteCounts.get(b.id) ?? 0 : 0;
      return bPop - aPop;
    }
    return 0;
  });

  return sorted;
}

function filterStaticRecipes(recipes: RecipeListItem[], filters: SearchFilters): RecipeListItem[] {
  return recipes.filter((recipe) => {
    if (
      filters.brewingMethodId ||
      filters.deviceId ||
      filters.grinderId ||
      filters.originId ||
      filters.roasterId ||
      filters.tagId
    ) {
      return false;
    }
    if (filters.premiumOnly && !recipe.premium) return false;
    if (filters.featuredOnly && !recipe.featured) return false;

    const doseMin = parseNumber(filters.doseMin);
    const doseMax = parseNumber(filters.doseMax);
    const waterMin = parseNumber(filters.waterMin);
    const waterMax = parseNumber(filters.waterMax);
    const tempMin = parseNumber(filters.tempMin);
    const tempMax = parseNumber(filters.tempMax);
    if (doseMin !== null || doseMax !== null || waterMin !== null || waterMax !== null || tempMin !== null || tempMax !== null) {
      return false;
    }

    return recipePassesFilters(recipe, filters);
  });
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
    image: (row.logo_url as string) ?? "/images/placeholders/roaster.svg",
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
    image: "/images/placeholders/origin.svg",
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
  staticRecipes: RecipeListItem[];
  staticRoasters: TopRoaster[];
  staticOrigins: CoffeeOrigin[];
  staticDevices: DeviceSearchHit[];
};

/** Runs a unified global search across recipes, roasters, origins, devices, varieties, and flavor notes. */
export async function runGlobalSearch(input: RunGlobalSearchInput): Promise<SearchResults> {
  const { supabase, filters, staticRecipes, staticRoasters, staticOrigins, staticDevices } = input;
  const { category, page } = filters;
  const previewLimit = category === "all" ? 6 : SEARCH_PAGE_SIZE;

  const needsRecipes = category === "all" || category === "recipes";
  const needsRoasters = category === "all" || category === "roasters";
  const needsOrigins = category === "all" || category === "origins";
  const needsDevices = category === "all" || category === "devices";
  const needsVarieties = category === "all" || category === "varieties";
  const needsFlavors = category === "all" || category === "flavors";

  const [
    staticFiltered,
    dbRoasters,
    staticRoastersFiltered,
    dbOrigins,
    staticOriginsFiltered,
    dbDevices,
    varieties,
    flavors,
    sortMaps,
  ] = await Promise.all([
    needsRecipes ? Promise.resolve(filterStaticRecipes(staticRecipes, filters)) : Promise.resolve([]),
    needsRoasters ? searchDbRoasters(supabase, filters.q, filters.country) : Promise.resolve([]),
    needsRoasters ? Promise.resolve(filterStaticRoasters(staticRoasters, filters.q, filters.country)) : Promise.resolve([]),
    needsOrigins ? searchDbOrigins(supabase, filters) : Promise.resolve([]),
    needsOrigins ? Promise.resolve(filterStaticOrigins(staticOrigins, filters)) : Promise.resolve([]),
    needsDevices ? searchDbDevices(supabase, filters.q) : Promise.resolve([]),
    needsVarieties ? searchVarieties(supabase, filters) : Promise.resolve([]),
    needsFlavors ? searchFlavors(supabase, filters) : Promise.resolve([]),
    needsRecipes ? loadRecipeSortMaps(supabase) : Promise.resolve({ ratingById: new Map(), favoriteCounts: new Map() }),
  ]);

  let recipes: RecipeListItem[] = [];
  let totalRecipes = 0;

  if (needsRecipes) {
    const sortedStatic = sortRecipes(
      staticFiltered,
      filters.sort,
      sortMaps.ratingById,
      sortMaps.favoriteCounts,
    );

    if (category === "all") {
      const staticSlice = sortedStatic.slice(0, previewLimit);
      const remaining = Math.max(0, previewLimit - staticSlice.length);
      const paginated = await searchPublishedRecipesPaginated(supabase, filters, {
        page: 1,
        pageSize: remaining > 0 ? remaining : 1,
        staticCount: 0,
      });

      recipes = remaining > 0 ? [...staticSlice, ...paginated.recipes] : staticSlice;
      totalRecipes = sortedStatic.length + paginated.dbTotalCount;
    } else {
      const paginated = await searchPublishedRecipesPaginated(supabase, filters, {
        page,
        pageSize: SEARCH_PAGE_SIZE,
        staticCount: sortedStatic.length,
      });

      if (page === 1) {
        const staticSlice = sortedStatic.slice(0, Math.min(sortedStatic.length, SEARCH_PAGE_SIZE));
        recipes = [...staticSlice, ...paginated.recipes];
      } else {
        recipes = paginated.recipes;
      }

      totalRecipes = sortedStatic.length + paginated.dbTotalCount;
    }
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

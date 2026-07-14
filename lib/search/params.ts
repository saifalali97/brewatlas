import {
  SEARCH_CATEGORIES,
  SEARCH_SORTS,
  type SearchCategory,
  type SearchFilters,
  type SearchSort,
} from "@/types/search";

export const SEARCH_PAGE_SIZE = 12;

function parseCategory(value: string | undefined): SearchCategory {
  if (value && (SEARCH_CATEGORIES as readonly string[]).includes(value)) {
    return value as SearchCategory;
  }
  return "all";
}

function parseSort(value: string | undefined): SearchSort {
  if (value && (SEARCH_SORTS as readonly string[]).includes(value)) {
    return value as SearchSort;
  }
  return "newest";
}

function parseBool(value: string | undefined): boolean {
  return value === "1" || value === "true";
}

function parsePage(value: string | undefined): number {
  const page = Number.parseInt(value ?? "1", 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
}

/** Parses Next.js `searchParams` into a typed `SearchFilters` object with safe defaults. */
export function parseSearchParams(
  params: Record<string, string | string[] | undefined>,
): SearchFilters {
  const single = (key: string) => {
    const value = params[key];
    return Array.isArray(value) ? value[0] : value;
  };

  return {
    q: (single("q") ?? "").trim(),
    category: parseCategory(single("cat")),
    sort: parseSort(single("sort")),
    country: single("country") ?? "",
    region: single("region") ?? "",
    roastLevel: single("roast") ?? "",
    process: single("process") ?? "",
    brewingMethodId: single("method") ?? "",
    deviceId: single("device") ?? "",
    grinderId: single("grinder") ?? "",
    difficulty: single("diff") ?? "",
    brewTimeMax: single("bt") ?? "",
    doseMin: single("dmin") ?? "",
    doseMax: single("dmax") ?? "",
    waterMin: single("wmin") ?? "",
    waterMax: single("wmax") ?? "",
    tempMin: single("tmin") ?? "",
    tempMax: single("tmax") ?? "",
    premiumOnly: parseBool(single("premium")),
    featuredOnly: parseBool(single("featured")),
    page: parsePage(single("page")),
  };
}

/** Serializes `SearchFilters` into URL search params, omitting empty/default values. */
export function serializeSearchFilters(filters: SearchFilters): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.q) params.set("q", filters.q);
  if (filters.category !== "all") params.set("cat", filters.category);
  if (filters.sort !== "newest") params.set("sort", filters.sort);
  if (filters.country) params.set("country", filters.country);
  if (filters.region) params.set("region", filters.region);
  if (filters.roastLevel) params.set("roast", filters.roastLevel);
  if (filters.process) params.set("process", filters.process);
  if (filters.brewingMethodId) params.set("method", filters.brewingMethodId);
  if (filters.deviceId) params.set("device", filters.deviceId);
  if (filters.grinderId) params.set("grinder", filters.grinderId);
  if (filters.difficulty) params.set("diff", filters.difficulty);
  if (filters.brewTimeMax) params.set("bt", filters.brewTimeMax);
  if (filters.doseMin) params.set("dmin", filters.doseMin);
  if (filters.doseMax) params.set("dmax", filters.doseMax);
  if (filters.waterMin) params.set("wmin", filters.waterMin);
  if (filters.waterMax) params.set("wmax", filters.waterMax);
  if (filters.tempMin) params.set("tmin", filters.tempMin);
  if (filters.tempMax) params.set("tmax", filters.tempMax);
  if (filters.premiumOnly) params.set("premium", "1");
  if (filters.featuredOnly) params.set("featured", "1");
  if (filters.page > 1) params.set("page", String(filters.page));

  return params;
}

export function countActiveFilters(filters: SearchFilters): number {
  let count = 0;
  if (filters.country) count += 1;
  if (filters.region) count += 1;
  if (filters.roastLevel) count += 1;
  if (filters.process) count += 1;
  if (filters.brewingMethodId) count += 1;
  if (filters.deviceId) count += 1;
  if (filters.grinderId) count += 1;
  if (filters.difficulty) count += 1;
  if (filters.brewTimeMax) count += 1;
  if (filters.doseMin || filters.doseMax) count += 1;
  if (filters.waterMin || filters.waterMax) count += 1;
  if (filters.tempMin || filters.tempMax) count += 1;
  if (filters.premiumOnly) count += 1;
  if (filters.featuredOnly) count += 1;
  return count;
}

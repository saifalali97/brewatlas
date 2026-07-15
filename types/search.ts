import type { RecipeListItem } from "@/types/recipe";
import type { CoffeeOrigin, TopRoaster } from "@/types/homepage";

export const SEARCH_CATEGORIES = [
  "all",
  "recipes",
  "roasters",
  "origins",
  "devices",
  "varieties",
  "flavors",
] as const;

export type SearchCategory = (typeof SEARCH_CATEGORIES)[number];

export const SEARCH_SORTS = ["popular", "rated", "newest", "fastest", "alphabetical"] as const;

export type SearchSort = (typeof SEARCH_SORTS)[number];

export type SearchFilters = {
  q: string;
  category: SearchCategory;
  sort: SearchSort;
  country: string;
  region: string;
  originId: string;
  roasterId: string;
  roastLevel: string;
  process: string;
  brewingMethodId: string;
  deviceId: string;
  grinderId: string;
  difficulty: string;
  brewTimeMax: string;
  tastingNotes: string;
  tagId: string;
  doseMin: string;
  doseMax: string;
  waterMin: string;
  waterMax: string;
  tempMin: string;
  tempMax: string;
  premiumOnly: boolean;
  featuredOnly: boolean;
  page: number;
};

export type SearchFilterOptions = {
  countries: string[];
  regions: string[];
  originOptions: { id: string; label: string }[];
  roasters: { id: string; name: string }[];
  tags: { id: string; name: string }[];
  roastLevels: string[];
  processes: string[];
  brewingMethods: { id: string; name: string }[];
  devices: { id: string; name: string }[];
  grinders: { id: string; name: string }[];
  difficulties: string[];
};

export type DeviceSearchHit = {
  id: string;
  name: string;
  slug: string | null;
  manufacturer: string | null;
  source: "db" | "static";
  image?: string;
  description?: string;
};

export type VarietySearchHit = {
  id: string;
  name: string;
  variety: string | null;
  process: string | null;
  roastLevel: string | null;
  roasterName: string | null;
  country: string | null;
  region: string | null;
};

export type FlavorSearchHit = {
  id: string;
  recipeSlug: string;
  recipeName: string;
  flavorText: string;
  tags: string[];
};

export type SearchResults = {
  recipes: RecipeListItem[];
  roasters: TopRoaster[];
  origins: CoffeeOrigin[];
  devices: DeviceSearchHit[];
  varieties: VarietySearchHit[];
  flavors: FlavorSearchHit[];
  totalRecipes: number;
  page: number;
  pageSize: number;
};

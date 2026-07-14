import type { LookupOption, RecipeListItem } from "@/types/recipe";

/**
 * Types for the BrewAtlas Personal Experience system: a signed-in user's
 * equipment setup, taste preferences, and brewing history, plus the
 * aggregated data shown on a personal dashboard.
 *
 * Nothing here is wired into any page yet -- this is the data layer that a
 * future "My Coffee Setup" / "My Taste Profile" / "Brewing History" UI, and
 * eventually an AI recommendation engine, can build on. See
 * `getTasteProfileFeatureVector` for the AI-recommendation-ready export.
 */

/** `public.user_coffee_setups` row, camelCased -- "My Coffee Setup". */
export type CoffeeSetupRow = {
  id: string;
  userId: string;
  grinderId: string | null;
  grinderName: string | null;
  brewerDeviceId: string | null;
  brewerDeviceName: string | null;
  xbloomDeviceId: string | null;
  xbloomDeviceName: string | null;
  espressoMachine: string | null;
  kettle: string | null;
  scale: string | null;
  filterTypeId: string | null;
  filterTypeName: string | null;
  favoriteMug: string | null;
  favoriteServer: string | null;
  preferredWaterProfileId: string | null;
  preferredWaterProfileName: string | null;
  createdAt: string;
  updatedAt: string;
};

/** Raw shape of a `user_coffee_setups` row as selected from Supabase, including its lookup joins. */
export type DbCoffeeSetupRow = {
  id: string;
  user_id: string;
  grinder_id: string | null;
  grinders: LookupOption | null;
  brewer_device_id: string | null;
  devices: LookupOption | null;
  xbloom_device_id: string | null;
  xbloom_devices: LookupOption | null;
  espresso_machine: string | null;
  kettle: string | null;
  scale: string | null;
  filter_type_id: string | null;
  filter_types: LookupOption | null;
  favorite_mug: string | null;
  favorite_server: string | null;
  preferred_water_profile_id: string | null;
  water_profiles: LookupOption | null;
  created_at: string;
  updated_at: string;
};

/** 1-10 preference/affinity scale, matching `recipes.sweetness`/`acidity`/`body`/`bitterness`. */
export type TastePreferenceScore = number;

export const ROAST_PREFERENCES = ["Light", "Medium-Light", "Medium", "Medium-Dark", "Dark"] as const;
export type RoastPreference = (typeof ROAST_PREFERENCES)[number];

/** `public.user_taste_profiles` row (+ favorite processing methods), camelCased -- "My Taste Profile". */
export type TasteProfileRow = {
  id: string;
  userId: string;
  acidityPreference: TastePreferenceScore | null;
  sweetnessPreference: TastePreferenceScore | null;
  bodyPreference: TastePreferenceScore | null;
  fruity: TastePreferenceScore | null;
  chocolate: TastePreferenceScore | null;
  floral: TastePreferenceScore | null;
  nutty: TastePreferenceScore | null;
  fermented: TastePreferenceScore | null;
  teaLike: TastePreferenceScore | null;
  roastPreference: RoastPreference | null;
  favoriteProcessingMethods: string[];
  createdAt: string;
  updatedAt: string;
};

/** Raw shape of a `user_taste_profiles` row as selected from Supabase, including its processes join. */
export type DbTasteProfileRow = {
  id: string;
  user_id: string;
  acidity_preference: number | null;
  sweetness_preference: number | null;
  body_preference: number | null;
  fruity: number | null;
  chocolate: number | null;
  floral: number | null;
  nutty: number | null;
  fermented: number | null;
  tea_like: number | null;
  roast_preference: RoastPreference | null;
  created_at: string;
  updated_at: string;
  user_taste_profile_processes: { id: string; process: string }[] | null | undefined;
};

/** `public.user_brew_logs` row, camelCased -- one entry in "Brewing History". */
export type BrewLogRow = {
  id: string;
  userId: string;
  recipeId: string | null;
  recipeTitle: string | null;
  recipeSlug: string | null;
  brewedAt: string;
  brewingDeviceId: string | null;
  brewingDeviceName: string | null;
  brewingMethodId: string | null;
  brewingMethodName: string | null;
  rating: number | null;
  isFavorite: boolean;
  notes: string | null;
  createdAt: string;
};

/** Raw shape of a `user_brew_logs` row as selected from Supabase, including its lookup/recipe joins. */
export type DbBrewLogRow = {
  id: string;
  user_id: string;
  recipe_id: string | null;
  recipes: { id: string; title: string; slug: string } | null;
  brewed_at: string;
  brewing_device_id: string | null;
  devices: LookupOption | null;
  brewing_method_id: string | null;
  brewing_methods: LookupOption | null;
  rating: number | null;
  is_favorite: boolean;
  notes: string | null;
  created_at: string;
};

/** A named count, used for the "favorite X" dashboard aggregates (most-frequent value in the user's brew history). */
export type PersonalDashboardFavorite = {
  id: string;
  name: string;
  count: number;
} | null;

/** Aggregated "Personal Dashboard data", derived from a user's brew history and favorites. */
export type PersonalDashboard = {
  favoriteBrewMethod: PersonalDashboardFavorite;
  favoriteOrigin: PersonalDashboardFavorite;
  favoriteRoaster: PersonalDashboardFavorite;
  favoriteDevice: PersonalDashboardFavorite;
  totalBrews: number;
  favoriteRecipes: RecipeListItem[];
  recentlyBrewed: BrewLogRow[];
  averageRecipeRating: number | null;
};

/**
 * A flat, numeric feature vector derived from a user's taste profile and
 * brewing history, ready to feed a future AI/ML recommendation model
 * (e.g. nearest-neighbor matching against `recipe_insights.expected_*`
 * from the Recipe Intelligence Engine). All fields are 0-10; unset
 * preferences fall back to the midpoint (5) rather than null so the
 * vector is always a fixed, well-formed shape.
 */
export type TasteProfileFeatureVector = {
  userId: string;
  acidity: number;
  sweetness: number;
  body: number;
  fruity: number;
  chocolate: number;
  floral: number;
  nutty: number;
  fermented: number;
  teaLike: number;
  roastPreference: RoastPreference | null;
  favoriteProcessingMethods: string[];
  /** From brew history: average of `recipes.acidity`/etc. across brewed recipes that have Recipe Intelligence data, when available. */
  averageBrewedAcidity: number | null;
  averageBrewedSweetness: number | null;
  averageBrewedBody: number | null;
  averageRecipeRating: number | null;
  totalBrews: number;
};

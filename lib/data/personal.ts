import type { SupabaseClient } from "@supabase/supabase-js";
import { getUserFavoriteRecipes } from "@/lib/data/db-recipes";
import { toSafeArray } from "@/lib/utils/arrays";
import type {
  BrewLogRow,
  CoffeeSetupRow,
  DbBrewLogRow,
  DbCoffeeSetupRow,
  DbTasteProfileRow,
  PersonalDashboard,
  PersonalDashboardFavorite,
  RoastPreference,
  TasteProfileFeatureVector,
  TasteProfileRow,
} from "@/types/personal";

/**
 * Data-access layer for the Personal Experience system: "My Coffee Setup"
 * (`user_coffee_setups`), "My Taste Profile" (`user_taste_profiles` +
 * `user_taste_profile_processes`), "Brewing History" (`user_brew_logs`),
 * and the aggregated Personal Dashboard derived from them.
 *
 * `getCoffeeSetup` backs the "My Coffee Setup" page
 * (`/dashboard/coffee-setup`). Taste profile and brew log queries remain
 * production-ready groundwork (mirroring `lib/data/xbloom.ts` and
 * `lib/data/brew-engine.ts`) for a future UI, and are the data source for
 * future AI recipe recommendations (see `getTasteProfileFeatureVector`).
 */

const COFFEE_SETUP_SELECT = `
  id, user_id, grinder_id, brewer_device_id, xbloom_device_id, espresso_machine,
  kettle, scale, filter_type_id, favorite_mug, favorite_server, preferred_water_profile_id,
  preferred_units, created_at, updated_at,
  grinders ( id, name ),
  devices ( id, name ),
  xbloom_devices ( id, name ),
  filter_types ( id, name ),
  water_profiles ( id, name )
`;

const TASTE_PROFILE_SELECT = `
  id, user_id, acidity_preference, sweetness_preference, body_preference,
  fruity, chocolate, floral, nutty, fermented, tea_like, roast_preference,
  created_at, updated_at,
  user_taste_profile_processes ( id, process )
`;

const BREW_LOG_SELECT = `
  id, user_id, recipe_id, brewed_at, brewing_device_id, brewing_method_id,
  rating, is_favorite, notes, created_at,
  recipes ( id, title, slug ),
  devices ( id, name ),
  brewing_methods ( id, name )
`;

function mapDbCoffeeSetupToRow(row: DbCoffeeSetupRow): CoffeeSetupRow {
  return {
    id: row.id,
    userId: row.user_id,
    grinderId: row.grinder_id,
    grinderName: row.grinders?.name ?? null,
    brewerDeviceId: row.brewer_device_id,
    brewerDeviceName: row.devices?.name ?? null,
    xbloomDeviceId: row.xbloom_device_id,
    xbloomDeviceName: row.xbloom_devices?.name ?? null,
    espressoMachine: row.espresso_machine,
    kettle: row.kettle,
    scale: row.scale,
    filterTypeId: row.filter_type_id,
    filterTypeName: row.filter_types?.name ?? null,
    favoriteMug: row.favorite_mug,
    favoriteServer: row.favorite_server,
    preferredWaterProfileId: row.preferred_water_profile_id,
    preferredWaterProfileName: row.water_profiles?.name ?? null,
    preferredUnits: row.preferred_units,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapDbTasteProfileToRow(row: DbTasteProfileRow): TasteProfileRow {
  return {
    id: row.id,
    userId: row.user_id,
    acidityPreference: row.acidity_preference,
    sweetnessPreference: row.sweetness_preference,
    bodyPreference: row.body_preference,
    fruity: row.fruity,
    chocolate: row.chocolate,
    floral: row.floral,
    nutty: row.nutty,
    fermented: row.fermented,
    teaLike: row.tea_like,
    roastPreference: row.roast_preference,
    favoriteProcessingMethods: toSafeArray(row.user_taste_profile_processes).map((p) => p.process),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapDbBrewLogToRow(row: DbBrewLogRow): BrewLogRow {
  return {
    id: row.id,
    userId: row.user_id,
    recipeId: row.recipe_id,
    recipeTitle: row.recipes?.title ?? null,
    recipeSlug: row.recipes?.slug ?? null,
    brewedAt: row.brewed_at,
    brewingDeviceId: row.brewing_device_id,
    brewingDeviceName: row.devices?.name ?? null,
    brewingMethodId: row.brewing_method_id,
    brewingMethodName: row.brewing_methods?.name ?? null,
    rating: row.rating,
    isFavorite: row.is_favorite,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

/** A user's saved brewing equipment ("My Coffee Setup"), or null if they haven't saved one yet. */
export async function getCoffeeSetup(supabase: SupabaseClient, userId: string): Promise<CoffeeSetupRow | null> {
  const { data, error } = await supabase
    .from("user_coffee_setups")
    .select(COFFEE_SETUP_SELECT)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return mapDbCoffeeSetupToRow(data as unknown as DbCoffeeSetupRow);
}

/** A user's sensory preferences and favorite processing methods ("My Taste Profile"), or null if unset. */
export async function getTasteProfile(supabase: SupabaseClient, userId: string): Promise<TasteProfileRow | null> {
  const { data, error } = await supabase
    .from("user_taste_profiles")
    .select(TASTE_PROFILE_SELECT)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return mapDbTasteProfileToRow(data as unknown as DbTasteProfileRow);
}

/** A user's brew log entries ("Brewing History"), most recent first. */
export async function getBrewLogs(
  supabase: SupabaseClient,
  userId: string,
  options: { limit?: number } = {},
): Promise<BrewLogRow[]> {
  let query = supabase
    .from("user_brew_logs")
    .select(BREW_LOG_SELECT)
    .eq("user_id", userId)
    .order("brewed_at", { ascending: false });

  if (options.limit) query = query.limit(options.limit);

  const { data, error } = await query;
  if (error || !data) {
    if (error) console.error("getBrewLogs failed", error);
    return [];
  }
  return (data as unknown as DbBrewLogRow[]).map(mapDbBrewLogToRow);
}

/** A single brew log entry the caller owns, for an edit form. */
export async function getBrewLogById(
  supabase: SupabaseClient,
  id: string,
  userId: string,
): Promise<BrewLogRow | null> {
  const { data, error } = await supabase
    .from("user_brew_logs")
    .select(BREW_LOG_SELECT)
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return mapDbBrewLogToRow(data as unknown as DbBrewLogRow);
}

type OriginFavoriteJoin = {
  brewing_methods: { id: string; name: string } | null;
  devices: { id: string; name: string } | null;
  recipes: {
    coffees: {
      origins: { id: string; country: string; region: string } | null;
      roasters: { id: string; name: string } | null;
    } | null;
  } | null;
};

/** Picks the most frequent `{ id, name }` in a list, ignoring nulls. Ties resolve to whichever was seen first. */
function mostFrequent<T extends { id: string; name: string }>(items: (T | null)[]): PersonalDashboardFavorite {
  const counts = new Map<string, { name: string; count: number }>();
  for (const item of items) {
    if (!item) continue;
    const existing = counts.get(item.id);
    if (existing) {
      existing.count += 1;
    } else {
      counts.set(item.id, { name: item.name, count: 1 });
    }
  }

  let best: PersonalDashboardFavorite = null;
  for (const [id, { name, count }] of counts) {
    if (!best || count > best.count) {
      best = { id, name, count };
    }
  }
  return best;
}

/**
 * Aggregated Personal Dashboard data: favorite brew method/origin/roaster/
 * device (derived from brew history), total brews, favorite recipes,
 * recently brewed, and average recipe rating.
 */
export async function getPersonalDashboard(supabase: SupabaseClient, userId: string): Promise<PersonalDashboard> {
  const [{ data: aggregateRows, error: aggregateError }, recentlyBrewed, favoriteRecipes] = await Promise.all([
    supabase
      .from("user_brew_logs")
      .select(
        `
          rating,
          brewing_methods ( id, name ),
          devices ( id, name ),
          recipes ( coffees ( origins ( id, country, region ), roasters ( id, name ) ) )
        `,
      )
      .eq("user_id", userId),
    getBrewLogs(supabase, userId, { limit: 8 }),
    getUserFavoriteRecipes(supabase, userId),
  ]);

  if (aggregateError) {
    console.error("getPersonalDashboard failed", aggregateError);
  }

  const rows = (aggregateRows ?? []) as unknown as (OriginFavoriteJoin & { rating: number | null })[];

  const favoriteBrewMethod = mostFrequent(rows.map((row) => row.brewing_methods));
  const favoriteDevice = mostFrequent(rows.map((row) => row.devices));
  const favoriteOrigin = mostFrequent(
    rows.map((row) => {
      const origin = row.recipes?.coffees?.origins;
      return origin ? { id: origin.id, name: `${origin.region}, ${origin.country}` } : null;
    }),
  );
  const favoriteRoaster = mostFrequent(rows.map((row) => row.recipes?.coffees?.roasters ?? null));

  const ratings = rows.map((row) => row.rating).filter((rating): rating is number => rating !== null);
  const averageRecipeRating =
    ratings.length > 0 ? Math.round((ratings.reduce((sum, r) => sum + r, 0) / ratings.length) * 10) / 10 : null;

  return {
    favoriteBrewMethod,
    favoriteOrigin,
    favoriteRoaster,
    favoriteDevice,
    totalBrews: rows.length,
    favoriteRecipes,
    recentlyBrewed,
    averageRecipeRating,
  };
}

const MIDPOINT_PREFERENCE = 5;

/**
 * Flattens a user's taste profile and brew history into a fixed-shape
 * numeric feature vector for future AI recipe recommendations (e.g.
 * nearest-neighbor matching against `recipe_insights.expected_*` rows from
 * the Recipe Intelligence Engine). Safe to call even if the user hasn't
 * filled in a taste profile yet -- unset preferences fall back to the
 * midpoint so downstream models always get a well-formed vector.
 */
export async function getTasteProfileFeatureVector(
  supabase: SupabaseClient,
  userId: string,
): Promise<TasteProfileFeatureVector> {
  const [tasteProfile, brewLogs] = await Promise.all([
    getTasteProfile(supabase, userId),
    getBrewLogs(supabase, userId),
  ]);

  const { data: brewedRecipeRows } = await supabase
    .from("user_brew_logs")
    .select("recipes ( acidity, sweetness, body )")
    .eq("user_id", userId)
    .not("recipe_id", "is", null);

  const brewedRecipes = (
    (brewedRecipeRows ?? []) as unknown as {
      recipes: { acidity: number | null; sweetness: number | null; body: number | null } | null;
    }[]
  )
    .map((row) => row.recipes)
    .filter((recipe): recipe is { acidity: number | null; sweetness: number | null; body: number | null } =>
      Boolean(recipe),
    );

  const average = (values: (number | null)[]): number | null => {
    const present = values.filter((value): value is number => value !== null);
    if (present.length === 0) return null;
    return Math.round((present.reduce((sum, value) => sum + value, 0) / present.length) * 10) / 10;
  };

  const ratings = brewLogs.map((log) => log.rating);

  return {
    userId,
    acidity: tasteProfile?.acidityPreference ?? MIDPOINT_PREFERENCE,
    sweetness: tasteProfile?.sweetnessPreference ?? MIDPOINT_PREFERENCE,
    body: tasteProfile?.bodyPreference ?? MIDPOINT_PREFERENCE,
    fruity: tasteProfile?.fruity ?? MIDPOINT_PREFERENCE,
    chocolate: tasteProfile?.chocolate ?? MIDPOINT_PREFERENCE,
    floral: tasteProfile?.floral ?? MIDPOINT_PREFERENCE,
    nutty: tasteProfile?.nutty ?? MIDPOINT_PREFERENCE,
    fermented: tasteProfile?.fermented ?? MIDPOINT_PREFERENCE,
    teaLike: tasteProfile?.teaLike ?? MIDPOINT_PREFERENCE,
    roastPreference: (tasteProfile?.roastPreference ?? null) as RoastPreference | null,
    favoriteProcessingMethods: tasteProfile?.favoriteProcessingMethods ?? [],
    averageBrewedAcidity: average(brewedRecipes.map((recipe) => recipe.acidity)),
    averageBrewedSweetness: average(brewedRecipes.map((recipe) => recipe.sweetness)),
    averageBrewedBody: average(brewedRecipes.map((recipe) => recipe.body)),
    averageRecipeRating: average(ratings),
    totalBrews: brewLogs.length,
  };
}

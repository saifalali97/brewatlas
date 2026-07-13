import type { SupabaseClient } from "@supabase/supabase-js";
import type { LookupOption } from "@/types/recipe";
import type {
  BrewProfileFullDetail,
  DbBrewProfileRow,
  RecipeBrewEngineLink,
} from "@/types/brew-engine";

/**
 * Data-access layer for the Smart Brewing Engine tables (`brew_devices`,
 * `brew_profiles`, `brew_profile_steps`). Mirrors the shape of
 * `lib/data/db-recipes.ts` but is kept in its own module since these
 * tables are not yet wired into any page or component -- this is
 * groundwork for a future feature.
 */

const BREW_PROFILE_SELECT = `
  id, dose, beverage_weight, brew_ratio, water_temperature, brew_time, bloom_time,
  bloom_water, grinder_name, grinder_setting, filter_type, agitation, tds,
  extraction_yield, notes, created_by, created_at, updated_at,
  brew_profile_steps ( id, step_number, water_amount, pour_duration, wait_after, description )
`;

function mapDbBrewProfileToFullDetail(row: DbBrewProfileRow): BrewProfileFullDetail {
  return {
    id: row.id,
    dose: row.dose,
    beverageWeight: row.beverage_weight,
    brewRatio: row.brew_ratio,
    waterTemperature: row.water_temperature,
    brewTime: row.brew_time,
    bloomTime: row.bloom_time,
    bloomWater: row.bloom_water,
    grinderName: row.grinder_name,
    grinderSetting: row.grinder_setting,
    filterType: row.filter_type,
    agitation: row.agitation,
    tds: row.tds,
    extractionYield: row.extraction_yield,
    notes: row.notes,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    steps: [...row.brew_profile_steps]
      .sort((a, b) => a.step_number - b.step_number)
      .map((step) => ({
        id: step.id,
        stepNumber: step.step_number,
        waterAmount: step.water_amount,
        pourDuration: step.pour_duration,
        waitAfter: step.wait_after,
        description: step.description,
      })),
  };
}

/** The Smart Brewing Engine's equipment catalog, for populating a future device <select>. */
export async function getBrewDeviceOptions(supabase: SupabaseClient): Promise<LookupOption[]> {
  const { data, error } = await supabase.from("brew_devices").select("id, name").order("name");
  if (error) {
    console.error("getBrewDeviceOptions failed", error);
    return [];
  }
  return data ?? [];
}

/** A single brew profile, fully expanded with its ordered steps. */
export async function getBrewProfileById(
  supabase: SupabaseClient,
  id: string,
): Promise<BrewProfileFullDetail | null> {
  const { data, error } = await supabase
    .from("brew_profiles")
    .select(BREW_PROFILE_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return mapDbBrewProfileToFullDetail(data as unknown as DbBrewProfileRow);
}

/** All brew profiles a given user has created, most recent first. */
export async function getUserBrewProfiles(
  supabase: SupabaseClient,
  userId: string,
): Promise<BrewProfileFullDetail[]> {
  const { data, error } = await supabase
    .from("brew_profiles")
    .select(BREW_PROFILE_SELECT)
    .eq("created_by", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getUserBrewProfiles failed", error);
    return [];
  }

  return (data as unknown as DbBrewProfileRow[]).map(mapDbBrewProfileToFullDetail);
}

type RecipeBrewLinkRow = {
  brew_profile_id: string | null;
  brew_device_id: string | null;
  brew_devices: { name: string } | null;
  brew_profiles: DbBrewProfileRow | null;
};

/** The brew profile (if any) currently linked to a recipe. */
export async function getBrewProfileForRecipe(
  supabase: SupabaseClient,
  recipeId: string,
): Promise<BrewProfileFullDetail | null> {
  const { data, error } = await supabase
    .from("recipes")
    .select(`brew_profiles ( ${BREW_PROFILE_SELECT} )`)
    .eq("id", recipeId)
    .maybeSingle();

  if (error || !data) return null;
  const row = data as unknown as { brew_profiles: DbBrewProfileRow | null };
  if (!row.brew_profiles) return null;
  return mapDbBrewProfileToFullDetail(row.brew_profiles);
}

/** The Smart Brewing Engine link (profile id + device id/name) on a recipe, if set. */
export async function getRecipeBrewEngineLink(
  supabase: SupabaseClient,
  recipeId: string,
): Promise<RecipeBrewEngineLink | null> {
  const { data, error } = await supabase
    .from("recipes")
    .select("brew_profile_id, brew_device_id, brew_devices ( name )")
    .eq("id", recipeId)
    .maybeSingle();

  if (error || !data) return null;
  const row = data as unknown as RecipeBrewLinkRow;

  return {
    brewProfileId: row.brew_profile_id,
    brewDeviceId: row.brew_device_id,
    brewDeviceName: row.brew_devices?.name ?? null,
  };
}

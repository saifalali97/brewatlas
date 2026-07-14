import type { SupabaseClient } from "@supabase/supabase-js";
import { toSafeArray } from "@/lib/utils/arrays";
import type { LookupOption } from "@/types/recipe";
import type { DbXBloomProfileRow, XBloomProfileFullDetail } from "@/types/xbloom";

/** An xBloom profile plus the title/slug of the recipe it belongs to, for a user's own aggregate profile list. */
export type UserXBloomProfileSummary = XBloomProfileFullDetail & {
  recipeTitle: string;
  recipeSlug: string;
};

/**
 * Data-access layer for the xBloom Integration Foundation
 * (`xbloom_devices`, `xbloom_profiles`, `xbloom_profile_steps`).
 *
 * This is NOT a live xBloom API integration -- it's read/write access to
 * the structured settings a recipe can optionally carry. Nothing in the UI
 * calls this yet; it mirrors `lib/data/brew-engine.ts` as groundwork for a
 * future xBloom profile editor/export feature.
 */

const XBLOOM_PROFILE_SELECT = `
  id, recipe_id, device_model, grind_setting, water_temperature, brew_water, dose,
  bloom_time, flow_rate, pulse_pattern, pour_sequence, agitation, dripper, filter,
  total_time, brew_notes, created_at, updated_at,
  xbloom_profile_steps ( id, step_number, water_amount, flow_rate, delay, description )
`;

function mapDbXBloomProfileToFullDetail(row: DbXBloomProfileRow): XBloomProfileFullDetail {
  return {
    id: row.id,
    recipeId: row.recipe_id,
    deviceModel: row.device_model,
    grindSetting: row.grind_setting,
    waterTemperature: row.water_temperature,
    brewWater: row.brew_water,
    dose: row.dose,
    bloomTime: row.bloom_time,
    flowRate: row.flow_rate,
    pulsePattern: row.pulse_pattern,
    pourSequence: row.pour_sequence,
    agitation: row.agitation,
    dripper: row.dripper,
    filter: row.filter,
    totalTime: row.total_time,
    brewNotes: row.brew_notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    steps: toSafeArray(row.xbloom_profile_steps)
      .sort((a, b) => a.step_number - b.step_number)
      .map((step) => ({
        id: step.id,
        stepNumber: step.step_number,
        waterAmount: step.water_amount,
        flowRate: step.flow_rate,
        delay: step.delay,
        description: step.description,
      })),
  };
}

/** The supported xBloom hardware catalog, for populating a future device <select>. */
export async function getXBloomDeviceOptions(supabase: SupabaseClient): Promise<LookupOption[]> {
  const { data, error } = await supabase.from("xbloom_devices").select("id, name").order("name");
  if (error) {
    console.error("getXBloomDeviceOptions failed", error);
    return [];
  }
  return data ?? [];
}

/** The xBloom profile (if any) belonging to a recipe, fully expanded with its ordered steps. */
export async function getXBloomProfileForRecipe(
  supabase: SupabaseClient,
  recipeId: string,
): Promise<XBloomProfileFullDetail | null> {
  const { data, error } = await supabase
    .from("xbloom_profiles")
    .select(XBLOOM_PROFILE_SELECT)
    .eq("recipe_id", recipeId)
    .maybeSingle();

  if (error || !data) return null;
  return mapDbXBloomProfileToFullDetail(data as unknown as DbXBloomProfileRow);
}

/** A single xBloom profile by its own id, fully expanded. */
export async function getXBloomProfileById(
  supabase: SupabaseClient,
  id: string,
): Promise<XBloomProfileFullDetail | null> {
  const { data, error } = await supabase
    .from("xbloom_profiles")
    .select(XBLOOM_PROFILE_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return mapDbXBloomProfileToFullDetail(data as unknown as DbXBloomProfileRow);
}

/** Every xBloom profile attached to a recipe `userId` authored, most recently updated first. */
export async function getUserXBloomProfiles(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserXBloomProfileSummary[]> {
  const { data, error } = await supabase
    .from("xbloom_profiles")
    .select(
      `
      id, recipe_id, device_model, grind_setting, water_temperature, brew_water, dose,
      bloom_time, flow_rate, pulse_pattern, pour_sequence, agitation, dripper, filter,
      total_time, brew_notes, created_at, updated_at,
      xbloom_profile_steps ( id, step_number, water_amount, flow_rate, delay, description ),
      recipes!inner ( id, title, slug, author_id )
    `,
    )
    .eq("recipes.author_id", userId)
    .order("updated_at", { ascending: false });

  if (error || !data) {
    if (error) console.error("getUserXBloomProfiles failed", error);
    return [];
  }

  return (
    data as unknown as (DbXBloomProfileRow & { recipes: { id: string; title: string; slug: string; author_id: string } })[]
  ).map((row) => ({
    ...mapDbXBloomProfileToFullDetail(row),
    recipeTitle: row.recipes.title,
    recipeSlug: row.recipes.slug,
  }));
}

/** Whether a recipe already has an xBloom profile attached (cheaper than fetching the full detail). */
export async function recipeHasXBloomProfile(supabase: SupabaseClient, recipeId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("xbloom_profiles")
    .select("id")
    .eq("recipe_id", recipeId)
    .maybeSingle();

  return !error && data !== null;
}

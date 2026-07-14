"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * Server Actions for the Smart Brewing Engine tables (`brew_profiles`,
 * `brew_profile_steps`, and linking a profile/device to a recipe).
 *
 * Nothing in the UI calls these yet -- they exist as production-ready
 * groundwork for the upcoming brew profile editor/detail views, following
 * the same validation and ownership patterns as `lib/supabase/recipe-actions.ts`.
 */

function optionalString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function optionalNumber(formData: FormData, key: string): number | null {
  const value = optionalString(formData, key);
  if (value === null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

type BrewProfileFormValues = {
  dose: number | null;
  beverageWeight: number | null;
  brewRatio: string | null;
  waterTemperature: number | null;
  brewTime: string | null;
  bloomTime: string | null;
  bloomWater: number | null;
  grinderName: string | null;
  grinderSetting: string | null;
  filterType: string | null;
  agitation: string | null;
  tds: number | null;
  extractionYield: number | null;
  notes: string | null;
};

function parseBrewProfileForm(formData: FormData): BrewProfileFormValues {
  return {
    dose: optionalNumber(formData, "dose"),
    beverageWeight: optionalNumber(formData, "beverageWeight"),
    brewRatio: optionalString(formData, "brewRatio"),
    waterTemperature: optionalNumber(formData, "waterTemperature"),
    brewTime: optionalString(formData, "brewTime"),
    bloomTime: optionalString(formData, "bloomTime"),
    bloomWater: optionalNumber(formData, "bloomWater"),
    grinderName: optionalString(formData, "grinderName"),
    grinderSetting: optionalString(formData, "grinderSetting"),
    filterType: optionalString(formData, "filterType"),
    agitation: optionalString(formData, "agitation"),
    tds: optionalNumber(formData, "tds"),
    extractionYield: optionalNumber(formData, "extractionYield"),
    notes: optionalString(formData, "notes"),
  };
}

function brewProfilePayload(values: BrewProfileFormValues) {
  return {
    dose: values.dose,
    beverage_weight: values.beverageWeight,
    brew_ratio: values.brewRatio,
    water_temperature: values.waterTemperature,
    brew_time: values.brewTime,
    bloom_time: values.bloomTime,
    bloom_water: values.bloomWater,
    grinder_name: values.grinderName,
    grinder_setting: values.grinderSetting,
    filter_type: values.filterType,
    agitation: values.agitation,
    tds: values.tds,
    extraction_yield: values.extractionYield,
    notes: values.notes,
  };
}

type StepInput = {
  stepNumber: number;
  waterAmount: number | null;
  pourDuration: string | null;
  waitAfter: string | null;
  description: string | null;
};

/** Reads dynamically-added step rows (`stepWater_0`, `stepPourDuration_0`, ...), skipping empty ones. */
function parseBrewProfileSteps(formData: FormData): StepInput[] {
  const count = Number(formData.get("stepCount") ?? 0);
  const steps: StepInput[] = [];
  let stepNumber = 1;

  for (let i = 0; i < count && i < 200; i += 1) {
    const waterAmount = optionalNumber(formData, `stepWater_${i}`);
    const pourDuration = optionalString(formData, `stepPourDuration_${i}`);
    const waitAfter = optionalString(formData, `stepWaitAfter_${i}`);
    const description = optionalString(formData, `stepDescription_${i}`);
    if (waterAmount === null && !pourDuration && !waitAfter && !description) continue;
    steps.push({ stepNumber, waterAmount, pourDuration, waitAfter, description });
    stepNumber += 1;
  }

  return steps;
}

async function replaceBrewProfileSteps(
  supabase: SupabaseClient,
  brewProfileId: string,
  steps: StepInput[],
): Promise<void> {
  await supabase.from("brew_profile_steps").delete().eq("brew_profile_id", brewProfileId);
  if (steps.length === 0) return;

  await supabase.from("brew_profile_steps").insert(
    steps.map((step) => ({
      brew_profile_id: brewProfileId,
      step_number: step.stepNumber,
      water_amount: step.waterAmount,
      pour_duration: step.pourDuration,
      wait_after: step.waitAfter,
      description: step.description,
    })),
  );
}

export type BrewProfileActionState = { error?: string; success?: string; profileId?: string } | undefined;

/** Creates a new brew profile (plus its ordered steps) owned by the current user. */
export async function createBrewProfileAction(
  _prevState: BrewProfileActionState,
  formData: FormData,
): Promise<BrewProfileActionState> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    return { error: "You must be signed in to create a brew profile." };
  }

  const values = parseBrewProfileForm(formData);

  const { data: inserted, error } = await supabase
    .from("brew_profiles")
    .insert({ ...brewProfilePayload(values), created_by: authData.user.id })
    .select("id")
    .single();

  if (error || !inserted) {
    return { error: error?.message ?? "Failed to create brew profile." };
  }

  const profileId = inserted.id as string;
  await replaceBrewProfileSteps(supabase, profileId, parseBrewProfileSteps(formData));

  return { success: "Brew profile created.", profileId };
}

/** Updates a brew profile (and replaces its steps) the current user owns. */
export async function updateBrewProfileAction(
  _prevState: BrewProfileActionState,
  formData: FormData,
): Promise<BrewProfileActionState> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    return { error: "You must be signed in to update a brew profile." };
  }

  const profileId = optionalString(formData, "profileId");
  if (!profileId) {
    return { error: "Missing brew profile id." };
  }

  const { data: existing } = await supabase
    .from("brew_profiles")
    .select("id, created_by")
    .eq("id", profileId)
    .maybeSingle();

  if (!existing) {
    return { error: "Brew profile not found." };
  }

  // RLS already prevents the update below from touching another user's
  // profile, but checking here first gives a clear, friendly error message
  // instead of a silent no-op.
  if (existing.created_by !== authData.user.id) {
    return { error: "You can only edit your own brew profiles." };
  }

  const values = parseBrewProfileForm(formData);

  const { error } = await supabase
    .from("brew_profiles")
    .update(brewProfilePayload(values))
    .eq("id", profileId)
    .eq("created_by", authData.user.id);

  if (error) {
    return { error: error.message };
  }

  await replaceBrewProfileSteps(supabase, profileId, parseBrewProfileSteps(formData));

  return { success: "Brew profile updated.", profileId };
}

/** Deletes a brew profile the current user owns (its steps cascade automatically). */
export async function deleteBrewProfileAction(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return;

  const profileId = optionalString(formData, "profileId");
  if (!profileId) return;

  await supabase.from("brew_profiles").delete().eq("id", profileId).eq("created_by", authData.user.id);
}

export type LinkBrewProfileActionState = { error?: string; success?: string } | undefined;

/** Attaches (or clears, when left blank) a brew profile and/or brew device on a recipe the caller owns. */
export async function linkRecipeToBrewProfileAction(
  _prevState: LinkBrewProfileActionState,
  formData: FormData,
): Promise<LinkBrewProfileActionState> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    return { error: "You must be signed in to link a brew profile." };
  }

  const recipeId = optionalString(formData, "recipeId");
  if (!recipeId) {
    return { error: "Missing recipe id." };
  }

  const { data: existing } = await supabase
    .from("recipes")
    .select("id, author_id, slug")
    .eq("id", recipeId)
    .maybeSingle();

  if (!existing) {
    return { error: "Recipe not found." };
  }
  if (existing.author_id !== authData.user.id) {
    return { error: "You can only edit your own recipes." };
  }

  const brewProfileId = optionalString(formData, "brewProfileId");
  const brewDeviceId = optionalString(formData, "brewDeviceId");

  const { error } = await supabase
    .from("recipes")
    .update({ brew_profile_id: brewProfileId, brew_device_id: brewDeviceId })
    .eq("id", recipeId)
    .eq("author_id", authData.user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard/recipes");
  if (existing.slug) revalidatePath(`/recipes/${existing.slug}`);

  return { success: "Brew profile linked to recipe." };
}

"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { XBLOOM_DEVICE_MODELS, type XBloomDeviceModel } from "@/types/xbloom";

/**
 * Server Actions for the xBloom Integration Foundation
 * (`xbloom_profiles`, `xbloom_profile_steps`).
 *
 * This is NOT a live xBloom API integration -- these actions only read and
 * write the structured settings a recipe can optionally carry. Nothing in
 * the UI calls them yet; they exist as production-ready groundwork for a
 * future xBloom profile editor/export feature, following the same
 * validation and ownership patterns as `lib/supabase/recipe-actions.ts`
 * and `lib/supabase/brew-profile-actions.ts`.
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

function isXBloomDeviceModel(value: string): value is XBloomDeviceModel {
  return (XBLOOM_DEVICE_MODELS as readonly string[]).includes(value);
}

type XBloomProfileFormValues = {
  deviceModel: XBloomDeviceModel | null;
  grindSetting: string | null;
  waterTemperature: number | null;
  brewWater: number | null;
  dose: number | null;
  bloomTime: string | null;
  flowRate: number | null;
  pulsePattern: string | null;
  pourSequence: string | null;
  agitation: string | null;
  dripper: string | null;
  filter: string | null;
  totalTime: string | null;
  brewNotes: string | null;
};

/** Validates and parses the xBloom profile form fields. Returns a friendly error for an unsupported device model. */
function parseXBloomProfileForm(
  formData: FormData,
): { values: XBloomProfileFormValues } | { error: string } {
  const deviceModelRaw = optionalString(formData, "deviceModel");
  if (deviceModelRaw && !isXBloomDeviceModel(deviceModelRaw)) {
    return { error: `Unsupported xBloom device model. Choose one of: ${XBLOOM_DEVICE_MODELS.join(", ")}.` };
  }

  return {
    values: {
      deviceModel: deviceModelRaw as XBloomDeviceModel | null,
      grindSetting: optionalString(formData, "grindSetting"),
      waterTemperature: optionalNumber(formData, "waterTemperature"),
      brewWater: optionalNumber(formData, "brewWater"),
      dose: optionalNumber(formData, "dose"),
      bloomTime: optionalString(formData, "bloomTime"),
      flowRate: optionalNumber(formData, "flowRate"),
      pulsePattern: optionalString(formData, "pulsePattern"),
      pourSequence: optionalString(formData, "pourSequence"),
      agitation: optionalString(formData, "agitation"),
      dripper: optionalString(formData, "dripper"),
      filter: optionalString(formData, "filter"),
      totalTime: optionalString(formData, "totalTime"),
      brewNotes: optionalString(formData, "brewNotes"),
    },
  };
}

function xbloomProfilePayload(values: XBloomProfileFormValues) {
  return {
    device_model: values.deviceModel,
    grind_setting: values.grindSetting,
    water_temperature: values.waterTemperature,
    brew_water: values.brewWater,
    dose: values.dose,
    bloom_time: values.bloomTime,
    flow_rate: values.flowRate,
    pulse_pattern: values.pulsePattern,
    pour_sequence: values.pourSequence,
    agitation: values.agitation,
    dripper: values.dripper,
    filter: values.filter,
    total_time: values.totalTime,
    brew_notes: values.brewNotes,
  };
}

type StepInput = {
  stepNumber: number;
  waterAmount: number | null;
  flowRate: number | null;
  delay: string | null;
  description: string | null;
};

/** Reads dynamically-added step rows (`stepWater_0`, `stepFlowRate_0`, ...), skipping empty ones. */
function parseXBloomProfileSteps(formData: FormData): StepInput[] {
  const count = Number(formData.get("stepCount") ?? 0);
  const steps: StepInput[] = [];
  let stepNumber = 1;

  for (let i = 0; i < count && i < 200; i += 1) {
    const waterAmount = optionalNumber(formData, `stepWater_${i}`);
    const flowRate = optionalNumber(formData, `stepFlowRate_${i}`);
    const delay = optionalString(formData, `stepDelay_${i}`);
    const description = optionalString(formData, `stepDescription_${i}`);
    if (waterAmount === null && flowRate === null && !delay && !description) continue;
    steps.push({ stepNumber, waterAmount, flowRate, delay, description });
    stepNumber += 1;
  }

  return steps;
}

async function replaceXBloomProfileSteps(
  supabase: SupabaseClient,
  xbloomProfileId: string,
  steps: StepInput[],
): Promise<void> {
  await supabase.from("xbloom_profile_steps").delete().eq("xbloom_profile_id", xbloomProfileId);
  if (steps.length === 0) return;

  await supabase.from("xbloom_profile_steps").insert(
    steps.map((step) => ({
      xbloom_profile_id: xbloomProfileId,
      step_number: step.stepNumber,
      water_amount: step.waterAmount,
      flow_rate: step.flowRate,
      delay: step.delay,
      description: step.description,
    })),
  );
}

/** Loads a recipe's id/author for the ownership check shared by every action below. */
async function loadOwnedRecipe(
  supabase: SupabaseClient,
  recipeId: string,
  userId: string,
): Promise<{ id: string; slug: string } | { error: string }> {
  const { data: recipe } = await supabase
    .from("recipes")
    .select("id, author_id, slug")
    .eq("id", recipeId)
    .maybeSingle();

  if (!recipe) {
    return { error: "Recipe not found." };
  }
  if (recipe.author_id !== userId) {
    return { error: "You can only manage the xBloom profile on your own recipes." };
  }

  return { id: recipe.id as string, slug: recipe.slug as string };
}

export type XBloomProfileActionState = { error?: string; success?: string; profileId?: string } | undefined;

/**
 * Creates or updates the single xBloom profile for a recipe the caller
 * owns (a recipe has at most one, enforced by the DB's unique `recipe_id`),
 * and replaces its ordered steps.
 */
export async function saveXBloomProfileAction(
  _prevState: XBloomProfileActionState,
  formData: FormData,
): Promise<XBloomProfileActionState> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    return { error: "You must be signed in to manage an xBloom profile." };
  }

  const recipeId = optionalString(formData, "recipeId");
  if (!recipeId) {
    return { error: "Missing recipe id." };
  }

  const owned = await loadOwnedRecipe(supabase, recipeId, authData.user.id);
  if ("error" in owned) {
    return { error: owned.error };
  }

  const parsed = parseXBloomProfileForm(formData);
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const { data: upserted, error } = await supabase
    .from("xbloom_profiles")
    .upsert(
      { ...xbloomProfilePayload(parsed.values), recipe_id: recipeId },
      { onConflict: "recipe_id" },
    )
    .select("id")
    .single();

  if (error || !upserted) {
    return { error: error?.message ?? "Failed to save the xBloom profile." };
  }

  const profileId = upserted.id as string;
  await replaceXBloomProfileSteps(supabase, profileId, parseXBloomProfileSteps(formData));

  revalidatePath("/dashboard/recipes");
  if (owned.slug) revalidatePath(`/recipes/${owned.slug}`);

  return { success: "xBloom profile saved.", profileId };
}

/** Deletes the xBloom profile (and its steps, via cascade) for a recipe the caller owns. */
export async function deleteXBloomProfileAction(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return;

  const recipeId = optionalString(formData, "recipeId");
  if (!recipeId) return;

  const owned = await loadOwnedRecipe(supabase, recipeId, authData.user.id);
  if ("error" in owned) return;

  await supabase.from("xbloom_profiles").delete().eq("recipe_id", recipeId);

  revalidatePath("/dashboard/recipes");
  if (owned.slug) revalidatePath(`/recipes/${owned.slug}`);
}

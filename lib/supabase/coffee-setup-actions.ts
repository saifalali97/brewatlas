"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * Server Actions for "My Coffee Setup" (`user_coffee_setups`).
 *
 * Nothing in the UI calls these yet -- they're production-ready groundwork
 * for a future settings page, following the same auth/validation patterns
 * as `lib/supabase/xbloom-actions.ts` and `lib/supabase/recipe-actions.ts`.
 */

function optionalString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export type CoffeeSetupActionState = { error?: string; success?: string } | undefined;

/** Creates or updates the caller's single coffee setup row (one per user, enforced by the DB's unique `user_id`). */
export async function saveCoffeeSetupAction(
  _prevState: CoffeeSetupActionState,
  formData: FormData,
): Promise<CoffeeSetupActionState> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    return { error: "You must be signed in to save your coffee setup." };
  }

  const payload = {
    user_id: authData.user.id,
    grinder_id: optionalString(formData, "grinderId"),
    brewer_device_id: optionalString(formData, "brewerDeviceId"),
    xbloom_device_id: optionalString(formData, "xbloomDeviceId"),
    espresso_machine: optionalString(formData, "espressoMachine"),
    kettle: optionalString(formData, "kettle"),
    scale: optionalString(formData, "scale"),
    filter_type_id: optionalString(formData, "filterTypeId"),
    favorite_mug: optionalString(formData, "favoriteMug"),
    favorite_server: optionalString(formData, "favoriteServer"),
    preferred_water_profile_id: optionalString(formData, "preferredWaterProfileId"),
  };

  const { error } = await supabase.from("user_coffee_setups").upsert(payload, { onConflict: "user_id" });

  if (error) {
    return { error: error.message || "Failed to save your coffee setup." };
  }

  revalidatePath("/dashboard");
  return { success: "Coffee setup saved." };
}

/** Clears the caller's saved coffee setup. */
export async function deleteCoffeeSetupAction(): Promise<CoffeeSetupActionState> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return { error: "You must be signed in to manage your coffee setup." };
  }

  const { error } = await supabase.from("user_coffee_setups").delete().eq("user_id", authData.user.id);
  if (error) {
    return { error: error.message || "Failed to clear your coffee setup." };
  }

  revalidatePath("/dashboard");
  return { success: "Coffee setup cleared." };
}

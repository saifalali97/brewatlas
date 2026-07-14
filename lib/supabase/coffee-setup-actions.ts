"use server";

import { revalidatePath } from "next/cache";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { createClient } from "@/lib/supabase/server";
import { PREFERRED_UNITS_OPTIONS, type PreferredUnits } from "@/types/personal";

/**
 * Server Actions for "My Coffee Setup" (`user_coffee_setups`), backing the
 * `/dashboard/coffee-setup` page. Follows the same auth/validation/i18n
 * patterns as `lib/supabase/profile-actions.ts` and
 * `lib/supabase/xbloom-actions.ts`.
 */

function optionalString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function optionalPreferredUnits(formData: FormData, key: string): PreferredUnits | null {
  const value = optionalString(formData, key);
  return (PREFERRED_UNITS_OPTIONS as readonly string[]).includes(value ?? "") ? (value as PreferredUnits) : null;
}

export type CoffeeSetupActionState = { error?: string; success?: string } | undefined;

/** Creates or updates the caller's single coffee setup row (one per user, enforced by the DB's unique `user_id`). */
export async function saveCoffeeSetupAction(
  _prevState: CoffeeSetupActionState,
  formData: FormData,
): Promise<CoffeeSetupActionState> {
  const supabase = await createClient();
  const dictionary = await getDictionary(await getLocale());
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    return { error: dictionary.coffeeSetupPage.signInRequired };
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
    preferred_units: optionalPreferredUnits(formData, "preferredUnits"),
  };

  const { error } = await supabase.from("user_coffee_setups").upsert(payload, { onConflict: "user_id" });

  if (error) {
    return { error: error.message || dictionary.coffeeSetupPage.saveFailed };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/coffee-setup");
  return { success: dictionary.coffeeSetupPage.setupSaved };
}

/** Clears the caller's saved coffee setup. */
export async function deleteCoffeeSetupAction(
  _prevState: CoffeeSetupActionState,
  _formData: FormData,
): Promise<CoffeeSetupActionState> {
  const supabase = await createClient();
  const dictionary = await getDictionary(await getLocale());
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return { error: dictionary.coffeeSetupPage.signInRequired };
  }

  const { error } = await supabase.from("user_coffee_setups").delete().eq("user_id", authData.user.id);
  if (error) {
    return { error: error.message || dictionary.coffeeSetupPage.clearFailed };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/coffee-setup");
  return { success: dictionary.coffeeSetupPage.setupCleared };
}

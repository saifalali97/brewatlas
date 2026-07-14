"use server";

import { revalidatePath } from "next/cache";
import { updateTasteProfile } from "@/lib/data/ai";
import { evaluateAndAwardBadges, recordActivity, refreshCommunityStats } from "@/lib/data/community";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { createClient } from "@/lib/supabase/server";

/**
 * Server Actions for "Brewing History" (`user_brew_logs`), backing the
 * `/dashboard/brew-history` pages. Follows the same auth/validation/i18n
 * patterns as `lib/supabase/coffee-setup-actions.ts`.
 */

function optionalString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseRating(
  formData: FormData,
  invalidMessage: string,
): { value: number | null } | { error: string } {
  const raw = optionalString(formData, "rating");
  if (raw === null) return { value: null };

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 1 || parsed > 5) {
    return { error: invalidMessage };
  }
  return { value: Math.round(parsed) };
}

function parseWaterAmount(formData: FormData, invalidMessage: string): { value: number | null } | { error: string } {
  const raw = optionalString(formData, "waterAmount");
  if (raw === null) return { value: null };

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return { error: invalidMessage };
  }
  return { value: Math.round(parsed * 10) / 10 };
}

function parseBrewedAt(formData: FormData): string {
  const raw = optionalString(formData, "brewedAt");
  if (!raw) return new Date().toISOString();

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function brewLogPayload(formData: FormData, invalidRating: string, invalidWater: string) {
  const rating = parseRating(formData, invalidRating);
  if ("error" in rating) return { error: rating.error } as const;

  const waterAmount = parseWaterAmount(formData, invalidWater);
  if ("error" in waterAmount) return { error: waterAmount.error } as const;

  return {
    payload: {
      recipe_id: optionalString(formData, "recipeId"),
      coffee_name: optionalString(formData, "coffeeName"),
      grinder_id: optionalString(formData, "grinderId"),
      grind_size: optionalString(formData, "grindSize"),
      water_amount: waterAmount.value,
      brew_time: optionalString(formData, "brewTime"),
      brewed_at: parseBrewedAt(formData),
      brewing_device_id: optionalString(formData, "brewingDeviceId"),
      brewing_method_id: optionalString(formData, "brewingMethodId"),
      rating: rating.value,
      is_favorite: formData.get("isFavorite") === "on" || formData.get("isFavorite") === "true",
      notes: optionalString(formData, "notes"),
    },
  } as const;
}

async function afterBrewLogMutation(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, recipeId: string | null, rating: number | null, isCreate: boolean) {
  await refreshCommunityStats(supabase, userId);
  await evaluateAndAwardBadges(supabase, userId);
  if (isCreate) {
    await recordActivity(supabase, {
      userId,
      activityType: "brewed_recipe",
      recipeId,
      metadata: rating ? { rating } : {},
    });
  }
  await updateTasteProfile(supabase, userId);
}

function revalidateBrewHistory() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/brew-history");
}

export type BrewLogActionState = { error?: string; success?: string; brewLogId?: string } | undefined;

/** Logs a new brew session for the caller. */
export async function logBrewAction(
  _prevState: BrewLogActionState,
  formData: FormData,
): Promise<BrewLogActionState> {
  const supabase = await createClient();
  const dictionary = await getDictionary(await getLocale());
  const b = dictionary.brewLogPage;
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    return { error: b.signInRequired };
  }

  const parsed = brewLogPayload(formData, b.invalidRating, b.invalidWater);
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const payload = { user_id: authData.user.id, ...parsed.payload };

  const { data: inserted, error } = await supabase
    .from("user_brew_logs")
    .insert(payload)
    .select("id")
    .single();

  if (error || !inserted) {
    return { error: error?.message ?? b.saveFailed };
  }

  const brewLogId = inserted.id as string;
  await afterBrewLogMutation(supabase, authData.user.id, payload.recipe_id, payload.rating, true);

  revalidateBrewHistory();
  return { success: b.brewLogged, brewLogId };
}

/** Updates a brew log entry the caller owns. */
export async function updateBrewLogAction(
  _prevState: BrewLogActionState,
  formData: FormData,
): Promise<BrewLogActionState> {
  const supabase = await createClient();
  const dictionary = await getDictionary(await getLocale());
  const b = dictionary.brewLogPage;
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    return { error: b.signInRequired };
  }

  const brewLogId = optionalString(formData, "brewLogId");
  if (!brewLogId) {
    return { error: b.missingBrewLogId };
  }

  const parsed = brewLogPayload(formData, b.invalidRating, b.invalidWater);
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const { error } = await supabase
    .from("user_brew_logs")
    .update(parsed.payload)
    .eq("id", brewLogId)
    .eq("user_id", authData.user.id);

  if (error) {
    return { error: error.message || b.updateFailed };
  }

  await afterBrewLogMutation(supabase, authData.user.id, parsed.payload.recipe_id, parsed.payload.rating, false);

  revalidateBrewHistory();
  revalidatePath(`/dashboard/brew-history/${brewLogId}/edit`);
  return { success: b.brewUpdated, brewLogId };
}

/** Deletes a brew log entry the caller owns. */
export async function deleteBrewLogAction(
  _prevState: BrewLogActionState,
  formData: FormData,
): Promise<BrewLogActionState> {
  const supabase = await createClient();
  const dictionary = await getDictionary(await getLocale());
  const b = dictionary.brewLogPage;
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    return { error: b.signInRequired };
  }

  const brewLogId = optionalString(formData, "brewLogId");
  if (!brewLogId) {
    return { error: b.missingBrewLogId };
  }

  const { error } = await supabase.from("user_brew_logs").delete().eq("id", brewLogId).eq("user_id", authData.user.id);

  if (error) {
    return { error: error.message || b.deleteFailed };
  }

  await refreshCommunityStats(supabase, authData.user.id);
  await updateTasteProfile(supabase, authData.user.id);

  revalidateBrewHistory();
  return { success: b.brewDeleted };
}

/** Toggles the favorite flag on a single brew session the caller owns. */
export async function toggleBrewLogFavoriteAction(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return;

  const brewLogId = optionalString(formData, "brewLogId");
  if (!brewLogId) return;

  const { data: existing } = await supabase
    .from("user_brew_logs")
    .select("is_favorite")
    .eq("id", brewLogId)
    .eq("user_id", authData.user.id)
    .maybeSingle();

  if (!existing) return;

  await supabase
    .from("user_brew_logs")
    .update({ is_favorite: !existing.is_favorite })
    .eq("id", brewLogId)
    .eq("user_id", authData.user.id);

  revalidateBrewHistory();
}

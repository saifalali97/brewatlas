"use server";

import { revalidatePath } from "next/cache";
import { updateTasteProfile } from "@/lib/data/ai";
import { evaluateAndAwardBadges, recordActivity, refreshCommunityStats } from "@/lib/data/community";
import { createClient } from "@/lib/supabase/server";

/**
 * Server Actions for "Brewing History" (`user_brew_logs`).
 *
 * Nothing in the UI calls these yet -- they're production-ready groundwork
 * for a future brew-logging flow (e.g. a "log this brew" button on a
 * recipe detail page) and feed the Personal Dashboard aggregates in
 * `lib/data/personal.ts#getPersonalDashboard`.
 */

function optionalString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseRating(formData: FormData): { value: number | null } | { error: string } {
  const raw = optionalString(formData, "rating");
  if (raw === null) return { value: null };

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 1 || parsed > 5) {
    return { error: "Rating must be a number between 1 and 5." };
  }
  return { value: Math.round(parsed) };
}

function parseBrewedAt(formData: FormData): string {
  const raw = optionalString(formData, "brewedAt");
  if (!raw) return new Date().toISOString();

  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

export type BrewLogActionState = { error?: string; success?: string; brewLogId?: string } | undefined;

/** Logs a new brew session for the caller. */
export async function logBrewAction(
  _prevState: BrewLogActionState,
  formData: FormData,
): Promise<BrewLogActionState> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    return { error: "You must be signed in to log a brew." };
  }

  const rating = parseRating(formData);
  if ("error" in rating) {
    return { error: rating.error };
  }

  const payload = {
    user_id: authData.user.id,
    recipe_id: optionalString(formData, "recipeId"),
    brewed_at: parseBrewedAt(formData),
    brewing_device_id: optionalString(formData, "brewingDeviceId"),
    brewing_method_id: optionalString(formData, "brewingMethodId"),
    rating: rating.value,
    is_favorite: formData.get("isFavorite") === "on" || formData.get("isFavorite") === "true",
    notes: optionalString(formData, "notes"),
  };

  const { data: inserted, error } = await supabase
    .from("user_brew_logs")
    .insert(payload)
    .select("id")
    .single();

  if (error || !inserted) {
    return { error: error?.message ?? "Failed to log this brew." };
  }

  const brewLogId = inserted.id as string;

  // Community system: every logged brew feeds Brew Score, the "Top
  // Brewers"/"Most Active Users" leaderboards, and badges like First
  // Brew / V60 Master / Espresso Expert / UAE Coffee Explorer.
  await refreshCommunityStats(supabase, authData.user.id);
  await evaluateAndAwardBadges(supabase, authData.user.id);
  await recordActivity(supabase, {
    userId: authData.user.id,
    activityType: "brewed_recipe",
    recipeId: payload.recipe_id,
    metadata: payload.rating ? { rating: payload.rating } : {},
  });

  // BrewAtlas AI: every logged brew is a taste signal -- the AI User
  // Profile becomes smarter over time as it recomputes from this.
  await updateTasteProfile(supabase, authData.user.id);

  revalidatePath("/dashboard");
  return { success: "Brew logged.", brewLogId };
}

/** Updates a brew log entry the caller owns. */
export async function updateBrewLogAction(
  _prevState: BrewLogActionState,
  formData: FormData,
): Promise<BrewLogActionState> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    return { error: "You must be signed in to update a brew log." };
  }

  const brewLogId = optionalString(formData, "brewLogId");
  if (!brewLogId) {
    return { error: "Missing brew log id." };
  }

  const rating = parseRating(formData);
  if ("error" in rating) {
    return { error: rating.error };
  }

  const payload = {
    recipe_id: optionalString(formData, "recipeId"),
    brewed_at: parseBrewedAt(formData),
    brewing_device_id: optionalString(formData, "brewingDeviceId"),
    brewing_method_id: optionalString(formData, "brewingMethodId"),
    rating: rating.value,
    is_favorite: formData.get("isFavorite") === "on" || formData.get("isFavorite") === "true",
    notes: optionalString(formData, "notes"),
  };

  const { error } = await supabase
    .from("user_brew_logs")
    .update(payload)
    .eq("id", brewLogId)
    .eq("user_id", authData.user.id);

  if (error) {
    return { error: error.message || "Failed to update this brew log." };
  }

  await updateTasteProfile(supabase, authData.user.id);

  revalidatePath("/dashboard");
  return { success: "Brew log updated.", brewLogId };
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

  revalidatePath("/dashboard");
}

/** Deletes a brew log entry the caller owns. */
export async function deleteBrewLogAction(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return;

  const brewLogId = optionalString(formData, "brewLogId");
  if (!brewLogId) return;

  await supabase.from("user_brew_logs").delete().eq("id", brewLogId).eq("user_id", authData.user.id);

  revalidatePath("/dashboard");
}

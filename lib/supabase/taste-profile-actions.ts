"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ROAST_PREFERENCES, type RoastPreference } from "@/types/personal";

/**
 * Server Actions for "My Taste Profile" (`user_taste_profiles` +
 * `user_taste_profile_processes`).
 *
 * Nothing in the UI calls these yet -- they're production-ready groundwork
 * for a future preferences page and, eventually, AI recipe
 * recommendations (see `lib/data/personal.ts#getTasteProfileFeatureVector`).
 */

function optionalString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** Parses a 1-10 preference score, returning an error if present but out of range. */
function parsePreferenceScore(formData: FormData, key: string): { value: number | null } | { error: string } {
  const raw = optionalString(formData, key);
  if (raw === null) return { value: null };

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 1 || parsed > 10) {
    return { error: `${key} must be a number between 1 and 10.` };
  }
  return { value: Math.round(parsed) };
}

function isRoastPreference(value: string): value is RoastPreference {
  return (ROAST_PREFERENCES as readonly string[]).includes(value);
}

/** Reads favorite processing methods from either repeated `processes` fields or a comma-separated string, deduped. */
function parseFavoriteProcessingMethods(formData: FormData): string[] {
  const values = formData
    .getAll("processes")
    .flatMap((value) => (typeof value === "string" ? value.split(",") : []))
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

  return Array.from(new Set(values));
}

const PREFERENCE_FIELDS = [
  "acidityPreference",
  "sweetnessPreference",
  "bodyPreference",
  "fruity",
  "chocolate",
  "floral",
  "nutty",
  "fermented",
  "teaLike",
] as const;

const PREFERENCE_COLUMNS: Record<(typeof PREFERENCE_FIELDS)[number], string> = {
  acidityPreference: "acidity_preference",
  sweetnessPreference: "sweetness_preference",
  bodyPreference: "body_preference",
  fruity: "fruity",
  chocolate: "chocolate",
  floral: "floral",
  nutty: "nutty",
  fermented: "fermented",
  teaLike: "tea_like",
};

export type TasteProfileActionState = { error?: string; success?: string } | undefined;

/**
 * Creates or updates the caller's single taste profile row (one per user,
 * enforced by the DB's unique `user_id`), and replaces their favorite
 * processing methods.
 */
export async function saveTasteProfileAction(
  _prevState: TasteProfileActionState,
  formData: FormData,
): Promise<TasteProfileActionState> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    return { error: "You must be signed in to save your taste profile." };
  }

  const roastPreferenceRaw = optionalString(formData, "roastPreference");
  if (roastPreferenceRaw && !isRoastPreference(roastPreferenceRaw)) {
    return { error: `Roast preference must be one of: ${ROAST_PREFERENCES.join(", ")}.` };
  }

  const payload: Record<string, string | number | null> = {
    user_id: authData.user.id,
    roast_preference: roastPreferenceRaw,
  };

  for (const field of PREFERENCE_FIELDS) {
    const parsed = parsePreferenceScore(formData, field);
    if ("error" in parsed) {
      return { error: parsed.error };
    }
    payload[PREFERENCE_COLUMNS[field]] = parsed.value;
  }

  const { data: upserted, error } = await supabase
    .from("user_taste_profiles")
    .upsert(payload, { onConflict: "user_id" })
    .select("id")
    .single();

  if (error || !upserted) {
    return { error: error?.message ?? "Failed to save your taste profile." };
  }

  const tasteProfileId = upserted.id as string;
  const processes = parseFavoriteProcessingMethods(formData);

  await supabase.from("user_taste_profile_processes").delete().eq("taste_profile_id", tasteProfileId);
  if (processes.length > 0) {
    await supabase.from("user_taste_profile_processes").insert(
      processes.map((process) => ({ taste_profile_id: tasteProfileId, process })),
    );
  }

  revalidatePath("/account");
  return { success: "Taste profile saved." };
}

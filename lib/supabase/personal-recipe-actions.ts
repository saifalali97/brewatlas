"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { PersonalizationAdjustments } from "@/lib/recipes/personalization/types";

export type SavePersonalRecipeState =
  | { ok: true; id: string }
  | { ok: false; error: string };

/**
 * Persists personalization preferences only — never writes a new recipes row.
 * Falls back to a clear error when the user is signed out.
 */
export async function saveUserCustomRecipeAction(input: {
  baseRecipeId?: string | null;
  baseRecipeSlug: string;
  title?: string | null;
  adjustments: PersonalizationAdjustments;
  isDuplicate?: boolean;
}): Promise<SavePersonalRecipeState> {
  const slug = input.baseRecipeSlug?.trim();
  if (!slug) return { ok: false, error: "Missing recipe slug." };

  const dose = input.adjustments.coffeeDoseG;
  const ratio = input.adjustments.brewRatio;
  if (dose != null && (!(dose > 0) || !Number.isFinite(dose))) {
    return { ok: false, error: "Invalid dose." };
  }
  if (ratio != null && (!(ratio > 0) || !Number.isFinite(ratio))) {
    return { ok: false, error: "Invalid ratio." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sign in to save your customized brew." };

  const servingStyle =
    input.adjustments.servingStyle === "hot" || input.adjustments.servingStyle === "iced"
      ? input.adjustments.servingStyle
      : null;

  const payload = {
    user_id: user.id,
    base_recipe_id: input.baseRecipeId ?? null,
    base_recipe_slug: slug,
    title: input.title ?? null,
    serving_style: servingStyle,
    brew_method: input.adjustments.brewMethod ?? null,
    coffee_dose_g: dose ?? null,
    brew_ratio: ratio ?? null,
    settings: input.adjustments,
    is_duplicate: Boolean(input.isDuplicate),
    updated_at: new Date().toISOString(),
  };

  const { data: existing } = await supabase
    .from("user_custom_recipes")
    .select("id")
    .eq("user_id", user.id)
    .eq("base_recipe_slug", slug)
    .eq("is_duplicate", Boolean(input.isDuplicate))
    .maybeSingle();

  if (existing?.id) {
    const { data, error } = await supabase
      .from("user_custom_recipes")
      .update(payload)
      .eq("id", existing.id)
      .select("id")
      .single();
    if (error) return { ok: false, error: error.message };
    revalidatePath(`/recipes/${slug}`);
    return { ok: true, id: data.id };
  }

  const { data, error } = await supabase
    .from("user_custom_recipes")
    .insert(payload)
    .select("id")
    .single();
  if (error) return { ok: false, error: error.message };
  revalidatePath(`/recipes/${slug}`);
  return { ok: true, id: data.id };
}

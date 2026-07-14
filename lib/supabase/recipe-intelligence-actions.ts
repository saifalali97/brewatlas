"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { analyzeRecipe } from "@/lib/intelligence/recipe-analysis";
import { buildRecipeAnalysisInputForRecipe, deleteRecipeInsights, upsertRecipeInsights } from "@/lib/data/recipe-insights";

/**
 * Server Actions for the BrewAtlas Recipe Intelligence Engine
 * (`recipe_insights`, `recipe_insight_warnings`).
 *
 * These actions don't accept any calculated values from the client -- they
 * only take a `recipeId`, re-read that recipe's own brewing parameters from
 * the database, run them through the pure analysis functions in
 * `lib/intelligence/recipe-analysis.ts`, and store the result. That's what
 * keeps "calculated" and "user-entered" values honestly separated: nothing
 * here ever writes to the `recipes` table.
 *
 * Nothing in the UI calls these yet; they follow the same
 * validation/ownership pattern as `lib/supabase/brew-profile-actions.ts`
 * and `lib/supabase/xbloom-actions.ts` as groundwork for a future
 * "recalculate insights" affordance on the recipe editor.
 */

function optionalString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** Loads a recipe's id/slug for the ownership check shared by every action below. */
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
    return { error: "You can only recalculate insights on your own recipes." };
  }

  return { id: recipe.id as string, slug: recipe.slug as string };
}

export type RecipeInsightsActionState =
  | {
      error?: string;
      success?: string;
      difficultyScore?: number | null;
      warningCount?: number;
    }
  | undefined;

/**
 * Recalculates and stores the Recipe Intelligence Engine's insights for a
 * recipe the caller owns. Safe to call repeatedly (e.g. every time the
 * recipe's brewing parameters are saved) -- it always overwrites the prior
 * result for that recipe.
 */
export async function recalculateRecipeInsightsAction(
  _prevState: RecipeInsightsActionState,
  formData: FormData,
): Promise<RecipeInsightsActionState> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    return { error: "You must be signed in to recalculate recipe insights." };
  }

  const recipeId = optionalString(formData, "recipeId");
  if (!recipeId) {
    return { error: "Missing recipe id." };
  }

  const owned = await loadOwnedRecipe(supabase, recipeId, authData.user.id);
  if ("error" in owned) {
    return { error: owned.error };
  }

  const input = await buildRecipeAnalysisInputForRecipe(supabase, recipeId);
  if (!input) {
    return { error: "Could not load this recipe's brewing parameters." };
  }

  if (input.coffeeDose === null || input.waterAmount === null) {
    return { error: "Add a coffee dose and water amount before insights can be calculated." };
  }

  const result = analyzeRecipe(input);
  const saved = await upsertRecipeInsights(supabase, recipeId, result);
  if ("error" in saved) {
    return { error: saved.error };
  }

  revalidatePath("/account/recipes");
  if (owned.slug) revalidatePath(`/recipes/${owned.slug}`);

  return {
    success: "Recipe insights recalculated.",
    difficultyScore: result.difficultyScore,
    warningCount: result.warnings.length,
  };
}

/** Deletes the stored insights for a recipe the caller owns (e.g. before recalculating from scratch). */
export async function deleteRecipeInsightsAction(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return;

  const recipeId = optionalString(formData, "recipeId");
  if (!recipeId) return;

  const owned = await loadOwnedRecipe(supabase, recipeId, authData.user.id);
  if ("error" in owned) return;

  await deleteRecipeInsights(supabase, recipeId);

  revalidatePath("/account/recipes");
  if (owned.slug) revalidatePath(`/recipes/${owned.slug}`);
}

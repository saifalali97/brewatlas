"use server";

import { revalidatePath } from "next/cache";
import { getDiscoveryResults, getRecommendations, getSimilarRecipes, refreshRecipeFeatureVector, updateTasteProfile } from "@/lib/data/ai";
import { createClient } from "@/lib/supabase/server";
import type { DiscoveryResult, RecipeRecommendation, SimilarRecipeResult } from "@/types/ai";

/**
 * Server Actions for BrewAtlas AI. Thin `"use server"` wrappers around
 * the repository functions in `lib/data/ai.ts` -- the actual
 * recommendation/similarity/discovery logic lives there and in
 * `lib/ai/*.ts`; these only handle auth, `FormData` parsing, and cache
 * revalidation, matching every other action file in this codebase.
 *
 * Nothing in the UI calls these yet; they're production-ready groundwork
 * for a future "Recommended for you" / "Similar recipes" / "Discover"
 * surface, and are equally callable from a future mobile client via the
 * same repository functions (see `lib/data/ai.ts`).
 */

function optionalString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export type RecommendationsActionState =
  | { error?: string; success?: string; recommendations?: RecipeRecommendation[] }
  | undefined;

/** Recomputes the caller's AI User Profile and returns their top recipe recommendations. */
export async function getRecommendationsAction(
  _prevState: RecommendationsActionState,
  _formData: FormData,
): Promise<RecommendationsActionState> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return { error: "You must be signed in to get recommendations." };
  }

  const recommendations = await getRecommendations(supabase, authData.user.id, { limit: 10 });
  return { success: "Recommendations generated.", recommendations };
}

export type SimilarRecipesActionState = { error?: string; success?: string; results?: SimilarRecipeResult[] } | undefined;

/** Returns recipes most similar in taste to the given recipe. */
export async function getSimilarRecipesAction(
  _prevState: SimilarRecipesActionState,
  formData: FormData,
): Promise<SimilarRecipesActionState> {
  const supabase = await createClient();
  const recipeId = optionalString(formData, "recipeId");
  if (!recipeId) {
    return { error: "Missing recipe id." };
  }

  const results = await getSimilarRecipes(supabase, recipeId, { limit: 8 });
  return { success: "Similar recipes found.", results };
}

export type DiscoveryActionState = { error?: string; success?: string; query?: string; results?: DiscoveryResult[] } | undefined;

/** Runs a free-text Smart Recipe Discovery query and returns matching recipes. */
export async function runDiscoveryAction(
  _prevState: DiscoveryActionState,
  formData: FormData,
): Promise<DiscoveryActionState> {
  const supabase = await createClient();
  const query = optionalString(formData, "query");
  if (!query) {
    return { error: "Enter what you're looking for." };
  }

  const results = await getDiscoveryResults(supabase, query, { limit: 20 });
  return { success: "Discovery results found.", query, results };
}

export type TasteProfileActionState = { error?: string; success?: string } | undefined;

/** Forces an immediate recompute of the caller's AI User Profile (it also recomputes automatically after brews/favorites/reviews). */
export async function refreshTasteProfileAction(
  _prevState: TasteProfileActionState,
  _formData: FormData,
): Promise<TasteProfileActionState> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return { error: "You must be signed in to refresh your taste profile." };
  }

  await updateTasteProfile(supabase, authData.user.id);
  revalidatePath("/dashboard");
  return { success: "Taste profile refreshed." };
}

/** Recalculates and stores the AI feature vector for a recipe the caller owns. Safe to call repeatedly. */
export async function recalculateRecipeFeatureVectorAction(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return;

  const recipeId = optionalString(formData, "recipeId");
  if (!recipeId) return;

  const { data: recipe } = await supabase.from("recipes").select("author_id, slug").eq("id", recipeId).maybeSingle();
  if (!recipe || recipe.author_id !== authData.user.id) return;

  await refreshRecipeFeatureVector(supabase, recipeId);

  revalidatePath("/dashboard/recipes");
  if (recipe.slug) revalidatePath(`/recipes/${recipe.slug}`);
}

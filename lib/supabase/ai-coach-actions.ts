"use server";

import { revalidatePath } from "next/cache";
import { analyzeRecipe, getCoachAnalysisHistory } from "@/lib/data/ai-coach";
import { getMembershipSummary } from "@/lib/data/membership";
import { canUseAI } from "@/lib/membership/access";
import { createClient } from "@/lib/supabase/server";
import type { AiCoachAnalysisRow, CoachAnalysisResult } from "@/types/coach";

/**
 * Server Actions for the AI Coach. Thin `"use server"` wrappers around
 * `lib/data/ai-coach.ts` -- the actual analysis logic lives there and in
 * `lib/ai/coach-engine.ts`; these only handle auth, the Premium
 * `ai_coach` feature gate (see `lib/membership/access.ts#canUseAI`),
 * `FormData` parsing, and cache revalidation, matching every other
 * action file in this codebase (see `lib/supabase/ai-actions.ts`).
 *
 * Nothing in the UI calls these yet; they're production-ready
 * groundwork for a future "Coach this recipe" surface on the recipe
 * detail/edit pages.
 */

function requiredString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export type CoachAnalysisActionState =
  | { error?: string; success?: string; analysis?: CoachAnalysisResult }
  | undefined;

/** Runs the AI Coach on a recipe for the signed-in user and stores the result in their analysis history. Requires the `ai_coach` Premium feature. */
export async function analyzeRecipeAction(
  _prevState: CoachAnalysisActionState,
  formData: FormData,
): Promise<CoachAnalysisActionState> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return { error: "You must be signed in to use the AI Coach." };
  }

  const summary = await getMembershipSummary(supabase, authData.user.id);
  if (!canUseAI(summary)) {
    return { error: "The AI Coach is a Premium feature. Upgrade your membership to use it." };
  }

  const recipeId = requiredString(formData, "recipeId");
  if (!recipeId) {
    return { error: "Missing recipe id." };
  }

  const outcome = await analyzeRecipe(supabase, recipeId, authData.user.id);
  if ("error" in outcome) {
    return { error: outcome.error };
  }

  revalidatePath("/dashboard");
  return { success: "Analysis complete.", analysis: outcome.result };
}

export type CoachHistoryActionState =
  | { error?: string; success?: string; history?: AiCoachAnalysisRow[] }
  | undefined;

/** Returns the signed-in user's past AI Coach analyses for a recipe, most recent first. */
export async function getCoachHistoryAction(
  _prevState: CoachHistoryActionState,
  formData: FormData,
): Promise<CoachHistoryActionState> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    return { error: "You must be signed in to view AI Coach history." };
  }

  const recipeId = requiredString(formData, "recipeId");
  if (!recipeId) {
    return { error: "Missing recipe id." };
  }

  const history = await getCoachAnalysisHistory(supabase, recipeId, authData.user.id);
  return { success: "History loaded.", history };
}

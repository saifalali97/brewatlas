import type { SupabaseClient } from "@supabase/supabase-js";

/** Records a recipe page view (deduped server-side for authenticated viewers). */
export async function recordRecipeView(
  supabase: SupabaseClient,
  recipeId: string,
  viewerId?: string | null,
): Promise<void> {
  const { error } = await supabase.rpc("record_recipe_view", {
    p_recipe_id: recipeId,
    p_viewer_id: viewerId ?? null,
  });

  if (error) {
    console.error("recordRecipeView failed", error);
  }
}

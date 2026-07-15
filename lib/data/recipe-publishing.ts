import type { SupabaseClient } from "@supabase/supabase-js";

/** Promotes scheduled recipes whose publish time has passed. Safe to call on every public read. */
export async function processScheduledRecipePublishes(supabase: SupabaseClient): Promise<void> {
  const { error } = await supabase.rpc("process_scheduled_recipe_publishes");
  if (error) {
    console.error("processScheduledRecipePublishes failed", error);
  }
}

export async function getPublishedRecipeSlugs(
  supabase: SupabaseClient,
): Promise<Array<{ slug: string; updatedAt: string }>> {
  await processScheduledRecipePublishes(supabase);

  const { data, error } = await supabase
    .from("recipes")
    .select("slug, updated_at")
    .eq("status", "published")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("getPublishedRecipeSlugs failed", error);
    return [];
  }

  return (data ?? []).map((row) => ({
    slug: row.slug as string,
    updatedAt: row.updated_at as string,
  }));
}

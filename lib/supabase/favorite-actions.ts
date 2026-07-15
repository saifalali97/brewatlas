"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { updateTasteProfile } from "@/lib/data/ai";
import { createNotification, recordActivity, refreshCommunityStats } from "@/lib/data/community";
import { createClient } from "@/lib/supabase/server";

function readCurrentPath(formData: FormData): string {
  const value = formData.get("currentPath");
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/recipes";
}

function readRecipeId(formData: FormData): string | null {
  const value = formData.get("recipeId");
  return typeof value === "string" && value.length > 0 ? value : null;
}

async function getRecipeAuthor(
  supabase: Awaited<ReturnType<typeof createClient>>,
  recipeId: string,
): Promise<string | null> {
  const { data } = await supabase.from("recipes").select("author_id").eq("id", recipeId).maybeSingle();
  return (data?.author_id as string | null) ?? null;
}

export async function addFavoriteAction(formData: FormData): Promise<void> {
  const path = readCurrentPath(formData);
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect(`/login?redirectTo=${encodeURIComponent(path)}`);
  }

  const recipeId = readRecipeId(formData);
  if (!recipeId) return;

  const { data: existingFavorite } = await supabase
    .from("favorites")
    .select("recipe_id")
    .eq("user_id", data.user.id)
    .eq("recipe_id", recipeId)
    .maybeSingle();

  const isNewFavorite = !existingFavorite;

  await supabase
    .from("favorites")
    .upsert({ user_id: data.user.id, recipe_id: recipeId }, { onConflict: "user_id,recipe_id", ignoreDuplicates: true });

  const authorId = isNewFavorite ? await getRecipeAuthor(supabase, recipeId) : null;
  if (authorId) {
    await createNotification(supabase, {
      recipientId: authorId,
      notificationType: "recipe_favorited",
      actorId: data.user.id,
      recipeId,
      message: "Someone favorited your recipe.",
    });
  }

  await recordActivity(supabase, {
    userId: data.user.id,
    activityType: "saved_recipe",
    recipeId,
  });

  // Community system: "saving" a recipe (favorites) feeds recipesSaved in
  // user_community_stats and the Brew Score.
  await refreshCommunityStats(supabase, data.user.id);
  // BrewAtlas AI: a saved recipe is a strong taste signal.
  await updateTasteProfile(supabase, data.user.id);

  revalidatePath(path);
  revalidatePath("/account");
  revalidatePath("/account/favorites");
  revalidatePath(`/users/${data.user.id}`);
}

export async function removeFavoriteAction(formData: FormData): Promise<void> {
  const path = readCurrentPath(formData);
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect(`/login?redirectTo=${encodeURIComponent(path)}`);
  }

  const recipeId = readRecipeId(formData);
  if (!recipeId) return;

  await supabase.from("favorites").delete().eq("user_id", data.user.id).eq("recipe_id", recipeId);

  await refreshCommunityStats(supabase, data.user.id);
  await updateTasteProfile(supabase, data.user.id);

  revalidatePath(path);
  revalidatePath("/account");
  revalidatePath("/account/favorites");
  revalidatePath(`/users/${data.user.id}`);
}

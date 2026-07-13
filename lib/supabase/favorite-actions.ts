"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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

export async function addFavoriteAction(formData: FormData): Promise<void> {
  const path = readCurrentPath(formData);
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect(`/login?redirectTo=${encodeURIComponent(path)}`);
  }

  const recipeId = readRecipeId(formData);
  if (!recipeId) return;

  await supabase
    .from("favorites")
    .upsert({ user_id: data.user.id, recipe_id: recipeId }, { onConflict: "user_id,recipe_id", ignoreDuplicates: true });

  revalidatePath(path);
  revalidatePath("/dashboard");
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

  revalidatePath(path);
  revalidatePath("/dashboard");
}

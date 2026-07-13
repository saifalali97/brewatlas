"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { generateUniqueRecipeSlug } from "@/lib/data/db-recipes";
import { createClient } from "@/lib/supabase/server";

export type RecipeActionState = { error?: string; success?: string } | undefined;

type RecipeFormValues = {
  title: string;
  brewingMethodId: string;
  deviceId: string | null;
  originId: string | null;
  roasterId: string | null;
  coffeeDose: number | null;
  water: number | null;
  ice: number | null;
  grindSize: string | null;
  temperature: number | null;
  bloom: string | null;
  brewTime: string | null;
  tastingNotes: string | null;
  instructions: string | null;
  imageUrl: string | null;
  featured: boolean;
  premiumOnly: boolean;
  published: boolean;
};

function optionalString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function optionalNumber(formData: FormData, key: string): number | null {
  const value = optionalString(formData, key);
  if (value === null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Shared required-field validation for both create and edit recipe forms. */
function parseRecipeForm(formData: FormData): { values: RecipeFormValues } | { error: string } {
  const title = optionalString(formData, "title");
  if (!title) {
    return { error: "Recipe title is required." };
  }

  const brewingMethodId = optionalString(formData, "brewingMethodId");
  if (!brewingMethodId) {
    return { error: "Choose a brewing method." };
  }

  return {
    values: {
      title,
      brewingMethodId,
      deviceId: optionalString(formData, "deviceId"),
      originId: optionalString(formData, "originId"),
      roasterId: optionalString(formData, "roasterId"),
      coffeeDose: optionalNumber(formData, "coffeeDose"),
      water: optionalNumber(formData, "water"),
      ice: optionalNumber(formData, "ice"),
      grindSize: optionalString(formData, "grindSize"),
      temperature: optionalNumber(formData, "temperature"),
      bloom: optionalString(formData, "bloom"),
      brewTime: optionalString(formData, "brewTime"),
      tastingNotes: optionalString(formData, "tastingNotes"),
      instructions: optionalString(formData, "instructions"),
      imageUrl: optionalString(formData, "imageUrl"),
      featured: formData.get("featured") === "on",
      premiumOnly: formData.get("premiumOnly") === "on",
      published: formData.get("published") === "on",
    },
  };
}

export async function createRecipeAction(
  _prevState: RecipeActionState,
  formData: FormData,
): Promise<RecipeActionState> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    redirect("/login?redirectTo=/dashboard/recipes/new");
  }

  const parsed = parseRecipeForm(formData);
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const slug = await generateUniqueRecipeSlug(supabase, parsed.values.title);

  const { error } = await supabase.from("recipes").insert({
    title: parsed.values.title,
    slug,
    brewing_method_id: parsed.values.brewingMethodId,
    device_id: parsed.values.deviceId,
    origin_id: parsed.values.originId,
    roaster_id: parsed.values.roasterId,
    author_id: authData.user.id,
    coffee_dose: parsed.values.coffeeDose,
    water: parsed.values.water,
    ice: parsed.values.ice,
    grind_size: parsed.values.grindSize,
    temperature: parsed.values.temperature,
    bloom: parsed.values.bloom,
    brew_time: parsed.values.brewTime,
    tasting_notes: parsed.values.tastingNotes,
    instructions: parsed.values.instructions,
    image_url: parsed.values.imageUrl,
    featured: parsed.values.featured,
    premium_only: parsed.values.premiumOnly,
    published: parsed.values.published,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/recipes");
  revalidatePath("/dashboard/recipes");
  revalidatePath("/dashboard");
  redirect("/dashboard/recipes");
}

export async function updateRecipeAction(
  _prevState: RecipeActionState,
  formData: FormData,
): Promise<RecipeActionState> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    redirect("/login");
  }

  const recipeId = optionalString(formData, "recipeId");
  if (!recipeId) {
    return { error: "Missing recipe id." };
  }

  const { data: existing, error: fetchError } = await supabase
    .from("recipes")
    .select("id, title, author_id")
    .eq("id", recipeId)
    .maybeSingle();

  if (fetchError || !existing) {
    return { error: "Recipe not found." };
  }

  // RLS already prevents the update below from touching another author's
  // recipe, but checking here first gives a clear, friendly error message
  // instead of a silent no-op.
  if (existing.author_id !== authData.user.id) {
    return { error: "You can only edit your own recipes." };
  }

  const parsed = parseRecipeForm(formData);
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const slug =
    parsed.values.title === existing.title
      ? undefined
      : await generateUniqueRecipeSlug(supabase, parsed.values.title, recipeId);

  const { error } = await supabase
    .from("recipes")
    .update({
      title: parsed.values.title,
      ...(slug ? { slug } : {}),
      brewing_method_id: parsed.values.brewingMethodId,
      device_id: parsed.values.deviceId,
      origin_id: parsed.values.originId,
      roaster_id: parsed.values.roasterId,
      coffee_dose: parsed.values.coffeeDose,
      water: parsed.values.water,
      ice: parsed.values.ice,
      grind_size: parsed.values.grindSize,
      temperature: parsed.values.temperature,
      bloom: parsed.values.bloom,
      brew_time: parsed.values.brewTime,
      tasting_notes: parsed.values.tastingNotes,
      instructions: parsed.values.instructions,
      image_url: parsed.values.imageUrl,
      featured: parsed.values.featured,
      premium_only: parsed.values.premiumOnly,
      published: parsed.values.published,
    })
    .eq("id", recipeId)
    .eq("author_id", authData.user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/recipes");
  revalidatePath("/dashboard/recipes");
  revalidatePath("/dashboard");
  redirect("/dashboard/recipes");
}

export async function deleteRecipeAction(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    redirect("/login");
  }

  const recipeId = optionalString(formData, "recipeId");
  if (!recipeId) {
    redirect("/dashboard/recipes");
  }

  // `.eq("author_id", ...)` is defense-in-depth; RLS's "Authors can manage
  // their own recipes" policy already blocks deleting anyone else's recipe.
  await supabase.from("recipes").delete().eq("id", recipeId).eq("author_id", authData.user.id);

  revalidatePath("/recipes");
  revalidatePath("/dashboard/recipes");
  revalidatePath("/dashboard");
  redirect("/dashboard/recipes");
}

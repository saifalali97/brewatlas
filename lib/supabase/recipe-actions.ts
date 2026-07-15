"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { generateUniqueRecipeSlug } from "@/lib/data/db-recipes";
import { evaluateAndAwardBadges, recordActivity, refreshCommunityStats } from "@/lib/data/community";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import {
  appendGalleryImages,
  optionalString,
  parsePours,
  parseRecipeForm,
  parseTagIds,
  recipeUpdatePayload,
  replacePours,
  replaceTags,
  resolveCoffeeId,
  uploadRecipeImage,
  type RecipeActionState,
} from "@/lib/recipes/recipe-persistence";
import { coverImageColumns, parseCoverImageMetadata, parseGalleryImageMetadata } from "@/lib/media/image-metadata";
import { createClient } from "@/lib/supabase/server";

export type { RecipeActionState };

export async function createRecipeAction(
  _prevState: RecipeActionState,
  formData: FormData,
): Promise<RecipeActionState> {
  const supabase = await createClient();
  const dictionary = await getDictionary(await getLocale());
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    redirect("/login?redirectTo=/account/recipes/new");
  }

  const parsed = parseRecipeForm(formData, dictionary);
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const coffeeId = await resolveCoffeeId(supabase, authData.user.id, formData);
  const slug = await generateUniqueRecipeSlug(supabase, parsed.values.title);

  const coverMeta = parseCoverImageMetadata(formData);
  const coverImageFile = formData.get("coverImage");
  let coverImageUrl: string | null = null;
  let coverColumns = coverImageColumns({});
  if (coverImageFile instanceof File && coverImageFile.size > 0) {
    const uploaded = await uploadRecipeImage(supabase, authData.user.id, coverImageFile, dictionary, coverMeta);
    if ("error" in uploaded) return { error: uploaded.error };
    coverImageUrl = uploaded.url;
    coverColumns = coverImageColumns({
      width: uploaded.width,
      height: uploaded.height,
      blurDataUrl: uploaded.blurDataUrl,
    });
  }

  const { data: inserted, error } = await supabase
    .from("recipes")
    .insert({
      ...recipeUpdatePayload(parsed.values, coffeeId),
      slug,
      author_id: authData.user.id,
      cover_image_url: coverImageUrl,
      ...coverColumns,
    })
    .select("id")
    .single();

  if (error || !inserted) {
    return { error: error?.message ?? dictionary.recipeActionMessages.failedToCreateRecipe };
  }

  const recipeId = inserted.id as string;

  await replacePours(supabase, recipeId, parsePours(formData));
  await replaceTags(supabase, recipeId, parseTagIds(formData));
  const galleryError = await appendGalleryImages(
    supabase,
    authData.user.id,
    recipeId,
    formData,
    0,
    dictionary,
    parseGalleryImageMetadata(formData),
  );
  if (galleryError) return { error: galleryError };

  if (parsed.values.published) {
    await refreshCommunityStats(supabase, authData.user.id);
    await evaluateAndAwardBadges(supabase, authData.user.id);
    await recordActivity(supabase, {
      userId: authData.user.id,
      activityType: "created_recipe",
      recipeId,
    });
  }

  revalidatePath("/recipes");
  revalidatePath("/account/recipes");
  revalidatePath("/account");
  redirect("/account/recipes");
}

export async function updateRecipeAction(
  _prevState: RecipeActionState,
  formData: FormData,
): Promise<RecipeActionState> {
  const supabase = await createClient();
  const dictionary = await getDictionary(await getLocale());
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    redirect("/login");
  }

  const recipeId = optionalString(formData, "recipeId");
  if (!recipeId) {
    return { error: dictionary.recipeActionMessages.missingRecipeId };
  }

  const { data: existing, error: fetchError } = await supabase
    .from("recipes")
    .select("id, title, author_id, cover_image_url")
    .eq("id", recipeId)
    .maybeSingle();

  if (fetchError || !existing) {
    return { error: dictionary.recipeActionMessages.recipeNotFound };
  }

  if (existing.author_id !== authData.user.id) {
    return { error: dictionary.recipeActionMessages.notYourRecipe };
  }

  const parsed = parseRecipeForm(formData, dictionary);
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const coffeeId = await resolveCoffeeId(supabase, authData.user.id, formData);

  const slug =
    parsed.values.title === existing.title
      ? undefined
      : await generateUniqueRecipeSlug(supabase, parsed.values.title, recipeId);

  let coverImageUrl = existing.cover_image_url as string | null;
  let coverColumns = coverImageColumns({});
  const coverMeta = parseCoverImageMetadata(formData);
  const coverImageFile = formData.get("coverImage");
  if (coverImageFile instanceof File && coverImageFile.size > 0) {
    const uploaded = await uploadRecipeImage(supabase, authData.user.id, coverImageFile, dictionary, coverMeta);
    if ("error" in uploaded) return { error: uploaded.error };
    coverImageUrl = uploaded.url;
    coverColumns = coverImageColumns({
      width: uploaded.width,
      height: uploaded.height,
      blurDataUrl: uploaded.blurDataUrl,
    });
  }

  const { count: existingImageCount } = await supabase
    .from("recipe_images")
    .select("*", { count: "exact", head: true })
    .eq("recipe_id", recipeId);

  const { error } = await supabase
    .from("recipes")
    .update({
      ...recipeUpdatePayload(parsed.values, coffeeId),
      ...(slug ? { slug } : {}),
      cover_image_url: coverImageUrl,
      ...coverColumns,
    })
    .eq("id", recipeId)
    .eq("author_id", authData.user.id);

  if (error) {
    return { error: error.message ?? dictionary.recipeActionMessages.failedToUpdateRecipe };
  }

  await replacePours(supabase, recipeId, parsePours(formData));
  await replaceTags(supabase, recipeId, parseTagIds(formData));
  const galleryError = await appendGalleryImages(
    supabase,
    authData.user.id,
    recipeId,
    formData,
    existingImageCount ?? 0,
    dictionary,
    parseGalleryImageMetadata(formData),
  );
  if (galleryError) return { error: galleryError };

  if (parsed.values.published) {
    await refreshCommunityStats(supabase, authData.user.id);
    await evaluateAndAwardBadges(supabase, authData.user.id);
  }

  revalidatePath("/recipes");
  revalidatePath("/account/recipes");
  revalidatePath("/account");
  redirect("/account/recipes");
}

export async function deleteRecipeAction(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    redirect("/login");
  }

  const recipeId = optionalString(formData, "recipeId");
  if (!recipeId) {
    redirect("/account/recipes");
  }

  await supabase.from("recipes").delete().eq("id", recipeId).eq("author_id", authData.user.id);

  revalidatePath("/recipes");
  revalidatePath("/account/recipes");
  revalidatePath("/account");
  redirect("/account/recipes");
}

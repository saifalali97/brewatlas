"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/auth/require-owner";
import { buildRecipeVersionSnapshot } from "@/lib/data/owner-recipes";
import { evaluateAndAwardBadges, refreshCommunityStats } from "@/lib/data/community";
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
  resolveRecipeSlug,
  saveRecipeVersion,
  uploadRecipeImage,
  type RecipeActionState,
} from "@/lib/recipes/recipe-persistence";

export type OwnerRecipeActionState = RecipeActionState;

const OWNER_PARSE_OPTIONS = { includeSeo: true, includeSlug: true } as const;

function revalidateOwnerRecipePaths(slug?: string) {
  revalidatePath("/dashboard/recipes");
  revalidatePath("/recipes");
  revalidatePath("/account/recipes");
  revalidatePath("/account");
  if (slug) {
    revalidatePath(`/recipes/${slug}`);
  }
}

async function persistOwnerRecipe(
  formData: FormData,
  options: { recipeId?: string; autosave?: boolean },
): Promise<OwnerRecipeActionState> {
  const { supabase, user } = await requireOwner();
  const dictionary = await getDictionary(await getLocale());
  const parsed = parseRecipeForm(formData, dictionary, OWNER_PARSE_OPTIONS);
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const coffeeId = await resolveCoffeeId(supabase, user.id, formData);
  const recipeId = options.recipeId ?? optionalString(formData, "recipeId");

  let existing: { id: string; title: string; cover_image_url: string | null; slug: string; author_id: string | null } | null =
    null;

  if (recipeId) {
    const { data, error } = await supabase
      .from("recipes")
      .select("id, title, cover_image_url, slug, author_id")
      .eq("id", recipeId)
      .maybeSingle();

    if (error || !data) {
      return { error: dictionary.recipeActionMessages.recipeNotFound };
    }
    existing = data;
  }

  const slugResult = await resolveRecipeSlug(supabase, parsed.values, {
    existingTitle: existing?.title,
    recipeId: recipeId ?? undefined,
  });

  if ("error" in slugResult) {
    return { error: dictionary.ownerRecipesPage.slugTaken };
  }

  let coverImageUrl = existing?.cover_image_url ?? null;
  const coverImageFile = formData.get("coverImage");
  if (coverImageFile instanceof File && coverImageFile.size > 0) {
    const uploaded = await uploadRecipeImage(supabase, user.id, coverImageFile, dictionary);
    if ("error" in uploaded) return { error: uploaded.error };
    coverImageUrl = uploaded.url;
  }

  const payload = {
    ...recipeUpdatePayload(parsed.values, coffeeId, { includeSeo: true }),
    slug: slugResult.slug,
    cover_image_url: coverImageUrl,
  };

  if (!recipeId) {
    const { data: inserted, error } = await supabase
      .from("recipes")
      .insert({
        ...payload,
        author_id: user.id,
      })
      .select("id, slug")
      .single();

    if (error || !inserted) {
      return { error: error?.message ?? dictionary.recipeActionMessages.failedToCreateRecipe };
    }

    const newId = inserted.id as string;
    await replacePours(supabase, newId, parsePours(formData));
    await replaceTags(supabase, newId, parseTagIds(formData));
    const galleryError = await appendGalleryImages(supabase, user.id, newId, formData, 0, dictionary);
    if (galleryError) return { error: galleryError };

    if (parsed.values.published && inserted.slug) {
      const authorId = user.id;
      await refreshCommunityStats(supabase, authorId);
      await evaluateAndAwardBadges(supabase, authorId);
    }

    revalidateOwnerRecipePaths(inserted.slug as string);

    if (options.autosave) {
      return {
        success: dictionary.ownerRecipesPage.autosaveSuccess,
        savedAt: new Date().toISOString(),
        recipeId: newId,
      };
    }

    redirect("/dashboard/recipes");
  }

  const { count: existingImageCount } = await supabase
    .from("recipe_images")
    .select("*", { count: "exact", head: true })
    .eq("recipe_id", recipeId);

  const snapshot = await buildRecipeVersionSnapshot(supabase, recipeId);

  const { error } = await supabase.from("recipes").update(payload).eq("id", recipeId);

  if (error) {
    return { error: error.message ?? dictionary.recipeActionMessages.failedToUpdateRecipe };
  }

  await replacePours(supabase, recipeId, parsePours(formData));
  await replaceTags(supabase, recipeId, parseTagIds(formData));
  const galleryError = await appendGalleryImages(
    supabase,
    user.id,
    recipeId,
    formData,
    existingImageCount ?? 0,
    dictionary,
  );
  if (galleryError) return { error: galleryError };

  if (!options.autosave) {
    await saveRecipeVersion(supabase, recipeId, user.id, snapshot);
  }

  if (parsed.values.published && existing?.author_id) {
    await refreshCommunityStats(supabase, existing.author_id);
    await evaluateAndAwardBadges(supabase, existing.author_id);
  }

  revalidateOwnerRecipePaths(slugResult.slug);

  if (options.autosave) {
    return {
      success: dictionary.ownerRecipesPage.autosaveSuccess,
      savedAt: new Date().toISOString(),
      recipeId,
    };
  }

  redirect("/dashboard/recipes");
}

export async function createOwnerRecipeAction(
  _prevState: OwnerRecipeActionState,
  formData: FormData,
): Promise<OwnerRecipeActionState> {
  return persistOwnerRecipe(formData, {});
}

export async function updateOwnerRecipeAction(
  _prevState: OwnerRecipeActionState,
  formData: FormData,
): Promise<OwnerRecipeActionState> {
  const recipeId = optionalString(formData, "recipeId");
  if (!recipeId) {
    const dictionary = await getDictionary(await getLocale());
    return { error: dictionary.recipeActionMessages.missingRecipeId };
  }
  return persistOwnerRecipe(formData, { recipeId });
}

export async function autosaveOwnerRecipeAction(
  _prevState: OwnerRecipeActionState,
  formData: FormData,
): Promise<OwnerRecipeActionState> {
  const recipeId = optionalString(formData, "recipeId");
  if (!recipeId) {
    return {};
  }
  return persistOwnerRecipe(formData, { recipeId, autosave: true });
}

export async function deleteOwnerRecipeAction(formData: FormData): Promise<void> {
  const { supabase } = await requireOwner();
  const recipeId = optionalString(formData, "recipeId");
  if (!recipeId) {
    redirect("/dashboard/recipes");
  }

  const { data } = await supabase.from("recipes").select("slug").eq("id", recipeId).maybeSingle();
  await supabase.from("recipes").delete().eq("id", recipeId);
  revalidateOwnerRecipePaths(data?.slug as string | undefined);
  redirect("/dashboard/recipes");
}

export async function toggleOwnerRecipePublishedAction(formData: FormData): Promise<void> {
  const { supabase } = await requireOwner();
  const recipeId = optionalString(formData, "recipeId");
  const nextPublished = formData.get("published") === "true";

  if (!recipeId) {
    redirect("/dashboard/recipes");
  }

  const { data: existing } = await supabase
    .from("recipes")
    .select("slug, author_id")
    .eq("id", recipeId)
    .maybeSingle();

  await supabase.from("recipes").update({ published: nextPublished }).eq("id", recipeId);

  if (nextPublished && existing?.author_id) {
    await refreshCommunityStats(supabase, existing.author_id);
    await evaluateAndAwardBadges(supabase, existing.author_id);
  }

  revalidateOwnerRecipePaths(existing?.slug as string | undefined);
  redirect("/dashboard/recipes");
}

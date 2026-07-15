"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireOwner } from "@/lib/auth/require-owner";
import { buildRecipeVersionSnapshot } from "@/lib/data/owner-recipes";
import { buildVersionMetadata } from "@/lib/data/recipe-versions";
import { evaluateAndAwardBadges, refreshCommunityStats } from "@/lib/data/community";
import { getMediaAssetById } from "@/lib/data/media-library";
import { appendGalleryMediaAssets, parseMediaAssetIds, syncRecipeMediaUsages } from "@/lib/media/recipe-media";
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
import { parsePublishIntent, resolveStatusFromIntent } from "@/lib/recipes/recipe-status";
import type { RecipePublishStatus } from "@/types/recipe-publishing";

export type OwnerRecipeActionState = RecipeActionState;

const OWNER_PARSE_OPTIONS = { includeSeo: true, includeSlug: true } as const;

function revalidateOwnerRecipePaths(slug?: string, recipeId?: string) {
  revalidatePath("/dashboard/recipes");
  revalidatePath("/recipes");
  revalidatePath("/account/recipes");
  revalidatePath("/account");
  if (recipeId) {
    revalidatePath(`/dashboard/recipes/${recipeId}/edit`);
    revalidatePath(`/dashboard/recipes/${recipeId}/versions`);
  }
  if (slug) {
    revalidatePath(`/recipes/${slug}`);
  }
}

function parseScheduledPublishAt(formData: FormData): string | null {
  const raw = optionalString(formData, "scheduledPublishAt");
  if (!raw) return null;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

async function captureRecipeVersion(
  supabase: Awaited<ReturnType<typeof requireOwner>>["supabase"],
  recipeId: string,
  editorId: string,
  snapshot: Record<string, unknown>,
  meta: {
    title: string;
    description: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
    canonicalUrl: string | null;
    authorId: string | null;
    status: RecipePublishStatus;
    scheduledPublishAt: string | null;
    metadata: Record<string, unknown>;
  },
) {
  await saveRecipeVersion(supabase, recipeId, editorId, {
    title: meta.title,
    description: meta.description,
    seoTitle: meta.seoTitle,
    seoDescription: meta.seoDescription,
    canonicalUrl: meta.canonicalUrl,
    authorId: meta.authorId,
    status: meta.status,
    scheduledPublishAt: meta.scheduledPublishAt,
    metadata: meta.metadata,
    snapshot,
  });
}

async function persistOwnerRecipe(
  formData: FormData,
  options: { recipeId?: string; autosave?: boolean; redirectTo?: string },
): Promise<OwnerRecipeActionState> {
  const { supabase, user } = await requireOwner();
  const dictionary = await getDictionary(await getLocale());
  const parsed = parseRecipeForm(formData, dictionary, OWNER_PARSE_OPTIONS);
  if ("error" in parsed) {
    return { error: parsed.error };
  }

  const publishIntent = parsePublishIntent(formData.get("publishIntent"));
  const scheduledPublishAt = parseScheduledPublishAt(formData);
  if (publishIntent === "schedule" && !scheduledPublishAt) {
    return { error: dictionary.ownerRecipePublishing.scheduleRequired };
  }
  if (publishIntent === "schedule" && scheduledPublishAt && new Date(scheduledPublishAt).getTime() <= Date.now()) {
    return { error: dictionary.ownerRecipePublishing.scheduleMustBeFuture };
  }

  const coffeeId = await resolveCoffeeId(supabase, user.id, formData);
  const recipeId = options.recipeId ?? optionalString(formData, "recipeId");

  let existing: {
    id: string;
    title: string;
    cover_image_url: string | null;
    slug: string;
    author_id: string | null;
    status: RecipePublishStatus;
  } | null = null;

  if (recipeId) {
    const { data, error } = await supabase
      .from("recipes")
      .select("id, title, cover_image_url, slug, author_id, status")
      .eq("id", recipeId)
      .maybeSingle();

    if (error || !data) {
      return { error: dictionary.recipeActionMessages.recipeNotFound };
    }
    existing = {
      id: data.id as string,
      title: data.title as string,
      cover_image_url: data.cover_image_url as string | null,
      slug: data.slug as string,
      author_id: data.author_id as string | null,
      status: (data.status as RecipePublishStatus) ?? "draft",
    };
  }

  const { status, scheduledPublishAt: resolvedSchedule } = resolveStatusFromIntent(
    publishIntent,
    existing?.status,
    scheduledPublishAt,
  );

  const slugResult = await resolveRecipeSlug(supabase, parsed.values, {
    existingTitle: existing?.title,
    recipeId: recipeId ?? undefined,
  });

  if ("error" in slugResult) {
    return { error: dictionary.ownerRecipesPage.slugTaken };
  }

  let coverImageUrl = existing?.cover_image_url ?? null;
  let coverMediaAssetId = optionalString(formData, "coverMediaAssetId");
  const coverImageFromLibrary = optionalString(formData, "coverImageFromLibrary");
  if (coverImageFromLibrary) {
    coverImageUrl = coverImageFromLibrary;
  } else if (coverMediaAssetId) {
    const coverAsset = await getMediaAssetById(supabase, coverMediaAssetId);
    if (coverAsset) coverImageUrl = coverAsset.publicUrl;
  }

  const coverImageFile = formData.get("coverImage");
  if (coverImageFile instanceof File && coverImageFile.size > 0) {
    const uploaded = await uploadRecipeImage(supabase, user.id, coverImageFile, dictionary);
    if ("error" in uploaded) return { error: uploaded.error };
    coverImageUrl = uploaded.url;
    coverMediaAssetId = null;
  }

  const payload = {
    ...recipeUpdatePayload(parsed.values, coffeeId, {
      includeSeo: true,
      status,
      scheduledPublishAt: resolvedSchedule,
    }),
    slug: slugResult.slug,
    cover_image_url: coverImageUrl,
    cover_media_asset_id: coverMediaAssetId,
    published: status === "published",
  };

  const pours = parsePours(formData);
  const tagIds = parseTagIds(formData);
  const versionMetadata = buildVersionMetadata(
    { ...payload, publishIntent },
    pours,
    tagIds,
  );

  if (!recipeId) {
    const { data: inserted, error } = await supabase
      .from("recipes")
      .insert({
        ...payload,
        author_id: user.id,
      })
      .select("id, slug, author_id")
      .single();

    if (error || !inserted) {
      return { error: error?.message ?? dictionary.recipeActionMessages.failedToCreateRecipe };
    }

    const newId = inserted.id as string;
    await replacePours(supabase, newId, pours);
    await replaceTags(supabase, newId, tagIds);
    const galleryError = await appendGalleryImages(supabase, user.id, newId, formData, 0, dictionary);
    if (galleryError) return { error: galleryError };
    const galleryMediaAssetIds = parseMediaAssetIds(formData, "galleryMediaAssetIds");
    const { count: galleryCountAfterFiles } = await supabase
      .from("recipe_images")
      .select("*", { count: "exact", head: true })
      .eq("recipe_id", newId);
    await appendGalleryMediaAssets(supabase, newId, galleryMediaAssetIds, galleryCountAfterFiles ?? 0);
    await syncRecipeMediaUsages(supabase, newId, coverMediaAssetId, galleryMediaAssetIds);

    const snapshot = await buildRecipeVersionSnapshot(supabase, newId);
    await captureRecipeVersion(supabase, newId, user.id, snapshot, {
      title: parsed.values.title,
      description: parsed.values.description,
      seoTitle: parsed.values.seoTitle,
      seoDescription: parsed.values.seoDescription,
      canonicalUrl: parsed.values.canonicalUrl,
      authorId: inserted.author_id as string,
      status,
      scheduledPublishAt: resolvedSchedule,
      metadata: versionMetadata,
    });

    if (status === "published") {
      await refreshCommunityStats(supabase, user.id);
      await evaluateAndAwardBadges(supabase, user.id);
    }

    revalidateOwnerRecipePaths(inserted.slug as string, newId);

    if (options.autosave) {
      return {
        success: dictionary.ownerRecipesPage.autosaveSuccess,
        savedAt: new Date().toISOString(),
        recipeId: newId,
      };
    }

    redirect(options.redirectTo ?? "/dashboard/recipes");
  }

  const snapshot = await buildRecipeVersionSnapshot(supabase, recipeId);

  const { count: existingImageCount } = await supabase
    .from("recipe_images")
    .select("*", { count: "exact", head: true })
    .eq("recipe_id", recipeId);

  const { error } = await supabase.from("recipes").update(payload).eq("id", recipeId);

  if (error) {
    return { error: error.message ?? dictionary.recipeActionMessages.failedToUpdateRecipe };
  }

  await replacePours(supabase, recipeId, pours);
  await replaceTags(supabase, recipeId, tagIds);
  const galleryError = await appendGalleryImages(
    supabase,
    user.id,
    recipeId,
    formData,
    existingImageCount ?? 0,
    dictionary,
  );
  if (galleryError) return { error: galleryError };
  const galleryMediaAssetIds = parseMediaAssetIds(formData, "galleryMediaAssetIds");
  const { count: galleryCountAfterFiles } = await supabase
    .from("recipe_images")
    .select("*", { count: "exact", head: true })
    .eq("recipe_id", recipeId);
  await appendGalleryMediaAssets(supabase, recipeId, galleryMediaAssetIds, galleryCountAfterFiles ?? 0);
  await syncRecipeMediaUsages(supabase, recipeId, coverMediaAssetId, galleryMediaAssetIds);

  await captureRecipeVersion(supabase, recipeId, user.id, snapshot, {
    title: parsed.values.title,
    description: parsed.values.description,
    seoTitle: parsed.values.seoTitle,
    seoDescription: parsed.values.seoDescription,
    canonicalUrl: parsed.values.canonicalUrl,
    authorId: existing?.author_id ?? null,
    status,
    scheduledPublishAt: resolvedSchedule,
    metadata: versionMetadata,
  });

  if (status === "published" && existing?.author_id) {
    await refreshCommunityStats(supabase, existing.author_id);
    await evaluateAndAwardBadges(supabase, existing.author_id);
  }

  revalidateOwnerRecipePaths(slugResult.slug, recipeId);

  if (options.autosave) {
    return {
      success: dictionary.ownerRecipesPage.autosaveSuccess,
      savedAt: new Date().toISOString(),
      recipeId,
    };
  }

  redirect(options.redirectTo ?? "/dashboard/recipes");
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
  formData.set("publishIntent", "draft");
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
  revalidateOwnerRecipePaths(data?.slug as string | undefined, recipeId);
  redirect("/dashboard/recipes");
}

export async function quickOwnerRecipeWorkflowAction(formData: FormData): Promise<void> {
  const { supabase, user } = await requireOwner();
  const recipeId = optionalString(formData, "recipeId");
  const intent = parsePublishIntent(formData.get("publishIntent"));

  if (!recipeId) {
    redirect("/dashboard/recipes");
  }

  const { data: existing, error } = await supabase
    .from("recipes")
    .select("id, title, slug, author_id, status, description, seo_title, seo_description, canonical_url, scheduled_publish_at")
    .eq("id", recipeId)
    .maybeSingle();

  if (error || !existing) {
    redirect("/dashboard/recipes");
  }

  const snapshot = await buildRecipeVersionSnapshot(supabase, recipeId);
  const { status, scheduledPublishAt } = resolveStatusFromIntent(
    intent,
    existing.status as RecipePublishStatus,
    existing.scheduled_publish_at as string | null,
  );

  const { error: updateError } = await supabase
    .from("recipes")
    .update({
      status,
      scheduled_publish_at: scheduledPublishAt,
      published: status === "published",
      archived_at: status === "archived" ? new Date().toISOString() : null,
    })
    .eq("id", recipeId);

  if (updateError) {
    redirect("/dashboard/recipes");
  }

  await captureRecipeVersion(supabase, recipeId, user.id, snapshot, {
    title: existing.title as string,
    description: existing.description as string | null,
    seoTitle: existing.seo_title as string | null,
    seoDescription: existing.seo_description as string | null,
    canonicalUrl: existing.canonical_url as string | null,
    authorId: existing.author_id as string | null,
    status,
    scheduledPublishAt,
    metadata: { workflowIntent: intent },
  });

  if (status === "published" && existing.author_id) {
    await refreshCommunityStats(supabase, existing.author_id as string);
    await evaluateAndAwardBadges(supabase, existing.author_id as string);
  }

  revalidateOwnerRecipePaths(existing.slug as string, recipeId);
  redirect("/dashboard/recipes");
}

export async function restoreOwnerRecipeVersionAction(formData: FormData): Promise<void> {
  const { supabase, user } = await requireOwner();
  const dictionary = await getDictionary(await getLocale());
  const recipeId = optionalString(formData, "recipeId");
  const versionId = optionalString(formData, "versionId");

  if (!recipeId || !versionId) {
    redirect("/dashboard/recipes");
  }

  const { data: version, error } = await supabase
    .from("recipe_versions")
    .select("id, snapshot, title, description, seo_title, seo_description, canonical_url, author_id, status, scheduled_publish_at, metadata")
    .eq("recipe_id", recipeId)
    .eq("id", versionId)
    .maybeSingle();

  if (error || !version) {
    redirect(`/dashboard/recipes/${recipeId}/versions`);
  }

  const snapshot = version.snapshot as { recipe?: Record<string, unknown> };
  const recipeData = snapshot.recipe;
  if (!recipeData) {
    redirect(`/dashboard/recipes/${recipeId}/versions`);
  }

  const preRestoreSnapshot = await buildRecipeVersionSnapshot(supabase, recipeId);

  const restorePayload = { ...recipeData };
  delete restorePayload.id;
  delete restorePayload.created_at;
  delete restorePayload.updated_at;
  restorePayload.status = "draft";
  restorePayload.published = false;
  restorePayload.scheduled_publish_at = null;
  restorePayload.archived_at = null;

  const { error: updateError } = await supabase.from("recipes").update(restorePayload).eq("id", recipeId);
  if (updateError) {
    redirect(`/dashboard/recipes/${recipeId}/versions`);
  }

  const metadata = (version.metadata as Record<string, unknown> | null) ?? {};
  const pours = Array.isArray(metadata.pours) ? metadata.pours : [];
  const tagIds = Array.isArray(metadata.tagIds) ? (metadata.tagIds as string[]) : [];

  if (pours.length > 0) {
    await replacePours(
      supabase,
      recipeId,
      pours.map((pour, index) => {
        const row = pour as Record<string, unknown>;
        return {
          pourNumber: (row.pour_number as number) ?? index + 1,
          waterAmount: (row.water_amount as number) ?? null,
          timeLabel: (row.time_label as string) ?? null,
          notes: (row.notes as string) ?? null,
        };
      }),
    );
  }

  if (tagIds.length > 0) {
    await replaceTags(supabase, recipeId, tagIds);
  }

  await captureRecipeVersion(supabase, recipeId, user.id, preRestoreSnapshot, {
    title: (version.title as string) ?? dictionary.ownerRecipePublishing.restoredVersionTitle,
    description: version.description as string | null,
    seoTitle: version.seo_title as string | null,
    seoDescription: version.seo_description as string | null,
    canonicalUrl: version.canonical_url as string | null,
    authorId: version.author_id as string | null,
    status: "draft",
    scheduledPublishAt: null,
    metadata: { restoredFromVersionId: versionId, ...(metadata ?? {}) },
  });

  revalidateOwnerRecipePaths(recipeData.slug as string | undefined, recipeId);
  redirect(`/dashboard/recipes/${recipeId}/edit`);
}

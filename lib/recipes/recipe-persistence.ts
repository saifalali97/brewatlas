import type { SupabaseClient } from "@supabase/supabase-js";
import type { RecipePublishStatus } from "@/types/recipe-publishing";
import { createCoffee, generateUniqueRecipeSlug } from "@/lib/data/db-recipes";
import { getAllRecipeSlugs } from "@/lib/data/recipes";
import { translate } from "@/lib/i18n/format";
import type { Dictionary } from "@/lib/i18n/types";
import { slugify } from "@/lib/utils/slugify";

import { ALLOWED_RECIPE_IMAGE_TYPES } from "@/lib/media/constants";

export const MAX_RECIPE_IMAGE_BYTES = 6 * 1024 * 1024;

export type UploadedRecipeImage = {
  url: string;
  width: number | null;
  height: number | null;
  blurDataUrl: string | null;
  mimeType: string;
};

export type RecipeActionState = { error?: string; success?: string; savedAt?: string; recipeId?: string } | undefined;

import { optionalNumber, optionalString } from "@/lib/forms/form-fields";

export { optionalNumber, optionalString };

export function optionalRating(formData: FormData, key: string): number | null | "invalid" {
  const value = optionalNumber(formData, key);
  if (value === null) return null;
  if (!Number.isInteger(value) || value < 1 || value > 10) return "invalid";
  return value;
}

export type PourInput = {
  pourNumber: number;
  waterAmount: number | null;
  timeLabel: string | null;
  notes: string | null;
};

export function parsePours(formData: FormData): PourInput[] {
  const count = Number(formData.get("pourCount") ?? 0);
  const pours: PourInput[] = [];
  let pourNumber = 1;

  for (let i = 0; i < count && i < 200; i += 1) {
    const waterAmount = optionalNumber(formData, `pourWater_${i}`);
    const timeLabel = optionalString(formData, `pourTime_${i}`);
    const notes = optionalString(formData, `pourNotes_${i}`);
    if (waterAmount === null && !timeLabel && !notes) continue;
    pours.push({ pourNumber, waterAmount, timeLabel, notes });
    pourNumber += 1;
  }

  return pours;
}

export function parseTagIds(formData: FormData): string[] {
  return formData
    .getAll("tagIds")
    .filter((value): value is string => typeof value === "string" && value.length > 0);
}

export type RecipeFormValues = {
  title: string;
  slug: string | null;
  description: string | null;
  videoUrl: string | null;
  difficulty: string | null;
  estimatedBrewTime: string | null;
  brewingMethodId: string;
  deviceId: string | null;
  grinderId: string | null;
  filterTypeId: string | null;
  waterProfileId: string | null;
  grindSize: string | null;
  waterTemperature: number | null;
  coffeeDose: number | null;
  waterAmount: number | null;
  ratio: string | null;
  iceAmount: number | null;
  bloomAmount: number | null;
  bloomTime: string | null;
  totalBrewTime: string | null;
  beverageWeight: number | null;
  tds: number | null;
  extractionPercentage: number | null;
  tastingNotes: string | null;
  instructions: string | null;
  sweetness: number | null;
  acidity: number | null;
  body: number | null;
  bitterness: number | null;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  featured: boolean;
  premiumOnly: boolean;
  published: boolean;
};

export function parseRecipeForm(
  formData: FormData,
  dictionary: Dictionary,
  options: { includeSeo?: boolean; includeSlug?: boolean } = {},
): { values: RecipeFormValues } | { error: string } {
  const title = optionalString(formData, "title");
  if (!title) {
    return { error: dictionary.recipeActionMessages.titleRequired };
  }

  const brewingMethodId = optionalString(formData, "brewingMethodId");
  if (!brewingMethodId) {
    return { error: dictionary.recipeActionMessages.chooseBrewingMethod };
  }

  const ratingFieldLabels: Record<string, string> = {
    sweetness: dictionary.recipeForm.sweetnessLabel,
    acidity: dictionary.recipeForm.acidityLabel,
    body: dictionary.recipeForm.bodyLabel,
    bitterness: dictionary.recipeForm.bitternessLabel,
  };
  const ratingFields = { sweetness: "sweetness", acidity: "acidity", body: "body", bitterness: "bitterness" } as const;
  const ratings: Record<string, number | null> = {};
  for (const [key, formKey] of Object.entries(ratingFields)) {
    const parsed = optionalRating(formData, formKey);
    if (parsed === "invalid") {
      return {
        error: translate(dictionary, "recipeActionMessages.ratingRangeTemplate", {
          field: ratingFieldLabels[key].replace(/\s*\(1-10\)$/, ""),
        }),
      };
    }
    ratings[key] = parsed;
  }

  let slug: string | null = null;
  if (options.includeSlug) {
    const rawSlug = optionalString(formData, "slug");
    if (rawSlug) {
      const normalized = slugify(rawSlug);
      if (!normalized) {
        return { error: dictionary.ownerRecipesPage.invalidSlug };
      }
      slug = normalized;
    }
  }

  let canonicalUrl: string | null = null;
  if (options.includeSeo) {
    const rawCanonical = optionalString(formData, "canonicalUrl");
    if (rawCanonical) {
      if (!rawCanonical.startsWith("/") && !rawCanonical.startsWith("https://")) {
        return { error: dictionary.ownerRecipesPage.invalidCanonicalUrl };
      }
      canonicalUrl = rawCanonical;
    }
  }

  return {
    values: {
      title,
      slug,
      description: optionalString(formData, "description"),
      videoUrl: optionalString(formData, "videoUrl"),
      difficulty: optionalString(formData, "difficulty"),
      estimatedBrewTime: optionalString(formData, "estimatedBrewTime"),
      brewingMethodId,
      deviceId: optionalString(formData, "deviceId"),
      grinderId: optionalString(formData, "grinderId"),
      filterTypeId: optionalString(formData, "filterTypeId"),
      waterProfileId: optionalString(formData, "waterProfileId"),
      grindSize: optionalString(formData, "grindSize"),
      waterTemperature: optionalNumber(formData, "waterTemperature"),
      coffeeDose: optionalNumber(formData, "coffeeDose"),
      waterAmount: optionalNumber(formData, "waterAmount"),
      ratio: optionalString(formData, "ratio"),
      iceAmount: optionalNumber(formData, "iceAmount"),
      bloomAmount: optionalNumber(formData, "bloomAmount"),
      bloomTime: optionalString(formData, "bloomTime"),
      totalBrewTime: optionalString(formData, "totalBrewTime"),
      beverageWeight: optionalNumber(formData, "beverageWeight"),
      tds: optionalNumber(formData, "tds"),
      extractionPercentage: optionalNumber(formData, "extractionPercentage"),
      tastingNotes: optionalString(formData, "tastingNotes"),
      instructions: optionalString(formData, "instructions"),
      sweetness: ratings.sweetness,
      acidity: ratings.acidity,
      body: ratings.body,
      bitterness: ratings.bitterness,
      seoTitle: options.includeSeo ? optionalString(formData, "seoTitle") : null,
      seoDescription: options.includeSeo ? optionalString(formData, "seoDescription") : null,
      canonicalUrl,
      featured: formData.get("featured") === "on",
      premiumOnly: formData.get("premiumOnly") === "on",
      published: formData.get("published") === "on",
    },
  };
}

export async function resolveCoffeeId(
  supabase: SupabaseClient,
  userId: string,
  formData: FormData,
): Promise<string | null> {
  const newCoffeeName = optionalString(formData, "newCoffeeName");

  if (!newCoffeeName) {
    return optionalString(formData, "coffeeId");
  }

  return createCoffee(supabase, userId, {
    name: newCoffeeName,
    roasterId: optionalString(formData, "roasterId"),
    originId: optionalString(formData, "originId"),
    farm: optionalString(formData, "farm"),
    producer: optionalString(formData, "producer"),
    variety: optionalString(formData, "variety"),
    process: optionalString(formData, "process"),
    altitude: optionalString(formData, "altitude"),
    roastLevel: optionalString(formData, "roastLevel"),
    roastDate: optionalString(formData, "roastDate"),
  });
}

export async function uploadRecipeImage(
  supabase: SupabaseClient,
  userId: string,
  file: File,
  dictionary: Dictionary,
  metadata: { width?: number | null; height?: number | null; blurDataUrl?: string | null } = {},
): Promise<UploadedRecipeImage | { error: string }> {
  if (file.size > MAX_RECIPE_IMAGE_BYTES) {
    return { error: translate(dictionary, "recipeActionMessages.imageTooLargeTemplate", { size: "6MB" }) };
  }
  if (!ALLOWED_RECIPE_IMAGE_TYPES.has(file.type)) {
    return { error: dictionary.recipeActionMessages.imagesMustBeFormat };
  }

  const extension = file.type.split("/")[1] ?? "webp";
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "-").slice(0, 60);
  const path = `${userId}/${Date.now()}-${safeName || `image.${extension}`}`;

  const { error } = await supabase.storage.from("recipe-images").upload(path, file, { contentType: file.type });

  if (error) {
    return { error: translate(dictionary, "recipeActionMessages.uploadImageFailedTemplate", { message: error.message }) };
  }

  const { data } = supabase.storage.from("recipe-images").getPublicUrl(path);
  return {
    url: data.publicUrl,
    width: metadata.width ?? null,
    height: metadata.height ?? null,
    blurDataUrl: metadata.blurDataUrl ?? null,
    mimeType: file.type,
  };
}

export async function replacePours(supabase: SupabaseClient, recipeId: string, pours: PourInput[]): Promise<void> {
  await supabase.from("recipe_pours").delete().eq("recipe_id", recipeId);
  if (pours.length === 0) return;

  await supabase.from("recipe_pours").insert(
    pours.map((pour) => ({
      recipe_id: recipeId,
      pour_number: pour.pourNumber,
      water_amount: pour.waterAmount,
      time_label: pour.timeLabel,
      notes: pour.notes,
    })),
  );
}

export async function replaceTags(supabase: SupabaseClient, recipeId: string, tagIds: string[]): Promise<void> {
  await supabase.from("recipe_tags").delete().eq("recipe_id", recipeId);
  if (tagIds.length === 0) return;

  await supabase.from("recipe_tags").insert(tagIds.map((tagId) => ({ recipe_id: recipeId, tag_id: tagId })));
}

export async function appendGalleryImages(
  supabase: SupabaseClient,
  userId: string,
  recipeId: string,
  formData: FormData,
  startPosition: number,
  dictionary: Dictionary,
  metadataList: Array<{ width?: number | null; height?: number | null; blurDataUrl?: string | null; alt?: string | null }> = [],
): Promise<string | null> {
  const files = formData.getAll("galleryImages").filter((value): value is File => value instanceof File && value.size > 0);
  if (files.length === 0) return null;

  const rows: Array<{
    recipe_id: string;
    url: string;
    position: number;
    width: number | null;
    height: number | null;
    alt_text: string | null;
    blur_data_url: string | null;
  }> = [];
  let position = startPosition;

  for (const [index, file] of files.entries()) {
    const meta = metadataList[index] ?? {};
    const uploaded = await uploadRecipeImage(supabase, userId, file, dictionary, meta);
    if ("error" in uploaded) return uploaded.error;
    rows.push({
      recipe_id: recipeId,
      url: uploaded.url,
      position,
      width: uploaded.width,
      height: uploaded.height,
      alt_text: meta.alt ?? null,
      blur_data_url: uploaded.blurDataUrl,
    });
    position += 1;
  }

  if (rows.length > 0) {
    await supabase.from("recipe_images").insert(rows);
  }

  return null;
}

export function recipeUpdatePayload(
  values: RecipeFormValues,
  coffeeId: string | null,
  options: { includeSeo?: boolean; status?: RecipePublishStatus; scheduledPublishAt?: string | null } = {},
) {
  const payload: Record<string, unknown> = {
    title: values.title,
    description: values.description,
    video_url: values.videoUrl,
    difficulty: values.difficulty,
    estimated_brew_time: values.estimatedBrewTime,
    brewing_method_id: values.brewingMethodId,
    device_id: values.deviceId,
    grinder_id: values.grinderId,
    filter_type_id: values.filterTypeId,
    water_profile_id: values.waterProfileId,
    coffee_id: coffeeId,
    grind_size: values.grindSize,
    water_temperature: values.waterTemperature,
    coffee_dose: values.coffeeDose,
    water_amount: values.waterAmount,
    ratio: values.ratio,
    ice_amount: values.iceAmount,
    bloom_amount: values.bloomAmount,
    bloom_time: values.bloomTime,
    total_brew_time: values.totalBrewTime,
    beverage_weight: values.beverageWeight,
    tds: values.tds,
    extraction_percentage: values.extractionPercentage,
    tasting_notes: values.tastingNotes,
    instructions: values.instructions,
    sweetness: values.sweetness,
    acidity: values.acidity,
    body: values.body,
    bitterness: values.bitterness,
    featured: values.featured,
    premium_only: values.premiumOnly,
    published: values.published,
  };

  if (options.status) {
    payload.status = options.status;
    payload.scheduled_publish_at = options.scheduledPublishAt ?? null;
    if (options.status === "archived") {
      payload.archived_at = new Date().toISOString();
    } else {
      payload.archived_at = null;
    }
  }

  if (options.includeSeo) {
    payload.seo_title = values.seoTitle;
    payload.seo_description = values.seoDescription;
    payload.canonical_url = values.canonicalUrl;
  }

  return payload;
}

export async function resolveRecipeSlug(
  supabase: SupabaseClient,
  values: RecipeFormValues,
  options: { existingTitle?: string; recipeId?: string },
): Promise<{ slug: string } | { error: string }> {
  const staticSlugs = new Set(getAllRecipeSlugs());

  if (values.slug) {
    if (staticSlugs.has(values.slug)) {
      return { error: "slug-conflict" };
    }
    let query = supabase.from("recipes").select("id").eq("slug", values.slug).limit(1);
    if (options.recipeId) query = query.neq("id", options.recipeId);
    const { data } = await query.maybeSingle();
    if (!data) return { slug: values.slug };
  }

  if (options.existingTitle && values.title === options.existingTitle && options.recipeId) {
    const { data } = await supabase.from("recipes").select("slug").eq("id", options.recipeId).maybeSingle();
    if (data?.slug) return { slug: data.slug as string };
  }

  return { slug: await generateUniqueRecipeSlug(supabase, values.title, options.recipeId) };
}

export type RecipeVersionInput = {
  title: string;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  authorId: string | null;
  status: RecipePublishStatus | null;
  scheduledPublishAt: string | null;
  versionLabel?: string | null;
  changeReason?: string | null;
  brewingChanges?: string | null;
  versionAuthorId?: string | null;
  metadata: Record<string, unknown>;
  snapshot: Record<string, unknown>;
};

export async function saveRecipeVersion(
  supabase: SupabaseClient,
  recipeId: string,
  editorId: string,
  input: RecipeVersionInput,
): Promise<void> {
  const { data: latest } = await supabase
    .from("recipe_versions")
    .select("version_number")
    .eq("recipe_id", recipeId)
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  const versionNumber = (latest?.version_number ?? 0) + 1;
  await supabase.from("recipe_versions").insert({
    recipe_id: recipeId,
    version_number: versionNumber,
    version_label: input.versionLabel ?? null,
    change_reason: input.changeReason ?? null,
    brewing_changes: input.brewingChanges ?? null,
    version_author_id: input.versionAuthorId ?? editorId,
    snapshot: input.snapshot,
    editor_id: editorId,
    title: input.title,
    description: input.description,
    seo_title: input.seoTitle,
    seo_description: input.seoDescription,
    canonical_url: input.canonicalUrl,
    author_id: input.authorId,
    status: input.status,
    scheduled_publish_at: input.scheduledPublishAt,
    metadata: input.metadata,
  });
}

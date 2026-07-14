"use server";

import type { SupabaseClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createCoffee, generateUniqueRecipeSlug } from "@/lib/data/db-recipes";
import { evaluateAndAwardBadges, recordActivity, refreshCommunityStats } from "@/lib/data/community";
import { createClient } from "@/lib/supabase/server";

export type RecipeActionState = { error?: string; success?: string } | undefined;

const MAX_IMAGE_BYTES = 6 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

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

/** Parses a 1-10 rating field. Returns `null` if blank, or the literal string `"invalid"` if out of range. */
function optionalRating(formData: FormData, key: string): number | null | "invalid" {
  const value = optionalNumber(formData, key);
  if (value === null) return null;
  if (!Number.isInteger(value) || value < 1 || value > 10) return "invalid";
  return value;
}

type PourInput = {
  pourNumber: number;
  waterAmount: number | null;
  timeLabel: string | null;
  notes: string | null;
};

/** Reads the dynamically-added pour rows (`pourWater_0`, `pourTime_0`, `pourNotes_0`, ...), skipping empty ones. */
function parsePours(formData: FormData): PourInput[] {
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

function parseTagIds(formData: FormData): string[] {
  return formData
    .getAll("tagIds")
    .filter((value): value is string => typeof value === "string" && value.length > 0);
}

async function uploadRecipeImage(
  supabase: SupabaseClient,
  userId: string,
  file: File,
): Promise<{ url: string } | { error: string }> {
  if (file.size > MAX_IMAGE_BYTES) {
    return { error: "Each image must be smaller than 6MB." };
  }
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return { error: "Images must be PNG, JPEG, WebP, or GIF." };
  }

  const extension = file.type.split("/")[1] ?? "jpg";
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "-").slice(0, 60);
  const path = `${userId}/${Date.now()}-${safeName || `image.${extension}`}`;

  const { error } = await supabase.storage
    .from("recipe-images")
    .upload(path, file, { contentType: file.type });

  if (error) {
    return { error: `Failed to upload image: ${error.message}` };
  }

  const { data } = supabase.storage.from("recipe-images").getPublicUrl(path);
  return { url: data.publicUrl };
}

type RecipeFormValues = {
  // General
  title: string;
  description: string | null;
  videoUrl: string | null;
  difficulty: string | null;
  estimatedBrewTime: string | null;
  // Brewing
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
  // Results
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
  // Status
  featured: boolean;
  premiumOnly: boolean;
  published: boolean;
};

/** Shared required-field + range validation for both create and edit recipe forms. */
function parseRecipeForm(formData: FormData): { values: RecipeFormValues } | { error: string } {
  const title = optionalString(formData, "title");
  if (!title) {
    return { error: "Recipe title is required." };
  }

  const brewingMethodId = optionalString(formData, "brewingMethodId");
  if (!brewingMethodId) {
    return { error: "Choose a brewing method." };
  }

  const ratingFields = { sweetness: "sweetness", acidity: "acidity", body: "body", bitterness: "bitterness" } as const;
  const ratings: Record<string, number | null> = {};
  for (const [key, formKey] of Object.entries(ratingFields)) {
    const parsed = optionalRating(formData, formKey);
    if (parsed === "invalid") {
      return { error: `${key.charAt(0).toUpperCase()}${key.slice(1)} must be a whole number from 1 to 10.` };
    }
    ratings[key] = parsed;
  }

  return {
    values: {
      title,
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
      featured: formData.get("featured") === "on",
      premiumOnly: formData.get("premiumOnly") === "on",
      published: formData.get("published") === "on",
    },
  };
}

/** Resolves the coffee_id for a recipe: creates a new coffee row if the author filled in "new coffee" fields, otherwise uses the selected existing one (if any). */
async function resolveCoffeeId(
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

async function replacePours(supabase: SupabaseClient, recipeId: string, pours: PourInput[]): Promise<void> {
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

async function replaceTags(supabase: SupabaseClient, recipeId: string, tagIds: string[]): Promise<void> {
  await supabase.from("recipe_tags").delete().eq("recipe_id", recipeId);
  if (tagIds.length === 0) return;

  await supabase.from("recipe_tags").insert(tagIds.map((tagId) => ({ recipe_id: recipeId, tag_id: tagId })));
}

async function appendGalleryImages(
  supabase: SupabaseClient,
  userId: string,
  recipeId: string,
  formData: FormData,
  startPosition: number,
): Promise<string | null> {
  const files = formData.getAll("galleryImages").filter((value): value is File => value instanceof File && value.size > 0);
  if (files.length === 0) return null;

  const rows: { recipe_id: string; url: string; position: number }[] = [];
  let position = startPosition;

  for (const file of files) {
    const uploaded = await uploadRecipeImage(supabase, userId, file);
    if ("error" in uploaded) return uploaded.error;
    rows.push({ recipe_id: recipeId, url: uploaded.url, position });
    position += 1;
  }

  if (rows.length > 0) {
    await supabase.from("recipe_images").insert(rows);
  }

  return null;
}

function recipeUpdatePayload(values: RecipeFormValues, coffeeId: string | null) {
  return {
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

  const coffeeId = await resolveCoffeeId(supabase, authData.user.id, formData);
  const slug = await generateUniqueRecipeSlug(supabase, parsed.values.title);

  const coverImageFile = formData.get("coverImage");
  let coverImageUrl: string | null = null;
  if (coverImageFile instanceof File && coverImageFile.size > 0) {
    const uploaded = await uploadRecipeImage(supabase, authData.user.id, coverImageFile);
    if ("error" in uploaded) return { error: uploaded.error };
    coverImageUrl = uploaded.url;
  }

  const { data: inserted, error } = await supabase
    .from("recipes")
    .insert({
      ...recipeUpdatePayload(parsed.values, coffeeId),
      slug,
      author_id: authData.user.id,
      cover_image_url: coverImageUrl,
    })
    .select("id")
    .single();

  if (error || !inserted) {
    return { error: error?.message ?? "Failed to create recipe." };
  }

  const recipeId = inserted.id as string;

  await replacePours(supabase, recipeId, parsePours(formData));
  await replaceTags(supabase, recipeId, parseTagIds(formData));
  const galleryError = await appendGalleryImages(supabase, authData.user.id, recipeId, formData, 0);
  if (galleryError) return { error: galleryError };

  // Community system: publishing a recipe can qualify the author for the
  // "Recipe Creator" / "Coffee Scientist" / "Coffee Legend" badges and
  // always feeds the "Top Recipe Creators" leaderboard.
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
    .select("id, title, author_id, cover_image_url")
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

  const coffeeId = await resolveCoffeeId(supabase, authData.user.id, formData);

  const slug =
    parsed.values.title === existing.title
      ? undefined
      : await generateUniqueRecipeSlug(supabase, parsed.values.title, recipeId);

  let coverImageUrl = existing.cover_image_url as string | null;
  const coverImageFile = formData.get("coverImage");
  if (coverImageFile instanceof File && coverImageFile.size > 0) {
    const uploaded = await uploadRecipeImage(supabase, authData.user.id, coverImageFile);
    if ("error" in uploaded) return { error: uploaded.error };
    coverImageUrl = uploaded.url;
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
    })
    .eq("id", recipeId)
    .eq("author_id", authData.user.id);

  if (error) {
    return { error: error.message };
  }

  await replacePours(supabase, recipeId, parsePours(formData));
  await replaceTags(supabase, recipeId, parseTagIds(formData));
  const galleryError = await appendGalleryImages(
    supabase,
    authData.user.id,
    recipeId,
    formData,
    existingImageCount ?? 0,
  );
  if (galleryError) return { error: galleryError };

  if (parsed.values.published) {
    await refreshCommunityStats(supabase, authData.user.id);
    await evaluateAndAwardBadges(supabase, authData.user.id);
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
  // Pours/images/tags/favorites cascade automatically via their foreign keys.
  await supabase.from("recipes").delete().eq("id", recipeId).eq("author_id", authData.user.id);

  revalidatePath("/recipes");
  revalidatePath("/dashboard/recipes");
  revalidatePath("/dashboard");
  redirect("/dashboard/recipes");
}

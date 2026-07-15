"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { updateTasteProfile } from "@/lib/data/ai";
import { createNotification, evaluateAndAwardBadges, recordActivity, refreshCommunityStats } from "@/lib/data/community";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { createClient } from "@/lib/supabase/server";
import { REVIEW_TEXT_MAX_LENGTH } from "@/types/community";

/**
 * Server Actions for Recipe Engagement: liking/unliking a recipe, rating +
 * reviewing a recipe (1-5 stars, optional text), and marking a review
 * helpful. "Saving" a recipe reuses the existing `favorites` table/actions
 * (see `lib/supabase/favorite-actions.ts`) -- this file only adds the
 * community stats/badge/notification side effects on top of it.
 */

export type RecipeReviewActionState = { error?: string; success?: string } | undefined;

function readCurrentPath(formData: FormData): string {
  const value = formData.get("currentPath");
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : "/recipes";
}

function readId(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return typeof value === "string" && value.length > 0 ? value : null;
}

async function getRecipeAuthor(supabase: Awaited<ReturnType<typeof createClient>>, recipeId: string): Promise<string | null> {
  const { data } = await supabase.from("recipes").select("author_id").eq("id", recipeId).maybeSingle();
  return (data?.author_id as string | null) ?? null;
}

/** Likes a recipe on behalf of the signed-in caller. */
export async function likeRecipeAction(formData: FormData): Promise<void> {
  const path = readCurrentPath(formData);
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    redirect(`/login?redirectTo=${encodeURIComponent(path)}`);
  }

  const recipeId = readId(formData, "recipeId");
  if (!recipeId) {
    revalidatePath(path);
    return;
  }

  const { error } = await supabase
    .from("recipe_likes")
    .upsert({ user_id: authData.user.id, recipe_id: recipeId }, { onConflict: "user_id,recipe_id", ignoreDuplicates: true });

  if (!error) {
    await refreshCommunityStats(supabase, authData.user.id);
    await updateTasteProfile(supabase, authData.user.id);
    const authorId = await getRecipeAuthor(supabase, recipeId);
    if (authorId) {
      await createNotification(supabase, {
        recipientId: authorId,
        notificationType: "recipe_liked",
        actorId: authData.user.id,
        recipeId,
        message: "Someone liked your recipe.",
      });
    }
  }

  revalidatePath(path);
}

/** Unlikes a recipe on behalf of the signed-in caller. */
export async function unlikeRecipeAction(formData: FormData): Promise<void> {
  const path = readCurrentPath(formData);
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    redirect(`/login?redirectTo=${encodeURIComponent(path)}`);
  }

  const recipeId = readId(formData, "recipeId");
  if (!recipeId) {
    revalidatePath(path);
    return;
  }

  await supabase.from("recipe_likes").delete().eq("user_id", authData.user.id).eq("recipe_id", recipeId);
  await refreshCommunityStats(supabase, authData.user.id);
  await updateTasteProfile(supabase, authData.user.id);

  revalidatePath(path);
}

/** Submits or updates the caller's 1-5 star rating + optional review text for a recipe. */
export async function submitRecipeReviewAction(
  _prevState: RecipeReviewActionState,
  formData: FormData,
): Promise<RecipeReviewActionState> {
  const path = readCurrentPath(formData);
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const r = dictionary.recipeReviews;
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    redirect(`/login?redirectTo=${encodeURIComponent(path)}`);
  }

  const recipeId = readId(formData, "recipeId");
  if (!recipeId) {
    return { error: r.missingRecipeId };
  }

  const ratingRaw = formData.get("rating");
  const rating = Number(ratingRaw);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { error: r.invalidRating };
  }

  const reviewTextRaw = formData.get("reviewText");
  const reviewText = typeof reviewTextRaw === "string" && reviewTextRaw.trim().length > 0 ? reviewTextRaw.trim() : null;

  if (reviewText && reviewText.length > REVIEW_TEXT_MAX_LENGTH) {
    return { error: r.reviewTooLong };
  }

  const { error } = await supabase
    .from("recipe_reviews")
    .upsert(
      { recipe_id: recipeId, user_id: authData.user.id, rating, review_text: reviewText },
      { onConflict: "recipe_id,user_id" },
    );

  if (error) {
    return { error: r.submitFailed };
  }

  await refreshCommunityStats(supabase, authData.user.id);
  await evaluateAndAwardBadges(supabase, authData.user.id);
  await recordActivity(supabase, {
    userId: authData.user.id,
    activityType: "reviewed_recipe",
    recipeId,
    metadata: { rating },
  });
  // BrewAtlas AI: a rating + review is the strongest available taste signal.
  await updateTasteProfile(supabase, authData.user.id);

  const authorId = await getRecipeAuthor(supabase, recipeId);
  if (authorId) {
    await createNotification(supabase, {
      recipientId: authorId,
      notificationType: "recipe_reviewed",
      actorId: authData.user.id,
      recipeId,
      message: "Someone reviewed your recipe.",
    });
  }

  revalidatePath(path);
  return { success: r.reviewSubmitted };
}

/** Deletes the caller's own review of a recipe. */
export async function deleteRecipeReviewAction(formData: FormData): Promise<void> {
  const path = readCurrentPath(formData);
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    redirect(`/login?redirectTo=${encodeURIComponent(path)}`);
  }

  const recipeId = readId(formData, "recipeId");
  if (!recipeId) {
    revalidatePath(path);
    return;
  }

  await supabase.from("recipe_reviews").delete().eq("recipe_id", recipeId).eq("user_id", authData.user.id);
  await refreshCommunityStats(supabase, authData.user.id);

  revalidatePath(path);
}

/** Marks another user's review as helpful. */
export async function markReviewHelpfulAction(formData: FormData): Promise<void> {
  const path = readCurrentPath(formData);
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    redirect(`/login?redirectTo=${encodeURIComponent(path)}`);
  }

  const reviewId = readId(formData, "reviewId");
  if (!reviewId) {
    revalidatePath(path);
    return;
  }

  const { data: review } = await supabase
    .from("recipe_reviews")
    .select("user_id, recipe_id")
    .eq("id", reviewId)
    .maybeSingle();

  if (!review || review.user_id === authData.user.id) {
    revalidatePath(path);
    return;
  }

  const { error } = await supabase
    .from("recipe_review_helpful_votes")
    .upsert({ review_id: reviewId, user_id: authData.user.id }, { onConflict: "review_id,user_id", ignoreDuplicates: true });

  if (!error) {
    const reviewAuthorId = review.user_id as string;
    const recipeId = review.recipe_id as string;
    await refreshCommunityStats(supabase, reviewAuthorId);
    await evaluateAndAwardBadges(supabase, reviewAuthorId);
    await createNotification(supabase, {
      recipientId: reviewAuthorId,
      notificationType: "review_liked",
      actorId: authData.user.id,
      recipeId,
      message: "Someone found your review helpful.",
    });
  }

  revalidatePath(path);
}

/** Removes the caller's helpful vote from a review. */
export async function unmarkReviewHelpfulAction(formData: FormData): Promise<void> {
  const path = readCurrentPath(formData);
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) {
    redirect(`/login?redirectTo=${encodeURIComponent(path)}`);
  }

  const reviewId = readId(formData, "reviewId");
  if (!reviewId) {
    revalidatePath(path);
    return;
  }

  await supabase.from("recipe_review_helpful_votes").delete().eq("review_id", reviewId).eq("user_id", authData.user.id);

  const { data: review } = await supabase.from("recipe_reviews").select("user_id").eq("id", reviewId).maybeSingle();
  const reviewAuthorId = review?.user_id as string | undefined;
  if (reviewAuthorId) {
    await refreshCommunityStats(supabase, reviewAuthorId);
  }

  revalidatePath(path);
}

/** Reports a review for owner moderation. */
export async function flagReviewAction(formData: FormData): Promise<void> {
  const path = readCurrentPath(formData);
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const r = dictionary.recipeReviews;
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    redirect(`/login?redirectTo=${encodeURIComponent(path)}`);
  }

  const reviewId = readId(formData, "reviewId");
  if (!reviewId) {
    revalidatePath(path);
    return;
  }

  const { data: review } = await supabase
    .from("recipe_reviews")
    .select("user_id")
    .eq("id", reviewId)
    .maybeSingle();

  if (!review || review.user_id === authData.user.id) {
    revalidatePath(path);
    return;
  }

  const reasonRaw = formData.get("flagReason");
  const flagReason =
    typeof reasonRaw === "string" && reasonRaw.trim().length > 0 ? reasonRaw.trim().slice(0, 500) : r.reportDefaultReason;

  await supabase
    .from("recipe_reviews")
    .update({
      moderation_status: "flagged",
      flagged_at: new Date().toISOString(),
      flag_reason: flagReason,
    })
    .eq("id", reviewId);

  revalidatePath(path);
}

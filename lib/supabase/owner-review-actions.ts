"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { userHasPermission } from "@/lib/auth/permission-middleware";
import { requireOwner } from "@/lib/auth/require-owner";
import { createNotification } from "@/lib/data/community";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";

function readReviewId(formData: FormData): string | null {
  const value = formData.get("reviewId");
  return typeof value === "string" && value.length > 0 ? value : null;
}

async function requireReviewsPermission() {
  const session = await requireOwner("/dashboard/reviews");
  const allowed = await userHasPermission(session.supabase, session.user.id, "cms.reviews");
  if (!allowed) {
    redirect("/dashboard");
  }
  return session;
}

async function loadReviewContext(supabase: Awaited<ReturnType<typeof requireOwner>>["supabase"], reviewId: string) {
  const { data } = await supabase
    .from("recipe_reviews")
    .select("id, user_id, recipe_id, recipes ( slug )")
    .eq("id", reviewId)
    .maybeSingle();

  if (!data) return null;

  return {
    reviewId: data.id as string,
    authorId: data.user_id as string,
    recipeId: data.recipe_id as string,
    recipeSlug: (data.recipes as unknown as { slug: string } | null)?.slug ?? null,
  };
}

async function notifyModeration(
  supabase: Awaited<ReturnType<typeof requireOwner>>["supabase"],
  authorId: string,
  recipeId: string,
  action: "hidden" | "restored" | "deleted",
) {
  await createNotification(supabase, {
    recipientId: authorId,
    notificationType: "moderation_event",
    recipeId,
    message: `Your review was ${action} by a moderator.`,
    metadata: { action },
  });
}

/** Hides a review from public listings while keeping it in the database. */
export async function hideOwnerReviewAction(formData: FormData): Promise<void> {
  const { supabase } = await requireReviewsPermission();
  const reviewId = readReviewId(formData);
  if (!reviewId) {
    revalidatePath("/dashboard/reviews");
    return;
  }

  const context = await loadReviewContext(supabase, reviewId);
  if (!context) {
    revalidatePath("/dashboard/reviews");
    return;
  }

  const { error } = await supabase
    .from("recipe_reviews")
    .update({ moderation_status: "hidden", flagged_at: null, flag_reason: null })
    .eq("id", reviewId);

  if (!error) {
    await notifyModeration(supabase, context.authorId, context.recipeId, "hidden");
    if (context.recipeSlug) {
      revalidatePath(`/recipes/${context.recipeSlug}`);
    }
  }

  revalidatePath("/dashboard/reviews");
}

/** Restores a hidden or flagged review to visible status. */
export async function restoreOwnerReviewAction(formData: FormData): Promise<void> {
  const { supabase } = await requireReviewsPermission();
  const reviewId = readReviewId(formData);
  if (!reviewId) {
    revalidatePath("/dashboard/reviews");
    return;
  }

  const context = await loadReviewContext(supabase, reviewId);
  if (!context) {
    revalidatePath("/dashboard/reviews");
    return;
  }

  const { error } = await supabase
    .from("recipe_reviews")
    .update({ moderation_status: "visible", flagged_at: null, flag_reason: null })
    .eq("id", reviewId);

  if (!error) {
    await notifyModeration(supabase, context.authorId, context.recipeId, "restored");
    if (context.recipeSlug) {
      revalidatePath(`/recipes/${context.recipeSlug}`);
    }
  }

  revalidatePath("/dashboard/reviews");
}

/** Permanently deletes a review (owner moderation). */
export async function deleteOwnerReviewAction(formData: FormData): Promise<void> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const { supabase } = await requireReviewsPermission();
  const reviewId = readReviewId(formData);
  if (!reviewId) {
    revalidatePath("/dashboard/reviews");
    return;
  }

  const context = await loadReviewContext(supabase, reviewId);
  if (!context) {
    revalidatePath("/dashboard/reviews");
    return;
  }

  const { error } = await supabase.from("recipe_reviews").delete().eq("id", reviewId);

  if (!error) {
    await notifyModeration(supabase, context.authorId, context.recipeId, "deleted");
    if (context.recipeSlug) {
      revalidatePath(`/recipes/${context.recipeSlug}`);
    }
  } else {
    console.error("deleteOwnerReviewAction failed", error, dictionary.ownerReviewsPage.deleteFailed);
  }

  revalidatePath("/dashboard/reviews");
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createNotification, evaluateAndAwardBadges, recordActivity, refreshCommunityStats } from "@/lib/data/community";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { createClient } from "@/lib/supabase/server";
import { sanitizeOptionalText } from "@/lib/security/sanitize";

export type CommentActionState = { error?: string; success?: string } | undefined;

function readPath(formData: FormData): string {
  const value = formData.get("currentPath");
  return typeof value === "string" && value.startsWith("/") ? value : "/recipes";
}

function readId(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return typeof value === "string" && value.length > 0 ? value : null;
}

async function getRecipeAuthor(supabase: Awaited<ReturnType<typeof createClient>>, recipeId: string) {
  const { data } = await supabase.from("recipes").select("author_id, title").eq("id", recipeId).maybeSingle();
  return data as { author_id: string | null; title: string } | null;
}

export async function createRecipeCommentAction(
  _prev: CommentActionState,
  formData: FormData,
): Promise<CommentActionState> {
  const path = readPath(formData);
  const supabase = await createClient();
  const dictionary = await getDictionary(await getLocale());
  const labels = dictionary.communityPlatformPage;
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { error: labels.signInRequired };

  const recipeId = readId(formData, "recipeId");
  const body = sanitizeOptionalText(String(formData.get("body") ?? ""), 2000);
  const parentId = readId(formData, "parentId");
  if (!recipeId || !body) return { error: labels.commentRequired };

  const { error } = await supabase.from("recipe_comments").insert({
    recipe_id: recipeId,
    user_id: authData.user.id,
    parent_id: parentId,
    body,
  });

  if (error) return { error: error.message || labels.saveFailed };

  await refreshCommunityStats(supabase, authData.user.id);
  await recordActivity(supabase, {
    userId: authData.user.id,
    activityType: "commented_recipe",
    recipeId,
    metadata: parentId ? { parentId } : {},
  });

  const recipe = await getRecipeAuthor(supabase, recipeId);
  if (recipe?.author_id && recipe.author_id !== authData.user.id) {
    await createNotification(supabase, {
      recipientId: recipe.author_id,
      notificationType: parentId ? "review_received" : "recipe_reviewed",
      actorId: authData.user.id,
      recipeId,
      message: parentId ? "Someone replied to a comment on your recipe." : "Someone commented on your recipe.",
    });
  }

  revalidatePath(path);
  return { success: labels.commentPosted };
}

export async function updateRecipeCommentAction(
  _prev: CommentActionState,
  formData: FormData,
): Promise<CommentActionState> {
  const path = readPath(formData);
  const supabase = await createClient();
  const dictionary = await getDictionary(await getLocale());
  const labels = dictionary.communityPlatformPage;
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { error: labels.signInRequired };

  const commentId = readId(formData, "commentId");
  const body = sanitizeOptionalText(String(formData.get("body") ?? ""), 2000);
  if (!commentId || !body) return { error: labels.saveFailed };

  const { error } = await supabase
    .from("recipe_comments")
    .update({ body, is_edited: true })
    .eq("id", commentId)
    .eq("user_id", authData.user.id);

  if (error) return { error: error.message || labels.saveFailed };
  revalidatePath(path);
  return { success: labels.commentUpdated };
}

export async function deleteRecipeCommentAction(
  _prev: CommentActionState,
  formData: FormData,
): Promise<CommentActionState> {
  const path = readPath(formData);
  const supabase = await createClient();
  const dictionary = await getDictionary(await getLocale());
  const labels = dictionary.communityPlatformPage;
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { error: labels.signInRequired };

  const commentId = readId(formData, "commentId");
  if (!commentId) return { error: labels.saveFailed };

  const { error } = await supabase.from("recipe_comments").delete().eq("id", commentId).eq("user_id", authData.user.id);
  if (error) return { error: error.message || labels.saveFailed };
  revalidatePath(path);
  return { success: labels.commentDeleted };
}

export async function likeRecipeCommentAction(formData: FormData): Promise<void> {
  const path = readPath(formData);
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect(`/login?redirectTo=${encodeURIComponent(path)}`);

  const commentId = readId(formData, "commentId");
  if (!commentId) return;

  await supabase
    .from("recipe_comment_likes")
    .upsert({ user_id: authData.user.id, comment_id: commentId }, { onConflict: "user_id,comment_id", ignoreDuplicates: true });

  revalidatePath(path);
}

export async function unlikeRecipeCommentAction(formData: FormData): Promise<void> {
  const path = readPath(formData);
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect(`/login?redirectTo=${encodeURIComponent(path)}`);

  const commentId = readId(formData, "commentId");
  if (!commentId) return;

  await supabase.from("recipe_comment_likes").delete().eq("user_id", authData.user.id).eq("comment_id", commentId);
  revalidatePath(path);
}

export async function reportContentAction(
  _prev: CommentActionState,
  formData: FormData,
): Promise<CommentActionState> {
  const supabase = await createClient();
  const dictionary = await getDictionary(await getLocale());
  const labels = dictionary.communityPlatformPage;
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return { error: labels.signInRequired };

  const targetType = readId(formData, "targetType");
  const targetId = readId(formData, "targetId");
  const reason = sanitizeOptionalText(String(formData.get("reason") ?? ""), 500);
  const details = sanitizeOptionalText(String(formData.get("details") ?? ""), 1000);
  if (!targetType || !targetId || !reason) return { error: labels.reportRequired };

  const { error } = await supabase.from("recipe_reports").insert({
    reporter_id: authData.user.id,
    target_type: targetType,
    target_id: targetId,
    reason,
    details,
  });

  if (error) return { error: error.message || labels.saveFailed };
  return { success: labels.reportSubmitted };
}

export async function syncUserAchievementsAction(userId: string): Promise<void> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user || authData.user.id !== userId) return;

  const [{ count: brewCount }, { count: commentCount }, { count: recipeCount }] = await Promise.all([
    supabase.from("brew_sessions").select("*", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("recipe_comments").select("*", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("recipes").select("*", { count: "exact", head: true }).eq("author_id", userId).eq("published", true),
  ]);

  const milestones = [
    { key: "first_brew", title: "First Brew", description: "Log your first brew session.", progress: brewCount ?? 0, target: 1 },
    { key: "hundred_brews", title: "100 Brews", description: "Log 100 brew sessions.", progress: brewCount ?? 0, target: 100 },
    { key: "recipe_creator", title: "Recipe Creator", description: "Publish a community recipe.", progress: recipeCount ?? 0, target: 1 },
    { key: "community_helper", title: "Community Helper", description: "Leave 10 helpful comments.", progress: commentCount ?? 0, target: 10 },
  ];

  for (const milestone of milestones) {
    const unlocked = milestone.progress >= milestone.target;
    await supabase.from("user_achievements").upsert(
      {
        user_id: userId,
        achievement_key: milestone.key,
        title: milestone.title,
        description: milestone.description,
        progress: milestone.progress,
        target: milestone.target,
        unlocked_at: unlocked ? new Date().toISOString() : null,
      },
      { onConflict: "user_id,achievement_key" },
    );
  }

  await evaluateAndAwardBadges(supabase, userId);
}

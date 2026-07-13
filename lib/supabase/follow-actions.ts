"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createNotification, evaluateAndAwardBadges, recordActivity, refreshCommunityStats } from "@/lib/data/community";
import { createClient } from "@/lib/supabase/server";

/**
 * Server Actions for the Coffee Community "Followers" system
 * (`user_follows`). Following/unfollowing recomputes both profiles'
 * `user_community_stats` (followers/following counts feed public
 * profiles and the "Coffee Legend" badge) and, for a new follow, records
 * an activity feed entry and delivers a "new follower" notification.
 */

function readCurrentPath(formData: FormData): string {
  const value = formData.get("currentPath");
  return typeof value === "string" && value.startsWith("/") && !value.startsWith("//") ? value : "/community";
}

function readTargetUserId(formData: FormData): string | null {
  const value = formData.get("userId");
  return typeof value === "string" && value.length > 0 ? value : null;
}

/** Follows another user on behalf of the signed-in caller. */
export async function followUserAction(formData: FormData): Promise<void> {
  const path = readCurrentPath(formData);
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    redirect(`/login?redirectTo=${encodeURIComponent(path)}`);
  }

  const targetUserId = readTargetUserId(formData);
  if (!targetUserId || targetUserId === authData.user.id) {
    revalidatePath(path);
    return;
  }

  const { error } = await supabase
    .from("user_follows")
    .upsert(
      { follower_id: authData.user.id, following_id: targetUserId },
      { onConflict: "follower_id,following_id", ignoreDuplicates: true },
    );

  if (!error) {
    await Promise.all([
      refreshCommunityStats(supabase, authData.user.id),
      refreshCommunityStats(supabase, targetUserId),
    ]);
    await evaluateAndAwardBadges(supabase, targetUserId);
    await recordActivity(supabase, {
      userId: authData.user.id,
      activityType: "followed_user",
      targetUserId,
    });
    await createNotification(supabase, {
      recipientId: targetUserId,
      notificationType: "new_follower",
      actorId: authData.user.id,
      message: "You have a new follower.",
    });
  }

  revalidatePath(path);
  revalidatePath("/community");
}

/** Unfollows a user on behalf of the signed-in caller. */
export async function unfollowUserAction(formData: FormData): Promise<void> {
  const path = readCurrentPath(formData);
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    redirect(`/login?redirectTo=${encodeURIComponent(path)}`);
  }

  const targetUserId = readTargetUserId(formData);
  if (!targetUserId) {
    revalidatePath(path);
    return;
  }

  await supabase
    .from("user_follows")
    .delete()
    .eq("follower_id", authData.user.id)
    .eq("following_id", targetUserId);

  await Promise.all([refreshCommunityStats(supabase, authData.user.id), refreshCommunityStats(supabase, targetUserId)]);

  revalidatePath(path);
  revalidatePath("/community");
}

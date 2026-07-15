import type { SupabaseClient } from "@supabase/supabase-js";
import { createNotification } from "@/lib/data/community";

type MentionNotificationParams = {
  recipientId: string;
  actorId: string;
  recipeId?: string | null;
  reviewId?: string | null;
  mentionContext?: string;
  message?: string;
};

/**
 * Future-ready helper for @mention notifications. Wire this when mention
 * parsing is added to reviews or community comments.
 */
export async function notifyMention(
  supabase: SupabaseClient,
  params: MentionNotificationParams,
): Promise<void> {
  await createNotification(supabase, {
    recipientId: params.recipientId,
    notificationType: "mention",
    actorId: params.actorId,
    recipeId: params.recipeId ?? null,
    message: params.message ?? "Someone mentioned you.",
    metadata: {
      reviewId: params.reviewId ?? undefined,
      mentionContext: params.mentionContext ?? "a conversation",
    },
  });
}

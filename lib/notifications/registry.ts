import type { NotificationItem, NotificationType } from "@/types/community";

/** Groups notification types for future filtering and owner-dashboard routing. */
export type NotificationCategory = "social" | "content" | "reviews" | "system" | "owner";

export type NotificationTypeConfig = {
  category: NotificationCategory;
  titleKey: string;
  messageKey: string;
  resolveHref?: (item: NotificationItem) => string | null;
};

const recipeHref = (item: NotificationItem) =>
  item.recipe ? `/recipes/${item.recipe.slug}` : null;

const profileHref = () => "/community";

const collectionHref = (item: NotificationItem) => {
  const collectionId = item.metadata.collectionId;
  return typeof collectionId === "string" ? `/account/collections/${collectionId}` : "/account/collections";
};

const metadataHref = (item: NotificationItem) => {
  const href = item.metadata.href;
  return typeof href === "string" && href.startsWith("/") && !href.startsWith("//") ? href : null;
};

/**
 * Central registry for notification types. Add new types here and their i18n
 * keys — no refactors needed elsewhere. Types in the `owner` category are
 * reserved for Phase 21 Owner Dashboard workflows.
 */
export const NOTIFICATION_TYPE_REGISTRY: Record<NotificationType, NotificationTypeConfig> = {
  new_follower: {
    category: "social",
    titleKey: "notificationsPage.typeNewFollowerTitle",
    messageKey: "notificationsPage.typeNewFollowerMessage",
    resolveHref: profileHref,
  },
  recipe_liked: {
    category: "social",
    titleKey: "notificationsPage.typeRecipeLikedTitle",
    messageKey: "notificationsPage.typeRecipeLikedMessage",
    resolveHref: recipeHref,
  },
  recipe_reviewed: {
    category: "reviews",
    titleKey: "notificationsPage.typeReviewReceivedTitle",
    messageKey: "notificationsPage.typeReviewReceivedMessage",
    resolveHref: recipeHref,
  },
  badge_earned: {
    category: "system",
    titleKey: "notificationsPage.typeAchievementTitle",
    messageKey: "notificationsPage.typeAchievementMessage",
    resolveHref: () => "/community",
  },
  recipe_published: {
    category: "content",
    titleKey: "notificationsPage.typeRecipePublishedTitle",
    messageKey: "notificationsPage.typeRecipePublishedMessage",
    resolveHref: recipeHref,
  },
  favorite_recipe_updated: {
    category: "content",
    titleKey: "notificationsPage.typeFavoriteRecipeUpdatedTitle",
    messageKey: "notificationsPage.typeFavoriteRecipeUpdatedMessage",
    resolveHref: recipeHref,
  },
  collection_updated: {
    category: "content",
    titleKey: "notificationsPage.typeCollectionUpdatedTitle",
    messageKey: "notificationsPage.typeCollectionUpdatedMessage",
    resolveHref: collectionHref,
  },
  review_received: {
    category: "reviews",
    titleKey: "notificationsPage.typeReviewReceivedTitle",
    messageKey: "notificationsPage.typeReviewReceivedMessage",
    resolveHref: recipeHref,
  },
  review_liked: {
    category: "reviews",
    titleKey: "notificationsPage.typeReviewLikedTitle",
    messageKey: "notificationsPage.typeReviewLikedMessage",
    resolveHref: recipeHref,
  },
  ai_recommendation: {
    category: "content",
    titleKey: "notificationsPage.typeAiRecommendationTitle",
    messageKey: "notificationsPage.typeAiRecommendationMessage",
    resolveHref: () => "/coach",
  },
  subscription_reminder: {
    category: "system",
    titleKey: "notificationsPage.typeSubscriptionReminderTitle",
    messageKey: "notificationsPage.typeSubscriptionReminderMessage",
    resolveHref: () => "/premium",
  },
  achievement_unlocked: {
    category: "system",
    titleKey: "notificationsPage.typeAchievementTitle",
    messageKey: "notificationsPage.typeAchievementMessage",
    resolveHref: () => "/community",
  },
  brew_log_reminder: {
    category: "content",
    titleKey: "notificationsPage.typeBrewLogReminderTitle",
    messageKey: "notificationsPage.typeBrewLogReminderMessage",
    resolveHref: () => "/account/brew-history/new",
  },
  account: {
    category: "system",
    titleKey: "notificationsPage.typeAccountTitle",
    messageKey: "notificationsPage.typeAccountMessage",
    resolveHref: () => "/account/profile",
  },
  system_announcement: {
    category: "system",
    titleKey: "notificationsPage.typeSystemAnnouncementTitle",
    messageKey: "notificationsPage.typeSystemAnnouncementMessage",
    resolveHref: metadataHref,
  },
  recipe_approval_pending: {
    category: "owner",
    titleKey: "notificationsPage.typeRecipeApprovalPendingTitle",
    messageKey: "notificationsPage.typeRecipeApprovalPendingMessage",
    resolveHref: metadataHref,
  },
  recipe_approved: {
    category: "owner",
    titleKey: "notificationsPage.typeRecipeApprovedTitle",
    messageKey: "notificationsPage.typeRecipeApprovedMessage",
    resolveHref: recipeHref,
  },
  recipe_rejected: {
    category: "owner",
    titleKey: "notificationsPage.typeRecipeRejectedTitle",
    messageKey: "notificationsPage.typeRecipeRejectedMessage",
    resolveHref: metadataHref,
  },
  staff_action: {
    category: "owner",
    titleKey: "notificationsPage.typeStaffActionTitle",
    messageKey: "notificationsPage.typeStaffActionMessage",
    resolveHref: metadataHref,
  },
  moderation_event: {
    category: "owner",
    titleKey: "notificationsPage.typeModerationEventTitle",
    messageKey: "notificationsPage.typeModerationEventMessage",
    resolveHref: metadataHref,
  },
  team_notification: {
    category: "owner",
    titleKey: "notificationsPage.typeTeamNotificationTitle",
    messageKey: "notificationsPage.typeTeamNotificationMessage",
    resolveHref: metadataHref,
  },
  admin_broadcast: {
    category: "owner",
    titleKey: "notificationsPage.typeAdminBroadcastTitle",
    messageKey: "notificationsPage.typeAdminBroadcastMessage",
    resolveHref: metadataHref,
  },
};

export function getNotificationTypeConfig(type: string): NotificationTypeConfig | null {
  return (NOTIFICATION_TYPE_REGISTRY as Record<string, NotificationTypeConfig>)[type] ?? null;
}

import type { NotificationType } from "@/types/community";

/** Preference categories surfaced in the notification settings UI. */
export const NOTIFICATION_PREFERENCE_CATEGORIES = [
  "social",
  "reviews",
  "content",
  "system",
  "mentions",
] as const;

export type NotificationPreferenceCategory = (typeof NOTIFICATION_PREFERENCE_CATEGORIES)[number];

export type NotificationChannelPreferences = Record<NotificationPreferenceCategory, boolean>;

export type NotificationPreferences = {
  inApp: NotificationChannelPreferences;
  email: NotificationChannelPreferences;
};

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  inApp: {
    social: true,
    reviews: true,
    content: true,
    system: true,
    mentions: true,
  },
  email: {
    social: false,
    reviews: false,
    content: false,
    system: false,
    mentions: false,
  },
};

/** Maps each notification type to a settings category for preference gating. */
export const NOTIFICATION_TYPE_CATEGORY: Record<NotificationType, NotificationPreferenceCategory> = {
  new_follower: "social",
  recipe_liked: "social",
  recipe_favorited: "social",
  recipe_reviewed: "reviews",
  review_received: "reviews",
  review_liked: "reviews",
  mention: "mentions",
  badge_earned: "system",
  recipe_published: "content",
  favorite_recipe_updated: "content",
  collection_updated: "content",
  ai_recommendation: "content",
  subscription_reminder: "system",
  achievement_unlocked: "system",
  brew_log_reminder: "content",
  account: "system",
  system_announcement: "system",
  recipe_approval_pending: "system",
  recipe_approved: "content",
  recipe_rejected: "content",
  staff_action: "system",
  moderation_event: "system",
  team_notification: "system",
  admin_broadcast: "system",
};

/** System broadcasts always deliver regardless of user prefs. */
const ALWAYS_DELIVER_TYPES = new Set<NotificationType>(["system_announcement", "admin_broadcast"]);

export function getNotificationCategory(type: string): NotificationPreferenceCategory {
  return NOTIFICATION_TYPE_CATEGORY[type as NotificationType] ?? "system";
}

export function shouldDeliverInApp(
  preferences: NotificationPreferences,
  notificationType: string,
): boolean {
  if (ALWAYS_DELIVER_TYPES.has(notificationType as NotificationType)) return true;
  const category = getNotificationCategory(notificationType);
  return preferences.inApp[category] ?? true;
}

export function parseNotificationPreferences(raw: {
  in_app?: unknown;
  email?: unknown;
} | null): NotificationPreferences {
  const inApp = { ...DEFAULT_NOTIFICATION_PREFERENCES.inApp };
  const email = { ...DEFAULT_NOTIFICATION_PREFERENCES.email };

  if (raw?.in_app && typeof raw.in_app === "object" && !Array.isArray(raw.in_app)) {
    for (const key of NOTIFICATION_PREFERENCE_CATEGORIES) {
      const value = (raw.in_app as Record<string, unknown>)[key];
      if (typeof value === "boolean") inApp[key] = value;
    }
  }

  if (raw?.email && typeof raw.email === "object" && !Array.isArray(raw.email)) {
    for (const key of NOTIFICATION_PREFERENCE_CATEGORIES) {
      const value = (raw.email as Record<string, unknown>)[key];
      if (typeof value === "boolean") email[key] = value;
    }
  }

  return { inApp, email };
}

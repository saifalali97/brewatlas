import { translate } from "@/lib/i18n/format";
import { getNotificationTypeConfig } from "@/lib/notifications/registry";
import type { Dictionary, DictionaryKey } from "@/lib/i18n/types";
import type { NotificationItem } from "@/types/community";

function actorName(item: NotificationItem): string {
  return item.actor?.displayName?.trim() || "Someone";
}

function recipeName(item: NotificationItem): string {
  return item.recipe?.title?.trim() || "a recipe";
}

function badgeName(item: NotificationItem): string {
  return item.badge?.name?.trim() || "an achievement";
}

function collectionName(item: NotificationItem): string {
  const fromMeta = item.metadata.collectionName;
  if (typeof fromMeta === "string" && fromMeta.trim()) return fromMeta.trim();
  return "your collection";
}

function templateVars(item: NotificationItem): Record<string, string> {
  const mentionContext =
    typeof item.metadata.mentionContext === "string" ? item.metadata.mentionContext.trim() : "a conversation";

  return {
    actor: actorName(item),
    recipe: recipeName(item),
    badge: badgeName(item),
    collection: collectionName(item),
    message: item.message,
    context: mentionContext,
  };
}

function resolveFromKey(dictionary: Dictionary, key: string, vars: Record<string, string>): string {
  return translate(dictionary, key as DictionaryKey, vars);
}

/** Localized title — prefers stored `title`, then type registry, then message fallback. */
export function resolveNotificationTitle(dictionary: Dictionary, item: NotificationItem): string {
  if (item.title?.trim()) return item.title.trim();
  const config = getNotificationTypeConfig(item.notificationType);
  if (config) return resolveFromKey(dictionary, config.titleKey, templateVars(item));
  return item.message || dictionary.notificationsPage.unknownTitle;
}

/** Localized body — prefers stored `message`, then type registry template. */
export function resolveNotificationMessage(dictionary: Dictionary, item: NotificationItem): string {
  const config = getNotificationTypeConfig(item.notificationType);
  if (config) return resolveFromKey(dictionary, config.messageKey, templateVars(item));
  return item.message || dictionary.notificationsPage.unknownMessage;
}

/** Deep link for a notification row, if one can be resolved. */
export function resolveNotificationHref(item: NotificationItem): string | null {
  const config = getNotificationTypeConfig(item.notificationType);
  if (config?.resolveHref) {
    const href = config.resolveHref(item);
    if (href) return href;
  }
  const metaHref = item.metadata.href;
  if (typeof metaHref === "string" && metaHref.startsWith("/") && !metaHref.startsWith("//")) {
    return metaHref;
  }
  return null;
}

export function formatNotificationTime(value: string, locale: string): string {
  const date = new Date(value);
  const now = Date.now();
  const diffMs = now - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60_000);

  if (diffMinutes < 1) return "just_now";
  if (diffMinutes < 60) return String(diffMinutes);
  if (diffMinutes < 60 * 24) return String(Math.floor(diffMinutes / 60));
  return date.toLocaleDateString(locale, { month: "short", day: "numeric" });
}

export function formatNotificationTimeLabel(
  dictionary: Dictionary,
  value: string,
  locale: string,
): string {
  const formatted = formatNotificationTime(value, locale);
  if (formatted === "just_now") return dictionary.notificationsPage.timeJustNow;
  const minutes = Number(formatted);
  if (Number.isFinite(minutes) && minutes < 60) {
    return translate(dictionary, "notificationsPage.timeMinutesAgo", { count: minutes });
  }
  const hours = Number(formatted);
  if (Number.isFinite(hours) && hours < 24) {
    return translate(dictionary, "notificationsPage.timeHoursAgo", { count: hours });
  }
  return formatted;
}

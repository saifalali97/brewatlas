import type { NotificationItem } from "@/types/community";

export type NotificationDateGroup = "today" | "yesterday" | "thisWeek" | "earlier";

export type NotificationDateSection = {
  group: NotificationDateGroup;
  items: NotificationItem[];
};

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getNotificationDateGroup(isoDate: string, now = new Date()): NotificationDateGroup {
  const date = new Date(isoDate);
  const todayStart = startOfLocalDay(now);
  const itemDay = startOfLocalDay(date);
  const diffDays = Math.floor((todayStart.getTime() - itemDay.getTime()) / 86_400_000);

  if (diffDays <= 0) return "today";
  if (diffDays === 1) return "yesterday";
  if (diffDays < 7) return "thisWeek";
  return "earlier";
}

/** Groups a chronologically sorted notification list by relative date buckets. */
export function groupNotificationsByDate(items: NotificationItem[]): NotificationDateSection[] {
  const sections: NotificationDateSection[] = [];

  for (const item of items) {
    const group = getNotificationDateGroup(item.createdAt);
    const last = sections.at(-1);
    if (last?.group === group) {
      last.items.push(item);
    } else {
      sections.push({ group, items: [item] });
    }
  }

  return sections;
}

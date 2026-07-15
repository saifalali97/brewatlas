import Image from "next/image";
import Link from "next/link";
import { Bell } from "lucide-react";
import {
  formatNotificationTimeLabel,
  resolveNotificationHref,
  resolveNotificationMessage,
  resolveNotificationTitle,
} from "@/lib/notifications/display";
import {
  deleteNotificationAction,
  markNotificationReadAction,
  markNotificationUnreadAction,
} from "@/lib/supabase/notification-actions";
import type { Dictionary } from "@/lib/i18n/types";
import type { NotificationItem } from "@/types/community";

type NotificationItemRowProps = {
  item: NotificationItem;
  labels: Dictionary["notificationsPage"];
  dictionary: Dictionary;
  locale: string;
  currentPath: string;
  compact?: boolean;
};

export function NotificationItemRow({
  item,
  labels,
  dictionary,
  locale,
  currentPath,
  compact = false,
}: NotificationItemRowProps) {
  const title = resolveNotificationTitle(dictionary, item);
  const message = resolveNotificationMessage(dictionary, item);
  const href = resolveNotificationHref(item);
  const timeLabel = formatNotificationTimeLabel(dictionary, item.createdAt, locale);

  const content = (
    <div className={`flex gap-3 ${compact ? "px-4 py-3" : "px-5 py-4"}`}>
      <div className="relative mt-0.5 h-9 w-9 shrink-0 overflow-hidden rounded-full border border-white/[0.1] bg-white/[0.04]">
        {item.actor?.avatarUrl ? (
          <Image src={item.actor.avatarUrl} alt="" fill sizes="36px" className="object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-amber-500/80">
            <Bell className="h-4 w-4" aria-hidden />
          </div>
        )}
        {!item.isRead ? (
          <span
            className="absolute -end-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border border-[#0a0705] bg-amber-500"
            aria-hidden
          />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm leading-snug ${item.isRead ? "text-stone-400" : "font-medium text-stone-100"}`}>
            {title}
          </p>
          <time dateTime={item.createdAt} className="shrink-0 text-[0.6875rem] text-stone-600">
            {timeLabel}
          </time>
        </div>
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-stone-500">{message}</p>

        {!compact ? (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {!item.isRead ? (
              <form action={markNotificationReadAction}>
                <input type="hidden" name="notificationId" value={item.id} />
                <input type="hidden" name="currentPath" value={currentPath} />
                <button
                  type="submit"
                  className="text-xs font-medium text-amber-400/90 underline-offset-4 hover:underline"
                  aria-label={labels.markAsReadAria}
                >
                  {labels.markAsRead}
                </button>
              </form>
            ) : (
              <form action={markNotificationUnreadAction}>
                <input type="hidden" name="notificationId" value={item.id} />
                <input type="hidden" name="currentPath" value={currentPath} />
                <button
                  type="submit"
                  className="text-xs font-medium text-stone-500 underline-offset-4 hover:text-stone-300 hover:underline"
                  aria-label={labels.markAsUnreadAria}
                >
                  {labels.markAsUnread}
                </button>
              </form>
            )}
            <form action={deleteNotificationAction}>
              <input type="hidden" name="notificationId" value={item.id} />
              <input type="hidden" name="currentPath" value={currentPath} />
              <button
                type="submit"
                className="text-xs font-medium text-stone-500 underline-offset-4 hover:text-stone-300 hover:underline"
                aria-label={labels.deleteAria}
              >
                {labels.delete}
              </button>
            </form>
          </div>
        ) : null}
      </div>
    </div>
  );

  const rowClass = `transition-colors hover:bg-white/[0.03] ${item.isRead ? "" : "bg-amber-950/10"}`;

  if (href) {
    return (
      <li className={rowClass}>
        <Link href={href} className="block focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-amber-500/60">
          {content}
        </Link>
        {compact && !item.isRead ? (
          <form action={markNotificationReadAction} className="sr-only">
            <input type="hidden" name="notificationId" value={item.id} />
            <input type="hidden" name="currentPath" value={currentPath} />
            <button type="submit">{labels.markAsRead}</button>
          </form>
        ) : null}
      </li>
    );
  }

  return <li className={rowClass}>{content}</li>;
}

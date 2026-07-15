"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { NotificationItemRow } from "@/app/components/notifications/notification-item-row";
import { buttons } from "@/lib/constants/styles";
import { groupNotificationsByDate, type NotificationDateGroup } from "@/lib/notifications/grouping";
import { loadNotificationsPageAction, markAllNotificationsReadAction } from "@/lib/supabase/notification-actions";
import type { Dictionary } from "@/lib/i18n/types";
import type { NotificationItem, NotificationsPageResult } from "@/types/community";

type NotificationsInboxProps = {
  initialResult: NotificationsPageResult;
  labels: Dictionary["notificationsPage"];
  dictionary: Dictionary;
  locale: string;
  unreadOnly: boolean;
  pathname: string;
  preferencesPath?: string;
};

function dateGroupLabel(dictionary: Dictionary, group: NotificationDateGroup): string {
  const labels = dictionary.notificationsPage;
  switch (group) {
    case "today":
      return labels.groupToday;
    case "yesterday":
      return labels.groupYesterday;
    case "thisWeek":
      return labels.groupThisWeek;
    default:
      return labels.groupEarlier;
  }
}

export function NotificationsInbox({
  initialResult,
  labels,
  dictionary,
  locale,
  unreadOnly,
  pathname,
  preferencesPath = "/account/notification-preferences",
}: NotificationsInboxProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialResult.notifications);
  const [page, setPage] = useState(initialResult.page);
  const [hasMore, setHasMore] = useState(initialResult.hasMore);
  const [unreadCount, setUnreadCount] = useState(initialResult.unreadCount);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const currentPath = unreadOnly
    ? `${pathname}?filter=unread${page > 1 ? `&page=${page}` : ""}`
    : page > 1
      ? `${pathname}?page=${page}`
      : pathname;

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const nextPage = page + 1;
      const result = await loadNotificationsPageAction({ page: nextPage, unreadOnly });
      setNotifications((prev) => {
        const seen = new Set(prev.map((item) => item.id));
        const merged = [...prev];
        for (const item of result.notifications) {
          if (!seen.has(item.id)) merged.push(item);
        }
        return merged;
      });
      setPage(result.page);
      setHasMore(result.hasMore);
      setUnreadCount(result.unreadCount);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, page, unreadOnly]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          void loadMore();
        }
      },
      { rootMargin: "240px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  const sections = groupNotificationsByDate(notifications);

  return (
    <div className="mt-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link
            href={pathname}
            aria-current={!unreadOnly ? "page" : undefined}
            className={`rounded-full px-3 py-1.5 transition-colors ${
              !unreadOnly ? "bg-amber-950/40 text-amber-200" : "text-stone-500 hover:text-stone-300"
            }`}
          >
            {labels.allNotifications}
          </Link>
          <Link
            href={`${pathname}?filter=unread`}
            aria-current={unreadOnly ? "page" : undefined}
            className={`rounded-full px-3 py-1.5 transition-colors ${
              unreadOnly ? "bg-amber-950/40 text-amber-200" : "text-stone-500 hover:text-stone-300"
            }`}
          >
            {labels.unreadOnly}
            {unreadCount > 0 ? <span className="ms-1.5 text-xs text-amber-400">({unreadCount})</span> : null}
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href={preferencesPath} className={`${buttons.secondary} h-9 min-w-0 px-4 text-xs`}>
            {labels.preferencesCta}
          </Link>
          {unreadCount > 0 ? (
            <form
              action={markAllNotificationsReadAction}
              onSubmit={() => {
                setUnreadCount(0);
                setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
              }}
            >
              <input type="hidden" name="currentPath" value={currentPath} />
              <button type="submit" className={`${buttons.secondary} h-9 min-w-0 px-4 text-xs`}>
                {labels.markAllRead}
              </button>
            </form>
          ) : null}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="mt-6 rounded-[1.5rem] border border-white/[0.09] bg-white/[0.03] px-8 py-16 text-center">
          <p className="text-lg font-medium text-stone-100">{labels.emptyTitle}</p>
          <p className="mt-2 text-sm text-stone-500">{labels.emptyDescription}</p>
        </div>
      ) : (
        <div className="mt-6 space-y-8" aria-busy={isLoadingMore}>
          {sections.map((section) => (
            <section key={section.group} aria-labelledby={`notifications-group-${section.group}`}>
              <h2
                id={`notifications-group-${section.group}`}
                className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-stone-500"
              >
                {dateGroupLabel(dictionary, section.group)}
              </h2>
              <div className="overflow-hidden rounded-[1.5rem] border border-white/[0.09] bg-white/[0.03]">
                <ul className="divide-y divide-white/[0.07]">
                  {section.items.map((item) => (
                    <NotificationItemRow
                      key={item.id}
                      item={item}
                      labels={labels}
                      dictionary={dictionary}
                      locale={locale}
                      currentPath={currentPath}
                    />
                  ))}
                </ul>
              </div>
            </section>
          ))}

          {hasMore ? (
            <div ref={sentinelRef} className="flex justify-center py-4" aria-hidden={!isLoadingMore}>
              {isLoadingMore ? (
                <p className="text-sm text-stone-500">{labels.loadingMore}</p>
              ) : (
                <p className="text-sm text-stone-600">{labels.loadMoreHint}</p>
              )}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

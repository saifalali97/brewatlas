"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useTransition } from "react";
import { NotificationItemRow } from "@/app/components/notifications/notification-item-row";
import { buttons } from "@/lib/constants/styles";
import { markAllNotificationsReadAction } from "@/lib/supabase/notification-actions";
import type { Dictionary } from "@/lib/i18n/types";
import type { NotificationsPageResult } from "@/types/community";

type NotificationsPanelProps = {
  result: NotificationsPageResult;
  labels: Dictionary["notificationsPage"];
  dictionary: Dictionary;
  locale: string;
  unreadOnly: boolean;
};

export function NotificationsPanel({
  result,
  labels,
  dictionary,
  locale,
  unreadOnly,
}: NotificationsPanelProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const totalPages = Math.max(1, Math.ceil(result.totalCount / result.pageSize));
  const currentPath = unreadOnly
    ? `${pathname}?filter=unread${result.page > 1 ? `&page=${result.page}` : ""}`
    : result.page > 1
      ? `${pathname}?page=${result.page}`
      : pathname;

  const goToPage = useCallback(
    (page: number) => {
      const params = new URLSearchParams();
      if (unreadOnly) params.set("filter", "unread");
      if (page > 1) params.set("page", String(page));
      const query = params.toString();
      startTransition(() => {
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
      });
    },
    [pathname, router, unreadOnly],
  );

  return (
    <div className="mt-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 text-sm">
          <Link
            href="/dashboard/notifications"
            aria-current={!unreadOnly ? "page" : undefined}
            className={`rounded-full px-3 py-1.5 transition-colors ${
              !unreadOnly ? "bg-amber-950/40 text-amber-200" : "text-stone-500 hover:text-stone-300"
            }`}
          >
            {labels.allNotifications}
          </Link>
          <Link
            href="/dashboard/notifications?filter=unread"
            aria-current={unreadOnly ? "page" : undefined}
            className={`rounded-full px-3 py-1.5 transition-colors ${
              unreadOnly ? "bg-amber-950/40 text-amber-200" : "text-stone-500 hover:text-stone-300"
            }`}
          >
            {labels.unreadOnly}
            {result.unreadCount > 0 ? (
              <span className="ms-1.5 text-xs text-amber-400">({result.unreadCount})</span>
            ) : null}
          </Link>
        </div>

        {result.unreadCount > 0 ? (
          <form action={markAllNotificationsReadAction}>
            <input type="hidden" name="currentPath" value={currentPath} />
            <button type="submit" className={`${buttons.secondary} h-9 min-w-0 px-4 text-xs`}>
              {labels.markAllRead}
            </button>
          </form>
        ) : null}
      </div>

      {result.notifications.length === 0 ? (
        <div className="mt-6 rounded-[1.5rem] border border-white/[0.09] bg-white/[0.03] px-8 py-16 text-center">
          <p className="text-lg font-medium text-stone-100">{labels.emptyTitle}</p>
          <p className="mt-2 text-sm text-stone-500">{labels.emptyDescription}</p>
        </div>
      ) : (
        <div
          className={`mt-6 overflow-hidden rounded-[1.5rem] border border-white/[0.09] bg-white/[0.03] ${isPending ? "opacity-70" : ""}`}
          aria-busy={isPending}
        >
          <ul className="divide-y divide-white/[0.07]">
            {result.notifications.map((item) => (
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
      )}

      {totalPages > 1 ? (
        <nav
          className="mt-8 flex items-center justify-center gap-4"
          aria-label={labels.paginationAria}
        >
          <button
            type="button"
            disabled={result.page <= 1 || isPending}
            onClick={() => goToPage(result.page - 1)}
            className="text-sm font-medium text-stone-400 transition-colors hover:text-stone-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {labels.previousPage}
          </button>
          <span className="text-sm text-stone-500">
            {result.page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={result.page >= totalPages || isPending}
            onClick={() => goToPage(result.page + 1)}
            className="text-sm font-medium text-stone-400 transition-colors hover:text-stone-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {labels.nextPage}
          </button>
        </nav>
      ) : null}
    </div>
  );
}

"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { DebugErrorBoundary } from "@/app/components/debug/debug-error-boundary";
import { DebugMountLogger } from "@/app/components/debug/debug-mount-logger";
import { NotificationItemRow } from "@/app/components/notifications/notification-item-row";
import { useNotificationRealtime } from "@/lib/notifications/realtime";
import { markAllNotificationsReadAction } from "@/lib/supabase/notification-actions";
import type { Dictionary } from "@/lib/i18n/types";
import type { NotificationItem } from "@/types/community";

type NotificationsBellProps = {
  userId: string;
  initialUnreadCount: number;
  initialNotifications: NotificationItem[];
  labels: Dictionary["notificationsPage"];
  dictionary: Dictionary;
  locale: string;
  notificationsPath?: string;
};

export function NotificationsBell({
  userId,
  initialUnreadCount,
  initialNotifications,
  labels,
  dictionary,
  locale,
  notificationsPath = "/account/notifications",
}: NotificationsBellProps) {
  const menuId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [notifications, setNotifications] = useState(initialNotifications);

  const handleInsert = useCallback((item: NotificationItem) => {
    setNotifications((prev) => {
      if (prev.some((entry) => entry.id === item.id)) return prev;
      return [item, ...prev].slice(0, 8);
    });
    setUnreadCount((count) => count + 1);
  }, []);

  useNotificationRealtime(userId, handleInsert);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [open]);

  const badgeLabel =
    unreadCount > 0
      ? labels.unreadBadgeAria.replace("{count}", String(Math.min(unreadCount, 99)))
      : labels.bellAriaLabel;

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.03] text-stone-300 transition-colors hover:border-white/[0.14] hover:text-stone-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500/60"
        aria-label={badgeLabel}
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        <Bell className="h-4 w-4" aria-hidden />
        {unreadCount > 0 ? (
          <span className="absolute -end-1 -top-1 flex h-[1.125rem] min-w-[1.125rem] items-center justify-center rounded-full bg-amber-600 px-1 text-[0.625rem] font-semibold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          ref={panelRef}
          id={menuId}
          role="region"
          aria-label={labels.dropdownAriaLabel}
          className="absolute end-0 z-50 mt-2 w-[min(22rem,calc(100vw-2.5rem))] overflow-hidden rounded-2xl border border-white/[0.1] bg-[#120c09]/95 shadow-[0_24px_56px_-16px_rgba(0,0,0,0.65)] backdrop-blur-2xl"
        >
          <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] px-4 py-3">
            <p className="text-sm font-medium text-stone-100">{labels.panelTitle}</p>
            {unreadCount > 0 ? (
              <form
                action={markAllNotificationsReadAction}
                onSubmit={() => {
                  setUnreadCount(0);
                  setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
                }}
              >
                <input type="hidden" name="currentPath" value={notificationsPath} />
                <button
                  type="submit"
                  className="text-xs font-medium text-amber-400/90 underline-offset-4 hover:underline"
                >
                  {labels.markAllRead}
                </button>
              </form>
            ) : null}
          </div>

          {notifications.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-stone-500">{labels.emptyDescription}</p>
          ) : (
            <ul className="max-h-80 divide-y divide-white/[0.06] overflow-y-auto">
              {notifications.map((item) => (
                <DebugErrorBoundary key={item.id} name={`NotificationItemRow:${item.id}`}>
                  <DebugMountLogger name={`NotificationItemRow:${item.id}`}>
                    <NotificationItemRow
                      item={item}
                      labels={labels}
                      dictionary={dictionary}
                      locale={locale}
                      currentPath={notificationsPath}
                      compact
                    />
                  </DebugMountLogger>
                </DebugErrorBoundary>
              ))}
            </ul>
          )}

          <div className="border-t border-white/[0.08] px-4 py-3">
            <Link
              href={notificationsPath}
              className="block text-center text-xs font-medium text-amber-400/90 underline-offset-4 hover:underline"
              onClick={() => setOpen(false)}
            >
              {labels.viewAll}
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { NotificationItem } from "@/types/community";

type DbNotificationPayload = {
  id: string;
  user_id: string;
  notification_type: string;
  message: string;
  title: string | null;
  metadata: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
};

function mapRealtimeRow(row: DbNotificationPayload): NotificationItem {
  return {
    id: row.id,
    notificationType: row.notification_type,
    actor: null,
    recipe: null,
    badge: null,
    title: row.title,
    message: row.message,
    metadata: row.metadata ?? {},
    isRead: row.is_read,
    createdAt: row.created_at,
  };
}

/**
 * Subscribes to new notifications for the signed-in user via Supabase Realtime.
 * Gracefully no-ops when Realtime is unavailable (e.g. publication not enabled).
 */
export function useNotificationRealtime(
  userId: string | null,
  onInsert: (item: NotificationItem) => void,
): void {
  useEffect(() => {
    if (!userId) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "user_notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const row = payload.new as DbNotificationPayload;
          onInsert(mapRealtimeRow(row));
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, onInsert]);
}

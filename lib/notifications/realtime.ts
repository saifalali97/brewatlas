"use client";

import { useEffect, useRef } from "react";
import type { RealtimeChannel } from "@supabase/supabase-js";
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

function isWebSocketAvailable(): boolean {
  if (typeof window === "undefined") return false;

  try {
    return typeof WebSocket !== "undefined";
  } catch {
    return false;
  }
}

function isRealtimeUnavailableError(error: unknown): boolean {
  if (error instanceof DOMException) {
    return error.name === "SecurityError" || error.name === "NotSupportedError";
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("securityerror") ||
      message.includes("content security policy") ||
      message.includes("websocket") ||
      message.includes("failed to construct")
    );
  }

  return false;
}

function safeRemoveChannel(
  supabase: ReturnType<typeof createClient>,
  channel: RealtimeChannel,
): void {
  void supabase.removeChannel(channel).catch(() => {
    // Realtime may already be torn down when WebSocket/CSP blocked the connection.
  });
}

/**
 * Subscribes to new notifications for the signed-in user via Supabase Realtime.
 * Never throws — if WebSocket or Realtime is unavailable (Safari CSP, offline,
 * publication disabled), the hook no-ops and the page continues to render.
 */
export function useNotificationRealtime(
  userId: string | null,
  onInsert: (item: NotificationItem) => void,
): void {
  const onInsertRef = useRef(onInsert);

  useEffect(() => {
    onInsertRef.current = onInsert;
  }, [onInsert]);

  useEffect(() => {
    if (!userId || !isWebSocketAvailable()) return;

    let supabase: ReturnType<typeof createClient> | null = null;
    let channel: RealtimeChannel | null = null;
    let active = true;

    const teardown = () => {
      if (supabase && channel) {
        safeRemoveChannel(supabase, channel);
      }
      channel = null;
    };

    try {
      supabase = createClient();
      channel = supabase
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
            if (!active) return;

            try {
              const row = payload.new as DbNotificationPayload;
              onInsertRef.current(mapRealtimeRow(row));
            } catch {
              // Ignore malformed payloads — do not break the notification UI.
            }
          },
        )
        .subscribe((status, error) => {
          if (!active) return;

          if (status === "SUBSCRIBED") return;

          if (
            status === "CHANNEL_ERROR" ||
            status === "TIMED_OUT" ||
            status === "CLOSED" ||
            (error && isRealtimeUnavailableError(error))
          ) {
            teardown();
          }
        });
    } catch {
      teardown();
    }

    return () => {
      active = false;
      teardown();
    };
  }, [userId]);
}

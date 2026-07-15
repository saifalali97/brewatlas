import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

const RETENTION_DAYS = 90;

/** Returns true when this Stripe event id was already processed. */
export async function isStripeWebhookEventProcessed(
  admin: SupabaseClient,
  eventId: string,
): Promise<boolean> {
  const { data, error } = await admin
    .from("stripe_webhook_events")
    .select("id")
    .eq("id", eventId)
    .maybeSingle();

  if (error) {
    console.error("isStripeWebhookEventProcessed failed", error);
    return false;
  }

  return Boolean(data);
}

/** Records a processed Stripe event id for idempotent webhook handling. */
export async function recordStripeWebhookEvent(
  admin: SupabaseClient,
  eventId: string,
  eventType: string,
): Promise<void> {
  const { error } = await admin.from("stripe_webhook_events").insert({
    id: eventId,
    event_type: eventType,
  });

  if (error && error.code !== "23505") {
    console.error("recordStripeWebhookEvent failed", error);
  }
}

/** Removes webhook idempotency rows older than the retention window. */
export async function pruneStripeWebhookEvents(admin: SupabaseClient): Promise<void> {
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const { error } = await admin.from("stripe_webhook_events").delete().lt("processed_at", cutoff);

  if (error) {
    console.error("pruneStripeWebhookEvents failed", error);
  }
}

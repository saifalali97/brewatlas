"use client";

type AiCoachAnalyticsEventName =
  | "chat_started"
  | "recipe_generated"
  | "brew_analyzed"
  | "session_saved"
  | "quick_action_clicked"
  | "premium_upgrade_click";

/** Client-side AI Coach analytics — fires events to server action or console in dev. */
export function trackAiCoachEvent(event: AiCoachAnalyticsEventName, data?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;

  const payload = { event, data: data ?? {}, timestamp: new Date().toISOString() };

  if (process.env.NODE_ENV === "development") {
    console.debug("[AI Coach Analytics]", payload);
  }

  window.dispatchEvent(new CustomEvent("ai-coach-analytics", { detail: payload }));
}

export type { AiCoachAnalyticsEventName };

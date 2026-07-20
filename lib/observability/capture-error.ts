import "server-only";

import { logError } from "@/lib/observability/logger";

export type ErrorCaptureContext = {
  source: string;
  digest?: string;
  [key: string]: unknown;
};

function normalizeError(error: unknown): Error {
  if (error instanceof Error) return error;
  return new Error(typeof error === "string" ? error : "Unknown error");
}

async function notifyErrorWebhook(error: Error, context: ErrorCaptureContext): Promise<void> {
  const webhookUrl = process.env.ERROR_REPORTING_WEBHOOK_URL?.trim();
  if (!webhookUrl) return;

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(5_000),
    });
  } catch {
    // Reporting must never break the request path.
  }
}

/** Structured server-side error capture for API routes, actions, and instrumentation. */
export function captureError(error: unknown, context: ErrorCaptureContext): void {
  const normalized = normalizeError(error);

  logError(normalized.message, {
    ...context,
    name: normalized.name,
    stack: normalized.stack,
  });

  void notifyErrorWebhook(normalized, context);
}

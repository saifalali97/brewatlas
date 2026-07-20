"use server";

import { captureError } from "@/lib/observability/capture-error";

export type ClientErrorReport = {
  message: string;
  digest?: string;
  stack?: string;
  pathname?: string;
};

/** Accepts client error-boundary reports and forwards them to structured logging. */
export async function reportClientErrorAction(payload: ClientErrorReport): Promise<void> {
  const message = payload.message.trim().slice(0, 500);
  if (!message) return;

  const error = new Error(message);
  if (payload.stack) {
    error.stack = payload.stack.slice(0, 2_000);
  }

  captureError(error, {
    source: "client.error-boundary",
    digest: payload.digest,
    pathname: payload.pathname,
  });
}

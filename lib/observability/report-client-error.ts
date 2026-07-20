"use client";

import { reportClientErrorAction } from "@/lib/observability/report-client-error-action";

/** Reports a client runtime error to the server without changing UI behavior. */
export function reportClientError(error: Error & { digest?: string }): void {
  void reportClientErrorAction({
    message: error.message,
    digest: error.digest,
    stack: error.stack,
    pathname: typeof window !== "undefined" ? window.location.pathname : undefined,
  });
}

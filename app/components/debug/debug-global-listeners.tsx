"use client";

import { useEffect } from "react";
import { logSafariCrash } from "@/lib/debug/safari-crash-debug";

/**
 * TEMPORARY — logs uncaught window errors and unhandled promise rejections.
 */
export function DebugGlobalListeners() {
  useEffect(() => {
    const onError = (event: ErrorEvent) => {
      logSafariCrash(
        "window.error",
        event.error ?? new Error(event.message),
        event.filename ? `at ${event.filename}:${event.lineno}:${event.colno}` : null,
      );
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      logSafariCrash("window.unhandledrejection", event.reason);
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);

    console.error("[DEBUG] Global error listeners attached");

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  return null;
}

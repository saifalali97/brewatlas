"use client";

import { useEffect } from "react";

/**
 * Registers `public/sw.js` (PWA requirement 4). Renders nothing --
 * purely a side-effect component, so it never touches layout, spacing,
 * or the visible component hierarchy.
 *
 * Skipped outside production: caching build output during local dev
 * would fight Fast Refresh and serve stale chunks after every save.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch((error) => {
        console.error("Service worker registration failed:", error);
      });
    };

    window.addEventListener("load", register);
    return () => window.removeEventListener("load", register);
  }, []);

  return null;
}

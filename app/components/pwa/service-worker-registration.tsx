"use client";

import { useEffect } from "react";

function isPrivateNetworkHost(hostname: string) {
  return (
    hostname === "localhost" ||
    hostname.endsWith(".local") ||
    /^127\./.test(hostname) ||
    /^192\.168\./.test(hostname) ||
    /^10\./.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(hostname)
  );
}

/**
 * Registers `public/sw.js` (PWA requirement 4). Renders nothing --
 * purely a side-effect component, so it never touches layout, spacing,
 * or the visible component hierarchy.
 *
 * Skipped outside production and on LAN/private hosts so local
 * `next start -H 0.0.0.0` iPhone testing is never cached or intercepted
 * by a service worker.
 */
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    if (isPrivateNetworkHost(window.location.hostname)) return;

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

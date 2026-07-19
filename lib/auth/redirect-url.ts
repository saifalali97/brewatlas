import { getSiteUrl } from "@/lib/seo/site";

function safeNextPath(next: string): string {
  return next.startsWith("/") && !next.startsWith("//") ? next : "/account";
}

/**
 * Auth callback URL for server-initiated redirects (email confirm, password reset).
 * Uses the configured public site URL in production.
 */
export function buildAuthCallbackUrl(next = "/account"): string {
  return `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(safeNextPath(next))}`;
}

/**
 * Auth callback URL for browser-initiated OAuth (uses the current origin so local dev works).
 */
export function buildAuthCallbackUrlFromOrigin(origin: string, next = "/account"): string {
  const base = origin.replace(/\/$/, "");
  return `${base}/auth/callback?next=${encodeURIComponent(safeNextPath(next))}`;
}

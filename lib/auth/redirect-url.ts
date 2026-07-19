import { getSiteUrl } from "@/lib/seo/site";

function safeNextPath(next: string): string {
  return next.startsWith("/") && !next.startsWith("//") ? next : "/account";
}

/**
 * Builds the auth callback URL Supabase should redirect to after email confirm / OAuth.
 *
 * For SSR email confirm, Supabase email templates must link with token_hash (not
 * ConfirmationURL alone), e.g.:
 * `<a href="{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=signup">Confirm</a>`
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

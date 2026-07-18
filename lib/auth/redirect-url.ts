import { getSiteUrl } from "@/lib/seo/site";

/**
 * Builds the auth callback URL Supabase should redirect to after email confirm / OAuth.
 *
 * For SSR email confirm, Supabase email templates must link with token_hash (not
 * ConfirmationURL alone), e.g.:
 * `<a href="{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=signup">Confirm</a>`
 */
export function buildAuthCallbackUrl(next = "/account"): string {
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/account";
  return `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(safeNext)}`;
}

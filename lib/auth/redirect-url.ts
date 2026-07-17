import { getSiteUrl } from "@/lib/seo/site";

/** Builds the auth callback URL Supabase should redirect to after email confirm / OAuth. */
export function buildAuthCallbackUrl(next = "/account"): string {
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/account";
  return `${getSiteUrl()}/auth/callback?next=${encodeURIComponent(safeNext)}`;
}

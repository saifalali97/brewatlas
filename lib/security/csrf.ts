import { getSiteUrl } from "@/lib/seo/site";

function normalizeOrigin(value: string): string {
  return value.replace(/\/$/, "");
}

/** Returns allowed origins for same-site API requests (production + local dev). */
export function getAllowedOrigins(): Set<string> {
  const siteUrl = getSiteUrl();
  const origins = new Set<string>([normalizeOrigin(siteUrl)]);

  if (process.env.NODE_ENV !== "production") {
    origins.add("http://localhost:3000");
    origins.add("http://127.0.0.1:3000");
  }

  return origins;
}

/** Validates Origin/Referer headers against allowed site origins. */
export function verifySameOriginHeaders(origin: string | null, referer: string | null): boolean {
  if (origin) {
    return getAllowedOrigins().has(normalizeOrigin(origin));
  }

  if (referer) {
    try {
      const refererOrigin = normalizeOrigin(new URL(referer).origin);
      return getAllowedOrigins().has(refererOrigin);
    } catch {
      return false;
    }
  }

  // Non-browser clients (Stripe webhooks, cron) omit Origin/Referer.
  return false;
}

/**
 * Validates that a mutating API request originates from this site.
 * Stripe webhooks are excluded — they use signature verification instead.
 */
export function verifySameOrigin(request: Request): boolean {
  return verifySameOriginHeaders(request.headers.get("origin"), request.headers.get("referer"));
}

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitBucket>();

export type RateLimitConfig = {
  /** Unique namespace for this limiter (e.g. "webhook", "auth"). */
  namespace: string;
  /** Max requests allowed within the window. */
  limit: number;
  /** Window size in milliseconds. */
  windowMs: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

/**
 * Lightweight in-memory sliding-window rate limiter for API routes and proxy.
 * Resets on cold starts — pair with platform-level limits in production.
 */
export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const bucketKey = `${config.namespace}:${key}`;
  const now = Date.now();
  const existing = buckets.get(bucketKey);

  if (!existing || now >= existing.resetAt) {
    const resetAt = now + config.windowMs;
    buckets.set(bucketKey, { count: 1, resetAt });
    return { allowed: true, remaining: config.limit - 1, resetAt };
  }

  if (existing.count >= config.limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  buckets.set(bucketKey, existing);
  return { allowed: true, remaining: config.limit - existing.count, resetAt: existing.resetAt };
}

export function getClientIp(request: Request | { headers: Headers; ip?: string | null }): string {
  if ("ip" in request && request.ip) return request.ip;

  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "unknown";
}

export const RATE_LIMITS = {
  stripeWebhook: { namespace: "stripe-webhook", limit: 120, windowMs: 60_000 },
  apiRoute: { namespace: "api", limit: 60, windowMs: 60_000 },
  authPage: { namespace: "auth-page", limit: 30, windowMs: 60_000 },
  contactForm: { namespace: "contact-form", limit: 5, windowMs: 60 * 60 * 1000 },
} as const satisfies Record<string, RateLimitConfig>;

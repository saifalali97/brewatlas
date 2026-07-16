/**
 * Centralized environment variable validation for BrewAtlas.
 * Called from instrumentation on server boot; helpers expose typed accessors.
 */

export type EnvValidationResult =
  | { ok: true; warnings?: string[] }
  | {
      ok: false;
      missing: string[];
      warnings: string[];
    };

function isNonEmpty(value: string | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function getBillingProvider(): "manual" | "stripe" {
  const provider = process.env.BILLING_PROVIDER ?? "manual";
  return provider === "stripe" ? "stripe" : "manual";
}

/** Validates required and optional env vars. In strict mode, throws on missing required keys. */
export function validateEnvironment(options: { strict?: boolean } = {}): EnvValidationResult {
  const missing: string[] = [];
  const warnings: string[] = [];

  if (!isNonEmpty(process.env.NEXT_PUBLIC_SUPABASE_URL)) {
    missing.push("NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!isNonEmpty(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)) {
    missing.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  }

  if (getBillingProvider() === "stripe") {
    for (const key of [
      "STRIPE_SECRET_KEY",
      "STRIPE_WEBHOOK_SECRET",
      "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
      "STRIPE_PRICE_PREMIUM_MONTHLY",
      "STRIPE_PRICE_PREMIUM_YEARLY",
    ]) {
      if (!isNonEmpty(process.env[key])) missing.push(key);
    }
    if (!isNonEmpty(process.env.SUPABASE_SERVICE_ROLE_KEY)) {
      missing.push("SUPABASE_SERVICE_ROLE_KEY");
    }
  }

  if (process.env.NODE_ENV === "production") {
    if (!isNonEmpty(process.env.NEXT_PUBLIC_SITE_URL)) {
      warnings.push("NEXT_PUBLIC_SITE_URL should be set in production for SEO and Stripe redirects.");
    } else if (process.env.NEXT_PUBLIC_SITE_URL.startsWith("http://")) {
      warnings.push("NEXT_PUBLIC_SITE_URL should use HTTPS in production.");
    }
    if (!isNonEmpty(process.env.BREWATLAS_INITIAL_ADMIN_EMAIL)) {
      warnings.push("BREWATLAS_INITIAL_ADMIN_EMAIL should be set in production to bootstrap your admin account.");
    }
    if (!isNonEmpty(process.env.SUPABASE_SERVICE_ROLE_KEY)) {
      warnings.push("SUPABASE_SERVICE_ROLE_KEY is required for admin bootstrap and billing webhooks.");
    }
  }

  if (missing.length > 0) {
    const result: EnvValidationResult = { ok: false, missing, warnings };
    if (options.strict) {
      throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
    }
    return result;
  }

  if (warnings.length > 0 && process.env.NODE_ENV === "production") {
    console.warn("[env] warnings:", warnings.join(" "));
  }

  return warnings.length > 0 ? { ok: true, warnings } : { ok: true };
}

export function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not configured.");
  return url;
}

export function getSupabasePublishableKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!key) throw new Error("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is not configured.");
  return key;
}

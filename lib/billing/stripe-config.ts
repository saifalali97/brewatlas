import type { BillingInterval } from "@/types/billing";

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);
}

export function getStripeSecretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured.");
  return key;
}

export function getStripeWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET is not configured.");
  return secret;
}

export function getStripePriceId(interval: BillingInterval): string {
  const priceId =
    interval === "year"
      ? process.env.STRIPE_PRICE_PREMIUM_YEARLY
      : process.env.STRIPE_PRICE_PREMIUM_MONTHLY;

  if (!priceId) {
    throw new Error(
      interval === "year"
        ? "STRIPE_PRICE_PREMIUM_YEARLY is not configured."
        : "STRIPE_PRICE_PREMIUM_MONTHLY is not configured.",
    );
  }

  return priceId;
}

export function getSiteBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

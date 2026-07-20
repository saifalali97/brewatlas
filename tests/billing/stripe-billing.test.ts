import { afterEach, describe, expect, it } from "vitest";
import { isStripeBillingEnabled } from "@/lib/billing/billing-adapter";

describe("isStripeBillingEnabled", () => {
  const originalProvider = process.env.BILLING_PROVIDER;
  const originalSecret = process.env.STRIPE_SECRET_KEY;

  afterEach(() => {
    if (originalProvider === undefined) {
      delete process.env.BILLING_PROVIDER;
    } else {
      process.env.BILLING_PROVIDER = originalProvider;
    }

    if (originalSecret === undefined) {
      delete process.env.STRIPE_SECRET_KEY;
    } else {
      process.env.STRIPE_SECRET_KEY = originalSecret;
    }
  });

  it("returns false when billing provider is manual", () => {
    process.env.BILLING_PROVIDER = "manual";
    process.env.STRIPE_SECRET_KEY = "sk_test";
    expect(isStripeBillingEnabled()).toBe(false);
  });

  it("returns false when Stripe is selected but secret key is missing", () => {
    process.env.BILLING_PROVIDER = "stripe";
    delete process.env.STRIPE_SECRET_KEY;
    expect(isStripeBillingEnabled()).toBe(false);
  });

  it("returns true when Stripe provider and secret key are configured", () => {
    process.env.BILLING_PROVIDER = "stripe";
    process.env.STRIPE_SECRET_KEY = "sk_test";
    expect(isStripeBillingEnabled()).toBe(true);
  });
});

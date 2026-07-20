import { afterEach, describe, expect, it } from "vitest";
import { isStripeBillingEnabled } from "@/lib/billing/billing-adapter";
import { isPlanAtLeast } from "@/lib/membership/plans";
import type { MembershipPlan } from "@/types/membership";

/** Mirrors the guard used in membership actions and `changeUserPlan`. */
function isManualPremiumUpgradeBlocked(plan: MembershipPlan): boolean {
  return isStripeBillingEnabled() && isPlanAtLeast(plan, "premium");
}

describe("membership stripe guards", () => {
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

  it("blocks manual premium and enterprise upgrades when Stripe is active", () => {
    process.env.BILLING_PROVIDER = "stripe";
    process.env.STRIPE_SECRET_KEY = "sk_test";

    expect(isManualPremiumUpgradeBlocked("premium")).toBe(true);
    expect(isManualPremiumUpgradeBlocked("enterprise")).toBe(true);
    expect(isManualPremiumUpgradeBlocked("free")).toBe(false);
  });

  it("allows manual premium upgrades when billing is manual", () => {
    process.env.BILLING_PROVIDER = "manual";
    delete process.env.STRIPE_SECRET_KEY;

    expect(isManualPremiumUpgradeBlocked("premium")).toBe(false);
    expect(isManualPremiumUpgradeBlocked("enterprise")).toBe(false);
  });
});

describe("isPlanAtLeast", () => {
  it("orders plans from free through enterprise", () => {
    expect(isPlanAtLeast("free", "free")).toBe(true);
    expect(isPlanAtLeast("premium", "free")).toBe(true);
    expect(isPlanAtLeast("enterprise", "premium")).toBe(true);
    expect(isPlanAtLeast("free", "premium")).toBe(false);
  });
});

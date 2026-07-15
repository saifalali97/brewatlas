import type { BillingCancelRequest, BillingCancelResult, BillingCheckoutRequest, BillingCheckoutResult, BillingPortalRequest, BillingPortalResult } from "@/types/billing";
import type { BillingProvider } from "@/types/membership";
import { BillingNotConfiguredError } from "@/lib/billing/errors";
import { StripeBillingAdapter } from "@/lib/billing/stripe-billing-adapter";

export { BillingNotConfiguredError };

/** Safe default adapter: implements the interface, never calls out, always throws a clear, catchable error. */
export class NullBillingAdapter {
  readonly provider: BillingProvider = "manual";

  async createCheckout(request: BillingCheckoutRequest): Promise<BillingCheckoutResult> {
    void request;
    throw new BillingNotConfiguredError("manual");
  }

  async cancel(request: BillingCancelRequest): Promise<BillingCancelResult> {
    void request;
    throw new BillingNotConfiguredError("manual");
  }

  async createBillingPortal(request: BillingPortalRequest): Promise<BillingPortalResult> {
    void request;
    throw new BillingNotConfiguredError("manual");
  }
}

export class ManualBillingAdapter extends NullBillingAdapter {
  readonly provider: BillingProvider = "manual";
}

export class ApplePayBillingAdapter extends NullBillingAdapter {
  readonly provider: BillingProvider = "apple_pay";
}

export class GooglePayBillingAdapter extends NullBillingAdapter {
  readonly provider: BillingProvider = "google_pay";
}

export type BillingAdapterLike = {
  readonly provider: BillingProvider;
  createCheckout(request: BillingCheckoutRequest): Promise<BillingCheckoutResult>;
  cancel(request: BillingCancelRequest): Promise<BillingCancelResult>;
  createBillingPortal?(request: BillingPortalRequest): Promise<BillingPortalResult>;
};

export function getBillingAdapter(): BillingAdapterLike {
  const provider = (process.env.BILLING_PROVIDER ?? "manual").toLowerCase() as BillingProvider;

  switch (provider) {
    case "stripe":
      return new StripeBillingAdapter(process.env.STRIPE_SECRET_KEY ?? null);
    case "apple_pay":
      return new ApplePayBillingAdapter();
    case "google_pay":
      return new GooglePayBillingAdapter();
    default:
      return new ManualBillingAdapter();
  }
}

export function isStripeBillingEnabled(): boolean {
  return (process.env.BILLING_PROVIDER ?? "manual").toLowerCase() === "stripe" && Boolean(process.env.STRIPE_SECRET_KEY);
}

import type { BillingCheckoutRequest, BillingCheckoutResult, BillingAdapter, BillingCancelRequest, BillingCancelResult } from "@/types/billing";
import type { BillingProvider } from "@/types/membership";

/**
 * Billing Abstraction (requirement 7): an adapter pattern so BrewAtlas
 * can later plug in real Stripe / Apple Pay / Google Pay checkout --
 * or keep using manual/admin-applied plan changes -- without changing
 * `lib/supabase/membership-actions.ts` or any other calling code.
 * Mirrors `lib/ai/llm-adapter.ts` exactly.
 *
 * IMPORTANT: none of the adapters below call an external API or SDK.
 * Every `createCheckout`/`cancel` implementation is a clearly-labeled
 * stub that throws `BillingNotConfiguredError`. `upgradePlan()` /
 * `cancelSubscription()` in `lib/supabase/membership-actions.ts` do NOT
 * go through this adapter today -- they apply plan changes directly
 * (the "manual payment" path). Wiring up a real provider later means:
 * fill in one adapter's two methods, have that provider's webhook call
 * `changeUserPlan`/`cancelUserSubscription` on confirmed payment, and
 * point a checkout button at `getBillingAdapter().createCheckout(...)`.
 */

export class BillingNotConfiguredError extends Error {
  constructor(provider: BillingProvider) {
    super(
      provider === "manual"
        ? "Manual billing has no checkout flow -- plan changes are applied directly by lib/supabase/membership-actions.ts's upgradePlan()."
        : `The '${provider}' billing adapter is wired up structurally but does not call the real API yet -- this is intentional groundwork (see lib/billing/billing-adapter.ts).`,
    );
    this.name = "BillingNotConfiguredError";
  }
}

/** Safe default adapter: implements the interface, never calls out, always throws a clear, catchable error. Used when no real billing provider is configured (today's default -- membership changes are manual). */
export class NullBillingAdapter implements BillingAdapter {
  readonly provider: BillingProvider = "manual";

  async createCheckout(request: BillingCheckoutRequest): Promise<BillingCheckoutResult> {
    void request;
    throw new BillingNotConfiguredError("manual");
  }

  async cancel(request: BillingCancelRequest): Promise<BillingCancelResult> {
    void request;
    throw new BillingNotConfiguredError("manual");
  }
}

/**
 * Structural adapter for Stripe. Later: install the `stripe` package,
 * read `STRIPE_SECRET_KEY`, and implement `createCheckout` via
 * `stripe.checkout.sessions.create` and `cancel` via
 * `stripe.subscriptions.cancel` (or `update` with `cancel_at_period_end`) --
 * matching this exact interface so no calling code changes.
 */
export class StripeBillingAdapter implements BillingAdapter {
  readonly provider: BillingProvider = "stripe";
  constructor(private readonly apiKey: string | null) {}

  async createCheckout(request: BillingCheckoutRequest): Promise<BillingCheckoutResult> {
    void request;
    if (!this.apiKey) throw new BillingNotConfiguredError("stripe");
    throw new BillingNotConfiguredError("stripe");
  }

  async cancel(request: BillingCancelRequest): Promise<BillingCancelResult> {
    void request;
    if (!this.apiKey) throw new BillingNotConfiguredError("stripe");
    throw new BillingNotConfiguredError("stripe");
  }
}

/**
 * Structural adapter for Apple Pay (via StoreKit / In-App Purchase on
 * iOS, or the Apple Pay JS API on web). Later: verify the App Store
 * server notification / receipt server-side before calling
 * `changeUserPlan`, matching this interface.
 */
export class ApplePayBillingAdapter implements BillingAdapter {
  readonly provider: BillingProvider = "apple_pay";
  constructor(private readonly merchantId: string | null) {}

  async createCheckout(request: BillingCheckoutRequest): Promise<BillingCheckoutResult> {
    void request;
    if (!this.merchantId) throw new BillingNotConfiguredError("apple_pay");
    throw new BillingNotConfiguredError("apple_pay");
  }

  async cancel(request: BillingCancelRequest): Promise<BillingCancelResult> {
    void request;
    if (!this.merchantId) throw new BillingNotConfiguredError("apple_pay");
    throw new BillingNotConfiguredError("apple_pay");
  }
}

/**
 * Structural adapter for Google Pay (via Google Play Billing on
 * Android, or the Google Pay API on web). Later: verify the Play
 * Developer Notification / purchase token server-side before calling
 * `changeUserPlan`, matching this interface.
 */
export class GooglePayBillingAdapter implements BillingAdapter {
  readonly provider: BillingProvider = "google_pay";
  constructor(private readonly merchantId: string | null) {}

  async createCheckout(request: BillingCheckoutRequest): Promise<BillingCheckoutResult> {
    void request;
    if (!this.merchantId) throw new BillingNotConfiguredError("google_pay");
    throw new BillingNotConfiguredError("google_pay");
  }

  async cancel(request: BillingCancelRequest): Promise<BillingCancelResult> {
    void request;
    if (!this.merchantId) throw new BillingNotConfiguredError("google_pay");
    throw new BillingNotConfiguredError("google_pay");
  }
}

/**
 * The "manual" provider: an admin (or a demo/seed script) applies a
 * plan change directly via `upgradePlan()`, with no payment collected.
 * This is what BrewAtlas actually runs on today -- `createCheckout`
 * still throws, since manual billing has no checkout flow to create.
 */
export class ManualBillingAdapter implements BillingAdapter {
  readonly provider: BillingProvider = "manual";

  async createCheckout(request: BillingCheckoutRequest): Promise<BillingCheckoutResult> {
    void request;
    throw new BillingNotConfiguredError("manual");
  }

  async cancel(request: BillingCancelRequest): Promise<BillingCancelResult> {
    void request;
    throw new BillingNotConfiguredError("manual");
  }
}

const MERCHANT_ID_ENV_VARS: Record<"apple_pay" | "google_pay", string> = {
  apple_pay: "APPLE_PAY_MERCHANT_ID",
  google_pay: "GOOGLE_PAY_MERCHANT_ID",
};

/**
 * Returns the configured `BillingAdapter`, chosen via the
 * `BILLING_PROVIDER` environment variable ("stripe" | "apple_pay" |
 * "google_pay" | "manual"), defaulting to `ManualBillingAdapter` when
 * unset -- so membership changes work today with zero payment
 * configuration, and turning on real billing later is purely an
 * environment/config change plus filling in one adapter.
 */
export function getBillingAdapter(): BillingAdapter {
  const provider = (process.env.BILLING_PROVIDER ?? "manual").toLowerCase() as BillingProvider;

  switch (provider) {
    case "stripe":
      return new StripeBillingAdapter(process.env.STRIPE_SECRET_KEY ?? null);
    case "apple_pay":
      return new ApplePayBillingAdapter(process.env[MERCHANT_ID_ENV_VARS.apple_pay] ?? null);
    case "google_pay":
      return new GooglePayBillingAdapter(process.env[MERCHANT_ID_ENV_VARS.google_pay] ?? null);
    default:
      return new ManualBillingAdapter();
  }
}

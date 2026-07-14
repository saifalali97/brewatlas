import type { BillingProvider, MembershipPlan } from "@/types/membership";

/**
 * Types for the Billing Abstraction (requirement 7): a provider-agnostic
 * checkout/cancel interface that Stripe, Apple Pay, Google Pay, and a
 * manual/no-payment path can all implement. See
 * `lib/billing/billing-adapter.ts` -- nothing here calls a payment API;
 * this is architecture only, matching `types/ai.ts`'s `LLMAdapter`
 * pattern for the (also call-free) LLM adapter.
 */

export type BillingCheckoutRequest = {
  userId: string;
  plan: MembershipPlan;
  /** Where to send the user after a successful/canceled checkout, once a real provider redirects back. */
  successUrl?: string;
  cancelUrl?: string;
};

/** What a real checkout would hand back: a URL/token for the client to complete payment with, plus the opaque reference to store on `subscriptions.billing_provider_ref`. */
export type BillingCheckoutResult = {
  provider: BillingProvider;
  checkoutUrl: string;
  providerRef: string;
};

export type BillingCancelRequest = {
  userId: string;
  providerRef: string;
};

export type BillingCancelResult = {
  provider: BillingProvider;
  canceled: boolean;
  /** When the provider will actually stop billing -- e.g. Stripe's current period end -- for `subscriptions.current_period_end` to mirror. */
  effectiveAt: string | null;
};

/**
 * The adapter every billing provider implements. `lib/supabase/membership-actions.ts`
 * does not call this yet (`upgradePlan()`/`cancelSubscription()` apply
 * plan changes directly, the "manual" path) -- this interface is the
 * architecture a real payment integration's checkout button and
 * webhook handler would be written against, so plugging one in later
 * is additive.
 */
export interface BillingAdapter {
  readonly provider: BillingProvider;
  createCheckout(request: BillingCheckoutRequest): Promise<BillingCheckoutResult>;
  cancel(request: BillingCancelRequest): Promise<BillingCancelResult>;
}

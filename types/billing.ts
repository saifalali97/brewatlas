import type { BillingProvider, MembershipPlan } from "@/types/membership";

export type BillingInterval = "month" | "year";

/**
 * Types for the Billing Abstraction (requirement 7): a provider-agnostic
 * checkout/cancel interface that Stripe, Apple Pay, Google Pay, and a
 * manual/no-payment path can all implement. See
 * `lib/billing/billing-adapter.ts`.
 */

export type BillingCheckoutRequest = {
  userId: string;
  userEmail?: string | null;
  plan: MembershipPlan;
  interval?: BillingInterval;
  includeTrial?: boolean;
  successUrl?: string;
  cancelUrl?: string;
};

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
  effectiveAt: string | null;
};

export type BillingPortalRequest = {
  userId: string;
  stripeCustomerId: string;
  returnUrl?: string;
};

export type BillingPortalResult = {
  provider: BillingProvider;
  portalUrl: string;
};

export interface BillingAdapter {
  readonly provider: BillingProvider;
  createCheckout(request: BillingCheckoutRequest): Promise<BillingCheckoutResult>;
  cancel(request: BillingCancelRequest): Promise<BillingCancelResult>;
  createBillingPortal?(request: BillingPortalRequest): Promise<BillingPortalResult>;
}

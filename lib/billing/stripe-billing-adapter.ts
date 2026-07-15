import type {
  BillingCancelRequest,
  BillingCancelResult,
  BillingCheckoutRequest,
  BillingCheckoutResult,
  BillingPortalRequest,
  BillingPortalResult,
} from "@/types/billing";
import type { BillingProvider } from "@/types/membership";
import { getSiteBaseUrl, getStripePriceId } from "@/lib/billing/stripe-config";
import { getStripeClient } from "@/lib/billing/stripe-client";
import { BillingNotConfiguredError } from "@/lib/billing/errors";

export class StripeBillingAdapter {
  readonly provider: BillingProvider = "stripe";

  constructor(private readonly apiKey: string | null) {}

  private requireStripe() {
    if (!this.apiKey) throw new BillingNotConfiguredError("stripe");
    return getStripeClient();
  }

  async createCheckout(request: BillingCheckoutRequest): Promise<BillingCheckoutResult> {
    const stripe = this.requireStripe();
    const interval = request.interval ?? "month";
    const priceId = getStripePriceId(interval);
    const siteUrl = getSiteBaseUrl();
    const successUrl = request.successUrl ?? `${siteUrl}/account/subscription?checkout=success`;
    const cancelUrl = request.cancelUrl ?? `${siteUrl}/premium?checkout=canceled`;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: request.userEmail ?? undefined,
      client_reference_id: request.userId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId: request.userId,
        plan: request.plan,
        interval,
      },
      subscription_data: {
        metadata: {
          userId: request.userId,
          plan: request.plan,
          interval,
        },
        ...(request.includeTrial ? { trial_period_days: 7 } : {}),
      },
    });

    if (!session.url) {
      throw new Error("Stripe did not return a checkout URL.");
    }

    return {
      provider: "stripe",
      checkoutUrl: session.url,
      providerRef: session.id,
    };
  }

  async cancel(request: BillingCancelRequest): Promise<BillingCancelResult> {
    const stripe = this.requireStripe();
    const updated = await stripe.subscriptions.update(request.providerRef, {
      cancel_at_period_end: true,
    });

    return {
      provider: "stripe",
      canceled: true,
      effectiveAt: updated.current_period_end ? new Date(updated.current_period_end * 1000).toISOString() : null,
    };
  }

  async createBillingPortal(request: BillingPortalRequest): Promise<BillingPortalResult> {
    const stripe = this.requireStripe();
    const siteUrl = getSiteBaseUrl();
    const session = await stripe.billingPortal.sessions.create({
      customer: request.stripeCustomerId,
      return_url: request.returnUrl ?? `${siteUrl}/account/subscription`,
    });

    return {
      provider: "stripe",
      portalUrl: session.url,
    };
  }
}

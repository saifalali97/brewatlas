import "server-only";

import { BillingNotConfiguredError, getBillingAdapter, isStripeBillingEnabled } from "@/lib/billing/billing-adapter";
import { getSiteBaseUrl } from "@/lib/billing/stripe-config";
import { getMembershipSummary, refreshUserMembership } from "@/lib/data/membership";
import { createClient } from "@/lib/supabase/server";
import type { BillingInterval } from "@/types/billing";

export class StripeApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "StripeApiError";
  }
}

async function requireAuthenticatedUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    throw new StripeApiError("Authentication required.", 401);
  }

  return {
    supabase,
    userId: data.user.id,
    userEmail: data.user.email ?? null,
  };
}

function assertStripeEnabled() {
  if (!isStripeBillingEnabled()) {
    throw new StripeApiError("Stripe billing is not configured.", 503);
  }
}

export async function createStripeCheckoutForUser(options: {
  interval?: BillingInterval;
  successPath?: string;
  cancelPath?: string;
}): Promise<{ checkoutUrl: string }> {
  assertStripeEnabled();

  const interval = options.interval ?? "month";
  const siteUrl = getSiteBaseUrl();
  const successPath = options.successPath ?? "/account/subscription?checkout=success";
  const cancelPath = options.cancelPath ?? "/premium?checkout=canceled";

  const { supabase, userId, userEmail } = await requireAuthenticatedUser();
  const membership = await getMembershipSummary(supabase, userId);

  if (membership.isPremium && !membership.cancelAtPeriodEnd) {
    throw new StripeApiError("You already have an active Premium subscription.", 409);
  }

  const adapter = getBillingAdapter();

  try {
    const result = await adapter.createCheckout({
      userId,
      userEmail,
      plan: "premium",
      interval,
      includeTrial: membership.trial.eligible,
      successUrl: `${siteUrl}${successPath.startsWith("/") ? successPath : `/${successPath}`}`,
      cancelUrl: `${siteUrl}${cancelPath.startsWith("/") ? cancelPath : `/${cancelPath}`}`,
    });

    return { checkoutUrl: result.checkoutUrl };
  } catch (error) {
    if (error instanceof BillingNotConfiguredError) {
      throw new StripeApiError("Stripe billing is not configured.", 503);
    }
    throw error;
  }
}

export async function createStripeCustomerPortalForUser(options?: {
  returnPath?: string;
}): Promise<{ portalUrl: string }> {
  assertStripeEnabled();

  const returnPath = options?.returnPath ?? "/account/subscription";
  const siteUrl = getSiteBaseUrl();

  const { supabase, userId } = await requireAuthenticatedUser();
  const subscription = await refreshUserMembership(supabase, userId);

  if (!subscription.stripeCustomerId) {
    throw new StripeApiError("No billing account found. Subscribe to Premium first.", 404);
  }

  const adapter = getBillingAdapter();

  if (!adapter.createBillingPortal) {
    throw new StripeApiError("Stripe billing portal is not configured.", 503);
  }

  try {
    const result = await adapter.createBillingPortal({
      userId,
      stripeCustomerId: subscription.stripeCustomerId,
      returnUrl: `${siteUrl}${returnPath.startsWith("/") ? returnPath : `/${returnPath}`}`,
    });

    return { portalUrl: result.portalUrl };
  } catch (error) {
    if (error instanceof BillingNotConfiguredError) {
      throw new StripeApiError("Stripe billing is not configured.", 503);
    }
    throw error;
  }
}

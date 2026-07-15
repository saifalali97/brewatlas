"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { BillingNotConfiguredError, getBillingAdapter, isStripeBillingEnabled } from "@/lib/billing/billing-adapter";
import { cancelUserSubscription, getMembershipSummary, getOrCreateSubscription, refreshUserMembership } from "@/lib/data/membership";
import { createClient } from "@/lib/supabase/server";
import { BILLING_PROVIDERS, MEMBERSHIP_PLANS } from "@/types/membership";
import type { BillingProvider, MembershipPlan, MembershipSummary } from "@/types/membership";
import type { BillingInterval } from "@/types/billing";

/**
 * Server Actions for the membership/subscription system (requirement
 * 6): `startTrial`, `upgradePlan`, `cancelSubscription`,
 * `getMembership`, `refreshMembership`. Thin `"use server"` wrappers
 * around `lib/data/membership.ts`, following the same shape as
 * `lib/supabase/ai-actions.ts`: auth check, parse `FormData`, delegate
 * to the data layer, revalidate, return a `{ error }` / `{ success }`
 * state.
 */

export type MembershipActionState = { error?: string; success?: string; membership?: MembershipSummary } | undefined;

async function requireUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return { supabase, user: data.user, userId: data.user?.id ?? null, userEmail: data.user?.email ?? null };
}

function isMembershipPlan(value: string | null): value is MembershipPlan {
  return !!value && (MEMBERSHIP_PLANS as readonly string[]).includes(value);
}

function isBillingProvider(value: string | null): value is BillingProvider {
  return !!value && (BILLING_PROVIDERS as readonly string[]).includes(value);
}

function isBillingInterval(value: string | null): value is BillingInterval {
  return value === "month" || value === "year";
}

function readString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return typeof value === "string" && value.length > 0 ? value : null;
}

/** Starts the caller's 7-day Premium trial. No-op success shape on failure -- `error` explains why (already premium, trial already used, etc.). */
export async function startTrial(prevState: MembershipActionState, formData: FormData): Promise<MembershipActionState> {
  void prevState;
  void formData;
  const { supabase, userId } = await requireUser();
  if (!userId) return { error: "You must be signed in to start a trial." };

  if (isStripeBillingEnabled()) {
    return { error: "Start your free trial from the Premium checkout page." };
  }

  const { startUserTrial } = await import("@/lib/data/membership");
  const result = await startUserTrial(supabase, userId);
  if ("error" in result) return { error: result.error };

  revalidatePath("/account");
  revalidatePath("/account/subscription");
  const membership = await getMembershipSummary(supabase, userId);
  return { success: "Your 7-day Premium trial has started.", membership };
}

/** Changes the caller's plan. Performs a direct, manual plan change today (no payment is collected) -- see `lib/billing/billing-adapter.ts` for the architecture a real checkout would call this through once wired up. Expects `plan` (required) and optional `billingProvider` (defaults to "manual") in `formData`. */
export async function upgradePlan(_prevState: MembershipActionState, formData: FormData): Promise<MembershipActionState> {
  const { supabase, userId } = await requireUser();
  if (!userId) return { error: "You must be signed in to change your plan." };

  const planRaw = readString(formData, "plan");
  if (!isMembershipPlan(planRaw)) {
    return { error: `plan must be one of: ${MEMBERSHIP_PLANS.join(", ")}.` };
  }

  const billingProviderRaw = readString(formData, "billingProvider");
  const billingProvider = isBillingProvider(billingProviderRaw) ? billingProviderRaw : "manual";

  const { changeUserPlan } = await import("@/lib/data/membership");
  const result = await changeUserPlan(supabase, userId, planRaw, billingProvider);
  if ("error" in result) return { error: result.error };

  revalidatePath("/account");
  revalidatePath("/account/subscription");
  revalidatePath("/premium");
  const membership = await getMembershipSummary(supabase, userId);
  return { success: `Your plan is now ${planRaw}.`, membership };
}

/** Creates a Stripe Checkout session and redirects the user to complete payment. */
export async function createCheckoutSessionAction(formData: FormData): Promise<void> {
  const { supabase, userId, userEmail } = await requireUser();
  if (!userId) {
    redirect("/login?redirectTo=/premium");
  }

  const intervalRaw = readString(formData, "interval");
  const interval = isBillingInterval(intervalRaw) ? intervalRaw : "month";
  const returnPath = readString(formData, "returnPath") ?? "/premium";

  const membership = await getMembershipSummary(supabase, userId);
  if (membership.isPremium && !membership.cancelAtPeriodEnd) {
    redirect("/account/subscription?error=already_subscribed");
  }

  const adapter = getBillingAdapter();

  try {
    const result = await adapter.createCheckout({
      userId,
      userEmail,
      plan: "premium",
      interval,
      includeTrial: membership.trial.eligible,
      successUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/account/subscription?checkout=success`,
      cancelUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}${returnPath}?checkout=canceled`,
    });

    redirect(result.checkoutUrl);
  } catch (error) {
    if (error instanceof BillingNotConfiguredError) {
      redirect(`${returnPath}?error=billing_not_configured`);
    }
    throw error;
  }
}

/** Opens the Stripe Customer Billing Portal for invoice and payment management. */
export async function createBillingPortalAction(formData: FormData): Promise<void> {
  const { supabase, userId } = await requireUser();
  if (!userId) {
    redirect("/login?redirectTo=/account/subscription");
  }

  void formData;
  const subscription = await refreshUserMembership(supabase, userId);

  if (!subscription.stripeCustomerId) {
    redirect("/account/subscription?error=no_billing_account");
  }

  const adapter = getBillingAdapter();
  if (!adapter.createBillingPortal) {
    redirect("/account/subscription?error=billing_not_configured");
  }

  try {
    const result = await adapter.createBillingPortal({
      userId,
      stripeCustomerId: subscription.stripeCustomerId,
    });
    redirect(result.portalUrl);
  } catch (error) {
    if (error instanceof BillingNotConfiguredError) {
      redirect("/account/subscription?error=billing_not_configured");
    }
    throw error;
  }
}

/** Cancels the caller's subscription (ends a trial immediately, or schedules a paid plan to revert to Free at the end of the current period). */
export async function cancelSubscription(prevState: MembershipActionState, formData: FormData): Promise<MembershipActionState> {
  void prevState;
  void formData;
  const { supabase, userId } = await requireUser();
  if (!userId) return { error: "You must be signed in to cancel your subscription." };

  const subscription = await getOrCreateSubscription(supabase, userId);

  if (
    subscription.billingProvider === "stripe" &&
    subscription.billingProviderRef &&
    isStripeBillingEnabled()
  ) {
    try {
      const adapter = getBillingAdapter();
      await adapter.cancel({
        userId,
        providerRef: subscription.billingProviderRef,
      });
    } catch (error) {
      if (!(error instanceof BillingNotConfiguredError)) {
        console.error("Stripe cancel failed", error);
        return { error: "Failed to cancel with the billing provider." };
      }
    }
  }

  const result = await cancelUserSubscription(supabase, userId);
  if ("error" in result) return { error: result.error };

  revalidatePath("/account");
  revalidatePath("/account/subscription");
  revalidatePath("/premium");
  const membership = await getMembershipSummary(supabase, userId);
  return { success: "Your subscription has been canceled.", membership };
}

/** Reads the caller's current membership summary -- a plain read for Client Components that need it on demand rather than via a Server Component fetch. Returns `null` for a guest (no signed-in user). */
export async function getMembership(): Promise<MembershipSummary | null> {
  const { supabase, userId } = await requireUser();
  if (!userId) return null;
  return getMembershipSummary(supabase, userId);
}

/** Forces the lazy expiration checks (trial expiry, cancel-at-period-end) to run immediately and returns the resulting summary, without waiting for the next natural read. Useful right after a client-side countdown reaches zero. */
export async function refreshMembership(): Promise<MembershipSummary | null> {
  const { supabase, userId } = await requireUser();
  if (!userId) return null;
  await refreshUserMembership(supabase, userId);
  revalidatePath("/account");
  revalidatePath("/account/subscription");
  return getMembershipSummary(supabase, userId);
}

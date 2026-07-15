import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";
import { TRIAL_PLAN } from "@/lib/membership/plans";
import type { BillingInterval } from "@/types/billing";
import type { BillingProvider, MembershipPlan, SubscriptionHistoryEventType, SubscriptionStatus } from "@/types/membership";

type SyncStripeInput = {
  userId: string;
  stripeSubscription: Stripe.Subscription;
  stripeCustomerId: string;
};

function mapStripeStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
  switch (status) {
    case "trialing":
      return "trialing";
    case "active":
      return "active";
    case "past_due":
    case "unpaid":
      return "past_due";
    case "canceled":
      return "canceled";
    case "incomplete_expired":
      return "expired";
    case "paused":
      return "canceled";
    default:
      return "active";
  }
}

function resolvePlan(stripeSubscription: Stripe.Subscription): MembershipPlan {
  const planMeta = stripeSubscription.metadata?.plan;
  if (planMeta === "enterprise") return "enterprise";
  if (planMeta === "free") return "free";
  return "premium";
}

function resolveInterval(stripeSubscription: Stripe.Subscription): BillingInterval | null {
  const interval = stripeSubscription.items.data[0]?.price?.recurring?.interval;
  if (interval === "year") return "year";
  if (interval === "month") return "month";
  return null;
}

function unixToIso(value: number | null | undefined): string | null {
  if (!value) return null;
  return new Date(value * 1000).toISOString();
}

/** Upserts BrewAtlas subscription state from a Stripe Subscription object (webhooks + post-checkout). */
export async function syncStripeSubscriptionToDb(
  supabase: SupabaseClient,
  input: SyncStripeInput,
): Promise<void> {
  const { userId, stripeSubscription, stripeCustomerId } = input;
  const status = mapStripeStatus(stripeSubscription.status);
  const plan = status === "expired" || status === "canceled" ? "free" : resolvePlan(stripeSubscription);
  const billingInterval = resolveInterval(stripeSubscription);
  const trialStart = unixToIso(stripeSubscription.trial_start);
  const trialEnd = unixToIso(stripeSubscription.trial_end);
  const periodStart = unixToIso(stripeSubscription.current_period_start) ?? new Date().toISOString();
  const periodEnd = unixToIso(stripeSubscription.current_period_end);

  const { data: existing } = await supabase
    .from("subscriptions")
    .select("id, plan, status")
    .eq("user_id", userId)
    .maybeSingle();

  const payload = {
    plan,
    status,
    billing_provider: "stripe" satisfies BillingProvider,
    billing_provider_ref: stripeSubscription.id,
    stripe_customer_id: stripeCustomerId,
    billing_interval: billingInterval,
    trial_started_at: trialStart,
    trial_ends_at: trialEnd,
    current_period_start: periodStart,
    current_period_end: periodEnd,
    cancel_at_period_end: stripeSubscription.cancel_at_period_end,
    canceled_at: unixToIso(stripeSubscription.canceled_at),
  };

  if (existing) {
    await supabase.from("subscriptions").update(payload).eq("id", existing.id);
  } else {
    await supabase.from("subscriptions").insert({ user_id: userId, ...payload });
  }

  if (status === "trialing" && trialStart && trialEnd) {
    await supabase.from("trial_usage").upsert(
      {
        user_id: userId,
        plan: TRIAL_PLAN,
        started_at: trialStart,
        ends_at: trialEnd,
        status: "active",
      },
      { onConflict: "user_id,plan" },
    );
  }

  const eventType: SubscriptionHistoryEventType =
    status === "past_due"
      ? "payment_failed"
      : status === "trialing"
        ? "trial_started"
        : status === "canceled" || status === "expired"
          ? "subscription_canceled"
          : "subscription_renewed";

  await supabase.from("subscription_history").insert({
    user_id: userId,
    subscription_id: existing?.id ?? null,
    event_type: eventType,
    from_plan: (existing?.plan as MembershipPlan | undefined) ?? null,
    to_plan: plan,
    billing_provider: "stripe",
    metadata: { stripeSubscriptionId: stripeSubscription.id, stripeStatus: stripeSubscription.status },
  });
}

/** Resolves BrewAtlas user id from a Stripe Checkout Session. */
export function resolveUserIdFromCheckoutSession(session: Stripe.Checkout.Session): string | null {
  const fromMetadata = session.metadata?.userId;
  if (typeof fromMetadata === "string" && fromMetadata.length > 0) return fromMetadata;

  const fromReference = session.client_reference_id;
  if (typeof fromReference === "string" && fromReference.length > 0) return fromReference;

  return null;
}

export function resolveStripeCustomerId(
  customer: Stripe.Customer | Stripe.DeletedCustomer | string | null,
): string | null {
  if (!customer) return null;
  if (typeof customer === "string") return customer;
  if ("deleted" in customer && customer.deleted) return null;
  return customer.id;
}

/** Resolves BrewAtlas user id from Stripe customer or subscription metadata. */
export function resolveUserIdFromStripe(
  stripeSubscription: Stripe.Subscription,
  stripeCustomer: Stripe.Customer | Stripe.DeletedCustomer | string | null,
): string | null {
  const fromSubscription = stripeSubscription.metadata?.userId;
  if (typeof fromSubscription === "string" && fromSubscription.length > 0) return fromSubscription;

  if (stripeCustomer && typeof stripeCustomer !== "string" && !("deleted" in stripeCustomer && stripeCustomer.deleted)) {
    const fromCustomer = stripeCustomer.metadata?.userId;
    if (typeof fromCustomer === "string" && fromCustomer.length > 0) return fromCustomer;
  }

  return null;
}

export async function getUserIdByStripeCustomerId(
  supabase: SupabaseClient,
  stripeCustomerId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", stripeCustomerId)
    .maybeSingle();

  return (data?.user_id as string | undefined) ?? null;
}

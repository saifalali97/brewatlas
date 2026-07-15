import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripeWebhookSecret } from "@/lib/billing/stripe-config";
import { getStripeClient } from "@/lib/billing/stripe-client";
import { isStripeBillingEnabled } from "@/lib/billing/billing-adapter";
import {
  getUserIdByStripeCustomerId,
  resolveStripeCustomerId,
  resolveUserIdFromCheckoutSession,
  resolveUserIdFromStripe,
  syncStripeSubscriptionToDb,
} from "@/lib/data/stripe-membership";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

async function syncSubscriptionEvent(
  admin: ReturnType<typeof createAdminClient>,
  stripeSubscription: Stripe.Subscription,
): Promise<void> {
  const stripeCustomerId = resolveStripeCustomerId(stripeSubscription.customer);
  if (!stripeCustomerId) return;

  let userId = resolveUserIdFromStripe(stripeSubscription, stripeSubscription.customer);

  if (!userId) {
    userId = await getUserIdByStripeCustomerId(admin, stripeCustomerId);
  }

  if (!userId) {
    console.error("Stripe webhook: could not resolve user for subscription", stripeSubscription.id);
    return;
  }

  await syncStripeSubscriptionToDb(admin, {
    userId,
    stripeSubscription,
    stripeCustomerId,
  });
}

export async function POST(request: Request) {
  if (!isStripeBillingEnabled() || !hasAdminClient()) {
    return NextResponse.json({ error: "Stripe billing is not configured." }, { status: 503 });
  }

  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  const stripe = getStripeClient();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, getStripeWebhookSecret());
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid webhook signature.";
    console.error("Stripe webhook signature verification failed", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const admin = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== "subscription" || !session.subscription) break;

        const subscriptionId =
          typeof session.subscription === "string" ? session.subscription : session.subscription.id;
        const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
        const stripeCustomerId = resolveStripeCustomerId(session.customer) ?? resolveStripeCustomerId(stripeSubscription.customer);

        if (!stripeCustomerId) break;

        let userId = resolveUserIdFromCheckoutSession(session) ?? resolveUserIdFromStripe(stripeSubscription, session.customer);
        if (!userId) {
          userId = await getUserIdByStripeCustomerId(admin, stripeCustomerId);
        }

        if (!userId) {
          console.error("Stripe webhook: checkout completed without resolvable user", session.id);
          break;
        }

        await stripe.customers.update(stripeCustomerId, {
          metadata: { userId },
        });

        await syncStripeSubscriptionToDb(admin, {
          userId,
          stripeSubscription,
          stripeCustomerId,
        });
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const stripeSubscription = event.data.object as Stripe.Subscription;
        await syncSubscriptionEvent(admin, stripeSubscription);
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        if (!invoice.subscription) break;

        const subscriptionId =
          typeof invoice.subscription === "string" ? invoice.subscription : invoice.subscription.id;
        const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
        await syncSubscriptionEvent(admin, stripeSubscription);
        break;
      }
      default:
        break;
    }
  } catch (error) {
    console.error("Stripe webhook handler failed", event.type, error);
    return NextResponse.json({ error: "Webhook handler failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

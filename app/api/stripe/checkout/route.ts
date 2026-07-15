import { NextResponse } from "next/server";
import { createStripeCheckoutForUser, StripeApiError } from "@/lib/billing/stripe-sessions";
import type { BillingInterval } from "@/types/billing";

export const runtime = "nodejs";

function parseInterval(value: unknown): BillingInterval {
  return value === "year" ? "year" : "month";
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const interval = parseInterval(body?.interval);
    const successPath = typeof body?.successPath === "string" ? body.successPath : undefined;
    const cancelPath = typeof body?.cancelPath === "string" ? body.cancelPath : undefined;

    const { checkoutUrl } = await createStripeCheckoutForUser({ interval, successPath, cancelPath });

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    if (error instanceof StripeApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("Stripe checkout API failed", error);
    return NextResponse.json({ error: "Failed to create checkout session." }, { status: 500 });
  }
}

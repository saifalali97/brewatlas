import { NextResponse } from "next/server";
import { createStripeCustomerPortalForUser, StripeApiError } from "@/lib/billing/stripe-sessions";
import { verifySameOrigin } from "@/lib/security/csrf";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!verifySameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const returnPath = typeof body?.returnPath === "string" ? body.returnPath : undefined;

    const { portalUrl } = await createStripeCustomerPortalForUser({ returnPath });

    return NextResponse.json({ url: portalUrl });
  } catch (error) {
    if (error instanceof StripeApiError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("Stripe customer portal API failed", error);
    return NextResponse.json({ error: "Failed to create billing portal session." }, { status: 500 });
  }
}

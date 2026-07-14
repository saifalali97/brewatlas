"use server";

import { revalidatePath } from "next/cache";
import { cancelUserSubscription, changeUserPlan, getMembershipSummary, refreshUserMembership, startUserTrial } from "@/lib/data/membership";
import { createClient } from "@/lib/supabase/server";
import { BILLING_PROVIDERS, MEMBERSHIP_PLANS } from "@/types/membership";
import type { BillingProvider, MembershipPlan, MembershipSummary } from "@/types/membership";

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
  return { supabase, userId: data.user?.id ?? null };
}

function isMembershipPlan(value: string | null): value is MembershipPlan {
  return !!value && (MEMBERSHIP_PLANS as readonly string[]).includes(value);
}

function isBillingProvider(value: string | null): value is BillingProvider {
  return !!value && (BILLING_PROVIDERS as readonly string[]).includes(value);
}

function readString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return typeof value === "string" && value.length > 0 ? value : null;
}

/** Starts the caller's 7-day Premium trial. No-op success shape on failure -- `error` explains why (already premium, trial already used, etc.). */
export async function startTrial(_prevState: MembershipActionState, _formData: FormData): Promise<MembershipActionState> {
  const { supabase, userId } = await requireUser();
  if (!userId) return { error: "You must be signed in to start a trial." };

  const result = await startUserTrial(supabase, userId);
  if ("error" in result) return { error: result.error };

  revalidatePath("/dashboard");
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

  const result = await changeUserPlan(supabase, userId, planRaw, billingProvider);
  if ("error" in result) return { error: result.error };

  revalidatePath("/dashboard");
  revalidatePath("/premium");
  const membership = await getMembershipSummary(supabase, userId);
  return { success: `Your plan is now ${planRaw}.`, membership };
}

/** Cancels the caller's subscription (ends a trial immediately, or schedules a paid plan to revert to Free at the end of the current period). */
export async function cancelSubscription(_prevState: MembershipActionState, _formData: FormData): Promise<MembershipActionState> {
  const { supabase, userId } = await requireUser();
  if (!userId) return { error: "You must be signed in to cancel your subscription." };

  const result = await cancelUserSubscription(supabase, userId);
  if ("error" in result) return { error: result.error };

  revalidatePath("/dashboard");
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
  revalidatePath("/dashboard");
  return getMembershipSummary(supabase, userId);
}

import type { SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_PLAN_PERMISSIONS, TRIAL_DURATION_DAYS, TRIAL_PLAN, isPlanAtLeast } from "@/lib/membership/plans";
import { KNOWN_FEATURE_KEYS, PLAN_RANK } from "@/types/membership";
import type {
  BillingProvider,
  DbFeatureAccessRow,
  DbPlanPermissionRow,
  DbSubscriptionRow,
  DbTrialUsageRow,
  FeatureAccessEntry,
  FeatureKey,
  FeatureUsageSummary,
  MembershipPlan,
  MembershipSummary,
  PlanPermission,
  Subscription,
  SubscriptionHistoryEventType,
  SubscriptionStatus,
  TrialSummary,
  TrialUsage,
} from "@/types/membership";

/**
 * Data-access + orchestration layer for the membership/subscription
 * system. `lib/membership/access.ts` holds the pure, synchronous
 * `isPremium`/`hasFeature`/... helpers that operate on an already-built
 * `MembershipSummary`; everything here is what builds that summary
 * (and mutates `subscriptions`/`trial_usage`/`subscription_history`),
 * mirroring the `lib/ai/*.ts` (pure) vs. `lib/data/ai.ts` (orchestration)
 * split used elsewhere in this codebase.
 */

const SUBSCRIPTION_FIELDS =
  "id, user_id, plan, status, billing_provider, billing_provider_ref, trial_started_at, trial_ends_at, current_period_start, current_period_end, cancel_at_period_end, canceled_at, created_at, updated_at";
const PLAN_PERMISSION_FIELDS = "id, plan, feature_key, is_enabled, usage_limit";
const TRIAL_USAGE_FIELDS = "id, user_id, plan, started_at, ends_at, status";
const FEATURE_ACCESS_FIELDS = "id, user_id, feature_key, is_enabled, usage_count, usage_limit, granted_reason, expires_at";

function mapSubscription(row: DbSubscriptionRow): Subscription {
  return {
    id: row.id,
    userId: row.user_id,
    plan: row.plan as MembershipPlan,
    status: row.status as SubscriptionStatus,
    billingProvider: row.billing_provider as BillingProvider,
    billingProviderRef: row.billing_provider_ref,
    trialStartedAt: row.trial_started_at,
    trialEndsAt: row.trial_ends_at,
    currentPeriodStart: row.current_period_start,
    currentPeriodEnd: row.current_period_end,
    cancelAtPeriodEnd: row.cancel_at_period_end,
    canceledAt: row.canceled_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapPlanPermission(row: DbPlanPermissionRow): PlanPermission {
  return {
    id: row.id,
    plan: row.plan as MembershipPlan,
    featureKey: row.feature_key,
    isEnabled: row.is_enabled,
    usageLimit: row.usage_limit,
  };
}

function mapTrialUsage(row: DbTrialUsageRow): TrialUsage {
  return {
    id: row.id,
    userId: row.user_id,
    plan: row.plan as MembershipPlan,
    startedAt: row.started_at,
    endsAt: row.ends_at,
    status: row.status as TrialUsage["status"],
  };
}

function mapFeatureAccess(row: DbFeatureAccessRow): FeatureAccessEntry {
  return {
    id: row.id,
    userId: row.user_id,
    featureKey: row.feature_key,
    isEnabled: row.is_enabled,
    usageCount: row.usage_count,
    usageLimit: row.usage_limit,
    grantedReason: row.granted_reason,
    expiresAt: row.expires_at,
  };
}

/** Fetches the caller's subscription, creating a default `free`/`active` row on first access. Every signed-in user has exactly one row after this has been called once. */
export async function getOrCreateSubscription(supabase: SupabaseClient, userId: string): Promise<Subscription> {
  const { data: existing, error: selectError } = await supabase
    .from("subscriptions")
    .select(SUBSCRIPTION_FIELDS)
    .eq("user_id", userId)
    .maybeSingle();

  if (selectError) {
    console.error("getOrCreateSubscription select failed", selectError);
  }
  if (existing) return mapSubscription(existing as DbSubscriptionRow);

  const { data: created, error: insertError } = await supabase
    .from("subscriptions")
    .insert({ user_id: userId })
    .select(SUBSCRIPTION_FIELDS)
    .single();

  if (insertError || !created) {
    // Most likely a race with a concurrent request creating the same row;
    // re-select rather than surface a spurious error.
    const { data: retried } = await supabase
      .from("subscriptions")
      .select(SUBSCRIPTION_FIELDS)
      .eq("user_id", userId)
      .maybeSingle();
    if (retried) return mapSubscription(retried as DbSubscriptionRow);
    console.error("getOrCreateSubscription insert failed", insertError);
    throw new Error("Failed to load or create a subscription.");
  }

  return mapSubscription(created as DbSubscriptionRow);
}

/** All `plan_permissions` rows for one plan, merged with `lib/membership/plans.ts`'s in-code defaults for any known feature key missing from the database. */
async function getPlanPermissionMap(
  supabase: SupabaseClient,
  plan: MembershipPlan,
): Promise<Partial<Record<FeatureKey, { isEnabled: boolean; usageLimit: number | null }>>> {
  const { data, error } = await supabase.from("plan_permissions").select(PLAN_PERMISSION_FIELDS).eq("plan", plan);

  if (error) {
    console.error("getPlanPermissionMap failed", error);
  }

  const map: Record<string, { isEnabled: boolean; usageLimit: number | null }> = {};
  for (const key of KNOWN_FEATURE_KEYS) {
    const fallback = DEFAULT_PLAN_PERMISSIONS[plan][key];
    map[key] = { isEnabled: fallback.isEnabled, usageLimit: fallback.usageLimit };
  }
  for (const row of (data ?? []) as DbPlanPermissionRow[]) {
    const permission = mapPlanPermission(row);
    map[permission.featureKey] = { isEnabled: permission.isEnabled, usageLimit: permission.usageLimit };
  }

  return map;
}

async function getFeatureAccessMap(supabase: SupabaseClient, userId: string): Promise<Partial<Record<FeatureKey, FeatureAccessEntry>>> {
  const { data, error } = await supabase.from("feature_access").select(FEATURE_ACCESS_FIELDS).eq("user_id", userId);

  if (error) {
    console.error("getFeatureAccessMap failed", error);
    return {};
  }

  const map: Record<string, FeatureAccessEntry> = {};
  for (const row of (data ?? []) as DbFeatureAccessRow[]) {
    const entry = mapFeatureAccess(row);
    map[entry.featureKey] = entry;
  }
  return map;
}

async function getTrialUsage(supabase: SupabaseClient, userId: string, plan: MembershipPlan): Promise<TrialUsage | null> {
  const { data, error } = await supabase
    .from("trial_usage")
    .select(TRIAL_USAGE_FIELDS)
    .eq("user_id", userId)
    .eq("plan", plan)
    .maybeSingle();

  if (error) {
    console.error("getTrialUsage failed", error);
    return null;
  }
  return data ? mapTrialUsage(data as DbTrialUsageRow) : null;
}

type RecordHistoryInput = {
  userId: string;
  subscriptionId: string | null;
  eventType: SubscriptionHistoryEventType;
  fromPlan?: MembershipPlan | null;
  toPlan?: MembershipPlan | null;
  billingProvider?: BillingProvider | null;
  metadata?: Record<string, unknown>;
};

async function recordSubscriptionHistory(supabase: SupabaseClient, input: RecordHistoryInput): Promise<void> {
  const { error } = await supabase.from("subscription_history").insert({
    user_id: input.userId,
    subscription_id: input.subscriptionId,
    event_type: input.eventType,
    from_plan: input.fromPlan ?? null,
    to_plan: input.toPlan ?? null,
    billing_provider: input.billingProvider ?? null,
    metadata: input.metadata ?? {},
  });

  if (error) {
    console.error("recordSubscriptionHistory failed", error);
  }
}

function daysRemaining(endsAt: string | null): number {
  if (!endsAt) return 0;
  const diffMs = new Date(endsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

/**
 * Applies any lazy state transitions that are "due" (requirement 2's
 * "automatic expiration"): an expired trial reverts to the free plan,
 * and a cancel-at-period-end subscription past its period end also
 * reverts to free. Called at the top of `getMembershipSummary` so every
 * read is self-healing -- no background cron job is required.
 */
export async function refreshUserMembership(supabase: SupabaseClient, userId: string): Promise<Subscription> {
  const subscription = await getOrCreateSubscription(supabase, userId);
  const now = Date.now();

  if (subscription.status === "trialing" && subscription.trialEndsAt && new Date(subscription.trialEndsAt).getTime() <= now) {
    const { data: updated, error } = await supabase
      .from("subscriptions")
      .update({ plan: "free", status: "active", cancel_at_period_end: false })
      .eq("id", subscription.id)
      .select(SUBSCRIPTION_FIELDS)
      .single();

    await supabase
      .from("trial_usage")
      .update({ status: "expired" })
      .eq("user_id", userId)
      .eq("plan", subscription.plan)
      .eq("status", "active");

    await recordSubscriptionHistory(supabase, {
      userId,
      subscriptionId: subscription.id,
      eventType: "trial_expired",
      fromPlan: subscription.plan,
      toPlan: "free",
    });

    if (!error && updated) return mapSubscription(updated as DbSubscriptionRow);
    return { ...subscription, plan: "free", status: "active" };
  }

  if (
    subscription.cancelAtPeriodEnd &&
    subscription.currentPeriodEnd &&
    new Date(subscription.currentPeriodEnd).getTime() <= now &&
    subscription.plan !== "free"
  ) {
    const { data: updated, error } = await supabase
      .from("subscriptions")
      .update({ plan: "free", status: "active", cancel_at_period_end: false })
      .eq("id", subscription.id)
      .select(SUBSCRIPTION_FIELDS)
      .single();

    await recordSubscriptionHistory(supabase, {
      userId,
      subscriptionId: subscription.id,
      eventType: "plan_downgraded",
      fromPlan: subscription.plan,
      toPlan: "free",
      metadata: { reason: "cancellation_period_ended" },
    });

    if (!error && updated) return mapSubscription(updated as DbSubscriptionRow);
    return { ...subscription, plan: "free", status: "active" };
  }

  return subscription;
}

/**
 * Builds the reusable membership summary model (requirement 8):
 * Current Plan, Trial Remaining, Premium Features, Usage Limits, and
 * Expiration. Always calls `refreshUserMembership` first so the caller
 * never sees a stale "trialing" or "canceled-but-still-active" state.
 */
export async function getMembershipSummary(supabase: SupabaseClient, userId: string): Promise<MembershipSummary> {
  const subscription = await refreshUserMembership(supabase, userId);
  const [planPermissions, featureAccess, trialUsage] = await Promise.all([
    getPlanPermissionMap(supabase, subscription.plan),
    getFeatureAccessMap(supabase, userId),
    getTrialUsage(supabase, userId, TRIAL_PLAN),
  ]);

  const isPremium =
    isPlanAtLeast(subscription.plan, "premium") && (subscription.status === "active" || subscription.status === "trialing");

  const features: Partial<Record<FeatureKey, boolean>> = {};
  const usage: Partial<Record<FeatureKey, FeatureUsageSummary>> = {};
  const featureKeys = new Set<FeatureKey>([...KNOWN_FEATURE_KEYS, ...Object.keys(planPermissions), ...Object.keys(featureAccess)]);

  for (const featureKey of featureKeys) {
    const planDefault = planPermissions[featureKey] ?? { isEnabled: false, usageLimit: null };
    const override = featureAccess[featureKey];

    const isEnabled = override ? override.isEnabled : planDefault.isEnabled;
    const usageLimit = override ? override.usageLimit : planDefault.usageLimit;
    const used = override?.usageCount ?? 0;

    features[featureKey] = isEnabled;
    usage[featureKey] = {
      featureKey,
      enabled: isEnabled,
      limit: usageLimit,
      used,
      remaining: usageLimit === null ? null : Math.max(0, usageLimit - used),
    };
  }

  const trialEligible = !trialUsage && !isPlanAtLeast(subscription.plan, "premium");
  const trial: TrialSummary = {
    eligible: trialEligible,
    isTrialing: subscription.status === "trialing",
    startedAt: subscription.trialStartedAt,
    endsAt: subscription.trialEndsAt,
    daysRemaining: subscription.status === "trialing" ? daysRemaining(subscription.trialEndsAt) : 0,
  };

  const expiresAt = subscription.status === "trialing" ? subscription.trialEndsAt : subscription.currentPeriodEnd;

  return {
    userId,
    plan: subscription.plan,
    status: subscription.status,
    isPremium,
    billingProvider: subscription.billingProvider,
    currentPeriodEnd: subscription.currentPeriodEnd,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    expiresAt,
    trial,
    features,
    usage,
  };
}

export type StartTrialResult = { subscription: Subscription } | { error: string };

/** Starts the 7-day Premium trial (requirement 2). Enforces trial eligibility and "prevent duplicate trials" both in application logic and via the `trial_usage` table's `unique (user_id, plan)` constraint. */
export async function startUserTrial(supabase: SupabaseClient, userId: string): Promise<StartTrialResult> {
  const subscription = await refreshUserMembership(supabase, userId);

  if (isPlanAtLeast(subscription.plan, TRIAL_PLAN)) {
    return { error: `You're already on the ${subscription.plan} plan.` };
  }

  const existingTrial = await getTrialUsage(supabase, userId, TRIAL_PLAN);
  if (existingTrial) {
    return { error: "You've already used your free trial." };
  }

  const startedAt = new Date();
  const endsAt = new Date(startedAt.getTime() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000);

  const { error: trialInsertError } = await supabase.from("trial_usage").insert({
    user_id: userId,
    plan: TRIAL_PLAN,
    started_at: startedAt.toISOString(),
    ends_at: endsAt.toISOString(),
    status: "active",
  });

  if (trialInsertError) {
    if (trialInsertError.code === "23505") return { error: "You've already used your free trial." };
    console.error("startUserTrial trial_usage insert failed", trialInsertError);
    return { error: "Failed to start the trial." };
  }

  const { data: updated, error: updateError } = await supabase
    .from("subscriptions")
    .update({
      plan: TRIAL_PLAN,
      status: "trialing",
      trial_started_at: startedAt.toISOString(),
      trial_ends_at: endsAt.toISOString(),
    })
    .eq("id", subscription.id)
    .select(SUBSCRIPTION_FIELDS)
    .single();

  if (updateError || !updated) {
    console.error("startUserTrial subscription update failed", updateError);
    return { error: "Failed to start the trial." };
  }

  await recordSubscriptionHistory(supabase, {
    userId,
    subscriptionId: subscription.id,
    eventType: "trial_started",
    fromPlan: subscription.plan,
    toPlan: TRIAL_PLAN,
  });

  return { subscription: mapSubscription(updated as DbSubscriptionRow) };
}

export type ChangePlanResult = { subscription: Subscription } | { error: string };

/** Upgrades (or changes) a user's plan (requirement 6's `upgradePlan()`). Performs a direct, manual plan change today -- see `lib/billing/billing-adapter.ts` for the (not-yet-wired) architecture a real payment confirmation would call this through. */
export async function changeUserPlan(
  supabase: SupabaseClient,
  userId: string,
  plan: MembershipPlan,
  billingProvider: BillingProvider = "manual",
): Promise<ChangePlanResult> {
  const subscription = await refreshUserMembership(supabase, userId);
  const wasTrialing = subscription.status === "trialing";
  const periodDays = 30;
  const now = new Date();

  const { data: updated, error } = await supabase
    .from("subscriptions")
    .update({
      plan,
      status: "active",
      billing_provider: billingProvider,
      current_period_start: now.toISOString(),
      current_period_end: plan === "free" ? null : new Date(now.getTime() + periodDays * 24 * 60 * 60 * 1000).toISOString(),
      cancel_at_period_end: false,
      canceled_at: null,
    })
    .eq("id", subscription.id)
    .select(SUBSCRIPTION_FIELDS)
    .single();

  if (error || !updated) {
    console.error("changeUserPlan failed", error);
    return { error: "Failed to change your plan." };
  }

  const eventType: SubscriptionHistoryEventType =
    wasTrialing && isPlanAtLeast(plan, TRIAL_PLAN)
      ? "trial_converted"
      : PLAN_RANK[plan] > PLAN_RANK[subscription.plan]
        ? "plan_upgraded"
        : "plan_downgraded";

  await recordSubscriptionHistory(supabase, {
    userId,
    subscriptionId: subscription.id,
    eventType,
    fromPlan: subscription.plan,
    toPlan: plan,
    billingProvider,
  });

  if (wasTrialing) {
    await supabase.from("trial_usage").update({ status: "converted" }).eq("user_id", userId).eq("plan", TRIAL_PLAN);
  }

  return { subscription: mapSubscription(updated as DbSubscriptionRow) };
}

export type CancelSubscriptionResult = { subscription: Subscription } | { error: string };

/**
 * Cancels a subscription (requirement 6's `cancelSubscription()`). A
 * trial is ended immediately (no billing commitment to honor); a paid
 * plan is marked `cancel_at_period_end` so access continues until
 * `current_period_end`, mirroring standard SaaS cancellation semantics
 * -- `refreshUserMembership` completes the downgrade once that date
 * passes.
 */
export async function cancelUserSubscription(supabase: SupabaseClient, userId: string): Promise<CancelSubscriptionResult> {
  const subscription = await refreshUserMembership(supabase, userId);

  if (subscription.plan === "free" && subscription.status !== "trialing") {
    return { subscription };
  }

  const now = new Date().toISOString();
  const isTrial = subscription.status === "trialing";

  const { data: updated, error } = await supabase
    .from("subscriptions")
    .update(
      isTrial
        ? { plan: "free", status: "active", cancel_at_period_end: false, canceled_at: now }
        : { cancel_at_period_end: true, canceled_at: now },
    )
    .eq("id", subscription.id)
    .select(SUBSCRIPTION_FIELDS)
    .single();

  if (error || !updated) {
    console.error("cancelUserSubscription failed", error);
    return { error: "Failed to cancel the subscription." };
  }

  if (isTrial) {
    await supabase.from("trial_usage").update({ status: "canceled" }).eq("user_id", userId).eq("plan", TRIAL_PLAN);
  }

  await recordSubscriptionHistory(supabase, {
    userId,
    subscriptionId: subscription.id,
    eventType: "subscription_canceled",
    fromPlan: subscription.plan,
    toPlan: isTrial ? "free" : subscription.plan,
  });

  return { subscription: mapSubscription(updated as DbSubscriptionRow) };
}

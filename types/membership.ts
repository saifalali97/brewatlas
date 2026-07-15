/**
 * Types for the BrewAtlas membership and subscription system: plans,
 * free trials, premium feature gating, and the reusable dashboard
 * summary model.
 *
 * "Guest" is not a stored plan -- it's simply the absence of an
 * authenticated user (see `lib/membership/access.ts`, which treats
 * `userId: null` as guest). Every signed-in user has exactly one
 * `subscriptions` row, defaulting to `plan: "free"`.
 *
 * Nothing here calls a payment provider -- see `lib/billing/billing-adapter.ts`
 * for the (also call-free) billing adapter architecture.
 */

/** Stored membership plans. "enterprise" is modelled now so multi-seat/team billing can be added later without a schema change -- see requirement 1 ("support future Enterprise plans"). */
export const MEMBERSHIP_PLANS = ["free", "premium", "enterprise"] as const;
export type MembershipPlan = (typeof MEMBERSHIP_PLANS)[number];

/** Relative ranking used by `isPremium`/`hasFeature` to reason about "at least this tier" without a chain of `||` comparisons. */
export const PLAN_RANK: Record<MembershipPlan, number> = {
  free: 0,
  premium: 1,
  enterprise: 2,
};

export const SUBSCRIPTION_STATUSES = ["trialing", "active", "past_due", "canceled", "expired"] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

export const BILLING_PROVIDERS = ["manual", "stripe", "apple_pay", "google_pay"] as const;
export type BillingProvider = (typeof BILLING_PROVIDERS)[number];

/**
 * Known premium feature keys (requirement 3). Deliberately typed as
 * `string` (not a closed union) everywhere except this reference list,
 * so a new feature can be added to `plan_permissions`/`feature_access`
 * purely as data -- "Future Features" needs no type change, only a new
 * row and (optionally) a new entry here for editor autocomplete.
 */
export const KNOWN_FEATURE_KEYS = [
  "premium_recipes",
  "ai_coach",
  "unlimited_favorites",
  "unlimited_brew_logs",
  "advanced_analytics",
  "recipe_collections",
] as const;
export type KnownFeatureKey = (typeof KNOWN_FEATURE_KEYS)[number];
/** A feature key as stored/queried -- any known key, or a future one not yet in `KNOWN_FEATURE_KEYS`. */
export type FeatureKey = KnownFeatureKey | (string & {});

/** `public.subscriptions` row, camelCased -- the single source of truth for a user's current membership state. */
export type Subscription = {
  id: string;
  userId: string;
  plan: MembershipPlan;
  status: SubscriptionStatus;
  billingProvider: BillingProvider;
  billingProviderRef: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  billingInterval: "month" | "year" | null;
  billingPeriod: "month" | "year" | null;
  trialStartedAt: string | null;
  trialEndsAt: string | null;
  currentPeriodStart: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DbSubscriptionRow = {
  id: string;
  user_id: string;
  plan: string;
  status: string;
  billing_provider: string;
  billing_provider_ref: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  billing_interval: string | null;
  billing_period: string | null;
  trial_started_at: string | null;
  trial_ends_at: string | null;
  current_period_start: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  canceled_at: string | null;
  created_at: string;
  updated_at: string;
};

export const SUBSCRIPTION_HISTORY_EVENT_TYPES = [
  "trial_started",
  "trial_expired",
  "trial_converted",
  "plan_upgraded",
  "plan_downgraded",
  "subscription_canceled",
  "subscription_reactivated",
  "subscription_renewed",
  "payment_failed",
] as const;
export type SubscriptionHistoryEventType = (typeof SUBSCRIPTION_HISTORY_EVENT_TYPES)[number];

/** `public.subscription_history` row, camelCased -- an append-only audit log of every plan/status transition. */
export type SubscriptionHistoryEntry = {
  id: string;
  userId: string;
  subscriptionId: string | null;
  eventType: SubscriptionHistoryEventType;
  fromPlan: MembershipPlan | null;
  toPlan: MembershipPlan | null;
  billingProvider: BillingProvider | null;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type DbSubscriptionHistoryRow = {
  id: string;
  user_id: string;
  subscription_id: string | null;
  event_type: string;
  from_plan: string | null;
  to_plan: string | null;
  billing_provider: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

/** `public.plan_permissions` row, camelCased -- the plan-level default for one feature key (e.g. "premium" + "ai_coach" -> enabled, no limit). */
export type PlanPermission = {
  id: string;
  plan: MembershipPlan;
  featureKey: FeatureKey;
  isEnabled: boolean;
  usageLimit: number | null;
};

export type DbPlanPermissionRow = {
  id: string;
  plan: string;
  feature_key: string;
  is_enabled: boolean;
  usage_limit: number | null;
};

export const TRIAL_STATUSES = ["active", "expired", "converted", "canceled"] as const;
export type TrialStatus = (typeof TRIAL_STATUSES)[number];

/** `public.trial_usage` row, camelCased -- records that a user has used their one-time free trial for a plan, so `startTrial` can enforce "prevent duplicate trials" even after the trial itself expires or the subscription is reset. */
export type TrialUsage = {
  id: string;
  userId: string;
  plan: MembershipPlan;
  startedAt: string;
  endsAt: string;
  status: TrialStatus;
};

export type DbTrialUsageRow = {
  id: string;
  user_id: string;
  plan: string;
  started_at: string;
  ends_at: string;
  status: string;
};

/** `public.feature_access` row, camelCased -- a per-user resolved feature grant/override (e.g. a comped `ai_coach` grant on the Free plan, or a usage counter for a limited feature like `unlimited_favorites`). Distinct from `plan_permissions`, which only holds plan-level defaults. */
export type FeatureAccessEntry = {
  id: string;
  userId: string;
  featureKey: FeatureKey;
  isEnabled: boolean;
  usageCount: number;
  usageLimit: number | null;
  grantedReason: string | null;
  expiresAt: string | null;
};

export type DbFeatureAccessRow = {
  id: string;
  user_id: string;
  feature_key: string;
  is_enabled: boolean;
  usage_count: number;
  usage_limit: number | null;
  granted_reason: string | null;
  expires_at: string | null;
};

/** Trial state as surfaced on the dashboard (requirement 8: "Trial Remaining"). */
export type TrialSummary = {
  eligible: boolean;
  isTrialing: boolean;
  startedAt: string | null;
  endsAt: string | null;
  daysRemaining: number;
};

/** Resolved usage for one limited feature (e.g. `unlimited_favorites` on the Free plan: `limit: 10, used: 4`). `limit: null` means unlimited. */
export type FeatureUsageSummary = {
  featureKey: FeatureKey;
  enabled: boolean;
  limit: number | null;
  used: number;
  remaining: number | null;
};

/**
 * The reusable membership summary model (requirement 8): Current Plan,
 * Trial Remaining, Premium Features, Usage Limits, and Expiration, all
 * pre-resolved from `subscriptions` + `plan_permissions` +
 * `feature_access` + `trial_usage` in one call to
 * `getMembershipSummary()`. This is what `lib/membership/access.ts`'s
 * helpers and any future dashboard UI should read from -- never the raw
 * tables directly.
 */
export type MembershipSummary = {
  userId: string;
  plan: MembershipPlan;
  status: SubscriptionStatus;
  isPremium: boolean;
  billingProvider: BillingProvider;
  billingInterval: "month" | "year" | null;
  stripeCustomerId: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  expiresAt: string | null;
  trial: TrialSummary;
  features: Partial<Record<FeatureKey, boolean>>;
  usage: Partial<Record<FeatureKey, FeatureUsageSummary>>;
};

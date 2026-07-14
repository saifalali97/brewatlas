import type { FeatureKey, MembershipPlan } from "@/types/membership";
import { KNOWN_FEATURE_KEYS, MEMBERSHIP_PLANS } from "@/types/membership";

/**
 * Static plan/feature registry. This is the single place that defines
 * "what each plan gets" in code -- `supabase/migrations/20260713280500_seed_membership_plan_permissions.sql`
 * seeds `plan_permissions` from these exact values, and
 * `lib/data/membership.ts` falls back to them if a (plan, feature)
 * pair is ever missing from the database (e.g. a brand-new feature key
 * that hasn't been seeded for every plan yet).
 */

export type PlanPermissionDefault = {
  isEnabled: boolean;
  /** `null` = unlimited. */
  usageLimit: number | null;
};

/** Free-tier caps for limited features, referenced by both the seed migration and the in-code fallback below. */
export const FREE_PLAN_LIMITS: Partial<Record<FeatureKey, number>> = {
  unlimited_favorites: 10,
  unlimited_brew_logs: 20,
  recipe_collections: 1,
};

type KnownFeatureKeyLike = (typeof KNOWN_FEATURE_KEYS)[number];

/** Default permission matrix: `plan -> featureKey -> { isEnabled, usageLimit }`. Free gets capped access to the "unlimited_*" features (the cap makes the name aspirational, matching the marketing copy on `/premium`); Premium and Enterprise are unlimited across the board. */
export const DEFAULT_PLAN_PERMISSIONS: Record<MembershipPlan, Record<KnownFeatureKeyLike, PlanPermissionDefault>> = {
  free: {
    premium_recipes: { isEnabled: false, usageLimit: null },
    ai_coach: { isEnabled: false, usageLimit: null },
    unlimited_favorites: { isEnabled: true, usageLimit: FREE_PLAN_LIMITS.unlimited_favorites ?? null },
    unlimited_brew_logs: { isEnabled: true, usageLimit: FREE_PLAN_LIMITS.unlimited_brew_logs ?? null },
    advanced_analytics: { isEnabled: false, usageLimit: null },
    recipe_collections: { isEnabled: true, usageLimit: FREE_PLAN_LIMITS.recipe_collections ?? null },
  },
  premium: {
    premium_recipes: { isEnabled: true, usageLimit: null },
    ai_coach: { isEnabled: true, usageLimit: null },
    unlimited_favorites: { isEnabled: true, usageLimit: null },
    unlimited_brew_logs: { isEnabled: true, usageLimit: null },
    advanced_analytics: { isEnabled: true, usageLimit: null },
    recipe_collections: { isEnabled: true, usageLimit: null },
  },
  enterprise: {
    premium_recipes: { isEnabled: true, usageLimit: null },
    ai_coach: { isEnabled: true, usageLimit: null },
    unlimited_favorites: { isEnabled: true, usageLimit: null },
    unlimited_brew_logs: { isEnabled: true, usageLimit: null },
    advanced_analytics: { isEnabled: true, usageLimit: null },
    recipe_collections: { isEnabled: true, usageLimit: null },
  },
};

/** Looks up the in-code default for a (plan, feature) pair -- used as a fallback when `plan_permissions` has no row for a not-yet-seeded feature key. Unknown feature keys default to disabled/unlimited-if-enabled, i.e. "off until explicitly granted". */
export function getDefaultPlanPermission(plan: MembershipPlan, featureKey: FeatureKey): PlanPermissionDefault {
  const planDefaults = DEFAULT_PLAN_PERMISSIONS[plan] as Record<string, PlanPermissionDefault>;
  return planDefaults[featureKey] ?? { isEnabled: false, usageLimit: null };
}

/** Whether `candidate` >= `plan` in the plan hierarchy (free < premium < enterprise). */
export function isPlanAtLeast(candidate: MembershipPlan, plan: MembershipPlan): boolean {
  return MEMBERSHIP_PLANS.indexOf(candidate) >= MEMBERSHIP_PLANS.indexOf(plan);
}

export const TRIAL_DURATION_DAYS = 7;
/** The only plan a free trial currently grants -- kept as a named constant so `startTrial()`'s "which plan does a trial unlock" decision is visible in one place. */
export const TRIAL_PLAN: MembershipPlan = "premium";

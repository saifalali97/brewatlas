import { unstable_cache } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import type { OwnerChartPoint } from "@/lib/data/owner-dashboard";

import { PREMIUM_MONTHLY_AED, PREMIUM_YEARLY_AED, PREMIUM_YEARLY_MRR_AED } from "@/lib/billing/pricing";

export const PREMIUM_MONTHLY_USD = PREMIUM_MONTHLY_AED;
export const PREMIUM_YEARLY_USD = PREMIUM_YEARLY_AED;
export const PREMIUM_YEARLY_MRR_USD = PREMIUM_YEARLY_MRR_AED;

export type OwnerKpiStats = {
  totalUsers: number;
  premiumSubscribers: number;
  monthlyRecurringRevenueUsd: number;
  activeUsers30d: number;
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  recipeViews: number;
  recipeSaves: number;
  suspendedUsers: number;
  flaggedReviews: number;
};

export type OwnerFunnelStep = {
  key: string;
  label: string;
  value: number;
};

export type OwnerNamedCount = {
  name: string;
  count: number;
};

export type OwnerRecipeMetric = {
  recipeId: string;
  title: string;
  slug: string;
  viewCount: number;
  saveCount: number;
  brewCount: number;
  averageRating: number;
  reviewCount: number;
};

export type OwnerRevenueMetrics = {
  mrrUsd: number;
  monthlySubscribers: number;
  yearlySubscribers: number;
  churnRatePercent: number;
  trialConversionRatePercent: number;
  stripeConfigured: boolean;
};

export type OwnerAnalyticsOverview = {
  kpis: OwnerKpiStats;
  userGrowth: OwnerChartPoint[];
  subscriptionGrowth: OwnerChartPoint[];
  revenueTrend: OwnerChartPoint[];
  conversionFunnel: OwnerFunnelStep[];
  revenue: OwnerRevenueMetrics;
  topCountries: OwnerNamedCount[];
  preferredBrewMethods: OwnerNamedCount[];
  preferredDevices: OwnerNamedCount[];
  mostViewedRecipes: OwnerRecipeMetric[];
  mostBrewedRecipes: OwnerRecipeMetric[];
  trendingRecipes: OwnerRecipeMetric[];
};

async function countTable(
  supabase: SupabaseClient,
  table: string,
  options?: { column?: string; value?: string | null; op?: "is" | "eq" },
): Promise<number> {
  let query = supabase.from(table).select("*", { count: "exact", head: true });
  if (options?.column && options.op === "is") {
    query = query.is(options.column, options.value ?? null);
  } else if (options?.column && options.op === "eq" && options.value) {
    query = query.eq(options.column, options.value);
  }
  const { count, error } = await query;
  if (error) {
    console.error(`countTable(${table}) failed`, error);
    return 0;
  }
  return count ?? 0;
}

function computeMrrFromSubscriptions(
  rows: Array<{ plan: string; status: string; billing_interval: string | null }>,
): { mrrUsd: number; monthlySubscribers: number; yearlySubscribers: number; premiumSubscribers: number } {
  let mrrUsd = 0;
  let monthlySubscribers = 0;
  let yearlySubscribers = 0;
  let premiumSubscribers = 0;

  for (const row of rows) {
    if (!["premium", "enterprise"].includes(row.plan)) continue;
    if (!["active", "trialing", "past_due"].includes(row.status)) continue;

    premiumSubscribers += 1;
    if (row.billing_interval === "year") {
      yearlySubscribers += 1;
      mrrUsd += PREMIUM_YEARLY_MRR_USD;
    } else {
      monthlySubscribers += 1;
      mrrUsd += PREMIUM_MONTHLY_USD;
    }
  }

  return { mrrUsd: Math.round(mrrUsd * 100) / 100, monthlySubscribers, yearlySubscribers, premiumSubscribers };
}

async function fetchMonthlySeriesFromHistory(
  supabase: SupabaseClient,
  months: number,
): Promise<OwnerChartPoint[]> {
  const since = new Date();
  since.setMonth(since.getMonth() - (months - 1));
  since.setDate(1);
  since.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("subscription_history")
    .select("created_at, to_plan, event_type")
    .gte("created_at", since.toISOString())
    .in("event_type", ["plan_upgraded", "trial_started", "trial_converted", "subscription_renewed"]);

  if (error) {
    console.error("fetchMonthlySeriesFromHistory failed", error);
    return [];
  }

  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const buckets = new Map<string, number>();

  for (let index = months - 1; index >= 0; index -= 1) {
    const date = new Date();
    date.setMonth(date.getMonth() - index);
    date.setDate(1);
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    buckets.set(key, 0);
  }

  for (const row of data ?? []) {
    if (!row.to_plan || !["premium", "enterprise"].includes(row.to_plan as string)) continue;
    const created = new Date(row.created_at as string);
    const key = `${created.getFullYear()}-${created.getMonth()}`;
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
  }

  return Array.from(buckets.entries()).map(([key, value]) => {
    const [, monthIndex] = key.split("-").map(Number);
    return { label: labels[monthIndex] ?? "—", value };
  });
}

async function computeOwnerAnalytics(supabase: SupabaseClient): Promise<OwnerAnalyticsOverview> {
  const [
    totalUsers,
    recipeViews,
    recipeSaves,
    suspendedUsers,
    flaggedReviews,
    subscriptionsRes,
    signupsRes,
    activeRes,
    countriesRes,
    methodsRes,
    devicesRes,
    leaderboardRes,
    trendingRes,
    trialUsageRes,
    canceledRes,
  ] = await Promise.all([
    countTable(supabase, "profiles"),
    countTable(supabase, "recipe_views"),
    countTable(supabase, "favorites"),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .not("suspended_at", "is", null)
      .then(({ count, error }) => (error ? 0 : count ?? 0)),
    countTable(supabase, "recipe_reviews", { column: "moderation_status", value: "flagged", op: "eq" }),
    supabase.from("subscriptions").select("plan, status, billing_interval"),
    supabase.rpc("owner_monthly_signups", { months: 6 }),
    supabase.rpc("owner_active_user_counts"),
    supabase.rpc("owner_top_countries", { result_limit: 8 }),
    supabase.rpc("owner_preferred_brew_methods", { result_limit: 8 }),
    supabase.rpc("owner_preferred_devices", { result_limit: 8 }),
    supabase.rpc("owner_recipe_leaderboard", { result_limit: 10 }),
    supabase.rpc("trending_recipes", { days: 14, result_limit: 10 }),
    supabase.from("trial_usage").select("status"),
    supabase
      .from("subscription_history")
      .select("id", { count: "exact", head: true })
      .eq("event_type", "subscription_canceled")
      .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
  ]);

  const subscriptionRows = (subscriptionsRes.data ?? []) as Array<{
    plan: string;
    status: string;
    billing_interval: string | null;
  }>;
  const { mrrUsd, monthlySubscribers, yearlySubscribers, premiumSubscribers } =
    computeMrrFromSubscriptions(subscriptionRows);

  const activeRow = (activeRes.data?.[0] ?? {}) as {
    daily_active?: number;
    weekly_active?: number;
    monthly_active?: number;
  };

  const trialRows = (trialUsageRes.data ?? []) as Array<{ status: string }>;
  const trialsStarted = trialRows.length;
  const trialsConverted = trialRows.filter((row) => row.status === "converted").length;
  const trialConversionRatePercent =
    trialsStarted > 0 ? Math.round((trialsConverted / trialsStarted) * 1000) / 10 : 0;

  const churnRatePercent =
    premiumSubscribers + (canceledRes.count ?? 0) > 0
      ? Math.round(((canceledRes.count ?? 0) / (premiumSubscribers + (canceledRes.count ?? 0))) * 1000) / 10
      : 0;

  const userGrowth: OwnerChartPoint[] = ((signupsRes.data ?? []) as Array<{ month_label: string; signup_count: number }>).map(
    (row) => ({ label: row.month_label, value: Number(row.signup_count) }),
  );

  const subscriptionGrowth = await fetchMonthlySeriesFromHistory(supabase, 6);
  const revenueTrend = userGrowth.map((point, index) => ({
    label: point.label,
    value: Math.round((subscriptionGrowth[index]?.value ?? 0) * PREMIUM_MONTHLY_USD),
  }));

  const freeUsers = Math.max(0, totalUsers - premiumSubscribers);
  const trialingCount = subscriptionRows.filter((row) => row.status === "trialing").length;

  const mapRecipeMetric = (row: {
    recipe_id: string;
    title: string;
    slug: string;
    view_count?: number;
    save_count?: number;
    brew_count?: number;
    average_rating?: number;
    review_count?: number;
    activity_count?: number;
  }): OwnerRecipeMetric => ({
    recipeId: row.recipe_id,
    title: row.title,
    slug: row.slug,
    viewCount: Number(row.view_count ?? 0),
    saveCount: Number(row.save_count ?? 0),
    brewCount: Number(row.brew_count ?? row.activity_count ?? 0),
    averageRating: Number(row.average_rating ?? 0),
    reviewCount: Number(row.review_count ?? 0),
  });

  const leaderboard = ((leaderboardRes.data ?? []) as Parameters<typeof mapRecipeMetric>[0][]).map(mapRecipeMetric);
  const trending = ((trendingRes.data ?? []) as Parameters<typeof mapRecipeMetric>[0][]).map(mapRecipeMetric);

  const mostBrewedRecipes = [...leaderboard]
    .sort((a, b) => b.brewCount - a.brewCount)
    .slice(0, 10);

  const mapNamed = (rows: Array<{ country?: string; method_name?: string; device_name?: string; user_count: number }>, key: "country" | "method_name" | "device_name") =>
    rows.map((row) => ({ name: (row[key] as string) ?? "—", count: Number(row.user_count) }));

  return {
    kpis: {
      totalUsers,
      premiumSubscribers,
      monthlyRecurringRevenueUsd: mrrUsd,
      activeUsers30d: Number(activeRow.monthly_active ?? 0),
      dailyActiveUsers: Number(activeRow.daily_active ?? 0),
      weeklyActiveUsers: Number(activeRow.weekly_active ?? 0),
      recipeViews,
      recipeSaves,
      suspendedUsers,
      flaggedReviews,
    },
    userGrowth,
    subscriptionGrowth,
    revenueTrend,
    conversionFunnel: [
      { key: "registered", label: "registered", value: totalUsers },
      { key: "free", label: "free", value: freeUsers },
      { key: "trialing", label: "trialing", value: trialingCount },
      { key: "premium", label: "premium", value: premiumSubscribers },
    ],
    revenue: {
      mrrUsd,
      monthlySubscribers,
      yearlySubscribers,
      churnRatePercent,
      trialConversionRatePercent,
      stripeConfigured: Boolean(process.env.STRIPE_SECRET_KEY),
    },
    topCountries: mapNamed((countriesRes.data ?? []) as Array<{ country: string; user_count: number }>, "country"),
    preferredBrewMethods: mapNamed((methodsRes.data ?? []) as Array<{ method_name: string; user_count: number }>, "method_name"),
    preferredDevices: mapNamed((devicesRes.data ?? []) as Array<{ device_name: string; user_count: number }>, "device_name"),
    mostViewedRecipes: leaderboard,
    mostBrewedRecipes,
    trendingRecipes: trending,
  };
}

const getCachedOwnerAnalytics = unstable_cache(
  async () => {
    if (!hasAdminClient()) {
      throw new Error("Admin client unavailable for analytics cache.");
    }
    const supabase = createAdminClient();
    return computeOwnerAnalytics(supabase);
  },
  ["owner-platform-analytics-v1"],
  { revalidate: 300, tags: ["owner-analytics"] },
);

/** Full owner analytics overview with cross-request caching (5 min). Falls back to live queries when admin client is unavailable. */
export async function getOwnerAnalyticsOverview(supabase: SupabaseClient): Promise<OwnerAnalyticsOverview> {
  if (hasAdminClient()) {
    try {
      return await getCachedOwnerAnalytics();
    } catch (error) {
      console.error("getCachedOwnerAnalytics failed, falling back to session client", error);
    }
  }
  return computeOwnerAnalytics(supabase);
}

export { computeOwnerAnalytics };

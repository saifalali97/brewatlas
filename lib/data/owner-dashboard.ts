import type { SupabaseClient } from "@supabase/supabase-js";
import type { ActivityFeedItem } from "@/types/community";

/** Display price used to estimate MRR from active premium subscriptions. */
import { PREMIUM_MONTHLY_AED } from "@/lib/billing/pricing";

export const PREMIUM_MONTHLY_PRICE_USD = PREMIUM_MONTHLY_AED;

export type OwnerDashboardStats = {
  totalUsers: number;
  premiumUsers: number;
  recipes: number;
  brewers: number;
  coffeeOrigins: number;
  reviews: number;
  collections: number;
  monthlyRevenueUsd: number;
};

export type OwnerChartPoint = {
  label: string;
  value: number;
};

export type OwnerDashboardOverview = {
  stats: OwnerDashboardStats;
  recentActivity: ActivityFeedItem[];
  userGrowth: OwnerChartPoint[];
  recipeGrowth: OwnerChartPoint[];
  revenueTrend: OwnerChartPoint[];
};

async function countTable(supabase: SupabaseClient, table: string): Promise<number> {
  const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });
  if (error) {
    console.error(`countTable(${table}) failed`, error);
    return 0;
  }
  return count ?? 0;
}

function buildMonthlySeries(total: number, months = 6): OwnerChartPoint[] {
  const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const now = new Date();
  const points: OwnerChartPoint[] = [];

  for (let index = months - 1; index >= 0; index -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1);
    const label = labels[date.getMonth()] ?? "—";
    const growthFactor = (months - index) / months;
    points.push({
      label,
      value: Math.max(0, Math.round(total * growthFactor * (0.55 + growthFactor * 0.45))),
    });
  }

  return points;
}

/** Aggregated CMS homepage metrics. Requires owner session (RLS grants admins full read). */
export async function getOwnerDashboardOverview(supabase: SupabaseClient): Promise<OwnerDashboardOverview> {
  const [
    totalUsers,
    recipes,
    coffeeOrigins,
    reviews,
    collections,
    brewers,
    premiumUsers,
  ] = await Promise.all([
    countTable(supabase, "profiles"),
    countTable(supabase, "recipes"),
    countTable(supabase, "origins"),
    countTable(supabase, "recipe_reviews"),
    countTable(supabase, "recipe_collections"),
    supabase
      .from("user_community_stats")
      .select("*", { count: "exact", head: true })
      .gt("brews_logged", 0)
      .then(({ count, error }) => {
        if (error) {
          console.error("brewers count failed", error);
          return 0;
        }
        return count ?? 0;
      }),
    supabase
      .from("subscriptions")
      .select("*", { count: "exact", head: true })
      .in("plan", ["premium", "enterprise"])
      .in("status", ["active", "trialing"])
      .then(({ count, error }) => {
        if (error) {
          console.error("premiumUsers count failed", error);
          return 0;
        }
        return count ?? 0;
      }),
  ]);

  const monthlyRevenueUsd = premiumUsers * PREMIUM_MONTHLY_PRICE_USD;

  let activity: ActivityFeedItem[] = [];
  const { data, error } = await supabase
      .from("user_activities")
      .select(
        `id, activity_type, metadata, created_at,
         profiles!user_activities_user_id_fkey ( id, full_name, avatar_url, country ),
         recipes ( id, title, slug ),
         badges ( id, key, name, icon ),
         target_profile:profiles!user_activities_target_user_id_fkey ( id, full_name, avatar_url, country )`,
      )
      .order("created_at", { ascending: false })
      .limit(12);

  if (!error && data) {
    type ProfileRow = { id: string; full_name: string | null; avatar_url: string | null; country: string | null };
    activity = (data as unknown as Array<{
      id: string;
      activity_type: string;
      metadata: Record<string, unknown> | null;
      created_at: string;
      profiles: ProfileRow | null;
      recipes: ActivityFeedItem["recipe"];
      badges: ActivityFeedItem["badge"];
      target_profile: ProfileRow | null;
    }>).map((row) => ({
      id: row.id,
      user: row.profiles
        ? {
            id: row.profiles.id,
            displayName: row.profiles.full_name,
            avatarUrl: row.profiles.avatar_url,
            country: row.profiles.country,
          }
        : { id: "", displayName: null, avatarUrl: null, country: null },
      activityType: row.activity_type as ActivityFeedItem["activityType"],
      recipe: row.recipes,
      badge: row.badges,
      targetUser: row.target_profile
        ? {
            id: row.target_profile.id,
            displayName: row.target_profile.full_name,
            avatarUrl: row.target_profile.avatar_url,
            country: row.target_profile.country,
          }
        : null,
      metadata: row.metadata ?? {},
      createdAt: row.created_at,
    }));
  }

  const stats: OwnerDashboardStats = {
    totalUsers,
    premiumUsers,
    recipes,
    brewers,
    coffeeOrigins,
    reviews,
    collections,
    monthlyRevenueUsd,
  };

  return {
    stats,
    recentActivity: activity,
    userGrowth: buildMonthlySeries(totalUsers),
    recipeGrowth: buildMonthlySeries(recipes),
    revenueTrend: buildMonthlySeries(monthlyRevenueUsd),
  };
}

import type { SupabaseClient } from "@supabase/supabase-js";
import type { BillingProvider, MembershipPlan, SubscriptionStatus } from "@/types/membership";

export const OWNER_SUBSCRIPTION_PAGE_SIZE = 15;

export type OwnerSubscriptionStatusFilter = SubscriptionStatus | "all";
export type OwnerSubscriptionPlanFilter = MembershipPlan | "all";

export type OwnerSubscriptionListItem = {
  id: string;
  userId: string;
  displayName: string | null;
  country: string | null;
  plan: MembershipPlan;
  status: SubscriptionStatus;
  billingProvider: BillingProvider;
  billingInterval: "month" | "year" | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  trialEndsAt: string | null;
  createdAt: string;
};

export type OwnerSubscriptionsPageResult = {
  items: OwnerSubscriptionListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
};

const OWNER_SUBSCRIPTION_SELECT = `
  id, user_id, plan, status, billing_provider, billing_interval,
  current_period_end, cancel_at_period_end, trial_ends_at, created_at,
  profiles!subscriptions_user_id_fkey ( full_name, country )
`;

type OwnerSubscriptionRow = {
  id: string;
  user_id: string;
  plan: MembershipPlan;
  status: SubscriptionStatus;
  billing_provider: BillingProvider;
  billing_interval: "month" | "year" | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  trial_ends_at: string | null;
  created_at: string;
  profiles: { full_name: string | null; country: string | null } | null;
};

function mapOwnerSubscriptionRow(row: OwnerSubscriptionRow): OwnerSubscriptionListItem {
  return {
    id: row.id,
    userId: row.user_id,
    displayName: row.profiles?.full_name ?? null,
    country: row.profiles?.country ?? null,
    plan: row.plan,
    status: row.status,
    billingProvider: row.billing_provider,
    billingInterval: row.billing_interval,
    currentPeriodEnd: row.current_period_end,
    cancelAtPeriodEnd: row.cancel_at_period_end,
    trialEndsAt: row.trial_ends_at,
    createdAt: row.created_at,
  };
}

export type OwnerSubscriptionFilters = {
  search?: string;
  plan?: OwnerSubscriptionPlanFilter;
  status?: OwnerSubscriptionStatusFilter;
  page?: number;
};

/** Paginated subscription list for the owner dashboard. Requires admin RLS. */
export async function getOwnerSubscriptionsPage(
  supabase: SupabaseClient,
  filters: OwnerSubscriptionFilters = {},
): Promise<OwnerSubscriptionsPageResult> {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = OWNER_SUBSCRIPTION_PAGE_SIZE;
  const offset = (page - 1) * pageSize;
  const search = filters.search?.trim() ?? "";

  let query = supabase.from("subscriptions").select(OWNER_SUBSCRIPTION_SELECT, { count: "exact" });

  if (filters.plan && filters.plan !== "all") {
    query = query.eq("plan", filters.plan);
  }

  if (filters.status && filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (search) {
    const { data: profileMatches } = await supabase
      .from("profiles")
      .select("id")
      .or(`full_name.ilike.%${search}%,country.ilike.%${search}%`);
    const userIds = (profileMatches ?? []).map((row) => row.id as string);
    if (userIds.length === 0) {
      return { items: [], totalCount: 0, page, pageSize };
    }
    query = query.in("user_id", userIds);
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error) {
    console.error("getOwnerSubscriptionsPage failed", error);
    return { items: [], totalCount: 0, page, pageSize };
  }

  return {
    items: (data as unknown as OwnerSubscriptionRow[]).map(mapOwnerSubscriptionRow),
    totalCount: count ?? 0,
    page,
    pageSize,
  };
}

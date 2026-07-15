import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppRole } from "@/types/auth";
import type { MembershipPlan, SubscriptionStatus } from "@/types/membership";

export const OWNER_USER_PAGE_SIZE = 15;

export type OwnerUserStatusFilter = "all" | "active" | "suspended";

export type OwnerUserListItem = {
  id: string;
  displayName: string | null;
  email: string | null;
  country: string | null;
  role: AppRole | string;
  plan: MembershipPlan | string;
  subscriptionStatus: SubscriptionStatus | string | null;
  recipesCreated: number;
  reviewsWritten: number;
  suspendedAt: string | null;
  suspensionReason: string | null;
  createdAt: string;
};

export type OwnerUsersPageResult = {
  items: OwnerUserListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
};

const OWNER_USER_SELECT = `
  id, full_name, country, role, suspended_at, suspension_reason, created_at,
  subscriptions ( plan, status ),
  user_community_stats ( recipes_created, reviews_written )
`;

type OwnerUserRow = {
  id: string;
  full_name: string | null;
  country: string | null;
  role: string;
  suspended_at: string | null;
  suspension_reason: string | null;
  created_at: string;
  subscriptions: { plan: string; status: string } | { plan: string; status: string }[] | null;
  user_community_stats: { recipes_created: number; reviews_written: number } | null;
};

function mapOwnerUserRow(row: OwnerUserRow): OwnerUserListItem {
  const subscription = Array.isArray(row.subscriptions) ? row.subscriptions[0] : row.subscriptions;
  return {
    id: row.id,
    displayName: row.full_name,
    email: null,
    country: row.country,
    role: row.role,
    plan: (subscription?.plan as MembershipPlan) ?? "free",
    subscriptionStatus: (subscription?.status as SubscriptionStatus) ?? null,
    recipesCreated: row.user_community_stats?.recipes_created ?? 0,
    reviewsWritten: row.user_community_stats?.reviews_written ?? 0,
    suspendedAt: row.suspended_at,
    suspensionReason: row.suspension_reason,
    createdAt: row.created_at,
  };
}

export type OwnerUserFilters = {
  search?: string;
  status?: OwnerUserStatusFilter;
  page?: number;
};

/** Paginated user list for owner moderation. Requires admin RLS. */
export async function getOwnerUsersPage(
  supabase: SupabaseClient,
  filters: OwnerUserFilters = {},
): Promise<OwnerUsersPageResult> {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = OWNER_USER_PAGE_SIZE;
  const offset = (page - 1) * pageSize;
  const search = filters.search?.trim() ?? "";

  let query = supabase.from("profiles").select(OWNER_USER_SELECT, { count: "exact" });

  if (filters.status === "suspended") {
    query = query.not("suspended_at", "is", null);
  } else if (filters.status === "active") {
    query = query.is("suspended_at", null);
  }

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,country.ilike.%${search}%`);
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error) {
    console.error("getOwnerUsersPage failed", error);
    return { items: [], totalCount: 0, page, pageSize };
  }

  return {
    items: (data as unknown as OwnerUserRow[]).map(mapOwnerUserRow),
    totalCount: count ?? 0,
    page,
    pageSize,
  };
}

/** Loads a single user for owner detail/actions. */
export async function getOwnerUserById(supabase: SupabaseClient, userId: string): Promise<OwnerUserListItem | null> {
  const { data, error } = await supabase.from("profiles").select(OWNER_USER_SELECT).eq("id", userId).maybeSingle();
  if (error || !data) return null;
  return mapOwnerUserRow(data as unknown as OwnerUserRow);
}

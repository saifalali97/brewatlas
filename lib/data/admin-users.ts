import "server-only";

import { createAdminClient, hasAdminClient } from "@/lib/supabase/admin";
import {
  getOwnerUsersPage,
  type OwnerUserFilters,
  type OwnerUserListItem,
  type OwnerUsersPageResult,
} from "@/lib/data/owner-users";

export type AdminUsersPageResult = OwnerUsersPageResult;

async function fetchEmailForUser(userId: string): Promise<string | null> {
  if (!hasAdminClient()) return null;
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.getUserById(userId);
    if (error || !data.user) return null;
    return data.user.email ?? null;
  } catch {
    return null;
  }
}

async function enrichUsersWithEmails(items: OwnerUserListItem[]): Promise<OwnerUserListItem[]> {
  if (items.length === 0) return items;
  const emails = await Promise.all(items.map((item) => fetchEmailForUser(item.id)));
  return items.map((item, index) => ({ ...item, email: emails[index] }));
}

async function findProfileIdsByEmail(search: string): Promise<string[]> {
  if (!search.includes("@") || !hasAdminClient()) return [];
  try {
    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 50 });
    if (error || !data.users) return [];
    const needle = search.toLowerCase();
    return data.users.filter((user) => user.email?.toLowerCase().includes(needle)).map((user) => user.id);
  } catch {
    return [];
  }
}

/** Paginated admin user list with email enrichment via service role. */
export async function getAdminUsersPage(
  supabase: Parameters<typeof getOwnerUsersPage>[0],
  filters: OwnerUserFilters = {},
): Promise<AdminUsersPageResult> {
  const search = filters.search?.trim() ?? "";

  if (search.includes("@")) {
    const matchingIds = await findProfileIdsByEmail(search);
    if (matchingIds.length === 0) {
      return { items: [], totalCount: 0, page: filters.page ?? 1, pageSize: 15 };
    }

    const page = Math.max(1, filters.page ?? 1);
    const pageSize = 15;
    const offset = (page - 1) * pageSize;
    const slice = matchingIds.slice(offset, offset + pageSize);

    const items = await Promise.all(
      slice.map(async (id) => {
        const { data } = await supabase
          .from("profiles")
          .select(
            `id, full_name, country, role, suspended_at, suspension_reason, created_at,
            subscriptions ( plan, status ),
            user_community_stats ( recipes_created, reviews_written )`,
          )
          .eq("id", id)
          .maybeSingle();
        if (!data) return null;
        const subscription = Array.isArray(data.subscriptions) ? data.subscriptions[0] : data.subscriptions;
        const stats = Array.isArray(data.user_community_stats)
          ? data.user_community_stats[0]
          : data.user_community_stats;
        return {
          id: data.id,
          displayName: data.full_name,
          email: null,
          country: data.country,
          role: data.role,
          plan: subscription?.plan ?? "free",
          subscriptionStatus: subscription?.status ?? null,
          recipesCreated: stats?.recipes_created ?? 0,
          reviewsWritten: stats?.reviews_written ?? 0,
          suspendedAt: data.suspended_at,
          suspensionReason: data.suspension_reason,
          createdAt: data.created_at,
        } as OwnerUserListItem;
      }),
    );

    const filtered = items.filter((item): item is OwnerUserListItem => item !== null);
    return {
      items: await enrichUsersWithEmails(filtered),
      totalCount: matchingIds.length,
      page,
      pageSize,
    };
  }

  const result = await getOwnerUsersPage(supabase, filters);
  return {
    ...result,
    items: await enrichUsersWithEmails(result.items),
  };
}

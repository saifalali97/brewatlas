import type { SupabaseClient } from "@supabase/supabase-js";
import type { ReviewModerationStatus } from "@/types/community";

export const OWNER_REVIEW_PAGE_SIZE = 15;

export type OwnerReviewStatusFilter = ReviewModerationStatus | "all";

export type OwnerReviewListItem = {
  id: string;
  recipeId: string;
  recipeTitle: string;
  recipeSlug: string;
  reviewerName: string | null;
  reviewerCountry: string | null;
  rating: number;
  reviewText: string | null;
  helpfulCount: number;
  moderationStatus: ReviewModerationStatus;
  flagReason: string | null;
  flaggedAt: string | null;
  createdAt: string;
};

export type OwnerReviewsPageResult = {
  items: OwnerReviewListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
};

const OWNER_REVIEW_SELECT = `
  id, recipe_id, rating, review_text, moderation_status, flag_reason, flagged_at, created_at,
  profiles!recipe_reviews_user_id_fkey ( full_name, country ),
  recipes ( title, slug ),
  recipe_review_helpful_votes ( user_id )
`;

type OwnerReviewRow = {
  id: string;
  recipe_id: string;
  rating: number;
  review_text: string | null;
  moderation_status: ReviewModerationStatus;
  flag_reason: string | null;
  flagged_at: string | null;
  created_at: string;
  profiles: { full_name: string | null; country: string | null } | null;
  recipes: { title: string; slug: string } | null;
  recipe_review_helpful_votes: { user_id: string }[] | null;
};

function mapOwnerReviewRow(row: OwnerReviewRow): OwnerReviewListItem {
  return {
    id: row.id,
    recipeId: row.recipe_id,
    recipeTitle: row.recipes?.title ?? "—",
    recipeSlug: row.recipes?.slug ?? "",
    reviewerName: row.profiles?.full_name ?? null,
    reviewerCountry: row.profiles?.country ?? null,
    rating: row.rating,
    reviewText: row.review_text,
    helpfulCount: row.recipe_review_helpful_votes?.length ?? 0,
    moderationStatus: row.moderation_status ?? "visible",
    flagReason: row.flag_reason,
    flaggedAt: row.flagged_at,
    createdAt: row.created_at,
  };
}

export type OwnerReviewFilters = {
  search?: string;
  status?: OwnerReviewStatusFilter;
  page?: number;
};

/** Paginated review list for the owner moderation dashboard. Requires admin RLS. */
export async function getOwnerReviewsPage(
  supabase: SupabaseClient,
  filters: OwnerReviewFilters = {},
): Promise<OwnerReviewsPageResult> {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = OWNER_REVIEW_PAGE_SIZE;
  const offset = (page - 1) * pageSize;
  const search = filters.search?.trim() ?? "";

  let recipeIds: string[] | null = null;
  if (search) {
    const { data: recipeMatches } = await supabase.from("recipes").select("id").ilike("title", `%${search}%`);
    recipeIds = (recipeMatches ?? []).map((row) => row.id as string);
  }

  let query = supabase.from("recipe_reviews").select(OWNER_REVIEW_SELECT, { count: "exact" });

  if (filters.status && filters.status !== "all") {
    query = query.eq("moderation_status", filters.status);
  }

  if (search) {
    if (recipeIds && recipeIds.length > 0) {
      query = query.or(`review_text.ilike.%${search}%,recipe_id.in.(${recipeIds.join(",")})`);
    } else {
      query = query.ilike("review_text", `%${search}%`);
    }
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error) {
    console.error("getOwnerReviewsPage failed", error);
    return { items: [], totalCount: 0, page, pageSize };
  }

  return {
    items: (data as unknown as OwnerReviewRow[]).map(mapOwnerReviewRow),
    totalCount: count ?? 0,
    page,
    pageSize,
  };
}

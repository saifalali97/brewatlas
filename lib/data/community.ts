import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ActivityFeedItem,
  ActivityType,
  Badge,
  CommunityStats,
  DbPublicProfileRow,
  DbRecipeReviewRow,
  LeaderboardKind,
  NotificationItem,
  NotificationsPageResult,
  ProfileSummary,
  PublicProfile,
  RatingDistributionBucket,
  RecipeLeaderboardEntry,
  RecipeRatingSummary,
  RecipeReview,
  RecipeReviewsResult,
  ReviewModerationStatus,
  ReviewSort,
  TrendingBrewingMethod,
  TrendingCoffee,
  TrendingRecipe,
  TrendingRoaster,
  UserBadge,
  UserLeaderboardEntry,
  UserReviewListItem,
} from "@/types/community";
import { EMPTY_COMMUNITY_STATS, NOTIFICATION_PAGE_SIZE, REVIEW_PAGE_SIZE, REVIEW_SORTS } from "@/types/community";

/**
 * Data-access layer for the Coffee Community system: public profiles,
 * followers, recipe engagement (likes/saves/ratings/reviews/helpful
 * votes), badges, Brew Score / leaderboards, trending, the activity feed,
 * and notifications.
 *
 * Mirrors `lib/data/personal.ts` / `lib/data/xbloom.ts` / `lib/data/brew-
 * engine.ts`: plain functions taking a Supabase client, safe to call from
 * Server Components, Server Actions, or (later) a mobile app talking to
 * the same Supabase project directly.
 */

const PUBLIC_PROFILE_SELECT = `
  id, full_name, avatar_url, country, bio, owns_xbloom,
  favorite_brewing_method_id, brewing_methods ( id, name ),
  favorite_origin_id, origins ( id, country, region ),
  favorite_coffee_id, coffees!profiles_favorite_coffee_id_fkey ( id, name ),
  favorite_roaster_id, roasters ( id, name ),
  favorite_grinder_id, grinders ( id, name ),
  favorite_device_id, devices ( id, name )
`;

function mapCommunityStatsRow(row: {
  total_brews: number;
  recipes_created: number;
  reviews_written: number;
  helpful_votes_received: number;
  recipes_liked: number;
  recipes_saved: number;
  followers_count: number;
  following_count: number;
  brew_score: number;
  activity_score: number;
  updated_at: string;
} | null): CommunityStats {
  if (!row) return EMPTY_COMMUNITY_STATS;
  return {
    totalBrews: row.total_brews,
    recipesCreated: row.recipes_created,
    reviewsWritten: row.reviews_written,
    helpfulVotesReceived: row.helpful_votes_received,
    recipesLiked: row.recipes_liked,
    recipesSaved: row.recipes_saved,
    followersCount: row.followers_count,
    followingCount: row.following_count,
    brewScore: row.brew_score,
    activityScore: row.activity_score,
    updatedAt: row.updated_at,
  };
}

/** A user's public Brewing Statistics + Brew Score, or all-zero defaults if never refreshed. */
export async function getCommunityStats(supabase: SupabaseClient, userId: string): Promise<CommunityStats> {
  const { data, error } = await supabase
    .from("user_community_stats")
    .select(
      "total_brews, recipes_created, reviews_written, helpful_votes_received, recipes_liked, recipes_saved, followers_count, following_count, brew_score, activity_score, updated_at",
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error) console.error("getCommunityStats failed", error);
  return mapCommunityStatsRow(data ?? null);
}

/** Recomputes `user_community_stats` for one user (call after any action that changes their stats). */
export async function refreshCommunityStats(supabase: SupabaseClient, userId: string): Promise<void> {
  const { error } = await supabase.rpc("refresh_user_community_stats", { target_user_id: userId });
  if (error) console.error("refreshCommunityStats failed", error);
}

/** Evaluates all badge criteria for a user and awards any newly-qualified badges. Returns newly-awarded badge keys. */
export async function evaluateAndAwardBadges(supabase: SupabaseClient, userId: string): Promise<string[]> {
  const { data, error } = await supabase.rpc("evaluate_and_award_badges", { target_user_id: userId });
  if (error) {
    console.error("evaluateAndAwardBadges failed", error);
    return [];
  }
  return (data as string[] | null) ?? [];
}

/** A user's public profile, including favorites and Brewing Statistics. Optionally flags whether `viewerId` follows them. */
export async function getPublicProfile(
  supabase: SupabaseClient,
  profileId: string,
  viewerId?: string | null,
): Promise<PublicProfile | null> {
  const [{ data, error }, stats, isFollowedByViewer] = await Promise.all([
    supabase.from("profiles").select(PUBLIC_PROFILE_SELECT).eq("id", profileId).maybeSingle(),
    getCommunityStats(supabase, profileId),
    viewerId ? isFollowing(supabase, viewerId, profileId) : Promise.resolve(undefined),
  ]);

  if (error || !data) return null;
  const row = data as unknown as DbPublicProfileRow;

  return {
    id: row.id,
    displayName: row.full_name,
    avatarUrl: row.avatar_url,
    country: row.country,
    bio: row.bio,
    favoriteBrewMethod: row.brewing_methods,
    favoriteOrigin: row.origins ? { id: row.origins.id, name: [row.origins.region, row.origins.country].filter(Boolean).join(", ") } : null,
    favoriteCoffee: row.coffees,
    favoriteRoaster: row.roasters,
    favoriteGrinder: row.grinders,
    favoriteBrewer: row.devices,
    ownsXbloom: row.owns_xbloom,
    stats,
    isFollowedByViewer,
  };
}

function mapProfileSummary(row: { id: string; full_name: string | null; avatar_url: string | null; country: string | null }): ProfileSummary {
  return { id: row.id, displayName: row.full_name, avatarUrl: row.avatar_url, country: row.country };
}

/** True if `followerId` currently follows `followingId`. */
export async function isFollowing(supabase: SupabaseClient, followerId: string, followingId: string): Promise<boolean> {
  const { data } = await supabase
    .from("user_follows")
    .select("follower_id")
    .eq("follower_id", followerId)
    .eq("following_id", followingId)
    .maybeSingle();
  return Boolean(data);
}

/** Profiles that follow `userId` ("Followers"). */
export async function getFollowers(
  supabase: SupabaseClient,
  userId: string,
  options: { limit?: number } = {},
): Promise<ProfileSummary[]> {
  let query = supabase
    .from("user_follows")
    .select("profiles!user_follows_follower_id_fkey ( id, full_name, avatar_url, country )")
    .eq("following_id", userId)
    .order("created_at", { ascending: false });
  if (options.limit) query = query.limit(options.limit);

  const { data, error } = await query;
  if (error || !data) {
    if (error) console.error("getFollowers failed", error);
    return [];
  }
  return (data as unknown as { profiles: Parameters<typeof mapProfileSummary>[0] }[])
    .map((row) => row.profiles)
    .filter(Boolean)
    .map(mapProfileSummary);
}

/** Profiles that `userId` follows ("Following"). */
export async function getFollowing(
  supabase: SupabaseClient,
  userId: string,
  options: { limit?: number } = {},
): Promise<ProfileSummary[]> {
  let query = supabase
    .from("user_follows")
    .select("profiles!user_follows_following_id_fkey ( id, full_name, avatar_url, country )")
    .eq("follower_id", userId)
    .order("created_at", { ascending: false });
  if (options.limit) query = query.limit(options.limit);

  const { data, error } = await query;
  if (error || !data) {
    if (error) console.error("getFollowing failed", error);
    return [];
  }
  return (data as unknown as { profiles: Parameters<typeof mapProfileSummary>[0] }[])
    .map((row) => row.profiles)
    .filter(Boolean)
    .map(mapProfileSummary);
}

/** Recipe ids `userId` has liked, for highlighting a like button as active. */
export async function getLikedRecipeIds(supabase: SupabaseClient, userId: string): Promise<Set<string>> {
  const { data, error } = await supabase.from("recipe_likes").select("recipe_id").eq("user_id", userId);
  if (error || !data) return new Set();
  return new Set(data.map((row) => row.recipe_id as string));
}

/** How many users have liked a recipe. */
export async function getRecipeLikeCount(supabase: SupabaseClient, recipeId: string): Promise<number> {
  const { count, error } = await supabase
    .from("recipe_likes")
    .select("*", { count: "exact", head: true })
    .eq("recipe_id", recipeId);
  if (error) console.error("getRecipeLikeCount failed", error);
  return count ?? 0;
}

const REVIEW_SELECT =
  "id, recipe_id, user_id, rating, review_text, moderation_status, flagged_at, flag_reason, created_at, updated_at, profiles!recipe_reviews_user_id_fkey ( id, full_name, avatar_url, country ), recipe_review_helpful_votes ( user_id )";

function parseReviewSort(value: string | undefined): ReviewSort {
  if (value && (REVIEW_SORTS as readonly string[]).includes(value)) {
    return value as ReviewSort;
  }
  return "newest";
}

function mapDbReviewToRecipeReview(row: DbRecipeReviewRow, viewerId?: string | null): RecipeReview {
  return {
    id: row.id,
    recipeId: row.recipe_id,
    user: row.profiles
      ? mapProfileSummary(row.profiles)
      : { id: row.user_id, displayName: null, avatarUrl: null, country: null },
    rating: row.rating,
    reviewText: row.review_text,
    helpfulCount: row.recipe_review_helpful_votes?.length ?? 0,
    isHelpfulByViewer: viewerId ? row.recipe_review_helpful_votes?.some((vote) => vote.user_id === viewerId) : undefined,
    moderationStatus: (row.moderation_status as ReviewModerationStatus) ?? "visible",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function sortReviews(reviews: RecipeReview[], sort: ReviewSort): RecipeReview[] {
  const sorted = [...reviews];
  if (sort === "highest") {
    sorted.sort((a, b) => b.rating - a.rating || b.createdAt.localeCompare(a.createdAt));
  } else if (sort === "lowest") {
    sorted.sort((a, b) => a.rating - b.rating || b.createdAt.localeCompare(a.createdAt));
  } else if (sort === "helpful") {
    sorted.sort((a, b) => b.helpfulCount - a.helpfulCount || b.createdAt.localeCompare(a.createdAt));
  } else {
    sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  return sorted;
}

/** Paginated, sortable reviews for a recipe. RLS hides moderated reviews from the public. */
export async function getRecipeReviewsPage(
  supabase: SupabaseClient,
  recipeId: string,
  options: {
    sort?: ReviewSort;
    page?: number;
    pageSize?: number;
    viewerId?: string | null;
  } = {},
): Promise<RecipeReviewsResult> {
  const sort = options.sort ?? "newest";
  const page = Math.max(1, options.page ?? 1);
  const pageSize = options.pageSize ?? REVIEW_PAGE_SIZE;

  if (sort === "helpful") {
    const { data, error } = await supabase
      .from("recipe_reviews")
      .select(REVIEW_SELECT)
      .eq("recipe_id", recipeId);

    if (error || !data) {
      if (error) console.error("getRecipeReviewsPage failed", error);
      return { reviews: [], totalCount: 0, page, pageSize, sort };
    }

    const mapped = (data as unknown as DbRecipeReviewRow[]).map((row) => mapDbReviewToRecipeReview(row, options.viewerId));
    const sorted = sortReviews(mapped, sort);
    const offset = (page - 1) * pageSize;
    return {
      reviews: sorted.slice(offset, offset + pageSize),
      totalCount: sorted.length,
      page,
      pageSize,
      sort,
    };
  }

  let query = supabase.from("recipe_reviews").select(REVIEW_SELECT, { count: "exact" }).eq("recipe_id", recipeId);

  if (sort === "highest") {
    query = query.order("rating", { ascending: false }).order("created_at", { ascending: false });
  } else if (sort === "lowest") {
    query = query.order("rating", { ascending: true }).order("created_at", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const offset = (page - 1) * pageSize;
  const { data, error, count } = await query.range(offset, offset + pageSize - 1);

  if (error || !data) {
    if (error) console.error("getRecipeReviewsPage failed", error);
    return { reviews: [], totalCount: 0, page, pageSize, sort };
  }

  return {
    reviews: (data as unknown as DbRecipeReviewRow[]).map((row) => mapDbReviewToRecipeReview(row, options.viewerId)),
    totalCount: count ?? 0,
    page,
    pageSize,
    sort,
  };
}

/** @deprecated Use `getRecipeReviewsPage` — kept for any internal callers expecting the full list. */
export async function getRecipeReviews(
  supabase: SupabaseClient,
  recipeId: string,
  viewerId?: string | null,
): Promise<RecipeReview[]> {
  const result = await getRecipeReviewsPage(supabase, recipeId, { viewerId, page: 1, pageSize: 500, sort: "newest" });
  return result.reviews;
}

/** A single user's review of a recipe, if any (for pre-filling an edit form). */
export async function getUserRecipeReview(
  supabase: SupabaseClient,
  recipeId: string,
  userId: string,
): Promise<RecipeReview | null> {
  const { data, error } = await supabase
    .from("recipe_reviews")
    .select(REVIEW_SELECT)
    .eq("recipe_id", recipeId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return mapDbReviewToRecipeReview(data as unknown as DbRecipeReviewRow, userId);
}

/** Average rating + review count for a recipe, from `recipe_rating_summary`. */
export async function getRecipeRatingSummary(supabase: SupabaseClient, recipeId: string): Promise<RecipeRatingSummary> {
  const { data, error } = await supabase
    .from("recipe_rating_summary")
    .select("recipe_id, review_count, average_rating")
    .eq("recipe_id", recipeId)
    .maybeSingle();

  if (error) console.error("getRecipeRatingSummary failed", error);
  return {
    recipeId,
    reviewCount: data?.review_count ?? 0,
    averageRating: data?.average_rating ?? null,
  };
}

/** Distribution of 1–5 star ratings for a recipe (visible reviews only, via RLS). */
export async function getRecipeRatingDistribution(
  supabase: SupabaseClient,
  recipeId: string,
): Promise<RatingDistributionBucket[]> {
  const { data, error } = await supabase
    .from("recipe_reviews")
    .select("rating")
    .eq("recipe_id", recipeId);

  if (error || !data) {
    if (error) console.error("getRecipeRatingDistribution failed", error);
    return [1, 2, 3, 4, 5].map((stars) => ({ stars, count: 0, percent: 0 }));
  }

  const counts = new Map<number, number>();
  for (const row of data) {
    const rating = row.rating as number;
    counts.set(rating, (counts.get(rating) ?? 0) + 1);
  }

  const total = data.length;
  return [5, 4, 3, 2, 1].map((stars) => {
    const count = counts.get(stars) ?? 0;
    return {
      stars,
      count,
      percent: total > 0 ? Math.round((count / total) * 100) : 0,
    };
  });
}

/** Reviews a user has written, with recipe title/slug for profile listings. */
export async function getUserReviewsWritten(
  supabase: SupabaseClient,
  userId: string,
  options: { limit?: number } = {},
): Promise<UserReviewListItem[]> {
  const limit = options.limit ?? 20;
  const { data, error } = await supabase
    .from("recipe_reviews")
    .select(`${REVIEW_SELECT}, recipes ( title, slug )`)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    if (error) console.error("getUserReviewsWritten failed", error);
    return [];
  }

  type Row = DbRecipeReviewRow & { recipes: { title: string; slug: string } | null };

  return (data as unknown as Row[])
    .filter((row) => row.recipes)
    .map((row) => ({
      review: mapDbReviewToRecipeReview(row, userId),
      recipeTitle: row.recipes!.title,
      recipeSlug: row.recipes!.slug,
    }));
}

/** Average star rating the user has given across all their reviews. */
export async function getUserAverageRatingGiven(supabase: SupabaseClient, userId: string): Promise<number | null> {
  const { data, error } = await supabase.from("recipe_reviews").select("rating").eq("user_id", userId);

  if (error || !data || data.length === 0) {
    if (error) console.error("getUserAverageRatingGiven failed", error);
    return null;
  }

  const sum = data.reduce((total, row) => total + (row.rating as number), 0);
  return Math.round((sum / data.length) * 10) / 10;
}

export { parseReviewSort };

/** The full badge catalog, in display order. */
export async function getBadgeCatalog(supabase: SupabaseClient): Promise<Badge[]> {
  const { data, error } = await supabase
    .from("badges")
    .select("id, key, name, description, criteria_description, icon, sort_order")
    .order("sort_order", { ascending: true });

  if (error || !data) {
    if (error) console.error("getBadgeCatalog failed", error);
    return [];
  }
  return data.map((row) => ({
    id: row.id,
    key: row.key,
    name: row.name,
    description: row.description,
    criteriaDescription: row.criteria_description,
    icon: row.icon,
    sortOrder: row.sort_order,
  }));
}

/** The full badge catalog for a user, each entry marked with `earnedAt` (null if not yet earned). */
export async function getUserBadges(supabase: SupabaseClient, userId: string): Promise<UserBadge[]> {
  const [catalog, { data: earnedRows, error }] = await Promise.all([
    getBadgeCatalog(supabase),
    supabase.from("user_badges").select("badge_id, earned_at").eq("user_id", userId),
  ]);

  if (error) console.error("getUserBadges failed", error);
  const earnedByBadgeId = new Map((earnedRows ?? []).map((row) => [row.badge_id as string, row.earned_at as string]));

  return catalog.map((badge) => ({ ...badge, earnedAt: earnedByBadgeId.get(badge.id) ?? null }));
}

async function mapStatsLeaderboard(
  supabase: SupabaseClient,
  orderColumn: "brew_score" | "activity_score" | "recipes_created" | "helpful_votes_received",
  limit: number,
): Promise<UserLeaderboardEntry[]> {
  const { data, error } = await supabase
    .from("user_community_stats")
    .select(
      "user_id, total_brews, recipes_created, reviews_written, helpful_votes_received, recipes_liked, recipes_saved, followers_count, following_count, brew_score, activity_score, updated_at, profiles ( id, full_name, avatar_url, country )",
    )
    .order(orderColumn, { ascending: false })
    .limit(limit);

  if (error || !data) {
    if (error) console.error("leaderboard query failed", error);
    return [];
  }

  return (
    data as unknown as {
      user_id: string;
      total_brews: number;
      recipes_created: number;
      reviews_written: number;
      helpful_votes_received: number;
      recipes_liked: number;
      recipes_saved: number;
      followers_count: number;
      following_count: number;
      brew_score: number;
      activity_score: number;
      updated_at: string;
      profiles: { id: string; full_name: string | null; avatar_url: string | null; country: string | null } | null;
    }[]
  ).map((row, index) => ({
    rank: index + 1,
    profile: row.profiles
      ? mapProfileSummary(row.profiles)
      : { id: row.user_id, displayName: null, avatarUrl: null, country: null },
    value: row[orderColumn],
    stats: mapCommunityStatsRow(row),
  }));
}

/** "Top Brewers" leaderboard, ranked by Brew Score. */
export async function getTopBrewersLeaderboard(supabase: SupabaseClient, limit = 10): Promise<UserLeaderboardEntry[]> {
  return mapStatsLeaderboard(supabase, "brew_score", limit);
}

/** "Most Active Users" leaderboard, ranked by activity score (brews + recipes + reviews). */
export async function getMostActiveUsersLeaderboard(supabase: SupabaseClient, limit = 10): Promise<UserLeaderboardEntry[]> {
  return mapStatsLeaderboard(supabase, "activity_score", limit);
}

/** "Top Recipe Creators" leaderboard, ranked by published recipes authored. */
export async function getTopRecipeCreatorsLeaderboard(supabase: SupabaseClient, limit = 10): Promise<UserLeaderboardEntry[]> {
  return mapStatsLeaderboard(supabase, "recipes_created", limit);
}

/** "Most Helpful Members" leaderboard, ranked by helpful votes received on reviews. */
export async function getMostHelpfulMembersLeaderboard(supabase: SupabaseClient, limit = 10): Promise<UserLeaderboardEntry[]> {
  return mapStatsLeaderboard(supabase, "helpful_votes_received", limit);
}

/** "Highest Rated Recipes" leaderboard, ranked by average rating (minimum 1 review). */
export async function getHighestRatedRecipesLeaderboard(
  supabase: SupabaseClient,
  limit = 10,
): Promise<RecipeLeaderboardEntry[]> {
  const { data, error } = await supabase
    .from("recipe_rating_summary")
    .select("recipe_id, review_count, average_rating, recipes ( id, title, slug, cover_image_url, published )")
    .order("average_rating", { ascending: false })
    .limit(limit * 3);

  if (error || !data) {
    if (error) console.error("getHighestRatedRecipesLeaderboard failed", error);
    return [];
  }

  return (
    data as unknown as {
      recipe_id: string;
      review_count: number;
      average_rating: number;
      recipes: { id: string; title: string; slug: string; cover_image_url: string | null; published: boolean } | null;
    }[]
  )
    .filter((row) => row.recipes?.published)
    .slice(0, limit)
    .map((row, index) => ({
      rank: index + 1,
      recipeId: row.recipe_id,
      title: row.recipes?.title ?? "",
      slug: row.recipes?.slug ?? "",
      coverImageUrl: row.recipes?.cover_image_url ?? null,
      averageRating: row.average_rating,
      reviewCount: row.review_count,
    }));
}

/** Retrieves a leaderboard by kind, for a single generic entry point (e.g. a `/community/leaderboards/[kind]` route). */
export async function getLeaderboard(
  supabase: SupabaseClient,
  kind: LeaderboardKind,
  limit = 10,
): Promise<UserLeaderboardEntry[] | RecipeLeaderboardEntry[]> {
  switch (kind) {
    case "top_brewers":
      return getTopBrewersLeaderboard(supabase, limit);
    case "most_active":
      return getMostActiveUsersLeaderboard(supabase, limit);
    case "top_recipe_creators":
      return getTopRecipeCreatorsLeaderboard(supabase, limit);
    case "most_helpful":
      return getMostHelpfulMembersLeaderboard(supabase, limit);
    case "highest_rated_recipes":
      return getHighestRatedRecipesLeaderboard(supabase, limit);
    default:
      return [];
  }
}

/** Trending recipes (most brews + likes) in the last `days` days. */
export async function getTrendingRecipes(supabase: SupabaseClient, days = 14, limit = 10): Promise<TrendingRecipe[]> {
  const { data, error } = await supabase.rpc("trending_recipes", { days, result_limit: limit });
  if (error || !data) {
    if (error) console.error("getTrendingRecipes failed", error);
    return [];
  }
  return (
    data as { recipe_id: string; title: string; slug: string; cover_image_url: string | null; brew_count: number; like_count: number; activity_count: number }[]
  ).map((row) => ({
    recipeId: row.recipe_id,
    title: row.title,
    slug: row.slug,
    coverImageUrl: row.cover_image_url,
    brewCount: row.brew_count,
    likeCount: row.like_count,
    activityCount: row.activity_count,
  }));
}

/** Trending coffees (most brewed) in the last `days` days. */
export async function getTrendingCoffees(supabase: SupabaseClient, days = 14, limit = 10): Promise<TrendingCoffee[]> {
  const { data, error } = await supabase.rpc("trending_coffees", { days, result_limit: limit });
  if (error || !data) {
    if (error) console.error("getTrendingCoffees failed", error);
    return [];
  }
  return (
    data as { coffee_id: string; coffee_name: string; roaster_name: string | null; origin_country: string | null; activity_count: number }[]
  ).map((row) => ({
    coffeeId: row.coffee_id,
    coffeeName: row.coffee_name,
    roasterName: row.roaster_name,
    originCountry: row.origin_country,
    activityCount: row.activity_count,
  }));
}

/** Trending roasters (most of their coffees brewed) in the last `days` days. */
export async function getTrendingRoasters(supabase: SupabaseClient, days = 14, limit = 10): Promise<TrendingRoaster[]> {
  const { data, error } = await supabase.rpc("trending_roasters", { days, result_limit: limit });
  if (error || !data) {
    if (error) console.error("getTrendingRoasters failed", error);
    return [];
  }
  return (data as { roaster_id: string; roaster_name: string; activity_count: number }[]).map((row) => ({
    roasterId: row.roaster_id,
    roasterName: row.roaster_name,
    activityCount: row.activity_count,
  }));
}

/** Trending brewing methods (most used) in the last `days` days. */
export async function getTrendingBrewingMethods(
  supabase: SupabaseClient,
  days = 14,
  limit = 10,
): Promise<TrendingBrewingMethod[]> {
  const { data, error } = await supabase.rpc("trending_brewing_methods", { days, result_limit: limit });
  if (error || !data) {
    if (error) console.error("getTrendingBrewingMethods failed", error);
    return [];
  }
  return (data as { brewing_method_id: string; method_name: string; activity_count: number }[]).map((row) => ({
    brewingMethodId: row.brewing_method_id,
    methodName: row.method_name,
    activityCount: row.activity_count,
  }));
}

/** Records a new activity feed entry as a side effect of another action. Never throws -- a failure here shouldn't fail the triggering action. */
export async function recordActivity(
  supabase: SupabaseClient,
  params: {
    userId: string;
    activityType: ActivityType;
    recipeId?: string | null;
    badgeId?: string | null;
    targetUserId?: string | null;
    metadata?: Record<string, unknown>;
  },
): Promise<void> {
  const { error } = await supabase.from("user_activities").insert({
    user_id: params.userId,
    activity_type: params.activityType,
    recipe_id: params.recipeId ?? null,
    badge_id: params.badgeId ?? null,
    target_user_id: params.targetUserId ?? null,
    metadata: params.metadata ?? {},
  });
  if (error) console.error("recordActivity failed", error);
}

type DbActivityRow = {
  id: string;
  activity_type: string;
  metadata: Record<string, unknown>;
  created_at: string;
  profiles: { id: string; full_name: string | null; avatar_url: string | null; country: string | null } | null;
  recipes: { id: string; title: string; slug: string } | null;
  badges: { id: string; key: string; name: string; icon: string } | null;
  target_profile: { id: string; full_name: string | null; avatar_url: string | null; country: string | null } | null;
};

function mapDbActivityToFeedItem(row: DbActivityRow): ActivityFeedItem {
  return {
    id: row.id,
    user: row.profiles
      ? mapProfileSummary(row.profiles)
      : { id: "", displayName: null, avatarUrl: null, country: null },
    activityType: row.activity_type,
    recipe: row.recipes,
    badge: row.badges,
    targetUser: row.target_profile ? mapProfileSummary(row.target_profile) : null,
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
  };
}

const ACTIVITY_SELECT = `
  id, activity_type, metadata, created_at,
  profiles!user_activities_user_id_fkey ( id, full_name, avatar_url, country ),
  recipes ( id, title, slug ),
  badges ( id, key, name, icon ),
  target_profile:profiles!user_activities_target_user_id_fkey ( id, full_name, avatar_url, country )
`;

/** The public activity feed, most recent first. */
export async function getActivityFeed(supabase: SupabaseClient, limit = 20): Promise<ActivityFeedItem[]> {
  const { data, error } = await supabase
    .from("user_activities")
    .select(ACTIVITY_SELECT)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    if (error) console.error("getActivityFeed failed", error);
    return [];
  }
  return (data as unknown as DbActivityRow[]).map(mapDbActivityToFeedItem);
}

/** Activity from the people `userId` follows ("following feed"), most recent first. */
export async function getFollowingActivityFeed(
  supabase: SupabaseClient,
  userId: string,
  limit = 20,
): Promise<ActivityFeedItem[]> {
  const { data: followingRows, error: followingError } = await supabase
    .from("user_follows")
    .select("following_id")
    .eq("follower_id", userId);

  if (followingError) console.error("getFollowingActivityFeed failed", followingError);
  const followingIds = (followingRows ?? []).map((row) => row.following_id as string);
  if (followingIds.length === 0) return [];

  const { data, error } = await supabase
    .from("user_activities")
    .select(ACTIVITY_SELECT)
    .in("user_id", followingIds)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    if (error) console.error("getFollowingActivityFeed failed", error);
    return [];
  }
  return (data as unknown as DbActivityRow[]).map(mapDbActivityToFeedItem);
}

/** One user's own activity, most recent first (shown on their public profile). */
export async function getUserActivityFeed(supabase: SupabaseClient, userId: string, limit = 20): Promise<ActivityFeedItem[]> {
  const { data, error } = await supabase
    .from("user_activities")
    .select(ACTIVITY_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    if (error) console.error("getUserActivityFeed failed", error);
    return [];
  }
  return (data as unknown as DbActivityRow[]).map(mapDbActivityToFeedItem);
}

type DbNotificationRow = {
  id: string;
  notification_type: string;
  title: string | null;
  message: string;
  metadata: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
  profiles: { id: string; full_name: string | null; avatar_url: string | null; country: string | null } | null;
  recipes: { id: string; title: string; slug: string } | null;
  badges: { id: string; key: string; name: string; icon: string } | null;
};

function mapDbNotificationRow(row: DbNotificationRow): NotificationItem {
  return {
    id: row.id,
    notificationType: row.notification_type,
    actor: row.profiles ? mapProfileSummary(row.profiles) : null,
    recipe: row.recipes,
    badge: row.badges,
    title: row.title,
    message: row.message,
    metadata: row.metadata ?? {},
    isRead: row.is_read,
    createdAt: row.created_at,
  };
}

const NOTIFICATION_SELECT =
  "id, notification_type, title, message, metadata, is_read, created_at, profiles:profiles!user_notifications_actor_id_fkey ( id, full_name, avatar_url, country ), recipes ( id, title, slug ), badges ( id, key, name, icon )";

/** The signed-in user's own notification inbox, most recent first. */
export async function getNotifications(
  supabase: SupabaseClient,
  userId: string,
  options: { limit?: number; unreadOnly?: boolean } = {},
): Promise<NotificationItem[]> {
  let query = supabase
    .from("user_notifications")
    .select(NOTIFICATION_SELECT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (options.unreadOnly) query = query.eq("is_read", false);
  if (options.limit) query = query.limit(options.limit);

  const { data, error } = await query;
  if (error || !data) {
    if (error) console.error("getNotifications failed", error);
    return [];
  }

  return (data as unknown as DbNotificationRow[]).map(mapDbNotificationRow);
}

/** Paginated notification inbox with total and unread counts. */
export async function getNotificationsPage(
  supabase: SupabaseClient,
  userId: string,
  options: { page?: number; pageSize?: number; unreadOnly?: boolean } = {},
): Promise<NotificationsPageResult> {
  const page = Math.max(1, options.page ?? 1);
  const pageSize = options.pageSize ?? NOTIFICATION_PAGE_SIZE;
  const offset = (page - 1) * pageSize;

  let query = supabase
    .from("user_notifications")
    .select(NOTIFICATION_SELECT, { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (options.unreadOnly) query = query.eq("is_read", false);

  const { data, error, count } = await query.range(offset, offset + pageSize - 1);
  if (error || !data) {
    if (error) console.error("getNotificationsPage failed", error);
    return { notifications: [], totalCount: 0, unreadCount: 0, page, pageSize };
  }

  const unreadCount = await getUnreadNotificationCount(supabase, userId);

  return {
    notifications: (data as unknown as DbNotificationRow[]).map(mapDbNotificationRow),
    totalCount: count ?? 0,
    unreadCount,
    page,
    pageSize,
  };
}

/** Count of unread notifications, for a badge/indicator in the UI. */
export async function getUnreadNotificationCount(supabase: SupabaseClient, userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("user_notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("is_read", false);
  if (error) console.error("getUnreadNotificationCount failed", error);
  return count ?? 0;
}

/** Creates a notification for `recipientId` via the `create_notification` RPC (bypasses RLS; see migration for why). No-op for self-notifications. */
export async function createNotification(
  supabase: SupabaseClient,
  params: {
    recipientId: string;
    notificationType: string;
    actorId?: string | null;
    recipeId?: string | null;
    badgeId?: string | null;
    message: string;
    title?: string | null;
    metadata?: Record<string, unknown>;
  },
): Promise<void> {
  const { error } = await supabase.rpc("create_notification", {
    recipient: params.recipientId,
    notif_type: params.notificationType,
    actor: params.actorId ?? null,
    related_recipe: params.recipeId ?? null,
    related_badge: params.badgeId ?? null,
    notif_message: params.message,
    notif_title: params.title ?? null,
    notif_metadata: params.metadata ?? {},
  });
  if (error) console.error("createNotification failed", error);
}

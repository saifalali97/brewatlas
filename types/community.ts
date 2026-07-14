import type { LookupOption } from "@/types/recipe";

/**
 * Types for the BrewAtlas Coffee Community system: public profiles,
 * followers, recipe engagement (likes/saves/ratings/reviews/helpful
 * votes), badges, Brew Score, leaderboards, trending, the activity feed,
 * and notifications.
 *
 * Nothing here is wired into any page yet -- this is the data layer a
 * future community UI (and a future mobile app, via the same Supabase
 * tables/RPCs) can build on. See `lib/data/community.ts` for the
 * repository functions and `lib/supabase/*-actions.ts` for the Server
 * Actions that mutate this data.
 */

/** A user's public profile -- `public.profiles` plus its community favorites, camelCased. */
export type PublicProfile = {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  country: string | null;
  bio: string | null;
  favoriteBrewMethod: LookupOption | null;
  favoriteOrigin: LookupOption | null;
  favoriteCoffee: LookupOption | null;
  favoriteRoaster: LookupOption | null;
  favoriteGrinder: LookupOption | null;
  favoriteBrewer: LookupOption | null;
  ownsXbloom: boolean;
  stats: CommunityStats;
  isFollowedByViewer?: boolean;
};

/** Raw shape of a `profiles` row as selected for a public profile, including its lookup joins. */
export type DbPublicProfileRow = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  country: string | null;
  bio: string | null;
  owns_xbloom: boolean;
  favorite_brewing_method_id: string | null;
  brewing_methods: LookupOption | null;
  favorite_origin_id: string | null;
  origins: { id: string; country: string; region: string | null } | null;
  favorite_coffee_id: string | null;
  coffees: { id: string; name: string } | null;
  favorite_roaster_id: string | null;
  roasters: LookupOption | null;
  favorite_grinder_id: string | null;
  grinders: LookupOption | null;
  favorite_device_id: string | null;
  devices: LookupOption | null;
};

/** `public.user_community_stats` row, camelCased -- "Brewing statistics" + Brew Score. */
export type CommunityStats = {
  totalBrews: number;
  recipesCreated: number;
  reviewsWritten: number;
  helpfulVotesReceived: number;
  recipesLiked: number;
  recipesSaved: number;
  followersCount: number;
  followingCount: number;
  brewScore: number;
  activityScore: number;
  updatedAt: string | null;
};

/** Default, all-zero stats for a user who has never triggered a stats refresh yet. */
export const EMPTY_COMMUNITY_STATS: CommunityStats = {
  totalBrews: 0,
  recipesCreated: 0,
  reviewsWritten: 0,
  helpfulVotesReceived: 0,
  recipesLiked: 0,
  recipesSaved: 0,
  followersCount: 0,
  followingCount: 0,
  brewScore: 0,
  activityScore: 0,
  updatedAt: null,
};

/** A follower/following relationship, camelCased. */
export type FollowRow = {
  followerId: string;
  followingId: string;
  createdAt: string;
};

/** A profile summary shown in a followers/following list or leaderboard row. */
export type ProfileSummary = {
  id: string;
  displayName: string | null;
  avatarUrl: string | null;
  country: string | null;
};

/** Moderation state prepared for a future admin dashboard. */
export type ReviewModerationStatus = "visible" | "hidden" | "flagged";

export const REVIEW_SORTS = ["newest", "highest", "lowest", "helpful"] as const;
export type ReviewSort = (typeof REVIEW_SORTS)[number];

export const REVIEW_PAGE_SIZE = 10;

/** `public.recipe_reviews` row, camelCased, plus the reviewing user's summary and helpful vote count. */
export type RecipeReview = {
  id: string;
  recipeId: string;
  user: ProfileSummary;
  rating: number;
  reviewText: string | null;
  helpfulCount: number;
  isHelpfulByViewer?: boolean;
  moderationStatus: ReviewModerationStatus;
  createdAt: string;
  updatedAt: string;
};

/** Raw shape of a `recipe_reviews` row as selected from Supabase, including its joins. */
export type DbRecipeReviewRow = {
  id: string;
  recipe_id: string;
  user_id: string;
  profiles: { id: string; full_name: string | null; avatar_url: string | null; country: string | null } | null;
  rating: number;
  review_text: string | null;
  moderation_status?: ReviewModerationStatus;
  created_at: string;
  updated_at: string;
  recipe_review_helpful_votes: { user_id: string }[];
};

/** `public.recipe_rating_summary` view row, camelCased. */
export type RecipeRatingSummary = {
  recipeId: string;
  reviewCount: number;
  averageRating: number | null;
};

/** Star rating bucket for distribution charts (1–5). */
export type RatingDistributionBucket = {
  stars: number;
  count: number;
  percent: number;
};

/** A review written by a user, with recipe context for profile listings. */
export type UserReviewListItem = {
  review: RecipeReview;
  recipeTitle: string;
  recipeSlug: string;
};

export type RecipeReviewsResult = {
  reviews: RecipeReview[];
  totalCount: number;
  page: number;
  pageSize: number;
  sort: ReviewSort;
};

export const BADGE_KEYS = [
  "first_brew",
  "v60_master",
  "espresso_expert",
  "xbloom_owner",
  "coffee_scientist",
  "uae_coffee_explorer",
  "origin_collector",
  "recipe_creator",
  "community_helper",
  "coffee_legend",
] as const;
export type BadgeKey = (typeof BADGE_KEYS)[number];

/** `public.badges` row, camelCased -- the achievement catalog. */
export type Badge = {
  id: string;
  key: BadgeKey | string;
  name: string;
  description: string;
  criteriaDescription: string;
  icon: string;
  sortOrder: number;
};

/** A badge the current user has earned, or the full catalog entry with an `earnedAt` when applicable. */
export type UserBadge = Badge & {
  earnedAt: string | null;
};

export type LeaderboardKind =
  | "top_brewers"
  | "most_active"
  | "highest_rated_recipes"
  | "top_recipe_creators"
  | "most_helpful";

/** One row of a user-ranked leaderboard (Top Brewers, Most Active Users, Top Recipe Creators, Most Helpful Members). */
export type UserLeaderboardEntry = {
  rank: number;
  profile: ProfileSummary;
  value: number;
  stats: CommunityStats;
};

/** One row of the "Highest Rated Recipes" leaderboard. */
export type RecipeLeaderboardEntry = {
  rank: number;
  recipeId: string;
  title: string;
  slug: string;
  coverImageUrl: string | null;
  averageRating: number;
  reviewCount: number;
};

/** A row returned by the `trending_recipes` RPC, camelCased. */
export type TrendingRecipe = {
  recipeId: string;
  title: string;
  slug: string;
  coverImageUrl: string | null;
  brewCount: number;
  likeCount: number;
  activityCount: number;
};

/** A row returned by the `trending_coffees` RPC, camelCased. */
export type TrendingCoffee = {
  coffeeId: string;
  coffeeName: string;
  roasterName: string | null;
  originCountry: string | null;
  activityCount: number;
};

/** A row returned by the `trending_roasters` RPC, camelCased. */
export type TrendingRoaster = {
  roasterId: string;
  roasterName: string;
  activityCount: number;
};

/** A row returned by the `trending_brewing_methods` RPC, camelCased. */
export type TrendingBrewingMethod = {
  brewingMethodId: string;
  methodName: string;
  activityCount: number;
};

export const ACTIVITY_TYPES = [
  "brewed_recipe",
  "created_recipe",
  "reviewed_recipe",
  "earned_badge",
  "followed_user",
] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

/** `public.user_activities` row, camelCased, with its related entities resolved. */
export type ActivityFeedItem = {
  id: string;
  user: ProfileSummary;
  activityType: ActivityType | string;
  recipe: { id: string; title: string; slug: string } | null;
  badge: { id: string; key: string; name: string; icon: string } | null;
  targetUser: ProfileSummary | null;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export const NOTIFICATION_TYPES = ["new_follower", "recipe_liked", "recipe_reviewed", "badge_earned"] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

/** `public.user_notifications` row, camelCased. */
export type NotificationItem = {
  id: string;
  notificationType: NotificationType | string;
  actor: ProfileSummary | null;
  recipe: { id: string; title: string; slug: string } | null;
  badge: { id: string; key: string; name: string; icon: string } | null;
  message: string;
  isRead: boolean;
  createdAt: string;
};

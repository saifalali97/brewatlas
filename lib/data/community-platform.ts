import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  AdminCommunityAnalytics,
  CommunityUserSearchHit,
  DbRecipeCommentRow,
  FeaturedCafe,
  FeaturedRoaster,
  FeaturedUser,
  RecipeComment,
  RecipeCommentSort,
  UserAchievement,
} from "@/types/community-platform";

function mapCommentRow(row: DbRecipeCommentRow): RecipeComment {
  return {
    id: row.id,
    recipeId: row.recipe_id,
    userId: row.user_id,
    parentId: row.parent_id,
    body: row.body,
    isPinned: row.is_pinned,
    isEdited: row.is_edited,
    likeCount: Number(row.like_count),
    viewerLiked: Boolean(row.viewer_liked),
    authorName: row.author_name,
    authorAvatar: row.author_avatar,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function nestComments(flat: RecipeComment[]): RecipeComment[] {
  const byId = new Map(flat.map((comment) => [comment.id, { ...comment, replies: [] as RecipeComment[] }]));
  const roots: RecipeComment[] = [];
  for (const comment of byId.values()) {
    if (comment.parentId && byId.has(comment.parentId)) {
      byId.get(comment.parentId)!.replies!.push(comment);
    } else {
      roots.push(comment);
    }
  }
  return roots;
}

export async function getRecipeComments(
  supabase: SupabaseClient,
  recipeId: string,
  options: { sort?: RecipeCommentSort; limit?: number; offset?: number; viewerId?: string | null } = {},
): Promise<RecipeComment[]> {
  const { data, error } = await supabase.rpc("get_recipe_comments", {
    p_recipe_id: recipeId,
    p_sort: options.sort ?? "newest",
    p_limit: options.limit ?? 50,
    p_offset: options.offset ?? 0,
    p_viewer_id: options.viewerId ?? null,
  });

  if (error || !data) {
    if (error) console.error("getRecipeComments failed", error);
    return [];
  }

  return nestComments((data as DbRecipeCommentRow[]).map(mapCommentRow));
}

export async function getRecipeLikeCount(supabase: SupabaseClient, recipeId: string): Promise<number> {
  const { count, error } = await supabase
    .from("recipe_likes")
    .select("*", { count: "exact", head: true })
    .eq("recipe_id", recipeId);
  if (error) return 0;
  return count ?? 0;
}

export async function hasUserLikedRecipe(
  supabase: SupabaseClient,
  userId: string,
  recipeId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("recipe_likes")
    .select("recipe_id")
    .eq("user_id", userId)
    .eq("recipe_id", recipeId)
    .maybeSingle();
  return Boolean(data);
}

export async function getUserAchievements(
  supabase: SupabaseClient,
  userId: string,
): Promise<UserAchievement[]> {
  const { data, error } = await supabase
    .from("user_achievements")
    .select("*")
    .eq("user_id", userId)
    .order("unlocked_at", { ascending: false, nullsFirst: false });

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id as string,
    userId: row.user_id as string,
    achievementKey: row.achievement_key as string,
    title: row.title as string,
    description: row.description as string,
    progress: Number(row.progress),
    target: Number(row.target),
    unlockedAt: (row.unlocked_at as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }));
}

export async function getFeaturedUsers(supabase: SupabaseClient, limit = 6): Promise<FeaturedUser[]> {
  const { data, error } = await supabase
    .from("featured_users")
    .select("id, user_id, headline, sort_order, profiles ( full_name, avatar_url, country )")
    .eq("is_active", true)
    .order("sort_order")
    .limit(limit);

  if (error || !data) return [];

  return data.map((row) => {
    const profile = row.profiles as unknown as { full_name: string | null; avatar_url: string | null; country: string | null } | null;
    return {
      id: row.id as string,
      userId: row.user_id as string,
      displayName: profile?.full_name ?? null,
      avatarUrl: profile?.avatar_url ?? null,
      country: profile?.country ?? null,
      headline: (row.headline as string | null) ?? null,
      sortOrder: Number(row.sort_order),
    };
  });
}

export async function getFeaturedRoasters(supabase: SupabaseClient, limit = 6): Promise<FeaturedRoaster[]> {
  const { data, error } = await supabase
    .from("featured_roasters")
    .select("id, roaster_id, headline, sort_order, roasters ( name )")
    .eq("is_active", true)
    .order("sort_order")
    .limit(limit);

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id as string,
    roasterId: row.roaster_id as string,
    name: (row.roasters as unknown as { name: string } | null)?.name ?? "Roaster",
    headline: (row.headline as string | null) ?? null,
    sortOrder: Number(row.sort_order),
  }));
}

export async function getFeaturedCafes(supabase: SupabaseClient, limit = 6): Promise<FeaturedCafe[]> {
  const { data, error } = await supabase
    .from("featured_cafes")
    .select("*")
    .eq("is_active", true)
    .order("sort_order")
    .limit(limit);

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id as string,
    name: row.name as string,
    country: (row.country as string | null) ?? null,
    city: (row.city as string | null) ?? null,
    websiteUrl: (row.website_url as string | null) ?? null,
    headline: (row.headline as string | null) ?? null,
    sortOrder: Number(row.sort_order),
  }));
}

export async function getAdminCommunityAnalytics(
  supabase: SupabaseClient,
  days = 30,
): Promise<AdminCommunityAnalytics> {
  const { data, error } = await supabase.rpc("admin_community_analytics", { p_days: days });
  if (error || !data) {
    return {
      dailyActiveUsers: 0,
      newUsers: 0,
      recipesCreated: 0,
      brewsLogged: 0,
      comments: 0,
      likes: 0,
      followers: 0,
      openReports: 0,
      topRecipes: [],
      topUsers: [],
    };
  }
  const parsed = data as AdminCommunityAnalytics;
  return {
    dailyActiveUsers: Number(parsed.dailyActiveUsers ?? 0),
    newUsers: Number(parsed.newUsers ?? 0),
    recipesCreated: Number(parsed.recipesCreated ?? 0),
    brewsLogged: Number(parsed.brewsLogged ?? 0),
    comments: Number(parsed.comments ?? 0),
    likes: Number(parsed.likes ?? 0),
    followers: Number(parsed.followers ?? 0),
    openReports: Number(parsed.openReports ?? 0),
    topRecipes: parsed.topRecipes ?? [],
    topUsers: parsed.topUsers ?? [],
  };
}

export async function searchCommunityUsers(
  supabase: SupabaseClient,
  query: string,
  limit = 20,
): Promise<CommunityUserSearchHit[]> {
  const { data, error } = await supabase.rpc("search_community_users", {
    p_query: query,
    p_limit: limit,
    p_offset: 0,
  });

  if (error || !data) return [];

  return (data as Array<{
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    country: string | null;
    bio: string | null;
    followers_count: number;
    brew_score: number;
  }>).map((row) => ({
    id: row.id,
    fullName: row.full_name,
    avatarUrl: row.avatar_url,
    country: row.country,
    bio: row.bio,
    followersCount: Number(row.followers_count),
    brewScore: Number(row.brew_score),
  }));
}

export async function getOpenReports(
  supabase: SupabaseClient,
  limit = 50,
): Promise<Array<{ id: string; targetType: string; targetId: string; reason: string; createdAt: string }>> {
  const { data, error } = await supabase
    .from("recipe_reports")
    .select("id, target_type, target_id, reason, created_at")
    .eq("status", "open")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id as string,
    targetType: row.target_type as string,
    targetId: row.target_id as string,
    reason: row.reason as string,
    createdAt: row.created_at as string,
  }));
}

export async function getPublicBrewSessionsForUser(
  supabase: SupabaseClient,
  userId: string,
  limit = 12,
): Promise<Array<{ id: string; coffeeName: string | null; brewMethod: string | null; rating: number | null; createdAt: string }>> {
  const { data, error } = await supabase
    .from("brew_sessions")
    .select("id, coffee_name, brew_method, rating, created_at")
    .eq("user_id", userId)
    .eq("is_public", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id as string,
    coffeeName: row.coffee_name as string | null,
    brewMethod: row.brew_method as string | null,
    rating: row.rating as number | null,
    createdAt: row.created_at as string,
  }));
}

export async function getProfileCommunityStats(
  supabase: SupabaseClient,
  userId: string,
): Promise<{
  favoriteCoffee: string | null;
  favoriteMethod: string | null;
  favoriteGrinder: string | null;
  averageRating: number | null;
}> {
  const { data } = await supabase
    .from("brew_sessions")
    .select("coffee_name, brew_method, grinder, rating")
    .eq("user_id", userId)
    .limit(200);

  const rows = data ?? [];
  if (rows.length === 0) {
    return { favoriteCoffee: null, favoriteMethod: null, favoriteGrinder: null, averageRating: null };
  }

  const countBy = (field: "coffee_name" | "brew_method" | "grinder") => {
    const counts = new Map<string, number>();
    for (const row of rows) {
      const value = row[field] as string | null;
      if (!value) continue;
      counts.set(value, (counts.get(value) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  };

  const ratings = rows.map((row) => row.rating as number | null).filter((v): v is number => v != null);
  const averageRating = ratings.length ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10 : null;

  return {
    favoriteCoffee: countBy("coffee_name"),
    favoriteMethod: countBy("brew_method"),
    favoriteGrinder: countBy("grinder"),
    averageRating,
  };
}

export async function searchPublicCollections(
  supabase: SupabaseClient,
  query: string,
  limit = 20,
): Promise<Array<{ id: string; name: string; description: string | null; shareSlug: string | null; ownerName: string | null; recipeCount: number }>> {
  let dbQuery = supabase
    .from("recipe_collections")
    .select("id, name, description, share_slug, profiles ( full_name ), recipe_collection_items ( recipe_id )")
    .eq("is_public", true)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (query.trim()) {
    const pattern = `%${query.trim()}%`;
    dbQuery = dbQuery.or(`name.ilike.${pattern},description.ilike.${pattern}`);
  }

  const { data, error } = await dbQuery;
  if (error || !data) return [];

  return data.map((row) => ({
    id: row.id as string,
    name: row.name as string,
    description: (row.description as string | null) ?? null,
    shareSlug: (row.share_slug as string | null) ?? null,
    ownerName: (row.profiles as unknown as { full_name: string | null } | null)?.full_name ?? null,
    recipeCount: Array.isArray(row.recipe_collection_items) ? row.recipe_collection_items.length : 0,
  }));
}

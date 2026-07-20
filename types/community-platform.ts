export type RecipeCommentSort = "newest" | "oldest" | "top";

export type RecipeComment = {
  id: string;
  recipeId: string;
  userId: string;
  parentId: string | null;
  body: string;
  isPinned: boolean;
  isEdited: boolean;
  likeCount: number;
  viewerLiked: boolean;
  authorName: string | null;
  authorAvatar: string | null;
  createdAt: string;
  updatedAt: string;
  replies?: RecipeComment[];
};

export type RecipeReportTargetType = "recipe" | "comment" | "user" | "review";

export type RecipeReport = {
  id: string;
  reporterId: string;
  targetType: RecipeReportTargetType;
  targetId: string;
  reason: string;
  details: string | null;
  status: "open" | "reviewed" | "dismissed" | "actioned";
  createdAt: string;
};

export type UserAchievement = {
  id: string;
  userId: string;
  achievementKey: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  unlockedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FeaturedUser = {
  id: string;
  userId: string;
  displayName: string | null;
  avatarUrl: string | null;
  country: string | null;
  headline: string | null;
  sortOrder: number;
};

export type FeaturedRoaster = {
  id: string;
  roasterId: string;
  name: string;
  headline: string | null;
  sortOrder: number;
};

export type FeaturedCafe = {
  id: string;
  name: string;
  country: string | null;
  city: string | null;
  websiteUrl: string | null;
  headline: string | null;
  sortOrder: number;
};

export type AdminCommunityAnalytics = {
  dailyActiveUsers: number;
  newUsers: number;
  recipesCreated: number;
  brewsLogged: number;
  comments: number;
  likes: number;
  followers: number;
  openReports: number;
  topRecipes: Array<{ name: string; count: number }>;
  topUsers: Array<{ name: string; count: number }>;
};

export type CommunityUserSearchHit = {
  id: string;
  fullName: string | null;
  avatarUrl: string | null;
  country: string | null;
  bio: string | null;
  followersCount: number;
  brewScore: number;
};

export type DbRecipeCommentRow = {
  id: string;
  recipe_id: string;
  user_id: string;
  parent_id: string | null;
  body: string;
  is_pinned: boolean;
  is_edited: boolean;
  like_count: number;
  viewer_liked: boolean;
  author_name: string | null;
  author_avatar: string | null;
  created_at: string;
  updated_at: string;
};

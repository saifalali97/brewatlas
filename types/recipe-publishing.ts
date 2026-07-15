export const RECIPE_PUBLISH_STATUSES = ["draft", "published", "archived", "scheduled"] as const;

export type RecipePublishStatus = (typeof RECIPE_PUBLISH_STATUSES)[number];

export type RecipePublishIntent =
  | "draft"
  | "publish"
  | "unpublish"
  | "archive"
  | "restore"
  | "schedule";

export type RecipeVersionListItem = {
  id: string;
  versionNumber: number;
  title: string;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  canonicalUrl: string | null;
  status: RecipePublishStatus | null;
  scheduledPublishAt: string | null;
  authorId: string | null;
  authorName: string | null;
  editorId: string | null;
  editorName: string | null;
  createdAt: string;
};

export type RecipeVersionDetail = RecipeVersionListItem & {
  metadata: Record<string, unknown>;
  snapshot: Record<string, unknown>;
};

export type RecipeVersionCompareField = {
  key: string;
  label: string;
  left: string;
  right: string;
  changed: boolean;
};

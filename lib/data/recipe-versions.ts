import type { SupabaseClient } from "@supabase/supabase-js";
import type { RecipePublishStatus } from "@/types/recipe-publishing";
import type {
  RecipeVersionCompareField,
  RecipeVersionDetail,
  RecipeVersionListItem,
} from "@/types/recipe-publishing";

type VersionRow = {
  id: string;
  version_number: number;
  title: string | null;
  description: string | null;
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
  status: RecipePublishStatus | null;
  scheduled_publish_at: string | null;
  author_id: string | null;
  editor_id: string | null;
  metadata: Record<string, unknown> | null;
  snapshot: Record<string, unknown>;
  created_at: string;
  author: { full_name: string | null } | null;
  editor: { full_name: string | null } | null;
};

const VERSION_SELECT = `
  id, version_number, title, description, seo_title, seo_description, canonical_url,
  status, scheduled_publish_at, author_id, editor_id, metadata, snapshot, created_at,
  author:author_id ( full_name ),
  editor:editor_id ( full_name )
`;

function mapVersionRow(row: VersionRow): RecipeVersionListItem {
  return {
    id: row.id,
    versionNumber: row.version_number,
    title: row.title ?? "Untitled",
    description: row.description,
    seoTitle: row.seo_title,
    seoDescription: row.seo_description,
    canonicalUrl: row.canonical_url,
    status: row.status,
    scheduledPublishAt: row.scheduled_publish_at,
    authorId: row.author_id,
    authorName: row.author?.full_name ?? null,
    editorId: row.editor_id,
    editorName: row.editor?.full_name ?? null,
    createdAt: row.created_at,
  };
}

export async function getRecipeVersions(
  supabase: SupabaseClient,
  recipeId: string,
): Promise<RecipeVersionListItem[]> {
  const { data, error } = await supabase
    .from("recipe_versions")
    .select(VERSION_SELECT)
    .eq("recipe_id", recipeId)
    .order("version_number", { ascending: false });

  if (error) {
    console.error("getRecipeVersions failed", error);
    return [];
  }

  return (data as unknown as VersionRow[]).map(mapVersionRow);
}

export async function getRecipeVersionById(
  supabase: SupabaseClient,
  recipeId: string,
  versionId: string,
): Promise<RecipeVersionDetail | null> {
  const { data, error } = await supabase
    .from("recipe_versions")
    .select(VERSION_SELECT)
    .eq("recipe_id", recipeId)
    .eq("id", versionId)
    .maybeSingle();

  if (error || !data) return null;
  const row = data as unknown as VersionRow;
  return {
    ...mapVersionRow(row),
    metadata: row.metadata ?? {},
    snapshot: row.snapshot ?? {},
  };
}

const COMPARE_FIELDS: Array<{ key: string; label: string; pick: (v: RecipeVersionListItem) => string }> = [
  { key: "title", label: "Title", pick: (v) => v.title },
  { key: "description", label: "Description", pick: (v) => v.description ?? "" },
  { key: "seoTitle", label: "Meta title", pick: (v) => v.seoTitle ?? "" },
  { key: "seoDescription", label: "Meta description", pick: (v) => v.seoDescription ?? "" },
  { key: "canonicalUrl", label: "Canonical URL", pick: (v) => v.canonicalUrl ?? "" },
  { key: "status", label: "Status", pick: (v) => v.status ?? "" },
  {
    key: "scheduledPublishAt",
    label: "Scheduled publish",
    pick: (v) => v.scheduledPublishAt ?? "",
  },
];

export function compareRecipeVersions(
  left: RecipeVersionListItem,
  right: RecipeVersionListItem,
): RecipeVersionCompareField[] {
  return COMPARE_FIELDS.map(({ key, label, pick }) => {
    const leftValue = pick(left);
    const rightValue = pick(right);
    return {
      key,
      label,
      left: leftValue,
      right: rightValue,
      changed: leftValue !== rightValue,
    };
  });
}

export function buildVersionMetadata(
  values: Record<string, unknown>,
  pours: unknown[],
  tagIds: string[],
): Record<string, unknown> {
  return {
    recipe: values,
    pours,
    tagIds,
  };
}

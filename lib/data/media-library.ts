import type { SupabaseClient } from "@supabase/supabase-js";
import { MEDIA_PAGE_SIZE } from "@/lib/media/constants";
import type {
  MediaAssetDetail,
  MediaAssetListItem,
  MediaAssetUsage,
  MediaFolder,
  MediaLibraryPageResult,
} from "@/types/media";

type AssetRow = {
  id: string;
  folder_id: string | null;
  filename: string;
  storage_path: string;
  public_url: string;
  alt_text: string | null;
  caption: string | null;
  tags: string[] | null;
  width: number | null;
  height: number | null;
  file_size: number;
  mime_type: string;
  blur_data_url: string | null;
  created_at: string;
  media_folders: { name: string } | null;
  profiles: { full_name: string | null } | null;
  media_asset_variants: { variant_key: string; public_url: string }[] | null;
  media_asset_usages: { id: string }[] | null;
};

const ASSET_LIST_SELECT = `
  id, folder_id, filename, storage_path, public_url, alt_text, caption, tags,
  width, height, file_size, mime_type, blur_data_url, created_at,
  media_folders ( name ),
  profiles:uploaded_by ( full_name ),
  media_asset_variants ( variant_key, public_url ),
  media_asset_usages ( id )
`;

function thumbnailFromRow(row: AssetRow): string {
  const thumb = row.media_asset_variants?.find((v) => v.variant_key === "thumbnail");
  return thumb?.public_url ?? row.public_url;
}

function mapAssetListItem(row: AssetRow): MediaAssetListItem {
  return {
    id: row.id,
    folderId: row.folder_id,
    folderName: row.media_folders?.name ?? null,
    filename: row.filename,
    publicUrl: row.public_url,
    altText: row.alt_text,
    caption: row.caption,
    tags: row.tags ?? [],
    width: row.width,
    height: row.height,
    fileSize: row.file_size,
    mimeType: row.mime_type,
    blurDataUrl: row.blur_data_url,
    uploadedByName: row.profiles?.full_name ?? null,
    createdAt: row.created_at,
    thumbnailUrl: thumbnailFromRow(row),
    usageCount: row.media_asset_usages?.length ?? 0,
  };
}

export async function getMediaFolders(supabase: SupabaseClient): Promise<MediaFolder[]> {
  const { data, error } = await supabase
    .from("media_folders")
    .select("id, slug, name, sort_order")
    .order("sort_order");

  if (error) {
    console.error("getMediaFolders failed", error);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id as string,
    slug: row.slug as string,
    name: row.name as string,
    sortOrder: row.sort_order as number,
  }));
}

export type MediaLibraryFilters = {
  search?: string;
  folderId?: string;
  page?: number;
};

export async function getMediaAssetsPage(
  supabase: SupabaseClient,
  filters: MediaLibraryFilters = {},
): Promise<MediaLibraryPageResult> {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = MEDIA_PAGE_SIZE;
  const offset = (page - 1) * pageSize;

  let query = supabase.from("media_assets").select(ASSET_LIST_SELECT, { count: "exact" });

  if (filters.folderId) {
    query = query.eq("folder_id", filters.folderId);
  }
  if (filters.search?.trim()) {
    query = query.or(
      `filename.ilike.%${filters.search.trim()}%,alt_text.ilike.%${filters.search.trim()}%,caption.ilike.%${filters.search.trim()}%`,
    );
  }

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error) {
    console.error("getMediaAssetsPage failed", error);
    return { items: [], totalCount: 0, page, pageSize };
  }

  return {
    items: (data as unknown as AssetRow[]).map(mapAssetListItem),
    totalCount: count ?? 0,
    page,
    pageSize,
  };
}

export async function getMediaAssetById(
  supabase: SupabaseClient,
  assetId: string,
): Promise<MediaAssetDetail | null> {
  const { data, error } = await supabase
    .from("media_assets")
    .select(
      `
      ${ASSET_LIST_SELECT},
      media_asset_variants ( id, variant_key, public_url, width, height, file_size )
    `,
    )
    .eq("id", assetId)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as unknown as Omit<AssetRow, "media_asset_variants"> & {
    media_asset_variants: Array<{
      id: string;
      variant_key: string;
      public_url: string;
      width: number | null;
      height: number | null;
      file_size: number;
    }> | null;
  };

  const usages = await getMediaAssetUsages(supabase, assetId);

  return {
    ...mapAssetListItem(row),
    storagePath: row.storage_path,
    variants: (row.media_asset_variants ?? []).map((variant) => ({
      id: variant.id,
      variantKey: variant.variant_key as MediaAssetDetail["variants"][number]["variantKey"],
      publicUrl: variant.public_url,
      width: variant.width,
      height: variant.height,
      fileSize: variant.file_size,
    })),
    usages,
  };
}

export async function getMediaAssetUsages(
  supabase: SupabaseClient,
  assetId: string,
): Promise<MediaAssetUsage[]> {
  const { data, error } = await supabase
    .from("media_asset_usages")
    .select("id, entity_type, entity_id, usage_field")
    .eq("asset_id", assetId);

  if (error || !data) return [];

  const recipeIds = data.filter((u) => u.entity_type === "recipe" || u.entity_type === "recipe_gallery").map((u) => u.entity_id as string);
  const uniqueRecipeIds = [...new Set(recipeIds)];

  let recipeMap = new Map<string, { title: string; slug: string }>();
  if (uniqueRecipeIds.length > 0) {
    const { data: recipes } = await supabase.from("recipes").select("id, title, slug").in("id", uniqueRecipeIds);
    recipeMap = new Map((recipes ?? []).map((r) => [r.id as string, { title: r.title as string, slug: r.slug as string }]));
  }

  return data.map((usage) => {
    const recipe = recipeMap.get(usage.entity_id as string);
    return {
      id: usage.id as string,
      entityType: usage.entity_type as MediaAssetUsage["entityType"],
      entityId: usage.entity_id as string,
      usageField: usage.usage_field as string,
      entityTitle: recipe?.title ?? null,
      entitySlug: recipe?.slug ?? null,
    };
  });
}

export async function getMediaAssetUsageCount(supabase: SupabaseClient, assetId: string): Promise<number> {
  const { count, error } = await supabase
    .from("media_asset_usages")
    .select("*", { count: "exact", head: true })
    .eq("asset_id", assetId);

  if (error) return 0;
  return count ?? 0;
}

import type { SupabaseClient } from "@supabase/supabase-js";
import { getMediaAssetById } from "@/lib/data/media-library";

export async function syncRecipeMediaUsages(
  supabase: SupabaseClient,
  recipeId: string,
  coverMediaAssetId: string | null,
  galleryMediaAssetIds: string[],
): Promise<void> {
  await supabase.from("media_asset_usages").delete().eq("entity_id", recipeId);

  const rows: Array<{
    asset_id: string;
    entity_type: "recipe" | "recipe_gallery";
    entity_id: string;
    usage_field: string;
  }> = [];

  if (coverMediaAssetId) {
    rows.push({
      asset_id: coverMediaAssetId,
      entity_type: "recipe",
      entity_id: recipeId,
      usage_field: "cover",
    });
  }

  galleryMediaAssetIds.forEach((assetId, index) => {
    rows.push({
      asset_id: assetId,
      entity_type: "recipe_gallery",
      entity_id: recipeId,
      usage_field: `gallery_${index}`,
    });
  });

  if (rows.length > 0) {
    await supabase.from("media_asset_usages").insert(rows);
  }
}

export function parseMediaAssetIds(formData: FormData, key: string): string[] {
  return formData
    .getAll(key)
    .filter((value): value is string => typeof value === "string" && value.length > 0);
}

export async function appendGalleryMediaAssets(
  supabase: SupabaseClient,
  recipeId: string,
  assetIds: string[],
  startPosition: number,
): Promise<void> {
  if (assetIds.length === 0) return;

  const rows: {
    recipe_id: string;
    url: string;
    position: number;
    media_asset_id: string;
    width: number | null;
    height: number | null;
    alt_text: string | null;
    blur_data_url: string | null;
  }[] = [];
  let position = startPosition;

  for (const assetId of assetIds) {
    const asset = await getMediaAssetById(supabase, assetId);
    if (!asset) continue;
    rows.push({
      recipe_id: recipeId,
      url: asset.publicUrl,
      position,
      media_asset_id: assetId,
      width: asset.width,
      height: asset.height,
      alt_text: asset.altText,
      blur_data_url: asset.blurDataUrl ?? null,
    });
    position += 1;
  }

  if (rows.length > 0) {
    await supabase.from("recipe_images").insert(rows);
  }
}

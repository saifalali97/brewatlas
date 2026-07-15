"use server";

import { revalidatePath } from "next/cache";
import { requireOwner } from "@/lib/auth/require-owner";
import { getMediaAssetById, getMediaAssetUsageCount } from "@/lib/data/media-library";
import { MEDIA_ALLOWED_MIME_TYPES, MEDIA_LIBRARY_BUCKET, MEDIA_MAX_BYTES } from "@/lib/media/constants";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { translate } from "@/lib/i18n/format";
import type { MediaUploadResult } from "@/types/media";

export type MediaActionState = { error?: string; success?: string; assetId?: string } | undefined;

const VARIANT_KEYS = ["original", "thumbnail", "sm", "md", "lg"] as const;

function optionalString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseTags(formData: FormData): string[] {
  const raw = optionalString(formData, "tags");
  if (!raw) return [];
  return raw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 20);
}

function revalidateMediaPaths() {
  revalidatePath("/dashboard/media");
  revalidatePath("/dashboard/recipes");
}

export async function uploadMediaAssetAction(formData: FormData): Promise<MediaUploadResult> {
  const { supabase, user } = await requireOwner();
  const dictionary = await getDictionary(await getLocale());
  const labels = dictionary.ownerMediaPage;

  const folderId = optionalString(formData, "folderId");
  const filename = optionalString(formData, "filename") ?? "image.webp";
  const altText = optionalString(formData, "altText");
  const caption = optionalString(formData, "caption");
  const tags = parseTags(formData);
  const width = Number(formData.get("width") ?? 0) || null;
  const height = Number(formData.get("height") ?? 0) || null;
  const mimeType = optionalString(formData, "mimeType") ?? "image/webp";

  if (!MEDIA_ALLOWED_MIME_TYPES.has(mimeType)) {
    return { error: labels.invalidFileType };
  }

  const originalFile = formData.get("variant_original");
  if (!(originalFile instanceof File) || originalFile.size === 0) {
    return { error: labels.uploadFailed };
  }
  if (originalFile.size > MEDIA_MAX_BYTES) {
    return { error: translate(dictionary, "ownerMediaPage.fileTooLargeTemplate", { size: "12MB" }) };
  }

  const assetId = crypto.randomUUID();
  const folderSegment = folderId ?? "uncategorized";
  const basePath = `${folderSegment}/${assetId}`;

  let totalSize = 0;
  const variantRows: Array<{
    asset_id: string;
    variant_key: string;
    storage_path: string;
    public_url: string;
    width: number | null;
    height: number | null;
    file_size: number;
  }> = [];

  let publicUrl = "";

  for (const key of VARIANT_KEYS) {
    const file = formData.get(`variant_${key}`);
    if (!(file instanceof File) || file.size === 0) continue;

    const storagePath = `${basePath}/${key}-${filename}`;
    const { error } = await supabase.storage.from(MEDIA_LIBRARY_BUCKET).upload(storagePath, file, {
      contentType: mimeType,
      upsert: true,
    });

    if (error) {
      return { error: error.message };
    }

    const { data: urlData } = supabase.storage.from(MEDIA_LIBRARY_BUCKET).getPublicUrl(storagePath);
    const variantWidth = Number(formData.get(`variant_${key}_width`) ?? 0) || null;
    const variantHeight = Number(formData.get(`variant_${key}_height`) ?? 0) || null;

    if (key === "original") {
      publicUrl = urlData.publicUrl;
    }

    totalSize += file.size;
    variantRows.push({
      asset_id: assetId,
      variant_key: key,
      storage_path: storagePath,
      public_url: urlData.publicUrl,
      width: variantWidth,
      height: variantHeight,
      file_size: file.size,
    });
  }

  if (!publicUrl) {
    return { error: labels.uploadFailed };
  }

  const { error: insertError } = await supabase.from("media_assets").insert({
    id: assetId,
    folder_id: folderId,
    filename,
    storage_path: `${basePath}/original-${filename}`,
    public_url: publicUrl,
    alt_text: altText,
    caption,
    tags,
    width,
    height,
    file_size: totalSize,
    mime_type: mimeType,
    uploaded_by: user.id,
  });

  if (insertError) {
    return { error: insertError.message };
  }

  if (variantRows.length > 0) {
    await supabase.from("media_asset_variants").insert(variantRows);
  }

  revalidateMediaPaths();
  return { success: true, assetId, publicUrl };
}

export async function updateMediaAssetAction(formData: FormData): Promise<void> {
  const { supabase } = await requireOwner();
  const assetId = optionalString(formData, "assetId");
  if (!assetId) return;

  await supabase
    .from("media_assets")
    .update({
      alt_text: optionalString(formData, "altText"),
      caption: optionalString(formData, "caption"),
      tags: parseTags(formData),
      folder_id: optionalString(formData, "folderId") || null,
    })
    .eq("id", assetId);

  revalidateMediaPaths();
}

export async function deleteMediaAssetAction(formData: FormData): Promise<void> {
  const { supabase } = await requireOwner();
  const assetId = optionalString(formData, "assetId");
  if (!assetId) return;

  const usageCount = await getMediaAssetUsageCount(supabase, assetId);
  if (usageCount > 0) return;

  const asset = await getMediaAssetById(supabase, assetId);
  if (!asset) return;

  const { data: variantPaths } = await supabase
    .from("media_asset_variants")
    .select("storage_path")
    .eq("asset_id", assetId);

  const allPaths = [asset.storagePath, ...(variantPaths ?? []).map((v) => v.storage_path as string)];
  if (allPaths.length > 0) {
    await supabase.storage.from(MEDIA_LIBRARY_BUCKET).remove(allPaths);
  }

  await supabase.from("media_assets").delete().eq("id", assetId);
  revalidateMediaPaths();
}

export async function replaceMediaAssetFileAction(formData: FormData): Promise<MediaUploadResult> {
  const { supabase } = await requireOwner();
  const dictionary = await getDictionary(await getLocale());
  const labels = dictionary.ownerMediaPage;
  const assetId = optionalString(formData, "assetId");
  if (!assetId) return { error: labels.assetNotFound };

  const existing = await getMediaAssetById(supabase, assetId);
  if (!existing) return { error: labels.assetNotFound };

  const filename = optionalString(formData, "filename") ?? existing.filename;
  const mimeType = optionalString(formData, "mimeType") ?? existing.mimeType;
  const width = Number(formData.get("width") ?? 0) || existing.width;
  const height = Number(formData.get("height") ?? 0) || existing.height;
  const folderId = optionalString(formData, "folderId") ?? existing.folderId;
  const folderSegment = folderId ?? "uncategorized";
  const basePath = `${folderSegment}/${assetId}`;

  if (!MEDIA_ALLOWED_MIME_TYPES.has(mimeType)) {
    return { error: labels.invalidFileType };
  }

  const originalFile = formData.get("variant_original");
  if (!(originalFile instanceof File) || originalFile.size === 0) {
    return { error: labels.uploadFailed };
  }
  if (originalFile.size > MEDIA_MAX_BYTES) {
    return { error: translate(dictionary, "ownerMediaPage.fileTooLargeTemplate", { size: "12MB" }) };
  }

  const { data: oldVariants } = await supabase
    .from("media_asset_variants")
    .select("storage_path")
    .eq("asset_id", assetId);

  const oldStoragePaths = [
    existing.storagePath,
    ...(oldVariants ?? []).map((row) => row.storage_path as string),
  ];

  const variantRows: Array<{
    asset_id: string;
    variant_key: string;
    storage_path: string;
    public_url: string;
    width: number | null;
    height: number | null;
    file_size: number;
  }> = [];

  let publicUrl = existing.publicUrl;
  let totalSize = 0;
  const newStoragePaths: string[] = [];

  for (const key of VARIANT_KEYS) {
    const file = formData.get(`variant_${key}`);
    if (!(file instanceof File) || file.size === 0) continue;

    const storagePath = `${basePath}/${key}-${filename}`;
    const { error } = await supabase.storage.from(MEDIA_LIBRARY_BUCKET).upload(storagePath, file, {
      contentType: mimeType,
      upsert: true,
    });
    if (error) return { error: error.message };

    const { data: urlData } = supabase.storage.from(MEDIA_LIBRARY_BUCKET).getPublicUrl(storagePath);
    const variantWidth = Number(formData.get(`variant_${key}_width`) ?? 0) || null;
    const variantHeight = Number(formData.get(`variant_${key}_height`) ?? 0) || null;

    if (key === "original") {
      publicUrl = urlData.publicUrl;
    }

    totalSize += file.size;
    newStoragePaths.push(storagePath);
    variantRows.push({
      asset_id: assetId,
      variant_key: key,
      storage_path: storagePath,
      public_url: urlData.publicUrl,
      width: variantWidth,
      height: variantHeight,
      file_size: file.size,
    });
  }

  if (!publicUrl) {
    return { error: labels.uploadFailed };
  }

  const { error: updateError } = await supabase
    .from("media_assets")
    .update({
      folder_id: folderId,
      filename,
      storage_path: `${basePath}/original-${filename}`,
      public_url: publicUrl,
      width,
      height,
      file_size: totalSize,
      mime_type: mimeType,
    })
    .eq("id", assetId);

  if (updateError) return { error: updateError.message };

  await supabase.from("media_asset_variants").delete().eq("asset_id", assetId);
  if (variantRows.length > 0) {
    await supabase.from("media_asset_variants").insert(variantRows);
  }

  await supabase.from("recipes").update({ cover_image_url: publicUrl }).eq("cover_media_asset_id", assetId);
  await supabase.from("recipe_images").update({ url: publicUrl }).eq("media_asset_id", assetId);

  const pathsToRemove = oldStoragePaths.filter((path) => !newStoragePaths.includes(path));
  if (pathsToRemove.length > 0) {
    await supabase.storage.from(MEDIA_LIBRARY_BUCKET).remove(pathsToRemove);
  }

  revalidateMediaPaths();
  return { success: true, assetId, publicUrl };
}

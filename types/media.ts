export type MediaFolder = {
  id: string;
  slug: string;
  name: string;
  sortOrder: number;
};

export type MediaAssetVariant = {
  id: string;
  variantKey: "thumbnail" | "sm" | "md" | "lg" | "original";
  publicUrl: string;
  width: number | null;
  height: number | null;
  fileSize: number;
};

export type MediaAssetListItem = {
  id: string;
  folderId: string | null;
  folderName: string | null;
  filename: string;
  publicUrl: string;
  altText: string | null;
  caption: string | null;
  tags: string[];
  width: number | null;
  height: number | null;
  fileSize: number;
  mimeType: string;
  uploadedByName: string | null;
  blurDataUrl: string | null;
  createdAt: string;
  thumbnailUrl: string;
  usageCount: number;
};

export type MediaAssetDetail = MediaAssetListItem & {
  storagePath: string;
  variants: MediaAssetVariant[];
  usages: MediaAssetUsage[];
};

export type MediaAssetUsage = {
  id: string;
  entityType: "recipe" | "recipe_gallery";
  entityId: string;
  usageField: string;
  entityTitle: string | null;
  entitySlug: string | null;
};

export type MediaLibraryPageResult = {
  items: MediaAssetListItem[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export type MediaUploadResult = {
  success?: boolean;
  error?: string;
  assetId?: string;
  publicUrl?: string;
};

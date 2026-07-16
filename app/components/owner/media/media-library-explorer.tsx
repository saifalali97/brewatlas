"use client";

import { OptimizedImage } from "@/app/components/ui/optimized-image";
import { IMAGE_SIZE_PRESETS } from "@/lib/media/responsive-image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { Grid3X3, List, Search, Trash2 } from "lucide-react";
import { MediaUploadZone } from "@/app/components/owner/media/media-upload-zone";
import { MediaAssetEditorModal } from "@/app/components/owner/media/media-asset-editor-modal";
import { buttons } from "@/lib/constants/styles";
import { formatFileSize } from "@/lib/media/constants";
import { createClient } from "@/lib/supabase/client";
import { deleteMediaAssetAction, updateMediaAssetAction } from "@/lib/supabase/media-library-actions";
import { translate } from "@/lib/i18n/format";
import { useTranslations } from "@/lib/i18n/translation-context";
import type { Dictionary } from "@/lib/i18n/types";
import type { MediaAssetListItem, MediaAssetUsage, MediaFolder, MediaLibraryPageResult } from "@/types/media";

type MediaLibraryExplorerProps = {
  result: MediaLibraryPageResult;
  folders: MediaFolder[];
  labels: Dictionary["ownerMediaPage"];
  dictionary: Dictionary;
  filters: { search: string; folderId: string; view: "grid" | "list" };
};

function buildQuery(pathname: string, filters: MediaLibraryExplorerProps["filters"], page: number) {
  const params = new URLSearchParams();
  if (filters.search) params.set("q", filters.search);
  if (filters.folderId) params.set("folder", filters.folderId);
  if (filters.view === "list") params.set("view", "list");
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function MediaLibraryExplorer({ result, folders, labels, dictionary, filters }: MediaLibraryExplorerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useTranslations();
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useState<MediaAssetListItem | null>(null);
  const [selectedUsages, setSelectedUsages] = useState<MediaAssetUsage[]>([]);
  const [editorAsset, setEditorAsset] = useState<MediaAssetListItem | null>(null);
  const totalPages = Math.max(1, Math.ceil(result.totalCount / result.pageSize));

  const applyFilters = useCallback(
    (next: Partial<MediaLibraryExplorerProps["filters"]>) => {
      startTransition(() => {
        router.replace(buildQuery(pathname, { ...filters, ...next }, 1), { scroll: false });
      });
    },
    [filters, pathname, router],
  );

  const goToPage = useCallback(
    (page: number) => {
      startTransition(() => {
        router.replace(buildQuery(pathname, filters, page), { scroll: false });
      });
    },
    [filters, pathname, router],
  );

  useEffect(() => {
    if (!selected) return;

    let cancelled = false;
    const supabase = createClient();
    void (async () => {
      const { data: usageRows } = await supabase
        .from("media_asset_usages")
        .select("id, entity_type, entity_id, usage_field")
        .eq("asset_id", selected.id);

      if (cancelled) return;

      if (!usageRows?.length) {
        setSelectedUsages([]);
        return;
      }

      const recipeIds = [...new Set(usageRows.map((row) => row.entity_id as string))];
      const { data: recipes } = await supabase.from("recipes").select("id, title, slug").in("id", recipeIds);
      const recipeMap = new Map((recipes ?? []).map((r) => [r.id as string, { title: r.title as string, slug: r.slug as string }]));

      setSelectedUsages(
        usageRows.map((usage) => {
          const recipe = recipeMap.get(usage.entity_id as string);
          return {
            id: usage.id as string,
            entityType: usage.entity_type as MediaAssetUsage["entityType"],
            entityId: usage.entity_id as string,
            usageField: usage.usage_field as string,
            entityTitle: recipe?.title ?? null,
            entitySlug: recipe?.slug ?? null,
          };
        }),
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [selected]);

  return (
    <div className="mt-8 space-y-6">
      <MediaUploadZone folders={folders} defaultFolderId={filters.folderId} onUploaded={() => router.refresh()} />

      <form
        className="flex flex-wrap items-end gap-3 rounded-[1.25rem] border border-white/[0.09] bg-white/[0.03] p-4"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          applyFilters({
            search: String(formData.get("q") ?? ""),
            folderId: String(formData.get("folder") ?? ""),
          });
        }}
      >
        <div className="min-w-[200px] flex-1">
          <label htmlFor="media-search" className="sr-only">
            {labels.searchLabel}
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
            <input
              id="media-search"
              name="q"
              defaultValue={filters.search}
              placeholder={labels.searchPlaceholder}
              className="w-full rounded-xl border border-white/[0.1] bg-white/[0.03] py-2.5 ps-10 pe-4 text-sm text-stone-100"
            />
          </div>
        </div>
        <select
          name="folder"
          defaultValue={filters.folderId}
          className="rounded-xl border border-white/[0.1] bg-white/[0.03] px-3 py-2.5 text-sm text-stone-100"
        >
          <option value="">{labels.allFolders}</option>
          {folders.map((folder) => (
            <option key={folder.id} value={folder.id}>
              {folder.name}
            </option>
          ))}
        </select>
        <button type="submit" className={`${buttons.secondary} h-10 px-4 text-xs`} disabled={isPending}>
          {labels.searchLabel}
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            aria-pressed={filters.view === "grid"}
            aria-label={labels.viewGridAria}
            onClick={() => applyFilters({ view: "grid" })}
            className={`${buttons.secondary} h-10 w-10 p-0 ${filters.view === "grid" ? "text-amber-300" : ""}`}
          >
            <Grid3X3 className="mx-auto h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            aria-pressed={filters.view === "list"}
            aria-label={labels.viewListAria}
            onClick={() => applyFilters({ view: "list" })}
            className={`${buttons.secondary} h-10 w-10 p-0 ${filters.view === "list" ? "text-amber-300" : ""}`}
          >
            <List className="mx-auto h-4 w-4" aria-hidden />
          </button>
        </div>
      </form>

      {result.items.length === 0 ? (
        <div className="rounded-[1.5rem] border border-white/[0.09] bg-white/[0.03] px-8 py-16 text-center">
          <p className="text-lg font-medium text-stone-100">{labels.emptyTitle}</p>
          <p className="mt-2 text-sm text-stone-500">{labels.emptyDescription}</p>
        </div>
      ) : filters.view === "grid" ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {result.items.map((asset) => (
            <button
              key={asset.id}
              type="button"
              onClick={() => {
                setSelected(asset);
                setSelectedUsages([]);
              }}
              className="group overflow-hidden rounded-xl border border-white/[0.09] bg-white/[0.03] text-start transition hover:border-amber-500/30"
            >
              <div className="relative aspect-square bg-stone-950/40">
                <OptimizedImage
                  src={asset.thumbnailUrl}
                  alt={asset.altText ?? asset.filename}
                  blurDataUrl={asset.blurDataUrl}
                  width={asset.width ?? undefined}
                  height={asset.height ?? undefined}
                  sizes={IMAGE_SIZE_PRESETS.cmsThumb}
                  loading="lazy"
                  className="object-cover"
                />
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-medium text-stone-100">{asset.filename}</p>
                <p className="mt-1 text-xs text-stone-500">{formatFileSize(asset.fileSize)}</p>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-[1.5rem] border border-white/[0.09] bg-white/[0.03]">
          <ul className="divide-y divide-white/[0.07]">
            {result.items.map((asset) => (
              <li key={asset.id}>
                <button
                  type="button"
                  onClick={() => {
                setSelected(asset);
                setSelectedUsages([]);
              }}
                  className="flex w-full items-center gap-4 px-4 py-3 text-start hover:bg-white/[0.02]"
                >
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-stone-950/40">
                    <OptimizedImage src={asset.thumbnailUrl} alt="" sizes="56px" loading="lazy" blurDataUrl={asset.blurDataUrl} className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-stone-100">{asset.filename}</p>
                    <p className="text-xs text-stone-500">
                      {asset.folderName ?? labels.noFolder} · {formatFileSize(asset.fileSize)} ·{" "}
                      {new Date(asset.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {totalPages > 1 ? (
        <nav aria-label={labels.paginationAria} className="flex items-center justify-between">
          <button
            type="button"
            disabled={result.page <= 1 || isPending}
            onClick={() => goToPage(result.page - 1)}
            className={`${buttons.secondary} h-9 px-4 text-xs disabled:opacity-50`}
          >
            {labels.previousPage}
          </button>
          <p className="text-sm text-stone-500">
            {translate(dictionary, "ownerMediaPage.pageTemplate", {
              page: String(result.page),
              total: String(totalPages),
            })}
          </p>
          <button
            type="button"
            disabled={result.page >= totalPages || isPending}
            onClick={() => goToPage(result.page + 1)}
            className={`${buttons.secondary} h-9 px-4 text-xs disabled:opacity-50`}
          >
            {labels.nextPage}
          </button>
        </nav>
      ) : null}

      {selected ? (
        <div className="rounded-[1.25rem] border border-white/[0.09] bg-white/[0.03] p-5">
          <div className="flex flex-wrap gap-5">
            <div className="relative h-40 w-40 overflow-hidden rounded-xl bg-stone-950/40">
              <OptimizedImage
                src={selected.publicUrl}
                alt={selected.altText ?? selected.filename}
                blurDataUrl={selected.blurDataUrl}
                width={selected.width ?? undefined}
                height={selected.height ?? undefined}
                sizes={IMAGE_SIZE_PRESETS.card}
                className="object-cover"
              />
            </div>
            <div className="min-w-0 flex-1 space-y-3">
              <h3 className="text-lg font-medium text-stone-100">{selected.filename}</h3>
              <p className="text-sm text-stone-500">
                {selected.width}×{selected.height} · {formatFileSize(selected.fileSize)} · {selected.uploadedByName ?? "—"}
              </p>
              <form action={updateMediaAssetAction} className="grid gap-3 sm:grid-cols-2">
                <input type="hidden" name="assetId" value={selected.id} />
                <input type="hidden" name="folderId" value={selected.folderId ?? ""} />
                <input
                  name="altText"
                  defaultValue={selected.altText ?? ""}
                  placeholder={labels.altTextLabel}
                  className="rounded-xl border border-white/[0.1] bg-white/[0.03] px-3 py-2 text-sm text-stone-100"
                />
                <input
                  name="caption"
                  defaultValue={selected.caption ?? ""}
                  placeholder={labels.captionLabel}
                  className="rounded-xl border border-white/[0.1] bg-white/[0.03] px-3 py-2 text-sm text-stone-100"
                />
                <input
                  name="tags"
                  defaultValue={selected.tags.join(", ")}
                  placeholder={labels.tagsLabel}
                  className="sm:col-span-2 rounded-xl border border-white/[0.1] bg-white/[0.03] px-3 py-2 text-sm text-stone-100"
                />
                <button type="submit" className={`${buttons.primary} h-10 px-4 text-xs`}>
                  {labels.saveMetadataCta}
                </button>
              </form>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setEditorAsset(selected)}
                  className={`${buttons.secondary} h-10 px-4 text-xs`}
                >
                  {labels.editImageCta}
                </button>
                <form
                  action={deleteMediaAssetAction}
                  onSubmit={(event) => {
                    if (selected.usageCount > 0) {
                      event.preventDefault();
                      window.alert(
                        translate(dictionary, "ownerMediaPage.deleteBlockedTemplate", {
                          count: String(selected.usageCount),
                        }),
                      );
                      return;
                    }
                    if (!window.confirm(labels.deleteConfirm)) event.preventDefault();
                    else {
                      setSelected(null);
                      setSelectedUsages([]);
                    }
                  }}
                >
                  <input type="hidden" name="assetId" value={selected.id} />
                  <button type="submit" className={`${buttons.secondary} h-10 gap-2 px-4 text-xs text-red-300`}>
                    <Trash2 className="h-4 w-4" />
                    {t("common.delete")}
                  </button>
                </form>
              </div>
              {selected.usageCount > 0 ? (
                <div className="text-xs text-amber-300/90">
                  <p>{translate(dictionary, "ownerMediaPage.inUseTemplate", { count: String(selected.usageCount) })}</p>
                  {selectedUsages.length > 0 ? (
                    <ul className="mt-2 space-y-1">
                      <li className="font-medium text-stone-400">{labels.usageListTitle}</li>
                      {selectedUsages.map((usage) => (
                        <li key={usage.id}>
                          <Link
                            href={`/admin/recipes/${usage.entityId}/edit`}
                            className="text-amber-200/90 underline-offset-2 hover:underline"
                          >
                            {usage.entityTitle ?? usage.entityId}
                            {usage.usageField === "cover" ? " (cover)" : " (gallery)"}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {editorAsset ? (
        <MediaAssetEditorModal
          asset={editorAsset}
          folderId={editorAsset.folderId ?? folders[0]?.id ?? ""}
          onClose={() => setEditorAsset(null)}
          onSaved={() => {
            setEditorAsset(null);
            router.refresh();
          }}
        />
      ) : null}
    </div>
  );
}

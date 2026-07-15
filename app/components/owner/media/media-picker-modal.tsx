"use client";

import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import { buttons, modal } from "@/lib/constants/styles";
import { createClient } from "@/lib/supabase/client";
import { useTranslations } from "@/lib/i18n/translation-context";
import type { MediaAssetListItem, MediaFolder } from "@/types/media";
import { MediaUploadZone } from "@/app/components/owner/media/media-upload-zone";

type MediaPickerModalProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (asset: { id: string; publicUrl: string; altText: string | null }) => void;
  folders: MediaFolder[];
};

export function MediaPickerModal({ open, onClose, onSelect, folders }: MediaPickerModalProps) {
  const { t } = useTranslations();
  const [tab, setTab] = useState<"library" | "upload">("library");
  const [items, setItems] = useState<MediaAssetListItem[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [, startLibraryLoad] = useTransition();

  useEffect(() => {
    if (!open) return;

    startLibraryLoad(() => {
      setLoading(true);
      const supabase = createClient();
      void (async () => {
        let query = supabase
          .from("media_assets")
          .select(
            `id, filename, public_url, alt_text, file_size, width, height, created_at, media_asset_variants ( variant_key, public_url )`,
          )
          .order("created_at", { ascending: false })
          .limit(48);
        if (search.trim()) query = query.ilike("filename", `%${search.trim()}%`);
        const { data } = await query;
        setItems(
          (data ?? []).map((row) => {
            const variants = row.media_asset_variants as { variant_key: string; public_url: string }[] | null;
            const thumb = variants?.find((v) => v.variant_key === "thumbnail");
            return {
              id: row.id as string,
              folderId: null,
              folderName: null,
              filename: row.filename as string,
              publicUrl: row.public_url as string,
              altText: row.alt_text as string | null,
              caption: null,
              tags: [],
              width: row.width as number | null,
              height: row.height as number | null,
              fileSize: row.file_size as number,
              mimeType: "image/webp",
              uploadedByName: null,
              createdAt: row.created_at as string,
              thumbnailUrl: thumb?.public_url ?? (row.public_url as string),
              usageCount: 0,
            };
          }),
        );
        setLoading(false);
      })();
    });
  }, [open, search]);

  if (!open) return null;

  return (
    <div className={modal.overlay} onClick={onClose} role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        className={`${modal.panel} max-w-4xl`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={modal.header}>
          <h2 className="text-lg font-semibold text-stone-100">{t("ownerMediaPage.pickerTitle")}</h2>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => setTab("library")}
              className={`rounded-full px-3 py-1.5 text-xs ${tab === "library" ? "bg-amber-950/40 text-amber-200" : "text-stone-500"}`}
            >
              {t("ownerMediaPage.pickerLibraryTab")}
            </button>
            <button
              type="button"
              onClick={() => setTab("upload")}
              className={`rounded-full px-3 py-1.5 text-xs ${tab === "upload" ? "bg-amber-950/40 text-amber-200" : "text-stone-500"}`}
            >
              {t("ownerMediaPage.pickerUploadTab")}
            </button>
          </div>
        </div>
        <div className={modal.body}>
          {tab === "library" ? (
            <>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("ownerMediaPage.searchPlaceholder")}
                className="mb-4 w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-2.5 text-sm text-stone-100"
              />
              {loading ? (
                <p className="text-sm text-stone-500">{t("ownerMediaPage.loading")}</p>
              ) : (
                <div className="grid max-h-[420px] grid-cols-2 gap-3 overflow-y-auto sm:grid-cols-3 md:grid-cols-4">
                  {items.map((asset) => (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => {
                        onSelect({ id: asset.id, publicUrl: asset.publicUrl, altText: asset.altText });
                        onClose();
                      }}
                      className="overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.02] text-start hover:border-amber-500/40"
                    >
                      <div className="relative aspect-square">
                        <Image src={asset.thumbnailUrl} alt="" fill sizes="120px" loading="lazy" className="object-cover" />
                      </div>
                      <p className="truncate p-2 text-xs text-stone-300">{asset.filename}</p>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <MediaUploadZone folders={folders} onUploaded={() => setTab("library")} />
          )}
        </div>
        <div className={modal.footer}>
          <button type="button" onClick={onClose} className={`${buttons.secondary} h-10 px-4 text-xs`}>
            {t("common.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}

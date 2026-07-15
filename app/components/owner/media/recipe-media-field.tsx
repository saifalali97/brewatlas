"use client";

import Image from "next/image";
import { useState } from "react";
import { MediaPickerModal } from "@/app/components/owner/media/media-picker-modal";
import { buttons } from "@/lib/constants/styles";
import { useTranslations } from "@/lib/i18n/translation-context";
import type { MediaFolder } from "@/types/media";

type RecipeMediaFieldProps = {
  folders: MediaFolder[];
  coverImageUrl?: string | null;
  coverMediaAssetId?: string | null;
  galleryItems?: { id: string; url: string }[];
};

export function RecipeMediaField({
  folders,
  coverImageUrl,
  coverMediaAssetId,
  galleryItems = [],
}: RecipeMediaFieldProps) {
  const { t } = useTranslations();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<"cover" | "gallery">("cover");
  const [cover, setCover] = useState<{ id: string; url: string } | null>(
    coverMediaAssetId && coverImageUrl ? { id: coverMediaAssetId, url: coverImageUrl } : null,
  );
  const [gallery, setGallery] = useState<{ id: string; url: string }[]>(galleryItems);

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <div>
        <p className="text-sm font-medium text-stone-300">{t("recipeForm.coverPhotoLabel")}</p>
        {cover ? (
          <div className="relative mt-3 aspect-video overflow-hidden rounded-xl border border-white/[0.08]">
            <Image src={cover.url} alt="" fill className="object-cover" sizes="400px" />
          </div>
        ) : null}
        <input type="hidden" name="coverMediaAssetId" value={cover?.id ?? ""} />
        <input type="hidden" name="coverImageFromLibrary" value={cover?.url ?? ""} />
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className={`${buttons.secondary} h-9 px-3 text-xs`}
            onClick={() => {
              setPickerTarget("cover");
              setPickerOpen(true);
            }}
          >
            {t("ownerMediaPage.chooseFromLibraryCta")}
          </button>
        </div>
        <label className={`${buttons.secondary} mt-2 inline-flex h-9 cursor-pointer items-center px-3 text-xs`}>
          {t("ownerMediaPage.uploadNewCta")}
          <input type="file" name="coverImage" accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" />
        </label>
      </div>

      <div>
        <p className="text-sm font-medium text-stone-300">{t("recipeForm.additionalPhotosLabel")}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className={`${buttons.secondary} h-9 px-3 text-xs`}
            onClick={() => {
              setPickerTarget("gallery");
              setPickerOpen(true);
            }}
          >
            {t("ownerMediaPage.chooseFromLibraryCta")}
          </button>
        </div>
        {gallery.map((item) => (
          <input key={item.id} type="hidden" name="galleryMediaAssetIds" value={item.id} />
        ))}
        <input
          type="file"
          name="galleryImages"
          multiple
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="mt-2 block text-sm text-stone-400 file:mr-4 file:rounded-full file:border-0 file:bg-white/[0.08] file:px-4 file:py-2 file:text-xs file:font-medium file:text-stone-100"
        />
      </div>

      <MediaPickerModal
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        folders={folders}
        onSelect={(asset) => {
          if (pickerTarget === "cover") {
            setCover({ id: asset.id, url: asset.publicUrl });
          } else {
            setGallery((prev) => [...prev, { id: asset.id, url: asset.publicUrl }]);
          }
        }}
      />
    </div>
  );
}

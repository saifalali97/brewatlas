"use client";

import { useState } from "react";
import { buttons, modal } from "@/lib/constants/styles";
import { applyImageEdits } from "@/lib/media/client-image-processing";
import { replaceMediaAssetFileAction } from "@/lib/supabase/media-library-actions";
import { useTranslations } from "@/lib/i18n/translation-context";
import type { MediaAssetListItem } from "@/types/media";

type MediaAssetEditorModalProps = {
  asset: MediaAssetListItem;
  folderId: string;
  onClose: () => void;
  onSaved: () => void;
};

export function MediaAssetEditorModal({ asset, folderId, onClose, onSaved }: MediaAssetEditorModalProps) {
  const { t } = useTranslations();
  const [rotation, setRotation] = useState(0);
  const [maxWidth, setMaxWidth] = useState(asset.width ?? 1600);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setPending(true);
    setError(null);
    try {
      const response = await fetch(asset.publicUrl);
      const blob = await response.blob();
      const file = new File([blob], asset.filename, { type: asset.mimeType });
      const processed = await applyImageEdits(file, { rotation, maxWidth });

      const formData = new FormData();
      formData.set("assetId", asset.id);
      formData.set("folderId", folderId);
      formData.set("filename", processed.filename);
      formData.set("mimeType", processed.mimeType);
      formData.set("width", String(processed.width));
      formData.set("height", String(processed.height));
      formData.set("altText", asset.altText ?? "");

      for (const variant of processed.variants) {
        formData.set(`variant_${variant.key}`, variant.blob, `${variant.key}-${processed.filename}`);
        formData.set(`variant_${variant.key}_width`, String(variant.width));
        formData.set(`variant_${variant.key}_height`, String(variant.height));
      }

      const result = await replaceMediaAssetFileAction(formData);
      if (result.error) {
        setError(result.error);
      } else {
        onSaved();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("ownerMediaPage.uploadFailed"));
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={modal.overlay} onClick={onClose} role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        className={modal.panel}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={modal.header}>
          <h2 className="text-lg font-semibold text-stone-100">{t("ownerMediaPage.editImageCta")}</h2>
        </div>
        <div className={modal.body}>
          <label className="block text-sm text-stone-400">
            {t("ownerMediaPage.rotateLabel")}
            <select
              value={rotation}
              onChange={(event) => setRotation(Number(event.target.value))}
              className="mt-2 w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-3 py-2 text-sm text-stone-100"
            >
              <option value={0}>0°</option>
              <option value={90}>90°</option>
              <option value={180}>180°</option>
              <option value={270}>270°</option>
            </select>
          </label>
          <label className="mt-4 block text-sm text-stone-400">
            {t("ownerMediaPage.maxWidthLabel")}
            <input
              type="range"
              min={480}
              max={2400}
              step={40}
              value={maxWidth}
              onChange={(event) => setMaxWidth(Number(event.target.value))}
              className="mt-2 w-full"
            />
            <span className="text-xs text-stone-500">{maxWidth}px</span>
          </label>
          {error ? <p className="mt-3 text-sm text-red-400">{error}</p> : null}
        </div>
        <div className={modal.footer}>
          <button type="button" onClick={onClose} className={`${buttons.secondary} h-10 px-4 text-xs`}>
            {t("common.cancel")}
          </button>
          <button type="button" disabled={pending} onClick={() => void handleSave()} className={`${buttons.primary} h-10 px-4 text-xs`}>
            {pending ? t("ownerMediaPage.savingCta") : t("ownerMediaPage.replaceImageCta")}
          </button>
        </div>
      </div>
    </div>
  );
}

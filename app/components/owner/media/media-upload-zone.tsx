"use client";

import { useCallback, useState } from "react";
import { Upload } from "lucide-react";
import { buttons } from "@/lib/constants/styles";
import { MEDIA_ALLOWED_MIME_TYPES } from "@/lib/media/constants";
import { processImageFile } from "@/lib/media/client-image-processing";
import { uploadMediaAssetAction } from "@/lib/supabase/media-library-actions";
import { useTranslations } from "@/lib/i18n/translation-context";
import type { MediaFolder } from "@/types/media";

type MediaUploadZoneProps = {
  folders: MediaFolder[];
  defaultFolderId?: string;
  onUploaded?: () => void;
};

type UploadItem = {
  id: string;
  name: string;
  progress: number;
  status: "pending" | "processing" | "uploading" | "done" | "error";
  error?: string;
};

export function MediaUploadZone({ folders, defaultFolderId, onUploaded }: MediaUploadZoneProps) {
  const { t } = useTranslations();
  const [folderId, setFolderId] = useState(defaultFolderId ?? folders[0]?.id ?? "");
  const [dragOver, setDragOver] = useState(false);
  const [uploads, setUploads] = useState<UploadItem[]>([]);

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files).filter((file) => MEDIA_ALLOWED_MIME_TYPES.has(file.type));
      if (list.length === 0) return;

      for (const file of list) {
        const id = crypto.randomUUID();
        setUploads((prev) => [...prev, { id, name: file.name, progress: 5, status: "processing" }]);

        try {
          setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, progress: 25 } : u)));
          const processed = await processImageFile(file);
          setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, progress: 55, status: "uploading" } : u)));

          const formData = new FormData();
          formData.set("folderId", folderId);
          formData.set("filename", processed.filename);
          formData.set("mimeType", processed.mimeType);
          formData.set("width", String(processed.width));
          formData.set("height", String(processed.height));

          for (const variant of processed.variants) {
            formData.set(`variant_${variant.key}`, variant.blob, `${variant.key}-${processed.filename}`);
            formData.set(`variant_${variant.key}_width`, String(variant.width));
            formData.set(`variant_${variant.key}_height`, String(variant.height));
          }

          setUploads((prev) => prev.map((u) => (u.id === id ? { ...u, progress: 85 } : u)));
          const result = await uploadMediaAssetAction(formData);

          if (result.error) {
            setUploads((prev) =>
              prev.map((u) => (u.id === id ? { ...u, status: "error", error: result.error, progress: 100 } : u)),
            );
          } else {
            setUploads((prev) =>
              prev.map((u) => (u.id === id ? { ...u, status: "done", progress: 100 } : u)),
            );
            onUploaded?.();
          }
        } catch (error) {
          setUploads((prev) =>
            prev.map((u) => ({
              ...u,
              status: "error",
              error: error instanceof Error ? error.message : t("ownerMediaPage.uploadFailed"),
              progress: 100,
            })),
          );
        }
      }
    },
    [folderId, onUploaded, t],
  );

  return (
    <div className="rounded-[1.25rem] border border-white/[0.09] bg-white/[0.03] p-4">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label htmlFor="media-upload-folder" className="text-sm text-stone-400">
          {t("ownerMediaPage.uploadFolderLabel")}
        </label>
        <select
          id="media-upload-folder"
          value={folderId}
          onChange={(event) => setFolderId(event.target.value)}
          className="rounded-xl border border-white/[0.1] bg-white/[0.03] px-3 py-2 text-sm text-stone-100"
        >
          {folders.map((folder) => (
            <option key={folder.id} value={folder.id}>
              {folder.name}
            </option>
          ))}
        </select>
      </div>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          void processFiles(event.dataTransfer.files);
        }}
        className={`flex min-h-[140px] flex-col items-center justify-center rounded-xl border border-dashed px-6 py-8 text-center transition-colors ${
          dragOver ? "border-amber-500/50 bg-amber-950/20" : "border-white/[0.12] bg-white/[0.02]"
        }`}
      >
        <Upload className="h-8 w-8 text-stone-500" aria-hidden />
        <p className="mt-3 text-sm font-medium text-stone-200">{t("ownerMediaPage.dropzoneTitle")}</p>
        <p className="mt-1 text-xs text-stone-500">{t("ownerMediaPage.dropzoneHint")}</p>
        <label className={`${buttons.secondary} mt-4 cursor-pointer px-4 py-2 text-xs`}>
          {t("ownerMediaPage.browseFilesCta")}
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="sr-only"
            onChange={(event) => {
              if (event.target.files) void processFiles(event.target.files);
              event.target.value = "";
            }}
          />
        </label>
      </div>

      {uploads.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {uploads.map((upload) => (
            <li key={upload.id} className="rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span className="truncate text-stone-300">{upload.name}</span>
                <span className="text-stone-500">{upload.status}</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                <div className="h-full bg-amber-500/80 transition-all" style={{ width: `${upload.progress}%` }} />
              </div>
              {upload.error ? <p className="mt-1 text-xs text-red-400">{upload.error}</p> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

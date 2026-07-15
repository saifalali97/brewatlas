"use client";

import { useRef, useState } from "react";
import { processImageFile } from "@/lib/media/client-image-processing";
import { ALLOWED_RECIPE_IMAGE_TYPES, RECIPE_IMAGE_ACCEPT } from "@/lib/media/constants";

type RecipeImageFileInputProps = {
  id: string;
  name: string;
  multiple?: boolean;
  className?: string;
  metaFieldName?: string;
  widthFieldName?: string;
  heightFieldName?: string;
  blurFieldName?: string;
  accept?: string;
};

export function RecipeImageFileInput({
  id,
  name,
  multiple = false,
  className,
  metaFieldName,
  widthFieldName,
  heightFieldName,
  blurFieldName,
  accept = RECIPE_IMAGE_ACCEPT,
}: RecipeImageFileInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [processing, setProcessing] = useState(false);

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const files = input.files;
    if (!files || files.length === 0) return;

    setProcessing(true);
    try {
      const transfer = new DataTransfer();
      const galleryMeta: Array<{ width: number; height: number; blurDataUrl: string }> = [];
      let coverWidth: number | null = null;
      let coverHeight: number | null = null;
      let coverBlur: string | null = null;

      for (const file of Array.from(files)) {
        if (!ALLOWED_RECIPE_IMAGE_TYPES.has(file.type) && !file.type.startsWith("image/")) {
          transfer.items.add(file);
          continue;
        }

        const processed = await processImageFile(file);
        const original = processed.variants.find((variant) => variant.key === "original");
        if (!original) continue;

        transfer.items.add(new File([original.blob], processed.filename, { type: processed.mimeType }));

        if (multiple) {
          galleryMeta.push({
            width: processed.width,
            height: processed.height,
            blurDataUrl: processed.blurDataUrl,
          });
        } else {
          coverWidth = processed.width;
          coverHeight = processed.height;
          coverBlur = processed.blurDataUrl;
        }
      }

      input.files = transfer.files;

      if (multiple && metaFieldName) {
        const metaInput = input.form?.elements.namedItem(metaFieldName) as HTMLInputElement | null;
        if (metaInput) metaInput.value = JSON.stringify(galleryMeta);
      }

      if (!multiple) {
        if (widthFieldName) {
          const widthInput = input.form?.elements.namedItem(widthFieldName) as HTMLInputElement | null;
          if (widthInput) widthInput.value = coverWidth ? String(coverWidth) : "";
        }
        if (heightFieldName) {
          const heightInput = input.form?.elements.namedItem(heightFieldName) as HTMLInputElement | null;
          if (heightInput) heightInput.value = coverHeight ? String(coverHeight) : "";
        }
        if (blurFieldName) {
          const blurInput = input.form?.elements.namedItem(blurFieldName) as HTMLInputElement | null;
          if (blurInput) blurInput.value = coverBlur ?? "";
        }
      }
    } finally {
      setProcessing(false);
    }
  }

  return (
    <>
      {metaFieldName ? <input type="hidden" name={metaFieldName} defaultValue="" /> : null}
      {widthFieldName ? <input type="hidden" name={widthFieldName} defaultValue="" /> : null}
      {heightFieldName ? <input type="hidden" name={heightFieldName} defaultValue="" /> : null}
      {blurFieldName ? <input type="hidden" name={blurFieldName} defaultValue="" /> : null}
      <input
        ref={inputRef}
        id={id}
        name={name}
        type="file"
        multiple={multiple}
        accept={accept}
        disabled={processing}
        onChange={(event) => void handleChange(event)}
        className={className}
      />
    </>
  );
}

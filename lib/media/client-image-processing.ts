"use client";

import { MEDIA_VARIANT_WIDTHS } from "@/lib/media/constants";

export type ProcessedImageVariant = {
  key: keyof typeof MEDIA_VARIANT_WIDTHS | "original";
  blob: Blob;
  width: number;
  height: number;
};

export type ProcessedImageResult = {
  filename: string;
  mimeType: string;
  width: number;
  height: number;
  fileSize: number;
  variants: ProcessedImageVariant[];
};

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    img.src = url;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) reject(new Error("Failed to encode image"));
        else resolve(blob);
      },
      mimeType,
      quality,
    );
  });
}

async function renderToCanvas(
  source: CanvasImageSource,
  width: number,
  height: number,
  rotation = 0,
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  if (rotation % 360 === 0) {
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(source, 0, 0, width, height);
    return canvas;
  }

  const radians = (rotation * Math.PI) / 180;
  const sin = Math.abs(Math.sin(radians));
  const cos = Math.abs(Math.cos(radians));
  canvas.width = Math.round(width * cos + height * sin);
  canvas.height = Math.round(width * sin + height * cos);
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(radians);
  ctx.drawImage(source, -width / 2, -height / 2, width, height);
  return canvas;
}

function pickOutputMimeType(inputType: string): string {
  if (inputType === "image/png") return "image/png";
  if (inputType === "image/avif" && typeof createImageBitmap !== "undefined") return "image/avif";
  return "image/webp";
}

export async function processImageFile(
  file: File,
  options: { maxWidth?: number; quality?: number; rotation?: number } = {},
): Promise<ProcessedImageResult> {
  const img = await loadImageFromFile(file);
  const rotation = options.rotation ?? 0;
  const maxWidth = options.maxWidth ?? MEDIA_VARIANT_WIDTHS.lg;
  const quality = options.quality ?? 0.82;
  const mimeType = pickOutputMimeType(file.type);

  const scale = Math.min(1, maxWidth / img.width);
  const baseWidth = Math.max(1, Math.round(img.width * scale));
  const baseHeight = Math.max(1, Math.round(img.height * scale));
  const baseCanvas = await renderToCanvas(img, baseWidth, baseHeight, rotation);
  const originalBlob = await canvasToBlob(baseCanvas, mimeType, quality);

  const variants: ProcessedImageVariant[] = [
    {
      key: "original",
      blob: originalBlob,
      width: baseCanvas.width,
      height: baseCanvas.height,
    },
  ];

  for (const [key, targetWidth] of Object.entries(MEDIA_VARIANT_WIDTHS) as Array<
    [keyof typeof MEDIA_VARIANT_WIDTHS, number]
  >) {
    if (key === "thumbnail") {
      const size = MEDIA_VARIANT_WIDTHS.thumbnail;
      const thumbScale = Math.min(1, size / baseWidth, size / baseHeight);
      const w = Math.max(1, Math.round(baseWidth * thumbScale));
      const h = Math.max(1, Math.round(baseHeight * thumbScale));
      const variantCanvas = await renderToCanvas(baseCanvas, w, h);
      variants.push({
        key: "thumbnail",
        blob: await canvasToBlob(variantCanvas, mimeType, 0.75),
        width: w,
        height: h,
      });
      continue;
    }
    if (targetWidth >= baseWidth) continue;
    const variantScale = targetWidth / baseWidth;
    const w = Math.max(1, Math.round(baseWidth * variantScale));
    const h = Math.max(1, Math.round(baseHeight * variantScale));
    const variantCanvas = await renderToCanvas(baseCanvas, w, h);
    const blob = await canvasToBlob(variantCanvas, mimeType, quality);
    variants.push({ key, blob, width: w, height: h });
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "-").slice(0, 80);
  const extension = mimeType.split("/")[1] ?? "webp";

  return {
    filename: safeName.includes(".") ? safeName : `${safeName}.${extension}`,
    mimeType,
    width: baseCanvas.width,
    height: baseCanvas.height,
    fileSize: originalBlob.size,
    variants,
  };
}

export async function applyImageEdits(
  file: File,
  edits: { rotation?: number; maxWidth?: number },
): Promise<ProcessedImageResult> {
  return processImageFile(file, edits);
}

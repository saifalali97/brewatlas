/** Warm coffee-toned 10×6 JPEG used when no per-image blur hash is stored yet. */
export const DEFAULT_BLUR_DATA_URL =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBEQACEQADAPwCd//Z";

const BLUR_WIDTH = 10;

export async function canvasToBlurDataUrl(canvas: HTMLCanvasElement): Promise<string> {
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (value) => {
        if (!value) reject(new Error("Failed to encode blur placeholder"));
        else resolve(value);
      },
      "image/webp",
      0.55,
    );
  });

  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return `data:image/webp;base64,${btoa(binary)}`;
}

export async function generateBlurDataUrl(
  source: CanvasImageSource,
  width: number,
  height: number,
): Promise<string> {
  const blurHeight = Math.max(1, Math.round((height / width) * BLUR_WIDTH));
  const canvas = document.createElement("canvas");
  canvas.width = BLUR_WIDTH;
  canvas.height = blurHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return DEFAULT_BLUR_DATA_URL;
  ctx.drawImage(source, 0, 0, BLUR_WIDTH, blurHeight);
  return canvasToBlurDataUrl(canvas);
}

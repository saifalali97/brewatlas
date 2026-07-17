"use client";

import Image from "next/image";
import { useState } from "react";
import {
  IMAGE_SIZE_PRESETS,
  resolveBlurDataUrl,
  resolveImageLoading,
  shouldUnoptimizeImage,
} from "@/lib/media/responsive-image";
import { RECIPE_IMAGE_PLACEHOLDER } from "@/types/recipe";

type OptimizedImageProps = {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  blurDataUrl?: string | null;
  priority?: boolean;
  loading?: "lazy" | "eager";
  sizes?: string;
  className?: string;
  preload?: boolean;
  fallbackSrc?: string;
};

export function OptimizedImage({
  src,
  alt,
  fill = true,
  width,
  height,
  blurDataUrl,
  priority = false,
  loading,
  sizes = IMAGE_SIZE_PRESETS.fullWidth,
  className = "ac-editorial-photo object-cover",
  preload = false,
  fallbackSrc = RECIPE_IMAGE_PLACEHOLDER,
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState(src);
  const unoptimized = shouldUnoptimizeImage(imageSrc);
  const resolvedBlur = resolveBlurDataUrl(imageSrc, blurDataUrl ?? undefined);

  return (
    <Image
      src={imageSrc}
      alt={alt}
      fill={fill}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      priority={priority}
      preload={preload}
      loading={resolveImageLoading(priority, loading)}
      sizes={sizes}
      unoptimized={unoptimized}
      placeholder={resolvedBlur ? "blur" : undefined}
      blurDataURL={resolvedBlur}
      onError={() => {
        if (imageSrc !== fallbackSrc) setImageSrc(fallbackSrc);
      }}
      className={className}
    />
  );
}

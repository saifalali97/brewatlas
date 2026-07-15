"use client";

import { OptimizedImage } from "@/app/components/ui/optimized-image";
import { IMAGE_SIZE_PRESETS } from "@/lib/media/responsive-image";

const overlayStyles = {
  hero: "bg-gradient-to-b from-[#0a0705]/92 via-[#0a0705]/78 to-[#0a0705]/96",
  card: "bg-gradient-to-t from-[#0a0705] via-[#0a0705]/55 to-[#0a0705]/5",
  portrait: "bg-gradient-to-t from-[#0a0705] via-[#0a0705]/45 to-[#0a0705]/5",
  banner: "bg-gradient-to-r from-[#0a0705]/90 via-[#0a0705]/50 to-[#0a0705]/20",
};

type PremiumImageProps = {
  src: string;
  alt: string;
  className?: string;
  overlay?: "hero" | "card" | "portrait" | "banner";
  preload?: boolean;
  priority?: boolean;
  sizes?: string;
  blurDataUrl?: string | null;
  width?: number;
  height?: number;
};

export function PremiumImage({
  src,
  alt,
  className = "",
  overlay = "card",
  preload = false,
  priority = false,
  sizes = IMAGE_SIZE_PRESETS.fullWidth,
  blurDataUrl,
  width,
  height,
}: PremiumImageProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <OptimizedImage
        src={src}
        alt={alt}
        blurDataUrl={blurDataUrl}
        width={width}
        height={height}
        priority={priority}
        preload={preload}
        sizes={sizes}
        loading={priority ? undefined : "lazy"}
        className="object-cover brightness-[0.62] contrast-[1.08] saturate-[0.8] transition-all duration-700 ease-out group-hover:scale-[1.04] group-hover:brightness-[0.72]"
      />
      <div className={`absolute inset-0 ${overlayStyles[overlay]}`} aria-hidden />
      <div
        className="absolute inset-0 bg-gradient-to-br from-amber-950/20 via-transparent to-[#0a0705]/30 mix-blend-multiply"
        aria-hidden
      />
    </div>
  );
}

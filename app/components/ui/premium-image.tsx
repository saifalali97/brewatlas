"use client";

import Image from "next/image";
import { useState } from "react";

const FALLBACK_SRC = "/images/coffee-placeholder.svg";

type PremiumImageProps = {
  src: string;
  alt: string;
  className?: string;
  overlay?: "hero" | "card" | "portrait" | "banner";
  priority?: boolean;
  sizes?: string;
};

const overlayStyles = {
  hero: "bg-gradient-to-b from-[#0a0705]/92 via-[#0a0705]/78 to-[#0a0705]/96",
  card: "bg-gradient-to-t from-[#0a0705] via-[#0a0705]/55 to-[#0a0705]/5",
  portrait: "bg-gradient-to-t from-[#0a0705] via-[#0a0705]/45 to-[#0a0705]/5",
  banner: "bg-gradient-to-r from-[#0a0705]/90 via-[#0a0705]/50 to-[#0a0705]/20",
};

export function PremiumImage({
  src,
  alt,
  className = "",
  overlay = "card",
  priority = false,
  sizes = "100vw",
}: PremiumImageProps) {
  const [imageSrc, setImageSrc] = useState(src);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={imageSrc}
        alt={alt}
        fill
        priority={priority}
        sizes={sizes}
        unoptimized={imageSrc === FALLBACK_SRC}
        onError={() => {
          if (imageSrc !== FALLBACK_SRC) {
            setImageSrc(FALLBACK_SRC);
          }
        }}
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

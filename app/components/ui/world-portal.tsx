"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { dsFocus, dsMotion, dsRadius } from "@/lib/constants/styles";

export type WorldPortalTone = "warm" | "neutral" | "palm" | "sand" | "culture" | "gold";

const toneOverlays: Record<WorldPortalTone, string> = {
  warm: "from-uae-dark-coffee-deep/90 via-uae-dark-coffee-deep/25 to-uae-warm-gold/10",
  neutral: "from-uae-dark-coffee-deep/92 via-uae-dark-coffee-deep/30 to-transparent",
  palm: "from-uae-dark-coffee-deep/90 via-uae-palm-deep/20 to-transparent",
  sand: "from-uae-dark-coffee-deep/88 via-uae-sand-deep/15 to-transparent",
  culture: "from-uae-dark-coffee-deep/90 via-uae-dark-coffee/20 to-uae-sand/10",
  gold: "from-uae-dark-coffee-deep/92 via-uae-warm-gold-deep/18 to-uae-warm-gold/8",
};

type WorldPortalProps = {
  href: string;
  eyebrow: string;
  title: string;
  tagline: string;
  enterLabel: string;
  imageSrc: string;
  imageAlt: string;
  tone?: WorldPortalTone;
  size?: "large" | "small";
  priority?: boolean;
};

function joinClasses(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/** Immersive editorial portal tile for the Discover section. */
export function WorldPortal({
  href,
  eyebrow,
  title,
  tagline,
  enterLabel,
  imageSrc,
  imageAlt,
  tone = "warm",
  size = "large",
  priority = false,
}: WorldPortalProps) {
  const heightClass =
    size === "large"
      ? "min-h-[28rem] sm:min-h-[26rem] lg:min-h-[26.25rem]"
      : "min-h-[22rem] sm:min-h-[20rem] lg:min-h-[26.25rem]";

  return (
    <Link
      href={href}
      className={joinClasses(
        "group relative block overflow-hidden",
        dsRadius.card,
        "border border-white/[0.08]",
        dsMotion.transitionSlow,
        "hover:border-uae-warm-gold/25",
        dsFocus.ring,
        heightClass,
      )}
    >
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        priority={priority}
        sizes={
          size === "large"
            ? "(min-width: 1024px) 66vw, 100vw"
            : "(min-width: 1024px) 33vw, 100vw"
        }
        className={joinClasses(
          "object-cover object-center",
          dsMotion.transitionSlow,
          "motion-safe:group-hover:scale-[1.02]",
          "brightness-[0.88] contrast-[1.04] saturate-[0.92]",
        )}
      />

      <div
        aria-hidden
        className={joinClasses(
          "absolute inset-0 bg-gradient-to-t",
          toneOverlays[tone],
        )}
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_80%,rgba(192,138,46,0.08),transparent_55%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
      />

      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 lg:p-9">
        <p className="text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-uae-warm-gold/85">
          {eyebrow}
        </p>
        <h3 className="mt-3 max-w-md text-2xl font-semibold leading-[1.15] tracking-[-0.02em] text-uae-pearl sm:text-[1.75rem]">
          {title}
        </h3>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-stone-400/95 sm:text-[0.9375rem]">
          {tagline}
        </p>
        <span
          className={joinClasses(
            "mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-uae-warm-gold",
            dsMotion.transition,
            "group-hover:gap-2.5",
          )}
        >
          {enterLabel}
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5" aria-hidden />
        </span>
      </div>
    </Link>
  );
}

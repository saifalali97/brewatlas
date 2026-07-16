"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { dsFocus, dsMotion, dsTypography } from "@/lib/constants/styles";

export type WorldPortalTone = "warm" | "neutral" | "palm" | "sand" | "culture" | "gold";

const toneOverlays: Record<WorldPortalTone, string> = {
  warm: "from-ba-espresso/92 via-ba-espresso/35 to-ba-gold/12",
  neutral: "from-ba-espresso/94 via-ba-espresso/40 to-transparent",
  palm: "from-ba-espresso/90 via-ba-charcoal/50 to-ba-bronze/8",
  sand: "from-ba-espresso/88 via-ba-coffee/40 to-ba-sand-deep/15",
  culture: "from-ba-espresso/92 via-ba-charcoal/45 to-ba-sand/12",
  gold: "from-ba-espresso/94 via-ba-bronze/25 to-ba-gold/15",
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
  size?: "large" | "small" | "tall";
  priority?: boolean;
};

function joinClasses(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/** Immersive editorial portal — full-bleed photography, no card chrome. */
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
      ? "min-h-[32rem] lg:min-h-[36rem]"
      : size === "tall"
        ? "min-h-[32rem] lg:min-h-[36rem]"
        : "min-h-[18rem] lg:min-h-[17rem]";

  return (
    <Link
      href={href}
      className={joinClasses(
        "group relative block overflow-hidden rounded-[1.75rem]",
        dsMotion.transitionSlow,
        "motion-safe:hover:shadow-[0_32px_80px_-24px_rgba(28,22,18,0.28)]",
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
          "motion-safe:group-hover:scale-[1.04]",
          "brightness-[0.82] contrast-[1.05] saturate-[0.9]",
        )}
      />

      <div
        aria-hidden
        className={joinClasses("absolute inset-0 bg-gradient-to-t", toneOverlays[tone])}
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_100%,rgba(184,149,107,0.18),transparent_60%)]"
      />

      <div className="absolute inset-x-0 bottom-0 p-8 sm:p-10 lg:p-12">
        <p className="text-[0.6875rem] font-medium uppercase tracking-[0.2em] text-ba-gold/90">
          {eyebrow}
        </p>
        <h3 className={`mt-4 max-w-lg ${dsTypography.h2Dark} text-3xl sm:text-4xl lg:text-[2.75rem]`}>
          {title}
        </h3>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-ba-sand-deep/85 sm:text-base">
          {tagline}
        </p>
        <span
          className={joinClasses(
            "mt-6 inline-flex items-center gap-2 text-sm font-medium text-ba-pearl",
            dsMotion.transition,
            "group-hover:gap-3",
          )}
        >
          {enterLabel}
          <ArrowRight
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1"
            aria-hidden
          />
        </span>
      </div>
    </Link>
  );
}

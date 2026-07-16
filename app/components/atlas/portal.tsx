"use client";

import Image from "next/image";
import Link from "next/link";
import {
  acFocus,
  acMotion,
  acPhotoGrade,
  acTypography,
  type AcPhotoGrade,
} from "@/lib/design-system/atlas-canon";

export type PortalTone = "warm" | "neutral" | "earth" | "sand" | "night";

const toneOverlays: Record<PortalTone, string> = {
  warm: "from-ac-espresso/92 via-ac-espresso/35 to-ac-gold/12",
  neutral: "from-ac-espresso/94 via-ac-espresso/40 to-transparent",
  earth: "from-ac-espresso/90 via-ac-walnut/50 to-ac-palm/10",
  sand: "from-ac-espresso/88 via-ac-walnut/40 to-ac-sand/15",
  night: "from-ac-espresso/94 via-ac-copper/25 to-ac-gold/15",
};

const toneGrade: Record<PortalTone, AcPhotoGrade> = {
  warm: "dawn",
  neutral: "directory",
  earth: "earth",
  sand: "dawn",
  night: "night",
};

export type PortalProps = {
  href: string;
  eyebrow: string;
  title: string;
  tagline?: string;
  enterLabel: string;
  imageSrc: string;
  imageAlt: string;
  tone?: PortalTone;
  size?: "large" | "small" | "tall" | "gateway";
  priority?: boolean;
  className?: string;
  /** Hide tagline for minimal gateway layouts */
  minimal?: boolean;
};

function joinClasses(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/**
 * Immersive portal — full-bleed linked photograph with type in lower third.
 * Subtle arch proportion; no card chrome.
 */
export function Portal({
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
  className = "",
  minimal = false,
}: PortalProps) {
  const heightClass =
    size === "gateway"
      ? "min-h-[14rem] sm:min-h-[18rem] md:min-h-full"
      : size === "large" || size === "tall"
        ? "min-h-[32rem] lg:min-h-[36rem]"
        : "min-h-[18rem] lg:min-h-[17rem]";

  return (
    <Link
      href={href}
      className={joinClasses(
        "group relative block overflow-hidden ac-portal-arch",
        acMotion.transitionPassage,
        acFocus.ring,
        heightClass,
        className,
      )}
    >
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        priority={priority}
        sizes={
          size === "gateway"
            ? "(min-width: 768px) 33vw, 100vw"
            : size === "large"
              ? "(min-width: 1024px) 66vw, 100vw"
              : "(min-width: 1024px) 33vw, 100vw"
        }
        className={joinClasses(
          "object-cover object-center",
          acPhotoGrade[toneGrade[tone]],
          acMotion.transitionPassage,
          "motion-safe:group-hover:brightness-[1.03]",
        )}
      />
      <div
        aria-hidden
        className={joinClasses(
          "absolute inset-0 bg-gradient-to-t",
          toneOverlays[tone],
        )}
      />
      <div className="absolute inset-x-0 bottom-0 p-8 sm:p-10 lg:p-12">
        <p className={acTypography.eyebrowDark}>{eyebrow}</p>
        <h3
          className={joinClasses(
            minimal ? acTypography.displayLgDark : acTypography.h2Dark,
            "mt-3 max-w-lg",
          )}
        >
          {title}
        </h3>
        {!minimal && tagline ? (
          <p className={joinClasses(acTypography.bodyDark, "mt-3 max-w-md")}>{tagline}</p>
        ) : null}
        <span
          className={joinClasses(
            acTypography.nav,
            "mt-6 inline-flex items-center gap-2 text-ac-gold",
          )}
        >
          {enterLabel}
          <span
            aria-hidden
            className="inline-block transition-transform duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1 motion-reduce:transform-none"
          >
            →
          </span>
        </span>
      </div>
    </Link>
  );
}

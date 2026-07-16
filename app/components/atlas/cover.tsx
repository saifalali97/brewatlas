import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  acFocus,
  acMotion,
  acPhotoGrade,
  acTypography,
  type AcPhotoGrade,
} from "@/lib/design-system/atlas-canon";

export type CoverProps = {
  href: string;
  title: string;
  eyebrow?: string;
  meta?: ReactNode;
  imageSrc: string;
  imageAlt: string;
  ctaLabel?: string;
  /** Photography grade profile */
  grade?: AcPhotoGrade;
  priority?: boolean;
  className?: string;
};

function joinClasses(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/**
 * Magazine cover — single recipe/publication feature at editorial scale.
 * 60/40 asymmetric split; no card chrome.
 */
export function Cover({
  href,
  title,
  eyebrow,
  meta,
  imageSrc,
  imageAlt,
  ctaLabel = "Open edition",
  grade = "library",
  priority = false,
  className = "",
}: CoverProps) {
  return (
    <Link
      href={href}
      className={joinClasses(
        "group grid grid-cols-1 lg:grid-cols-12 lg:gap-x-8",
        acFocus.ring,
        acMotion.transitionReveal,
        className,
      )}
    >
      <div className="relative min-h-[20rem] overflow-hidden lg:col-span-7 lg:min-h-[28rem]">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 58vw, 100vw"
          className={joinClasses(
            "object-cover object-center",
            acPhotoGrade[grade],
            acMotion.transitionReveal,
            "motion-safe:group-hover:brightness-[1.03]",
          )}
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-ac-espresso/40 via-transparent to-transparent"
        />
      </div>

      <div className="flex flex-col justify-end py-8 lg:col-span-5 lg:py-12">
        {eyebrow ? <p className={acTypography.eyebrow}>{eyebrow}</p> : null}
        <h2 className={joinClasses(acTypography.displayLg, "mt-4")}>{title}</h2>
        {meta ? <div className="mt-6">{meta}</div> : null}
        <span
          className={joinClasses(
            acTypography.nav,
            "mt-8 inline-flex items-center gap-2 text-ac-copper",
            acMotion.transition,
          )}
        >
          {ctaLabel}
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

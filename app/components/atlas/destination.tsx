import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  acFocus,
  acMotion,
  acTypography,
} from "@/lib/design-system/atlas-canon";

export type DestinationProps = {
  href: string;
  country: string;
  region?: string;
  description?: string;
  meta?: ReactNode;
  imageSrc?: string;
  imageAlt?: string;
  coordinates?: string;
  className?: string;
};

function joinClasses(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/**
 * Atlas destination panel — country at display scale, geography-first.
 * For horizontal atlas rails and full-viewport origin scroll experiences.
 */
export function Destination({
  href,
  country,
  region,
  description,
  meta,
  imageSrc,
  imageAlt = "",
  coordinates,
  className = "",
}: DestinationProps) {
  return (
    <Link
      href={href}
      className={joinClasses(
        "group relative flex min-w-[min(100%,20rem)] shrink-0 flex-col justify-end overflow-hidden sm:min-w-[24rem] lg:min-w-[28rem]",
        imageSrc ? "min-h-[24rem] lg:min-h-[32rem]" : "min-h-[16rem] border border-ac-espresso/[0.08] bg-ac-sand/30 p-8",
        acFocus.ring,
        acMotion.transitionReveal,
        className,
      )}
    >
      {imageSrc ? (
        <>
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes="(min-width: 1024px) 28vw, 80vw"
            className="object-cover object-center photo-grade-earth motion-safe:group-hover:brightness-[1.03]"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-ac-espresso/85 via-ac-espresso/25 to-transparent"
          />
        </>
      ) : null}

      <div className={joinClasses("relative z-10", imageSrc ? "p-8 lg:p-10" : "")}>
        {coordinates ? (
          <p className={joinClasses(acTypography.eyebrow, imageSrc && acTypography.eyebrowDark)}>
            {coordinates}
          </p>
        ) : null}
        {region ? (
          <p
            className={joinClasses(
              acTypography.caption,
              "mt-2",
              imageSrc && acTypography.captionDark,
            )}
          >
            {region}
          </p>
        ) : null}
        <h3
          className={joinClasses(
            acTypography.displayLg,
            "mt-2",
            imageSrc && acTypography.displayLgDark,
          )}
        >
          {country}
        </h3>
        {description ? (
          <p
            className={joinClasses(
              acTypography.body,
              "mt-4 max-w-sm",
              imageSrc && acTypography.bodyDark,
            )}
          >
            {description}
          </p>
        ) : null}
        {meta ? <div className="mt-4">{meta}</div> : null}
      </div>
    </Link>
  );
}

/** Horizontal atlas rail container for Destination panels. */
export function DestinationRail({
  children,
  className = "",
  ariaLabel = "Coffee origins atlas",
}: {
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
}) {
  return (
    <div
      role="list"
      aria-label={ariaLabel}
      className={joinClasses(
        "flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory",
        className,
      )}
    >
      {children}
    </div>
  );
}

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { acFocus, acMotion, acTypography } from "@/lib/design-system/atlas-canon";

export type DestinationChapterProps = {
  id: string;
  country: string;
  region?: string;
  description?: string;
  meta?: ReactNode;
  imageSrc: string;
  imageAlt: string;
  coordinates?: string;
  ctaHref: string;
  ctaLabel: string;
  routeLine?: ReactNode;
};

function joinClasses(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/** Full-viewport atlas destination — one country per scroll chapter. */
export function DestinationChapter({
  id,
  country,
  region,
  description,
  meta,
  imageSrc,
  imageAlt,
  coordinates,
  ctaHref,
  ctaLabel,
  routeLine,
}: DestinationChapterProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="relative min-h-[85svh] snap-start overflow-hidden"
    >
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        sizes="100vw"
        className="object-cover object-center photo-grade-earth"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-t from-ac-espresso/92 via-ac-espresso/35 to-ac-espresso/10"
      />

      <div className="relative mx-auto flex min-h-[85svh] max-w-7xl flex-col justify-end px-6 pb-16 pt-28 sm:px-8 lg:px-12 lg:pb-20">
        {routeLine ? <div className="mb-8 max-w-xs">{routeLine}</div> : null}

        {coordinates ? <p className={acTypography.eyebrowDark}>{coordinates}</p> : null}
        {region ? <p className={joinClasses(acTypography.captionDark, "mt-2")}>{region}</p> : null}

        <h2 id={`${id}-title`} className={joinClasses(acTypography.displayLgDark, "mt-4 max-w-3xl")}>
          {country}
        </h2>

        {description ? (
          <p className={joinClasses(acTypography.bodyDark, "mt-6 max-w-xl")}>{description}</p>
        ) : null}

        {meta ? <div className="mt-6 max-w-lg">{meta}</div> : null}

        <Link
          href={ctaHref}
          className={joinClasses(
            acTypography.nav,
            "mt-10 inline-flex items-center gap-2 text-ac-gold",
            acFocus.ringDark,
            acMotion.transition,
          )}
        >
          {ctaLabel} →
        </Link>
      </div>
    </section>
  );
}

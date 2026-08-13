import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, Building2, Coffee } from "lucide-react";
import {
  rdButton,
  rdCard,
  rdLayout,
  rdMotion,
  rdTypography,
} from "@/lib/design-system/recipes-directory";

export type CountryCardProps = {
  href: string;
  name: string;
  description: string;
  bannerImage: string;
  imageAlt: string;
  flag: string;
  roasterCountLabel: string;
  recipeCountLabel: string;
  exploreLabel: string;
  featuredLogoUrl?: string | null;
  featuredName?: string | null;
};

/** Shared Gulf / Recipes directory country card. */
export function CountryCard({
  href,
  name,
  description,
  bannerImage,
  imageAlt,
  flag,
  roasterCountLabel,
  recipeCountLabel,
  exploreLabel,
  featuredLogoUrl,
  featuredName,
}: CountryCardProps) {
  let featuredMark: ReactNode;
  if (featuredLogoUrl) {
    featuredMark = (
      <Image
        src={featuredLogoUrl}
        alt={featuredName ?? name}
        fill
        sizes="100px"
        className="object-contain p-3.5"
      />
    );
  } else if (featuredName) {
    featuredMark = (
      <span className="px-2 text-center text-[0.5625rem] font-bold uppercase leading-tight tracking-wide text-[#1A1410]">
        {featuredName}
      </span>
    );
  } else {
    featuredMark = <Coffee className="h-8 w-8 text-[#C4A574]" strokeWidth={1.5} aria-hidden />;
  }

  return (
    <article className={rdCard.country}>
      <div className="relative shrink-0">
        <div className={rdLayout.countryImage}>
          <Image
            src={bannerImage}
            alt={imageAlt}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className={`object-cover object-center ${rdMotion.imageZoom}`}
          />
          <span
            className="absolute start-3.5 top-3.5 text-[1.5rem] leading-none drop-shadow-[0_2px_8px_rgba(26,20,16,0.25)]"
            aria-hidden
          >
            {flag}
          </span>
        </div>

        <div className="pointer-events-none absolute left-1/2 top-full z-10 -translate-x-1/2 -translate-y-1/2">
          <div className={rdCard.logoBadge}>{featuredMark}</div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center px-5 pb-6 pt-[70px] text-center">
        <h2 className={rdTypography.cardTitleLg}>{name}</h2>

        <div className={`mt-3.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 ${rdTypography.meta}`}>
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <Building2 className="h-4 w-4 shrink-0 text-[#A67B4A]" strokeWidth={1.75} aria-hidden />
            {roasterCountLabel}
          </span>
          <span className="text-[#C4A574]" aria-hidden>
            •
          </span>
          <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
            <Coffee className="h-4 w-4 shrink-0 text-[#A67B4A]" strokeWidth={1.75} aria-hidden />
            {recipeCountLabel}
          </span>
        </div>

        <p className="mt-3.5 line-clamp-2 min-h-[43px] max-w-[220px] text-[13px] leading-[1.65] text-[#1A1410]/58">
          {description}
        </p>

        <div className="mt-auto flex w-full justify-center pt-5">
          <Link href={href} className={rdButton.exploreNarrow}>
            <span className="truncate">{exploreLabel}</span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0 rtl:-scale-x-100" aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}

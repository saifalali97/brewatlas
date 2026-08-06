import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Building2, Coffee } from "lucide-react";
import { acFocus } from "@/lib/design-system/atlas-canon";
import { gulfCountryPath } from "@/lib/gulf-directory/countries";
import type { GulfDirectoryCountrySummary } from "@/lib/data/gulf-directory";

type GulfCountryCardProps = {
  country: GulfDirectoryCountrySummary;
  name: string;
  description: string;
  imageAlt: string;
  roasterCountLabel: string;
  recipeCountLabel: string;
  exploreLabel: string;
};

/** Gulf country card — reference proportions and styling. */
export function GulfCountryCard({
  country,
  name,
  description,
  imageAlt,
  roasterCountLabel,
  recipeCountLabel,
  exploreLabel,
}: GulfCountryCardProps) {
  const href = gulfCountryPath(country.slug);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-[14px] bg-white shadow-[0_2px_18px_rgba(26,20,16,0.06)]">
      <div className="relative pb-7">
        <div className="relative aspect-[1.42/1] overflow-hidden rounded-t-[14px]">
          <Image
            src={country.bannerImage}
            alt={imageAlt}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover object-center"
          />
          <span className="absolute left-3 top-3 text-[1.375rem] leading-none sm:left-3.5 sm:top-3.5" aria-hidden>
            {country.flag}
          </span>
        </div>

        {country.featuredRoaster ? (
          <div className="absolute bottom-0 left-1/2 z-10 -translate-x-1/2 translate-y-1/2">
            <div className="relative flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-full border-[3px] border-white bg-white shadow-[0_3px_14px_rgba(26,20,16,0.10)]">
              {country.featuredRoaster.logoUrl ? (
                <Image
                  src={country.featuredRoaster.logoUrl}
                  alt={country.featuredRoaster.name}
                  fill
                  sizes="72px"
                  className="object-contain p-2.5"
                />
              ) : (
                <span className="px-2 text-center text-[0.5625rem] font-bold uppercase leading-tight tracking-wide text-[#1A1410]">
                  {country.featuredRoaster.name}
                </span>
              )}
            </div>
          </div>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col px-5 pb-5 pt-8 text-center">
        <h2 className="font-display text-[1.125rem] leading-tight tracking-[-0.02em] text-[#1A1410] sm:text-[1.1875rem]">
          {name}
        </h2>

        <div className="mt-2.5 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-[0.75rem] text-[#1A1410]/55">
          <span className="inline-flex items-center gap-1">
            <Building2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {roasterCountLabel}
          </span>
          <span aria-hidden>•</span>
          <span className="inline-flex items-center gap-1">
            <Coffee className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {recipeCountLabel}
          </span>
        </div>

        <p className="mt-2.5 line-clamp-2 min-h-[2.5rem] text-[0.75rem] leading-[1.55] text-[#1A1410]/62 sm:text-[0.8125rem]">
          {description}
        </p>

        <Link
          href={href}
          className={`mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-full border border-[#C4A574]/50 bg-[#F5EFE4] px-4 py-2.5 text-[0.8125rem] font-medium text-[#A67B4A] ${acFocus.ring}`}
        >
          {exploreLabel}
          <ArrowRight className="h-3.5 w-3.5 rtl:-scale-x-100" aria-hidden />
        </Link>
      </div>
    </article>
  );
}

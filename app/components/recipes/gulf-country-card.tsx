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

/** Gulf country card — pixel-matched to BrewAtlas reference. */
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
  const featured = country.featuredRoaster;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-[#C4A574]/22 bg-white shadow-[0_4px_24px_rgba(26,20,16,0.045)] transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-[6px] hover:shadow-[0_14px_40px_rgba(26,20,16,0.10)]">
      <div className="relative shrink-0">
        <div className="relative h-[235px] w-full overflow-hidden">
          <Image
            src={country.bannerImage}
            alt={imageAlt}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover object-center transition-transform duration-300 ease-out group-hover:scale-[1.03]"
          />
          <span
            className="absolute left-3.5 top-3.5 text-[1.5rem] leading-none drop-shadow-[0_2px_8px_rgba(26,20,16,0.25)]"
            aria-hidden
          >
            {country.flag}
          </span>
        </div>

        <div className="pointer-events-none absolute left-1/2 top-full z-10 -translate-x-1/2 -translate-y-1/2">
          <div className="relative flex h-[100px] w-[100px] items-center justify-center overflow-hidden rounded-full border-[3px] border-white bg-white shadow-[0_8px_24px_rgba(26,20,16,0.12)]">
            {featured?.logoUrl ? (
              <Image
                src={featured.logoUrl}
                alt={featured.name}
                fill
                sizes="100px"
                className="object-contain p-3.5"
              />
            ) : featured ? (
              <span className="px-2 text-center text-[0.5625rem] font-bold uppercase leading-tight tracking-wide text-[#1A1410]">
                {featured.name}
              </span>
            ) : (
              <Coffee className="h-8 w-8 text-[#C4A574]" strokeWidth={1.5} aria-hidden />
            )}
          </div>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col items-center px-5 pb-6 pt-[70px] text-center">
        <h2 className="font-display text-[1.5rem] font-bold leading-[1.15] tracking-[-0.03em] text-[#1A1410]">
          {name}
        </h2>

        <div className="mt-3.5 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[13px] text-[#1A1410]/55">
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
          <Link
            href={href}
            className={`inline-flex h-11 w-full max-w-[220px] items-center justify-center gap-1.5 rounded-full border border-[#C4A574]/55 bg-[#F5EFE4] px-4 text-[13px] font-medium text-[#A67B4A] transition-colors duration-300 hover:border-[#C4A574]/90 hover:bg-[#E8DCC8] hover:text-[#8B6914] ${acFocus.ring}`}
          >
            <span className="truncate">{exploreLabel}</span>
            <ArrowRight className="h-3.5 w-3.5 shrink-0 rtl:-scale-x-100" aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}

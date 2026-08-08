import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Coffee, MapPin } from "lucide-react";
import { acFocus } from "@/lib/design-system/atlas-canon";
import {
  gulfRoasterPath,
  type GulfDirectoryCountrySlug,
} from "@/lib/gulf-directory/countries";
import type { GulfCountryPageRoaster } from "@/lib/gulf-directory/country-page-data";

type GulfCountryRoasterCardProps = {
  countrySlug: GulfDirectoryCountrySlug;
  roaster: GulfCountryPageRoaster;
  recipeCountLabel: string;
  specialtyLabel: string;
  exploreLabel: string;
};

/** Roaster card for Gulf country directory grids. */
export function GulfCountryRoasterCard({
  countrySlug,
  roaster,
  recipeCountLabel,
  specialtyLabel,
  exploreLabel,
}: GulfCountryRoasterCardProps) {
  const href = gulfRoasterPath(countrySlug, roaster.slug);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[24px] border border-[#C4A574]/22 bg-white p-6 shadow-[0_4px_24px_rgba(26,20,16,0.045)] transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-[4px] hover:shadow-[0_14px_40px_rgba(26,20,16,0.10)]">
      <div className="flex items-start gap-4">
        <div className="relative flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#C4A574]/30 bg-[#FDFCF8]">
          {roaster.logoUrl ? (
            <Image
              src={roaster.logoUrl}
              alt={roaster.name}
              fill
              sizes="72px"
              className="object-contain p-2.5"
            />
          ) : (
            <Coffee className="h-7 w-7 text-[#C4A574]" strokeWidth={1.5} aria-hidden />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-display text-[1.25rem] font-bold leading-snug tracking-[-0.03em] text-[#1A1410]">
            {roaster.name}
          </h3>
          <p className="mt-1.5 inline-flex items-center gap-1.5 text-[13px] text-[#1A1410]/55">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-[#A67B4A]" strokeWidth={1.75} aria-hidden />
            {roaster.city}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-2.5 text-[13px] leading-relaxed">
        <p className="inline-flex items-center gap-1.5 text-[#1A1410]/55">
          <Coffee className="h-3.5 w-3.5 text-[#A67B4A]" strokeWidth={1.75} aria-hidden />
          {recipeCountLabel}
        </p>
        <p className="text-[#1A1410]/65">
          <span className="text-[#1A1410]/45">{specialtyLabel}: </span>
          {roaster.specialty}
        </p>
      </div>

      <div className="mt-auto pt-6">
        <Link
          href={href}
          className={`inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-full border border-[#C4A574]/55 bg-[#F5EFE4] px-4 text-[13px] font-medium text-[#A67B4A] transition-colors duration-300 hover:border-[#C4A574]/90 hover:bg-[#E8DCC8] hover:text-[#8B6914] ${acFocus.ring}`}
        >
          {exploreLabel}
          <ArrowRight className="h-3.5 w-3.5 shrink-0 rtl:-scale-x-100" aria-hidden />
        </Link>
      </div>
    </article>
  );
}

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Coffee, MapPin } from "lucide-react";
import {
  rdButton,
  rdCard,
  rdTypography,
} from "@/lib/design-system/recipes-directory";

export type RoasterCardProps = {
  href: string;
  name: string;
  city: string;
  specialty: string;
  recipeCountLabel: string;
  specialtyLabel: string;
  exploreLabel: string;
  logoUrl?: string | null;
};

/** Shared Recipes directory roaster card. */
export function RoasterCard({
  href,
  name,
  city,
  specialty,
  recipeCountLabel,
  specialtyLabel,
  exploreLabel,
  logoUrl,
}: RoasterCardProps) {
  return (
    <article className={rdCard.roaster}>
      <div className="flex items-start gap-4">
        <div className={rdCard.roasterLogo}>
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt={name}
              fill
              sizes="72px"
              className="object-contain p-2.5"
            />
          ) : (
            <Coffee className="h-7 w-7 text-[#C4A574]" strokeWidth={1.5} aria-hidden />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className={rdTypography.cardTitleMd}>{name}</h3>
          <p className={`mt-1.5 inline-flex items-center gap-1.5 ${rdTypography.meta}`}>
            <MapPin className="h-3.5 w-3.5 shrink-0 text-[#A67B4A]" strokeWidth={1.75} aria-hidden />
            {city}
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
          {specialty}
        </p>
      </div>

      <div className="mt-auto pt-6">
        <Link href={href} className={rdButton.explore}>
          {exploreLabel}
          <ArrowRight className="h-3.5 w-3.5 shrink-0 rtl:-scale-x-100" aria-hidden />
        </Link>
      </div>
    </article>
  );
}

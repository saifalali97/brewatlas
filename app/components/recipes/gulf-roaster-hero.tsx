import Image from "next/image";
import Link from "next/link";
import { Coffee, MapPin, ExternalLink } from "lucide-react";
import {
  rdBorder,
  rdButton,
  rdCard,
  rdLayout,
  rdRadius,
  rdShadow,
  rdTypography,
} from "@/lib/design-system/recipes-directory";

type GulfRoasterHeroProps = {
  name: string;
  city: string;
  countryName: string;
  specialty: string;
  coverImage: string;
  coverImageAlt: string;
  logoUrl: string | null;
  website: string | null;
  instagram: string | null;
  websiteLabel: string;
  instagramLabel: string;
  specialtyLabel: string;
  backHref: string;
  backLabel: string;
};

/** Roaster page hero — cover, logo, identity, and outbound links. */
export function GulfRoasterHero({
  name,
  city,
  countryName,
  specialty,
  coverImage,
  coverImageAlt,
  logoUrl,
  website,
  instagram,
  websiteLabel,
  instagramLabel,
  specialtyLabel,
  backHref,
  backLabel,
}: GulfRoasterHeroProps) {
  return (
    <section className="relative overflow-hidden">
      <div className={`${rdLayout.container} pt-8`}>
        <Link href={backHref} className={rdButton.navLink}>
          <span aria-hidden className="rtl:rotate-180">
            ←
          </span>
          {backLabel}
        </Link>

        <div
          className={`relative mt-6 overflow-hidden ${rdRadius.card} ${rdBorder.gold22} ${rdShadow.hero}`}
        >
          <div className="relative min-h-[280px] w-full sm:min-h-[340px] lg:min-h-[400px]">
            <Image
              src={coverImage}
              alt={coverImageAlt}
              fill
              priority
              sizes="(min-width: 1200px) 1200px, 100vw"
              className="object-cover object-center"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-[#1A1410]/90 via-[#1A1410]/40 to-[#1A1410]/15"
              aria-hidden
            />
          </div>
        </div>

        <div className="relative z-10 -mt-14 flex flex-col items-center px-2 text-center sm:-mt-16">
          <div className={rdCard.logoBadge}>
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={name}
                fill
                sizes="100px"
                className="object-contain p-3.5"
                priority
              />
            ) : (
              <Coffee className="h-8 w-8 text-[#C4A574]" strokeWidth={1.5} aria-hidden />
            )}
          </div>

          <h1
            id="gulf-roaster-heading"
            className={`mt-5 ${rdTypography.cardTitleLg} sm:text-[2rem]`}
          >
            {name}
          </h1>

          <p className={`mt-2.5 inline-flex flex-wrap items-center justify-center gap-x-2 ${rdTypography.meta}`}>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-[#A67B4A]" strokeWidth={1.75} aria-hidden />
              {city}
            </span>
            <span className="text-[#C4A574]" aria-hidden>
              ·
            </span>
            <span>{countryName}</span>
          </p>

          <p className="mt-3 max-w-xl text-[0.9375rem] leading-[1.7] text-[#1A1410]/65">
            <span className="text-[#1A1410]/45">{specialtyLabel}: </span>
            {specialty}
          </p>

          {(website || instagram) && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              {website ? (
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={rdButton.pillSolid}
                >
                  {websiteLabel}
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                </a>
              ) : null}
              {instagram ? (
                <a
                  href={instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={rdButton.pill}
                >
                  {instagramLabel}
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                </a>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

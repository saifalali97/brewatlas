import Image from "next/image";
import Link from "next/link";
import {
  rdButton,
  rdLayout,
  rdRadius,
  rdBorder,
  rdShadow,
} from "@/lib/design-system/recipes-directory";

type GulfCountryHeroProps = {
  flag: string;
  name: string;
  description: string;
  coverImage: string;
  imageAlt: string;
  backHref: string;
  backLabel: string;
};

/** Country directory hero — flag, name, description, large cover. */
export function GulfCountryHero({
  flag,
  name,
  description,
  coverImage,
  imageAlt,
  backHref,
  backLabel,
}: GulfCountryHeroProps) {
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
          <div className="relative min-h-[300px] w-full sm:min-h-[380px] lg:min-h-[440px]">
            <Image
              src={coverImage}
              alt={imageAlt}
              fill
              priority
              sizes="(min-width: 1200px) 1200px, 100vw"
              className="object-cover object-center"
            />
            <div
              className="absolute inset-0 bg-gradient-to-t from-[#1A1410]/85 via-[#1A1410]/35 to-[#1A1410]/10"
              aria-hidden
            />
            <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 lg:p-10">
              <div className="max-w-2xl">
                <span className="text-[2rem] leading-none drop-shadow-md sm:text-[2.25rem]" aria-hidden>
                  {flag}
                </span>
                <h1
                  id="gulf-country-heading"
                  className="mt-3 font-display text-[2rem] font-bold leading-[1.05] tracking-[-0.04em] text-white sm:text-[2.75rem] lg:text-[3.25rem]"
                >
                  {name}
                </h1>
                <p className="mt-3 max-w-xl text-[0.9375rem] leading-[1.7] text-white/85 sm:text-base">
                  {description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { RevealOnScroll } from "@/app/components/ui/reveal-on-scroll";
import { RippleLink } from "@/app/components/ui/ripple-link";
import { buttons, dsFocus, dsMotion, dsTypography } from "@/lib/constants/styles";
import { interpolate } from "@/lib/i18n/format";
import type { OriginCardLabels } from "@/app/components/cards/origin-card";
import type { CoffeeOrigin } from "@/types/homepage";

type OriginsAtlasSectionProps = {
  origins: CoffeeOrigin[];
  eyebrow: string;
  title: string;
  description: string;
  cardLabels: OriginCardLabels;
};

/** Horizontal world atlas — immersive origin panels, not a card grid. */
export function OriginsAtlasSection({
  origins,
  eyebrow,
  title,
  description,
  cardLabels,
}: OriginsAtlasSectionProps) {
  return (
    <section id="origins" aria-labelledby="origins-heading" className="overflow-hidden bg-ba-sand/40">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:px-8 lg:px-12 lg:py-32 xl:px-16">
        <RevealOnScroll>
          <p className={dsTypography.eyebrow}>{eyebrow}</p>
          <h2 id="origins-heading" className={`mt-6 max-w-3xl ${dsTypography.h1}`}>
            {title}
          </h2>
          <p className={`mt-8 max-w-xl ${dsTypography.body}`}>{description}</p>
        </RevealOnScroll>
      </div>

      <div className="scrollbar-hide flex snap-x snap-mandatory gap-0 overflow-x-auto pb-2">
        {origins.map((origin, index) => (
          <RevealOnScroll
            key={origin.country}
            delay={index * 50}
            className="w-[88vw] shrink-0 snap-start sm:w-[70vw] lg:w-[48vw]"
          >
            <Link
              href="/origins"
              className={`group relative block min-h-[32rem] overflow-hidden sm:min-h-[36rem] ${dsFocus.ring}`}
            >
              <Image
                src={origin.image}
                alt={interpolate(cardLabels.imageAltTemplate, {
                  country: origin.country,
                  region: origin.region,
                  process: origin.process,
                })}
                fill
                sizes="50vw"
                className={`object-cover brightness-[0.88] saturate-[0.92] ${dsMotion.transitionSlow} motion-safe:group-hover:scale-[1.04]`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ba-espresso/95 via-ba-espresso/25 to-ba-espresso/5" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(184,149,107,0.15),transparent_55%)]" />

              <div className="absolute inset-x-0 bottom-0 p-8 sm:p-10 lg:p-12">
                <p className="text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-ba-gold/85">
                  {origin.region} · {origin.process}
                </p>
                <h3 className="font-display mt-3 text-5xl leading-[0.95] tracking-[-0.04em] text-ba-pearl sm:text-6xl lg:text-7xl">
                  {origin.country}
                </h3>
                <p className="mt-5 max-w-md text-sm leading-relaxed text-ba-sand-deep/85 sm:text-base">
                  {origin.tastingProfile}
                </p>
                <div className="mt-8 flex flex-wrap gap-6 text-xs uppercase tracking-[0.12em] text-ba-sand-deep/65">
                  <span>{origin.altitude}</span>
                  <span>{origin.roastRecommendation}</span>
                </div>
                <span className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-ba-pearl">
                  {cardLabels.exploreOrigin}
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </div>
            </Link>
          </RevealOnScroll>
        ))}
      </div>

      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-12 xl:px-16">
        <RippleLink href="/origins" className={buttons.secondary}>
          {cardLabels.exploreOrigin}
        </RippleLink>
      </div>
    </section>
  );
}

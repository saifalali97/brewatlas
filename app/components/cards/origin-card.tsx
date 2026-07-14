import Image from "next/image";
import { Coffee, Flame, Layers, MapPin, Mountain, Sparkles } from "lucide-react";
import { GhostCtaLink } from "@/app/components/ui/ghost-cta-link";
import { MetaTile } from "@/app/components/ui/meta-tile";
import { cards } from "@/lib/constants/styles";
import type { CoffeeOrigin } from "@/types/homepage";
import { interpolate } from "@/lib/i18n/format";
import { imageAlt } from "@/lib/seo/image-alt";

export type OriginCardLabels = {
  premium: string;
  altitude: string;
  process: string;
  roast: string;
  brewMethod: string;
  exploreOrigin: string;
  /** Translated `{country} {region} {process}` image alt template. */
  imageAltTemplate: string;
};

const defaultOriginCardLabels: OriginCardLabels = {
  premium: "Premium",
  altitude: "Altitude",
  process: "Process",
  roast: "Roast",
  brewMethod: "Brew Method",
  exploreOrigin: "Explore Origin",
  imageAltTemplate: imageAlt.originTemplate,
};

type OriginCardProps = {
  origin: CoffeeOrigin;
  ctaHref?: string;
  /** Translated copy for this card's chrome. Defaults to English so existing callers (e.g. `/origins`) are unaffected. */
  labels?: Partial<OriginCardLabels>;
};

export function OriginCard({ origin, ctaHref = "#origins", labels }: OriginCardProps) {
  const l: OriginCardLabels = { ...defaultOriginCardLabels, ...labels };
  return (
    <article className={cards.premiumShell}>
      <div aria-hidden className={cards.premiumSheen} />
      <div aria-hidden className={cards.premiumGlow} />

      <div className="relative h-44 shrink-0 overflow-hidden sm:h-48 lg:h-52">
        <Image
          src={origin.image}
          alt={interpolate(l.imageAltTemplate, {
            country: origin.country,
            region: origin.region,
            process: origin.process,
          })}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          unoptimized={origin.image.endsWith(".svg")}
          className="object-cover brightness-[0.9] contrast-[1.04] saturate-[0.94] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] motion-reduce:transform-none"
        />
        <div className={cards.imageOverlay} />
        <div className={cards.imageAmberWash} />
        <div className={cards.imageRadial} />

        {origin.premium && (
          <div className="absolute right-4 top-4 rounded-full border border-amber-700/35 bg-amber-950/65 px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-amber-200/90 backdrop-blur-xl">
            {l.premium}
          </div>
        )}

        <div className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full border border-white/[0.12] bg-[#0a0705]/55 px-3 py-1 text-[10px] font-medium text-stone-200 backdrop-blur-xl">
          <MapPin className="h-3 w-3 text-amber-500/80" aria-hidden />
          {origin.region}
        </div>
      </div>

      <div className="relative flex flex-1 flex-col p-5 lg:p-6">
        <h3 className="text-[1.25rem] font-semibold leading-[1.15] tracking-tight text-stone-50 transition-colors duration-300 group-hover:text-amber-50 lg:text-[1.3rem]">
          {origin.country}
        </h3>

        <div className="mt-3 flex items-start gap-2">
          <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500/75" aria-hidden />
          <p className="text-[0.8125rem] leading-[1.65] text-stone-300/90">
            {origin.tastingProfile}
          </p>
        </div>

        <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
          <MetaTile icon={Mountain} label={l.altitude} value={origin.altitude} />
          <MetaTile icon={Layers} label={l.process} value={origin.process} />
          <MetaTile icon={Flame} label={l.roast} value={origin.roastRecommendation} />
          <MetaTile icon={Coffee} label={l.brewMethod} value={origin.brewingMethod} />
        </div>

        <div className="mt-auto border-t border-white/[0.06] pt-4">
          <GhostCtaLink href={ctaHref}>{l.exploreOrigin}</GhostCtaLink>
        </div>
      </div>
    </article>
  );
}

import { OptimizedImage } from "@/app/components/ui/optimized-image";
import { IMAGE_SIZE_PRESETS } from "@/lib/media/responsive-image";
import { Coffee, Flame, Layers, MapPin, Mountain, Sparkles } from "lucide-react";
import { GhostCtaLink } from "@/app/components/ui/ghost-cta-link";
import { MetaTile } from "@/app/components/ui/meta-tile";
import { badges, cards } from "@/lib/constants/styles";
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
  labels?: Partial<OriginCardLabels>;
};

export function OriginCard({ origin, ctaHref = "#origins", labels }: OriginCardProps) {
  const l: OriginCardLabels = { ...defaultOriginCardLabels, ...labels };
  return (
    <article className={cards.premiumShell}>
      <div aria-hidden className={cards.premiumSheen} />
      <div aria-hidden className={cards.premiumGlow} />

      <div className="relative h-44 shrink-0 overflow-hidden sm:h-48 lg:h-52">
        <OptimizedImage
          src={origin.image}
          alt={interpolate(l.imageAltTemplate, {
            country: origin.country,
            region: origin.region,
            process: origin.process,
          })}
          sizes={IMAGE_SIZE_PRESETS.card}
          loading="lazy"
          className="object-cover brightness-[0.94] contrast-[1.02] saturate-[0.96] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] motion-reduce:transform-none"
        />
        <div className={cards.imageOverlay} />
        <div className={cards.imageAmberWash} />
        <div className={cards.imageRadial} />

        {origin.premium && (
          <div className={`absolute end-4 top-4 ${badges.premiumCompact}`}>{l.premium}</div>
        )}

        <div className="absolute bottom-4 start-4 flex items-center gap-1.5 rounded-full border border-white/[0.15] bg-ba-espresso/55 px-3 py-1 text-[10px] font-medium text-ba-pearl backdrop-blur-xl">
          <MapPin className="h-3 w-3 text-ba-gold/85" aria-hidden />
          {origin.region}
        </div>
      </div>

      <div className="relative flex flex-1 flex-col p-5 lg:p-6">
        <h3 className="font-display text-[1.25rem] leading-[1.15] tracking-[-0.02em] text-ba-espresso transition-colors duration-300 group-hover:text-ba-coffee lg:text-[1.3rem]">
          {origin.country}
        </h3>

        <div className="mt-3 flex items-start gap-2">
          <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ba-bronze/80" aria-hidden />
          <p className="text-[0.8125rem] leading-[1.65] text-ba-coffee/75">{origin.tastingProfile}</p>
        </div>

        <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
          <MetaTile icon={Mountain} label={l.altitude} value={origin.altitude} />
          <MetaTile icon={Layers} label={l.process} value={origin.process} />
          <MetaTile icon={Flame} label={l.roast} value={origin.roastRecommendation} />
          <MetaTile icon={Coffee} label={l.brewMethod} value={origin.brewingMethod} />
        </div>

        <div className="mt-auto border-t border-ba-espresso/[0.06] pt-4">
          <GhostCtaLink href={ctaHref}>{l.exploreOrigin}</GhostCtaLink>
        </div>
      </div>
    </article>
  );
}

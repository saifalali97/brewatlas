import { OptimizedImage } from "@/app/components/ui/optimized-image";
import { IMAGE_SIZE_PRESETS } from "@/lib/media/responsive-image";
import { BookOpen, Calendar, MapPin, Sparkles, Star } from "lucide-react";
import { GhostCtaLink } from "@/app/components/ui/ghost-cta-link";
import { MetaTile } from "@/app/components/ui/meta-tile";
import { badges, cards } from "@/lib/constants/styles";
import type { TopRoaster } from "@/types/homepage";
import { interpolate } from "@/lib/i18n/format";
import { imageAlt } from "@/lib/seo/image-alt";

export type RoasterCardLabels = {
  premium: string;
  country: string;
  founded: string;
  recipes: string;
  rating: string;
  viewRoaster: string;
  imageAltTemplate: string;
};

const defaultRoasterCardLabels: RoasterCardLabels = {
  premium: "Premium",
  country: "Country",
  founded: "Founded",
  recipes: "Recipes",
  rating: "Rating",
  viewRoaster: "View Roaster",
  imageAltTemplate: imageAlt.roasterTemplate,
};

type RoasterCardProps = {
  roaster: TopRoaster;
  ctaHref?: string;
  labels?: Partial<RoasterCardLabels>;
};

export function RoasterCard({ roaster, ctaHref = "#roasters", labels }: RoasterCardProps) {
  const l: RoasterCardLabels = { ...defaultRoasterCardLabels, ...labels };
  return (
    <article className={cards.premiumShell}>
      <div aria-hidden className={cards.premiumSheen} />
      <div aria-hidden className={cards.premiumGlow} />

      <div className="relative h-40 shrink-0 overflow-hidden sm:h-44 lg:h-48">
        <OptimizedImage
          src={roaster.image}
          alt={interpolate(l.imageAltTemplate, {
            name: roaster.name,
            country: roaster.country,
            specialty: roaster.specialty,
          })}
          sizes={IMAGE_SIZE_PRESETS.card}
          loading="lazy"
          className={`${cards.cardPhoto} saturate-[0.96] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] motion-reduce:transform-none`}
        />
        <div className={cards.imageOverlay} />
        <div className={cards.imageAmberWash} />
        <div className={cards.imageRadial} />

        {roaster.premium && (
          <div className={`absolute end-4 top-4 ${badges.premiumCompact}`}>{l.premium}</div>
        )}

        <div className="absolute bottom-4 start-4 flex items-center gap-1 rounded-full border border-ba-gold/30 bg-ba-espresso/60 px-2.5 py-0.5 backdrop-blur-xl">
          <Star className="h-3 w-3 fill-ba-gold/80 text-ba-gold/80" aria-hidden />
          <span className="text-[10px] font-medium text-ba-gold/90">{roaster.rating}</span>
        </div>
      </div>

      <div className="relative flex flex-1 flex-col p-5 lg:p-6">
        <h3 className="font-display text-[1.2rem] leading-[1.15] tracking-[-0.02em] text-ba-espresso transition-colors duration-300 group-hover:text-ba-bronze lg:text-[1.25rem]">
          {roaster.name}
        </h3>

        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-ac-espresso">
          <Sparkles className="h-3 w-3 text-ac-espresso" aria-hidden />
          <span className="text-ac-espresso">{roaster.specialty}</span>
        </div>

        <p className="mt-3 line-clamp-2 text-[0.8125rem] leading-[1.65] text-ac-espresso">{roaster.description}</p>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <MetaTile icon={MapPin} label={l.country} value={roaster.country} compact />
          <MetaTile icon={Calendar} label={l.founded} value={roaster.founded} compact />
          <MetaTile icon={BookOpen} label={l.recipes} value={roaster.recipes} compact />
          <MetaTile icon={Star} label={l.rating} value={roaster.rating} compact />
        </div>

        <div className="mt-auto border-t border-ba-espresso/[0.06] pt-4">
          <GhostCtaLink href={ctaHref}>{l.viewRoaster}</GhostCtaLink>
        </div>
      </div>
    </article>
  );
}

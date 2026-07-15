import { OptimizedImage } from "@/app/components/ui/optimized-image";
import { IMAGE_SIZE_PRESETS } from "@/lib/media/responsive-image";
import { BookOpen, Calendar, MapPin, Sparkles, Star } from "lucide-react";
import { GhostCtaLink } from "@/app/components/ui/ghost-cta-link";
import { MetaTile } from "@/app/components/ui/meta-tile";
import { cards } from "@/lib/constants/styles";
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
  /** Translated `{name} {country} {specialty}` image alt template. */
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
  /** Translated copy for this card's chrome. Defaults to English so existing callers (e.g. `/roasters`) are unaffected. */
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
          className="object-cover brightness-[0.92] contrast-[1.04] saturate-[0.94] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] motion-reduce:transform-none"
        />
        <div className={cards.imageOverlay} />
        <div className={cards.imageAmberWash} />
        <div className={cards.imageRadial} />

        {roaster.premium && (
          <div className="absolute end-4 top-4 rounded-full border border-amber-700/35 bg-amber-950/65 px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-amber-200/90 backdrop-blur-xl">
            {l.premium}
          </div>
        )}

        <div className="absolute bottom-4 start-4 flex items-center gap-1 rounded-full border border-amber-600/30 bg-[#0a0705]/60 px-2.5 py-0.5 backdrop-blur-xl">
          <Star className="h-3 w-3 fill-amber-500/80 text-amber-500/80" aria-hidden />
          <span className="text-[10px] font-medium text-amber-200/90">{roaster.rating}</span>
        </div>
      </div>

      <div className="relative flex flex-1 flex-col p-5 lg:p-6">
        <h3 className="text-[1.2rem] font-semibold leading-[1.15] tracking-tight text-stone-50 transition-colors duration-300 group-hover:text-amber-50 lg:text-[1.25rem]">
          {roaster.name}
        </h3>

        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-stone-500">
          <Sparkles className="h-3 w-3 text-amber-500/75" aria-hidden />
          <span className="text-amber-600/80">{roaster.specialty}</span>
        </div>

        <p className="mt-3 line-clamp-2 text-[0.8125rem] leading-[1.65] text-stone-300/90">
          {roaster.description}
        </p>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <MetaTile icon={MapPin} label={l.country} value={roaster.country} compact />
          <MetaTile icon={Calendar} label={l.founded} value={roaster.founded} compact />
          <MetaTile icon={BookOpen} label={l.recipes} value={roaster.recipes} compact />
          <MetaTile icon={Star} label={l.rating} value={roaster.rating} compact />
        </div>

        <div className="mt-auto border-t border-white/[0.06] pt-4">
          <GhostCtaLink href={ctaHref}>{l.viewRoaster}</GhostCtaLink>
        </div>
      </div>
    </article>
  );
}

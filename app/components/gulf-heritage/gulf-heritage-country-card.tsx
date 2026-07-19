import { OptimizedImage } from "@/app/components/ui/optimized-image";
import { GhostCtaLink } from "@/app/components/ui/ghost-cta-link";
import { cards } from "@/lib/constants/styles";
import { IMAGE_SIZE_PRESETS } from "@/lib/media/responsive-image";
import { MapPin } from "lucide-react";
import type { GulfHeritageCountryCopy, GulfHeritageCountrySlug } from "@/types/gulf-heritage";
import { CULTURE_IMAGE_PLACEHOLDER } from "@/types/culture";

type GulfHeritageCountryCardProps = {
  slug: GulfHeritageCountrySlug;
  copy: GulfHeritageCountryCopy;
  topicCountLabel: string;
  exploreLabel: string;
  heroImageUrl?: string;
};

/** Hub card for a Gulf Heritage country. */
export function GulfHeritageCountryCard({
  slug,
  copy,
  topicCountLabel,
  exploreLabel,
  heroImageUrl,
}: GulfHeritageCountryCardProps) {
  const image = heroImageUrl ?? CULTURE_IMAGE_PLACEHOLDER;

  return (
    <article className={cards.premiumShell}>
      <div aria-hidden className={cards.premiumSheen} />
      <div aria-hidden className={cards.premiumGlow} />

      <div className="relative h-44 shrink-0 overflow-hidden sm:h-48 lg:h-52">
        <OptimizedImage
          src={image}
          alt={`${copy.name} — BrewAtlas Gulf Heritage`}
          sizes={IMAGE_SIZE_PRESETS.card}
          loading="lazy"
          className={`${cards.cardPhoto} saturate-[0.94] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] motion-reduce:transform-none`}
        />
        <div className={cards.imageOverlay} />
        <div className={cards.imageAmberWash} />
        <div className={cards.imageRadial} />

        <div className="absolute bottom-4 start-4 flex items-center gap-1.5 rounded-full border border-white/[0.12] bg-[#0a0705]/55 px-3 py-1 text-[10px] font-medium text-stone-200 backdrop-blur-xl">
          <MapPin className="h-3 w-3 text-amber-500/80" aria-hidden />
          {topicCountLabel}
        </div>
      </div>

      <div className="relative flex flex-1 flex-col p-5 lg:p-6">
        <h3 className="text-[1.25rem] font-semibold leading-[1.15] tracking-tight text-ac-espresso transition-colors duration-300 group-hover:text-ba-bronze lg:text-[1.3rem]">
          {copy.name}
        </h3>
        <p className="mt-3 text-[0.8125rem] leading-[1.65] text-ac-espresso">{copy.description}</p>

        <div className="mt-auto border-t border-ba-espresso/06 pt-4">
          <GhostCtaLink href={`/gulf-heritage/${slug}`}>{exploreLabel}</GhostCtaLink>
        </div>
      </div>
    </article>
  );
}

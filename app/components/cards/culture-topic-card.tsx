import { OptimizedImage } from "@/app/components/ui/optimized-image";
import { IMAGE_SIZE_PRESETS } from "@/lib/media/responsive-image";
import { BookOpen } from "lucide-react";
import { GhostCtaLink } from "@/app/components/ui/ghost-cta-link";
import { cards } from "@/lib/constants/styles";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import type { CultureTopicRow } from "@/types/culture";
import { CULTURE_IMAGE_PLACEHOLDER } from "@/types/culture";

type CultureTopicCardProps = {
  topic: CultureTopicRow;
  sectionSlug: string;
};

/** Section-page card for a single culture article (e.g. "The Dallah"), mirroring `OriginCard`'s layout. */
export async function CultureTopicCard({ topic, sectionSlug }: CultureTopicCardProps) {
  const dictionary = await getDictionary(await getLocale());
  const image = topic.heroImageUrl ?? CULTURE_IMAGE_PLACEHOLDER;

  return (
    <article className={cards.premiumShell}>
      <div aria-hidden className={cards.premiumSheen} />
      <div aria-hidden className={cards.premiumGlow} />

      <div className="relative h-44 shrink-0 overflow-hidden sm:h-48 lg:h-52">
        <OptimizedImage
          src={image}
          alt={`${topic.title} — BrewAtlas culture guide`}
          sizes={IMAGE_SIZE_PRESETS.card}
          loading="lazy"
          className={`${cards.cardPhoto} saturate-[0.94] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] motion-reduce:transform-none`}
        />
        <div className={cards.imageOverlay} />
        <div className={cards.imageAmberWash} />
        <div className={cards.imageRadial} />
      </div>

      <div className="relative flex flex-1 flex-col p-5 lg:p-6">
        <h3 className="text-[1.25rem] font-semibold leading-[1.15] tracking-tight text-ac-espresso transition-colors duration-300 group-hover:text-ba-bronze lg:text-[1.3rem]">
          {topic.title}
        </h3>

        <div className="mt-3 flex items-start gap-2">
          <BookOpen className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500/75" aria-hidden />
          <p className="text-[0.8125rem] leading-[1.65] text-ac-espresso">{topic.excerpt}</p>
        </div>

        <div className="mt-auto border-t border-ba-espresso/06 pt-4">
          <GhostCtaLink href={`/culture/${sectionSlug}/${topic.slug}`}>{dictionary.culturePage.readArticle}</GhostCtaLink>
        </div>
      </div>
    </article>
  );
}

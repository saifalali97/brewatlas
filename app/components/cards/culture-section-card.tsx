import Image from "next/image";
import { BookOpen, Sparkles } from "lucide-react";
import { GhostCtaLink } from "@/app/components/ui/ghost-cta-link";
import { cards } from "@/lib/constants/styles";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import type { CultureSectionWithTopicCount } from "@/types/culture";
import { CULTURE_IMAGE_PLACEHOLDER } from "@/types/culture";

type CultureSectionCardProps = {
  section: CultureSectionWithTopicCount;
};

/** Hub-page card for a culture section (e.g. "UAE Coffee Culture"), mirroring `OriginCard`'s layout. */
export async function CultureSectionCard({ section }: CultureSectionCardProps) {
  const dictionary = await getDictionary(await getLocale());
  const c = dictionary.culturePage;
  const image = section.heroImageUrl ?? CULTURE_IMAGE_PLACEHOLDER;

  return (
    <article className={cards.premiumShell}>
      <div aria-hidden className={cards.premiumSheen} />
      <div aria-hidden className={cards.premiumGlow} />

      <div className="relative h-44 shrink-0 overflow-hidden sm:h-48 lg:h-52">
        <Image
          src={image}
          alt={`${section.name} — BrewAtlas culture guide`}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          unoptimized={image.endsWith(".svg")}
          className="object-cover brightness-[0.9] contrast-[1.04] saturate-[0.94] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] motion-reduce:transform-none"
        />
        <div className={cards.imageOverlay} />
        <div className={cards.imageAmberWash} />
        <div className={cards.imageRadial} />

        {section.eyebrow && (
          <div className="absolute start-4 top-4 rounded-full border border-amber-600/30 bg-[#0a0705]/60 px-2.5 py-0.5 text-[9px] font-medium uppercase tracking-[0.14em] text-amber-200/90 backdrop-blur-xl">
            {section.eyebrow}
          </div>
        )}

        <div className="absolute bottom-4 start-4 flex items-center gap-1.5 rounded-full border border-white/[0.12] bg-[#0a0705]/55 px-3 py-1 text-[10px] font-medium text-stone-200 backdrop-blur-xl">
          <BookOpen className="h-3 w-3 text-amber-500/80" aria-hidden />
          {section.topicCount} {section.topicCount === 1 ? c.articleSingular : c.articlePlural}
        </div>
      </div>

      <div className="relative flex flex-1 flex-col p-5 lg:p-6">
        <h3 className="text-[1.25rem] font-semibold leading-[1.15] tracking-tight text-stone-50 transition-colors duration-300 group-hover:text-amber-50 lg:text-[1.3rem]">
          {section.name}
        </h3>

        <div className="mt-3 flex items-start gap-2">
          <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500/75" aria-hidden />
          <p className="text-[0.8125rem] leading-[1.65] text-stone-300/90">{section.description}</p>
        </div>

        <div className="mt-auto border-t border-white/[0.06] pt-4">
          <GhostCtaLink href={`/culture/${section.slug}`}>{c.exploreSection}</GhostCtaLink>
        </div>
      </div>
    </article>
  );
}

import Image from "next/image";
import { BookOpen } from "lucide-react";
import { GhostCtaLink } from "@/app/components/ui/ghost-cta-link";
import { cards } from "@/lib/constants/styles";
import type { CultureTopicRow } from "@/types/culture";
import { CULTURE_IMAGE_PLACEHOLDER } from "@/types/culture";

type CultureTopicCardProps = {
  topic: CultureTopicRow;
  sectionSlug: string;
};

/** Section-page card for a single culture article (e.g. "The Dallah"), mirroring `OriginCard`'s layout. */
export function CultureTopicCard({ topic, sectionSlug }: CultureTopicCardProps) {
  const image = topic.heroImageUrl ?? CULTURE_IMAGE_PLACEHOLDER;

  return (
    <article className={cards.premiumShell}>
      <div aria-hidden className={cards.premiumSheen} />
      <div aria-hidden className={cards.premiumGlow} />

      <div className="relative h-44 shrink-0 overflow-hidden sm:h-48 lg:h-52">
        <Image
          src={image}
          alt={`${topic.title} — BrewAtlas culture guide`}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          unoptimized={image.endsWith(".svg")}
          className="object-cover brightness-[0.9] contrast-[1.04] saturate-[0.94] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03] motion-reduce:transform-none"
        />
        <div className={cards.imageOverlay} />
        <div className={cards.imageAmberWash} />
        <div className={cards.imageRadial} />
      </div>

      <div className="relative flex flex-1 flex-col p-5 lg:p-6">
        <h3 className="text-[1.25rem] font-semibold leading-[1.15] tracking-tight text-stone-50 transition-colors duration-300 group-hover:text-amber-50 lg:text-[1.3rem]">
          {topic.title}
        </h3>

        <div className="mt-3 flex items-start gap-2">
          <BookOpen className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500/75" aria-hidden />
          <p className="text-[0.8125rem] leading-[1.65] text-stone-300/90">{topic.excerpt}</p>
        </div>

        <div className="mt-auto border-t border-white/[0.06] pt-4">
          <GhostCtaLink href={`/culture/${sectionSlug}/${topic.slug}`}>Read Article</GhostCtaLink>
        </div>
      </div>
    </article>
  );
}

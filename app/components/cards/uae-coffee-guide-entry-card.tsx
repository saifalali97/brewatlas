import {
  BookOpen,
  Coffee,
  CupSoda,
  Flame,
  Flower2,
  Leaf,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { GhostCtaLink } from "@/app/components/ui/ghost-cta-link";
import { cards } from "@/lib/constants/styles";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import type { UaeCoffeeGuideEntry } from "@/types/uae-brand";

const GUIDE_ICONS: Record<string, LucideIcon> = {
  Coffee,
  CupSoda,
  Flower2,
  Leaf,
  Sparkles,
  Flame,
};

type UaeCoffeeGuideEntryCardProps = {
  entry: UaeCoffeeGuideEntry;
};

/** Card for one entry in the "Emirati Coffee Guide" hub -- links through to the full `culture_topics` article that covers it. Renders a "coming soon" state if the article isn't published in the current locale. */
export async function UaeCoffeeGuideEntryCard({ entry }: UaeCoffeeGuideEntryCardProps) {
  const dictionary = await getDictionary(await getLocale());
  const c = dictionary.culturePage;
  const Icon = GUIDE_ICONS[entry.iconKey] ?? BookOpen;

  return (
    <article className={cards.premiumShell}>
      <div aria-hidden className={cards.premiumSheen} />
      <div aria-hidden className={cards.premiumGlow} />

      <div className="relative flex flex-1 flex-col p-5 lg:p-6">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-uae-warm-gold/30 bg-uae-warm-gold/10">
          <Icon className="h-4 w-4 text-uae-warm-gold" aria-hidden />
        </span>

        <h3 className="mt-4 text-[1.1rem] font-semibold leading-[1.2] tracking-tight text-stone-50">
          {c[entry.titleKey]}
        </h3>

        {entry.topic ? (
          <p className="mt-2.5 line-clamp-3 flex-1 text-[0.8125rem] leading-[1.65] text-stone-300/90">
            {entry.topic.excerpt}
          </p>
        ) : (
          <p className="mt-2.5 flex-1 text-[0.8125rem] leading-[1.65] text-stone-500">{c.comingSoon}</p>
        )}

        <div className="mt-auto border-t border-white/[0.06] pt-4">
          {entry.topic ? (
            <GhostCtaLink href={`/culture/${entry.sectionSlug}/${entry.topicSlug}`}>{c.readTheGuide}</GhostCtaLink>
          ) : (
            <span className="text-[0.75rem] text-stone-500">{c.notYetAvailable}</span>
          )}
        </div>
      </div>
    </article>
  );
}

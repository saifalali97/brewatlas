import {
  BookOpen,
  Coffee,
  CupSoda,
  HandHeart,
  HeartHandshake,
  Landmark,
  ScrollText,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import { GhostCtaLink } from "@/app/components/ui/ghost-cta-link";
import type { UaeHeritageHighlight } from "@/types/uae-brand";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  history: ScrollText,
  majlis: Users,
  hospitality: HeartHandshake,
  etiquette: HandHeart,
  dallah: Coffee,
  finjan: CupSoda,
  serving: Sparkles,
  unesco: Landmark,
};

type UaeHeritageHighlightCardProps = {
  highlight: UaeHeritageHighlight;
};

/** A short "fact card" for the UAE Coffee Heritage brand section, optionally deep-linking into the full culture article that covers it. Mirrors the `cards.premiumShell` convention used by `CultureSectionCard`/`RoasterCard`. */
export function UaeHeritageHighlightCard({ highlight }: UaeHeritageHighlightCardProps) {
  const Icon = CATEGORY_ICONS[highlight.category] ?? BookOpen;
  const readMoreHref =
    highlight.relatedSectionSlug && highlight.relatedTopicSlug
      ? `/culture/${highlight.relatedSectionSlug}/${highlight.relatedTopicSlug}`
      : null;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-uae-warm-gold/[0.18] bg-gradient-to-br from-uae-dark-coffee/40 via-white/[0.03] to-transparent p-6 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.48)] backdrop-blur-2xl transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:border-uae-warm-gold/40 motion-reduce:transition-none motion-reduce:hover:translate-y-0">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-uae-warm-gold/10 opacity-60 blur-3xl transition-opacity duration-300 group-hover:opacity-100"
      />

      <div className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-uae-warm-gold/30 bg-uae-warm-gold/10">
          <Icon className="h-4 w-4 text-uae-warm-gold" aria-hidden />
        </span>
        <p className="text-[0.6875rem] font-medium uppercase tracking-[0.18em] text-uae-sand">
          {highlight.category}
        </p>
      </div>

      <h3 className="mt-4 text-[1.05rem] font-semibold leading-[1.25] tracking-tight text-stone-50">
        {highlight.title}
      </h3>
      <p className="mt-2.5 flex-1 text-[0.8125rem] leading-[1.65] text-stone-300/90">{highlight.summary}</p>

      {readMoreHref && (
        <div className="mt-4 border-t border-white/[0.06] pt-4">
          <GhostCtaLink href={readMoreHref}>Read the full story</GhostCtaLink>
        </div>
      )}
    </article>
  );
}

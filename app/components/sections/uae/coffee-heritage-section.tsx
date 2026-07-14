import { UaeHeritageHighlightCard } from "@/app/components/cards/uae-heritage-highlight-card";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { SectionIntro } from "@/app/components/ui/section-intro";
import type { UaeHeritageHighlight } from "@/types/uae-brand";

type CoffeeHeritageSectionProps = {
  highlights: UaeHeritageHighlight[];
};

/**
 * Reusable "Coffee Heritage" homepage section (requirement 6). Not
 * wired into `app/(site)/page.tsx` -- prepared for future homepage
 * integration without changing the current homepage layout. Data comes
 * from `getUaeHeritageHighlights()` in `lib/data/uae-brand.ts`.
 */
export function CoffeeHeritageSection({ highlights }: CoffeeHeritageSectionProps) {
  if (highlights.length === 0) return null;

  return (
    <SectionFrame
      id="uae-coffee-heritage"
      ariaLabelledBy="uae-coffee-heritage-heading"
      className="border-t border-white/[0.04] bg-white/[0.008]"
    >
      <SectionIntro
        headingId="uae-coffee-heritage-heading"
        eyebrow="Emirati Coffee Heritage"
        title="Coffee Heritage"
        description="From the majlis to the brass dallah, a quick look at the traditions behind every cup of Emirati qahwa."
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {highlights.map((highlight) => (
          <UaeHeritageHighlightCard key={highlight.id} highlight={highlight} />
        ))}
      </div>
    </SectionFrame>
  );
}

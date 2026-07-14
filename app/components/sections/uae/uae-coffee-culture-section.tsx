import { CultureSectionCard } from "@/app/components/cards/culture-section-card";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { SectionIntro } from "@/app/components/ui/section-intro";
import type { CultureSectionWithTopicCount } from "@/types/culture";

type UaeCoffeeCultureSectionProps = {
  sections: CultureSectionWithTopicCount[];
};

/**
 * Reusable "UAE Coffee Culture" homepage section (requirement 6). Not
 * wired into `app/(site)/page.tsx` -- prepared for future homepage
 * integration. Reuses the existing `culture_sections` content and
 * `CultureSectionCard` rather than duplicating any copy; pass
 * `getCultureSections()` filtered to the UAE-relevant slugs
 * (`uae-coffee-culture`, `arabic-coffee`, `tea`).
 */
export function UaeCoffeeCultureSection({ sections }: UaeCoffeeCultureSectionProps) {
  if (sections.length === 0) return null;

  return (
    <SectionFrame
      id="uae-coffee-culture"
      ariaLabelledBy="uae-coffee-culture-heading"
      className="border-t border-white/[0.04] bg-white/[0.008]"
    >
      <SectionIntro
        headingId="uae-coffee-culture-heading"
        eyebrow="Deep Dive"
        title="UAE Coffee Culture"
        description="Editorial guides to Emirati coffee heritage, Arabic coffee tradition, and Gulf tea culture."
      />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section) => (
          <CultureSectionCard key={section.id} section={section} />
        ))}
      </div>
    </SectionFrame>
  );
}

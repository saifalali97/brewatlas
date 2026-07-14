import { UaeRoasterCard } from "@/app/components/cards/uae-roaster-card";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { SectionIntro } from "@/app/components/ui/section-intro";
import type { UaeRoaster } from "@/types/uae-brand";

type FeaturedUaeRoastersSectionProps = {
  roasters: UaeRoaster[];
};

/**
 * Reusable "Featured Roasters" homepage section for UAE-flagged
 * roasters (requirement 6). Not wired into `app/(site)/page.tsx` --
 * prepared for future homepage integration. Data comes from
 * `getUaeRoasters()` in `lib/data/uae-brand.ts`; roaster marks are
 * always generic initials badges, never real logos.
 */
export function FeaturedUaeRoastersSection({ roasters }: FeaturedUaeRoastersSectionProps) {
  if (roasters.length === 0) return null;

  return (
    <SectionFrame id="uae-featured-roasters" ariaLabelledBy="uae-featured-roasters-heading">
      <SectionIntro
        headingId="uae-featured-roasters-heading"
        eyebrow="Roasted in the Emirates"
        title="UAE Featured Roasters"
        description="Specialty roasters across the seven emirates, pairing modern roast craft with Emirati coffee tradition."
      />

      <div className="grid gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3 lg:gap-8">
        {roasters.map((roaster) => (
          <UaeRoasterCard key={roaster.id} roaster={roaster} />
        ))}
      </div>
    </SectionFrame>
  );
}

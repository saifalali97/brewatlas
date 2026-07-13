import { RoasterCard } from "@/app/components/cards/roaster-card";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { SectionIntro } from "@/app/components/ui/section-intro";
import type { TopRoaster } from "@/types/homepage";

type TopRoastersSectionProps = {
  roasters: TopRoaster[];
};

export function TopRoastersSection({ roasters }: TopRoastersSectionProps) {
  return (
    <SectionFrame id="roasters" ariaLabelledBy="roasters-heading" className="border-t border-white/[0.04] bg-white/[0.008]">
      <SectionIntro
        headingId="roasters-heading"
        eyebrow="Roaster Partners"
        title="Top Roasters"
        description="Discover recipes tailored to beans from the world's most respected specialty roasters."
      />

      <div className="grid gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3 lg:gap-8">
        {roasters.map((roaster) => (
          <RoasterCard key={roaster.name} roaster={roaster} />
        ))}
      </div>
    </SectionFrame>
  );
}

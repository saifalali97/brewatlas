import { RoasterCard, type RoasterCardLabels } from "@/app/components/cards/roaster-card";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { SectionIntro } from "@/app/components/ui/section-intro";
import type { TopRoaster } from "@/types/homepage";

type TopRoastersSectionProps = {
  roasters: TopRoaster[];
  eyebrow: string;
  title: string;
  description: string;
  cardLabels: RoasterCardLabels;
};

export function TopRoastersSection({
  roasters,
  eyebrow,
  title,
  description,
  cardLabels,
}: TopRoastersSectionProps) {
  return (
    <SectionFrame id="roasters" ariaLabelledBy="roasters-heading" className="border-t border-white/[0.04] bg-white/[0.008]">
      <SectionIntro
        headingId="roasters-heading"
        eyebrow={eyebrow}
        title={title}
        description={description}
      />

      <div className="grid gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3 lg:gap-8">
        {roasters.map((roaster) => (
          <RoasterCard key={roaster.name} roaster={roaster} labels={cardLabels} />
        ))}
      </div>
    </SectionFrame>
  );
}

import { OriginCard, type OriginCardLabels } from "@/app/components/cards/origin-card";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { SectionIntro } from "@/app/components/ui/section-intro";
import type { CoffeeOrigin } from "@/types/homepage";

type CoffeeOriginsSectionProps = {
  origins: CoffeeOrigin[];
  eyebrow: string;
  title: string;
  description: string;
  cardLabels: OriginCardLabels;
};

export function CoffeeOriginsSection({
  origins,
  eyebrow,
  title,
  description,
  cardLabels,
}: CoffeeOriginsSectionProps) {
  return (
    <SectionFrame id="origins" ariaLabelledBy="origins-heading" theme="light" padding="compact">
      <SectionIntro
        headingId="origins-heading"
        eyebrow={eyebrow}
        title={title}
        description={description}
      />

      <div className="grid gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3 lg:gap-8">
        {origins.map((origin) => (
          <OriginCard key={origin.country} origin={origin} labels={cardLabels} />
        ))}
      </div>
    </SectionFrame>
  );
}

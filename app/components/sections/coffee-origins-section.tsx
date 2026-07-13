import { OriginCard } from "@/app/components/cards/origin-card";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { SectionIntro } from "@/app/components/ui/section-intro";
import type { CoffeeOrigin } from "@/types/homepage";

type CoffeeOriginsSectionProps = {
  origins: CoffeeOrigin[];
};

export function CoffeeOriginsSection({ origins }: CoffeeOriginsSectionProps) {
  return (
    <SectionFrame id="origins" ariaLabelledBy="origins-heading">
      <SectionIntro
        headingId="origins-heading"
        eyebrow="From Farm to Cup"
        title="Coffee Origins"
        description="Trace every recipe to its source. Explore flavor profiles, altitude data, and processing methods from the world's greatest growing regions."
      />

      <div className="grid gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3 lg:gap-8">
        {origins.map((origin) => (
          <OriginCard key={origin.country} origin={origin} />
        ))}
      </div>
    </SectionFrame>
  );
}

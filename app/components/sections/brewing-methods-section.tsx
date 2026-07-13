import { MethodCard } from "@/app/components/cards/method-card";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { SectionIntro } from "@/app/components/ui/section-intro";
import type { BrewingMethod } from "@/types/homepage";

type BrewingMethodsSectionProps = {
  methods: BrewingMethod[];
};

export function BrewingMethodsSection({ methods }: BrewingMethodsSectionProps) {
  return (
    <SectionFrame
      id="methods"
      ariaLabelledBy="methods-heading"
      className="border-y border-white/[0.04] bg-white/[0.015]"
    >
      <SectionIntro
        headingId="methods-heading"
        eyebrow="Master Every Technique"
        title="Brewing Methods"
        description="From first pour to competition dial-in. Explore techniques with brew times, cup profiles, and roast pairings for every method."
      />

      <div className="grid gap-6 sm:gap-7 lg:grid-cols-2 lg:gap-8">
        {methods.map((method) => (
          <MethodCard key={method.name} method={method} />
        ))}
      </div>
    </SectionFrame>
  );
}

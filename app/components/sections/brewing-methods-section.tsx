import { MethodCard, type MethodCardLabels } from "@/app/components/cards/method-card";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { SectionIntro } from "@/app/components/ui/section-intro";
import type { BrewingMethod } from "@/types/homepage";

type BrewingMethodsSectionProps = {
  methods: BrewingMethod[];
  eyebrow: string;
  title: string;
  description: string;
  cardLabels: Omit<MethodCardLabels, "difficultyLabel"> & { difficultyLabels: Record<BrewingMethod["difficulty"], string> };
};

export function BrewingMethodsSection({
  methods,
  eyebrow,
  title,
  description,
  cardLabels,
}: BrewingMethodsSectionProps) {
  return (
    <SectionFrame id="methods" ariaLabelledBy="methods-heading" theme="pearl" padding="compact">
      <SectionIntro
        headingId="methods-heading"
        eyebrow={eyebrow}
        title={title}
        description={description}
      />

      <div className="grid gap-6 sm:gap-7 lg:grid-cols-2 lg:gap-8">
        {methods.map((method) => (
          <MethodCard
            key={method.name}
            method={method}
            labels={{ ...cardLabels, difficultyLabel: cardLabels.difficultyLabels[method.difficulty] }}
          />
        ))}
      </div>
    </SectionFrame>
  );
}

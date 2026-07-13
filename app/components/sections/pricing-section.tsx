import { PricingCard } from "@/app/components/cards/pricing-card";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { typography } from "@/lib/constants/styles";
import type { PricingPlan } from "@/types/homepage";

type PricingSectionProps = {
  plans: PricingPlan[];
};

export function PricingSection({ plans }: PricingSectionProps) {
  return (
    <SectionFrame
      id="pricing"
      ariaLabelledBy="pricing-heading"
      className="border-y border-white/[0.04]"
      beforeContent={
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[radial-gradient(ellipse_at_50%_100%,rgba(217,119,6,0.06),transparent_70%)]"
        />
      }
    >
      <div className="mb-14 max-w-2xl text-center md:mb-16 lg:mx-auto lg:mb-20">
        <p className={typography.eyebrow}>Membership</p>
        <h2 id="pricing-heading" className={typography.sectionTitleModern}>
          Premium Plans
        </h2>
        <p className={typography.sectionLeadCentered}>
          Unlock the full BrewAtlas experience. Choose the plan that fits your craft and upgrade anytime as your coffee journey evolves.
        </p>
      </div>

      <div className="grid items-stretch gap-6 sm:gap-7 lg:grid-cols-3 lg:gap-8">
        {plans.map((plan) => (
          <PricingCard key={plan.name} plan={plan} />
        ))}
      </div>
    </SectionFrame>
  );
}

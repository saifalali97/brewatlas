import type { Metadata } from "next";
import { PricingCard } from "@/app/components/cards/pricing-card";
import { FaqAccordion } from "@/app/components/ui/faq-accordion";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { typography } from "@/lib/constants/styles";
import { faqs, pricingPlans } from "@/data/homepage";

export const metadata: Metadata = {
  title: "Premium Membership",
  description:
    "Unlock the full BrewAtlas experience. Compare Free, Premium, and Team plans and choose the tier that fits your specialty coffee journey.",
  alternates: {
    canonical: "/premium",
  },
};

const ctaHrefByPlan: Record<string, string> = {
  Free: "/login",
  Premium: "/login",
  Team: "/contact",
};

export default function PremiumPage() {
  return (
    <>
      <SectionFrame id="premium-plans" ariaLabelledBy="premium-plans-heading" padding="compact">
        <PageHeader
          eyebrow="Membership"
          title="Premium Plans"
          description="Unlock the full BrewAtlas experience. Choose the plan that fits your craft and upgrade anytime as your coffee journey evolves."
        />

        <div className="grid items-stretch gap-6 sm:gap-7 lg:grid-cols-3 lg:gap-8">
          {pricingPlans.map((plan) => (
            <PricingCard key={plan.name} plan={plan} ctaHref={ctaHrefByPlan[plan.name] ?? "/login"} />
          ))}
        </div>
      </SectionFrame>

      <SectionFrame id="premium-faq" ariaLabelledBy="premium-faq-heading" padding="compact" className="border-t border-white/[0.04]">
        <div className="mx-auto max-w-2xl text-center">
          <p className={typography.eyebrow}>Support</p>
          <h2 id="premium-faq-heading" className={typography.sectionTitleModern}>
            Membership Questions
          </h2>
        </div>
        <div className="mx-auto mt-12 max-w-3xl">
          <FaqAccordion faqs={faqs} headingId="premium-faq-heading" />
        </div>
      </SectionFrame>
    </>
  );
}

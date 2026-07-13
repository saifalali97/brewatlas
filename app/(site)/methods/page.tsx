import type { Metadata } from "next";
import { MethodCard } from "@/app/components/cards/method-card";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { brewMethods } from "@/data/homepage";

export const metadata: Metadata = {
  title: "Brewing Methods",
  description:
    "Explore every specialty coffee brewing method BrewAtlas covers, from pour over to siphon, with brew times, cup profiles, and roast pairings.",
  alternates: {
    canonical: "/methods",
  },
};

export default function MethodsPage() {
  return (
    <SectionFrame id="methods-listing" ariaLabelledBy="methods-listing-heading" padding="compact">
      <PageHeader
        eyebrow="Master Every Technique"
        title="Brewing Methods"
        description="From first pour to competition dial-in. Explore techniques with brew times, cup profiles, and roast pairings for every method."
      />

      <div className="grid gap-6 sm:gap-7 lg:grid-cols-2 lg:gap-8">
        {brewMethods.map((method) => (
          <MethodCard key={method.name} method={method} ctaHref="/devices" />
        ))}
      </div>
    </SectionFrame>
  );
}

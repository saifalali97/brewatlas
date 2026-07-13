import type { Metadata } from "next";
import { RoasterCard } from "@/app/components/cards/roaster-card";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { topRoasters } from "@/data/homepage";

export const metadata: Metadata = {
  title: "Top Roasters",
  description:
    "Discover BrewAtlas recipes tailored to beans from the world's most respected specialty coffee roasters, from Onyx Coffee Lab to Tim Wendelboe.",
  alternates: {
    canonical: "/roasters",
  },
};

export default function RoastersPage() {
  return (
    <SectionFrame id="roasters-listing" ariaLabelledBy="roasters-listing-heading" padding="compact">
      <PageHeader
        eyebrow="Roaster Partners"
        title="Top Roasters"
        description="Discover recipes tailored to beans from the world's most respected specialty roasters."
      />

      <div className="grid gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3 lg:gap-8">
        {topRoasters.map((roaster) => (
          <RoasterCard key={roaster.name} roaster={roaster} ctaHref="/recipes" />
        ))}
      </div>
    </SectionFrame>
  );
}

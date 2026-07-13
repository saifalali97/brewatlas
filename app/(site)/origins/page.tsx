import type { Metadata } from "next";
import { OriginCard } from "@/app/components/cards/origin-card";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { coffeeOrigins } from "@/data/homepage";

export const metadata: Metadata = {
  title: "Coffee Origins",
  description:
    "Trace every BrewAtlas recipe to its source. Explore flavor profiles, altitude data, and processing methods from the world's greatest coffee growing regions.",
  alternates: {
    canonical: "/origins",
  },
};

export default function OriginsPage() {
  return (
    <SectionFrame id="origins-listing" ariaLabelledBy="origins-listing-heading" padding="compact">
      <PageHeader
        eyebrow="From Farm to Cup"
        title="Coffee Origins"
        description="Trace every recipe to its source. Explore flavor profiles, altitude data, and processing methods from the world's greatest growing regions."
      />

      <div className="grid gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3 lg:gap-8">
        {coffeeOrigins.map((origin) => (
          <OriginCard key={origin.country} origin={origin} ctaHref="/recipes" />
        ))}
      </div>
    </SectionFrame>
  );
}

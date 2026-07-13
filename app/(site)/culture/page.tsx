import type { Metadata } from "next";
import { CultureSectionCard } from "@/app/components/cards/culture-section-card";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { getCultureSections } from "@/lib/data/culture";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Coffee & Tea Culture",
  description:
    "Explore UAE coffee culture, traditional Arabic coffee, and tea traditions — the history, hospitality, and rituals behind every cup in the Emirates.",
  alternates: {
    canonical: "/culture",
  },
};

export default async function CulturePage() {
  const supabase = await createClient();
  const sections = await getCultureSections(supabase);

  return (
    <SectionFrame id="culture-hub" ariaLabelledBy="culture-hub-heading" padding="compact">
      <PageHeader
        eyebrow="Beyond the Recipe"
        title="Coffee & Tea Culture"
        description="From the Emirati majlis to the karak stall on the corner, coffee and tea in the UAE carry centuries of hospitality, ritual, and heritage. Explore the traditions behind every cup."
      />

      <div className="grid gap-6 sm:gap-7 lg:grid-cols-3 lg:gap-8">
        {sections.map((section) => (
          <CultureSectionCard key={section.id} section={section} />
        ))}
      </div>
    </SectionFrame>
  );
}

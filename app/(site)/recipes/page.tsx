import type { Metadata } from "next";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { PageHeader } from "@/app/components/ui/page-header";
import { featuredRecipes } from "@/data/homepage";
import { RecipesExplorer } from "./recipes-explorer";

export const metadata: Metadata = {
  title: "Recipes",
  description:
    "Browse the complete BrewAtlas recipe library. Filter by brew method and explore grind size, ratio, and step-by-step guidance for every specialty coffee recipe.",
  alternates: {
    canonical: "/recipes",
  },
};

export default function RecipesPage() {
  return (
    <SectionFrame id="recipes-listing" ariaLabelledBy="recipes-listing-heading" padding="compact">
      <PageHeader
        eyebrow="Curated Collection"
        title="All Recipes"
        description="Every recipe in the BrewAtlas library, handpicked by our barista community with grind size, water temperature, and step-by-step guidance."
      />
      <RecipesExplorer recipes={featuredRecipes} />
    </SectionFrame>
  );
}

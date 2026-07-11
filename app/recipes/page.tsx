import type { Metadata } from "next";
import { SiteNav } from "@/app/components/layout/site-nav";
import { SiteFooter } from "@/app/components/layout/site-footer";
import {
  RecipesFilters,
  RecipesGrid,
  RecipesHeader,
  RecipesSearch,
} from "@/components/recipes";
import { recipes } from "@/data/recipes";
import { sectionPadding } from "@/lib/constants/styles";
import { siteConfig } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Recipes",
  description: `Browse curated specialty coffee recipes on ${siteConfig.name}. Explore brew methods, origins, roasters, and difficulty levels.`,
  alternates: {
    canonical: "/recipes",
  },
  openGraph: {
    title: `Recipes | ${siteConfig.name}`,
    description: `Browse curated specialty coffee recipes on ${siteConfig.name}.`,
  },
};

export default function RecipesPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0705] font-sans text-stone-100">
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(180,120,60,0.28),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_80%_20%,rgba(120,70,40,0.16),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_10%_80%,rgba(90,50,30,0.2),transparent)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a0f0a]/35 via-transparent to-[#0a0705]" />
      </div>

      <SiteNav />

      <main id="main-content" className={sectionPadding.standard}>
        <RecipesHeader />
        <RecipesSearch />
        <RecipesFilters />
        <RecipesGrid recipes={recipes} />
      </main>

      <SiteFooter />
    </div>
  );
}

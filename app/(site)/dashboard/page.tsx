import type { Metadata } from "next";
import { BookOpen, Coffee, Heart } from "lucide-react";
import { RecipeCard } from "@/app/components/cards/recipe-card";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { featuredRecipes } from "@/data/homepage";
import { getRecipeSlug } from "@/lib/data/recipes";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your BrewAtlas dashboard — saved recipes, brew tracking, and personalized recommendations.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "/dashboard",
  },
};

const stats = [
  { icon: Heart, label: "Saved Recipes", value: "12" },
  { icon: Coffee, label: "Brews Logged", value: "34" },
  { icon: BookOpen, label: "Favorite Origin", value: "Ethiopia" },
];

export default function DashboardPage() {
  const recentRecipes = featuredRecipes.slice(0, 3);

  return (
    <SectionFrame id="dashboard-page" ariaLabelledBy="dashboard-page-heading" padding="compact">
      <PageHeader
        eyebrow="Your Account"
        title="Welcome Back"
        description="Here's a snapshot of your BrewAtlas activity."
        centered={false}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="flex items-center gap-4 rounded-2xl border border-white/[0.09] bg-white/[0.035] px-5 py-4 shadow-[0_16px_40px_-20px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-700/20 bg-amber-950/25 text-amber-500/80">
              <Icon className="h-[18px] w-[18px]" aria-hidden />
            </div>
            <div>
              <p className="text-2xl font-semibold tracking-tight text-stone-50">{value}</p>
              <p className="mt-1 text-sm text-stone-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16">
        <h2 className="text-xl font-semibold tracking-tight text-stone-50">
          Continue Brewing
        </h2>
        <div className="mt-6 grid gap-7 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 lg:gap-9">
          {recentRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.name}
              recipe={recipe}
              featured={false}
              href={`/recipes/${getRecipeSlug(recipe)}`}
            />
          ))}
        </div>
      </div>
    </SectionFrame>
  );
}

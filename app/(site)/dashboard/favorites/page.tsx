import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RecipeCard } from "@/app/components/cards/recipe-card";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { getUserFavoriteRecipes } from "@/lib/data/db-recipes";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Saved Recipes",
  description: "The recipes you've favorited on BrewAtlas, all in one place.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "/dashboard/favorites",
  },
};

export default async function DashboardFavoritesPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login?redirectTo=/dashboard/favorites");
  }

  const favoriteRecipes = await getUserFavoriteRecipes(supabase, data.user.id);

  return (
    <SectionFrame id="dashboard-favorites-page" ariaLabelledBy="dashboard-favorites-page-heading" padding="compact">
      <PageHeader
        eyebrow="Saved"
        title="Saved Recipes"
        description="Every recipe you've favorited across BrewAtlas, ready whenever you're ready to brew."
        centered={false}
      />

      {favoriteRecipes.length === 0 ? (
        <div className="rounded-[1.5rem] border border-white/[0.09] bg-white/[0.03] px-8 py-16 text-center">
          <p className="text-lg font-medium text-stone-100">No saved recipes yet</p>
          <p className="mt-2 text-sm text-stone-500">
            Browse the recipe library and tap the heart on any recipe to save it here.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-7 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 lg:gap-9">
          {favoriteRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} featured={false} href={`/recipes/${recipe.slug}`} />
          ))}
        </div>
      )}
    </SectionFrame>
  );
}

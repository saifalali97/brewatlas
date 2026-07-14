import type { Metadata } from "next";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { PageHeader } from "@/app/components/ui/page-header";
import { featuredRecipes } from "@/data/homepage";
import { getPublishedDbRecipes, getUserFavoriteRecipeIds } from "@/lib/data/db-recipes";
import { getRecipeSlug } from "@/lib/data/recipes";
import { createClient } from "@/lib/supabase/server";
import type { RecipeListItem } from "@/types/recipe";
import { RecipesExplorer } from "./recipes-explorer";

export const metadata: Metadata = {
  title: "Recipes",
  description:
    "Browse the complete BrewAtlas recipe library. Filter by brew method and explore grind size, ratio, and step-by-step guidance for every specialty coffee recipe.",
  alternates: {
    canonical: "/recipes",
  },
};

type RecipesPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function RecipesPage({ searchParams }: RecipesPageProps) {
  const { q } = await searchParams;
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  const staticRecipes: RecipeListItem[] = featuredRecipes.map((recipe) => ({
    ...recipe,
    slug: getRecipeSlug(recipe),
    source: "static",
  }));

  const [dbRecipes, favoritedRecipeIds] = await Promise.all([
    getPublishedDbRecipes(supabase),
    authData.user ? getUserFavoriteRecipeIds(supabase, authData.user.id) : Promise.resolve(new Set<string>()),
  ]);

  const allRecipes = [...staticRecipes, ...dbRecipes];

  return (
    <SectionFrame id="recipes-listing" ariaLabelledBy="recipes-listing-heading" padding="compact">
      <PageHeader
        eyebrow="Curated Collection"
        title="All Recipes"
        description="Every recipe in the BrewAtlas library, handpicked by our barista community with grind size, water temperature, and step-by-step guidance."
      />
      <RecipesExplorer
        recipes={allRecipes}
        favoritedRecipeIds={Array.from(favoritedRecipeIds)}
        isAuthenticated={Boolean(authData.user)}
        currentPath="/recipes"
        initialQuery={q ?? ""}
      />
    </SectionFrame>
  );
}

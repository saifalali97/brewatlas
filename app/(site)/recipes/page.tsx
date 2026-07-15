import type { Metadata } from "next";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { PageHeader } from "@/app/components/ui/page-header";
import { featuredRecipes as staticRecipesEn } from "@/data/homepage";
import { getCachedPublishedDbRecipes } from "@/lib/data/cached-public-data";
import { getUserFavoriteRecipeIds } from "@/lib/data/db-recipes";
import { getRecipeSlug } from "@/lib/data/recipes";
import { getMembershipSummary } from "@/lib/data/membership";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getHomeContent } from "@/lib/i18n/get-home-content";
import { getLocale } from "@/lib/i18n/locale";
import { getHiddenRecipeCount, isPremium } from "@/lib/membership/premium";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";
import { createClient } from "@/lib/supabase/server";
import type { RecipeListItem } from "@/types/recipe";
import { RecipesExplorer } from "./recipes-explorer";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    pathname: "/recipes",
    locale,
    title: dictionary.metadata.recipesTitle,
    description: dictionary.metadata.recipesDescription,
  });
}

type RecipesPageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function RecipesPage({ searchParams }: RecipesPageProps) {
  const { q } = await searchParams;
  const locale = await getLocale();
  const [dictionary, content] = await Promise.all([getDictionary(locale), getHomeContent(locale)]);
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  // Display uses the locale's translated copy, but the slug is always
  // derived from the English name at the same array index (see
  // `getStaticRecipeIndexBySlug`) so URLs never change across locales.
  const staticRecipes: RecipeListItem[] = content.featuredRecipes.map((recipe, index) => ({
    ...recipe,
    slug: getRecipeSlug(staticRecipesEn[index]),
    source: "static",
  }));

  const [dbRecipes, favoritedRecipeIds, membership] = await Promise.all([
    getCachedPublishedDbRecipes(locale),
    authData.user ? getUserFavoriteRecipeIds(supabase, authData.user.id) : Promise.resolve(new Set<string>()),
    authData.user ? getMembershipSummary(supabase, authData.user.id) : Promise.resolve(null),
  ]);

  const allRecipes = [...staticRecipes, ...dbRecipes];
  const isAuthenticated = Boolean(authData.user);
  const hiddenRecipeCount = getHiddenRecipeCount(allRecipes.length, membership, isAuthenticated);

  return (
    <SectionFrame id="recipes-listing" ariaLabelledBy="recipes-listing-heading" padding="compact">
      <PageHeader
        eyebrow={dictionary.recipesPage.eyebrow}
        title={dictionary.recipesPage.title}
        description={dictionary.recipesPage.description}
      />
      <RecipesExplorer
        recipes={allRecipes}
        favoritedRecipeIds={Array.from(favoritedRecipeIds)}
        isAuthenticated={isAuthenticated}
        isPremium={isPremium(membership)}
        hiddenRecipeCount={hiddenRecipeCount}
        currentPath="/recipes"
        initialQuery={q ?? ""}
      />
    </SectionFrame>
  );
}

import type { Metadata } from "next";
import { Chapter } from "@/app/components/atlas/chapter";
import { getCachedPublishedDbRecipes } from "@/lib/data/cached-public-data";
import { getUserFavoriteRecipeIds } from "@/lib/data/db-recipes";
import { getMembershipSummary } from "@/lib/data/membership";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { getHiddenRecipeCount, isPremium } from "@/lib/membership/premium";
import { buildLocalizedMetadata, localizedPathUrl } from "@/lib/seo/localized-metadata";
import { buildCollectionPageJsonLd } from "@/lib/seo/json-ld";
import { createClient } from "@/lib/supabase/server";
import { RecipesExplorer } from "../recipes-explorer";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    pathname: "/recipes/browse",
    locale,
    title: dictionary.metadata.recipesTitle,
    description: dictionary.metadata.recipesDescription,
  });
}

type RecipesBrowsePageProps = {
  searchParams: Promise<{ q?: string }>;
};

export default async function RecipesBrowsePage({ searchParams }: RecipesBrowsePageProps) {
  const { q } = await searchParams;
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  const [dbRecipes, favoritedRecipeIds, membership] = await Promise.all([
    getCachedPublishedDbRecipes(locale),
    authData.user ? getUserFavoriteRecipeIds(supabase, authData.user.id) : Promise.resolve(new Set<string>()),
    authData.user ? getMembershipSummary(supabase, authData.user.id) : Promise.resolve(null),
  ]);

  const isAuthenticated = Boolean(authData.user);
  const hiddenRecipeCount = getHiddenRecipeCount(dbRecipes.length, membership, isAuthenticated);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            buildCollectionPageJsonLd({
              url: localizedPathUrl("/recipes/browse", locale),
              name: dictionary.recipesPage.title,
              description: dictionary.recipesPage.description,
              itemCount: dbRecipes.length,
            }),
          ),
        }}
      />
      <Chapter
        id="recipes-archive"
        rhythm="dawn"
        padding="compact"
        wide
        ariaLabelledBy="recipes-archive-heading"
      >
        <RecipesExplorer
          recipes={dbRecipes}
          favoritedRecipeIds={Array.from(favoritedRecipeIds)}
          isAuthenticated={isAuthenticated}
          isPremium={isPremium(membership)}
          hiddenRecipeCount={hiddenRecipeCount}
          currentPath="/recipes/browse"
          initialQuery={q ?? ""}
        />
      </Chapter>
    </>
  );
}

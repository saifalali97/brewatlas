import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RecipeCard } from "@/app/components/cards/recipe-card";
import { FavoriteButton } from "@/app/components/recipes/favorite-button";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { getUserFavoriteRecipes } from "@/lib/data/db-recipes";
import { translate } from "@/lib/i18n/format";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { brewMethodLabelKey, difficultyLabelKey } from "@/lib/i18n/home-labels";
import { getLocale } from "@/lib/i18n/locale";
import type { Dictionary } from "@/lib/i18n/types";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";
import { createClient } from "@/lib/supabase/server";
import type { FeaturedRecipe } from "@/types/homepage";

/** Builds `RecipeCard`'s translated chrome labels for a given recipe, matching the pattern used on `/recipes`. */
function recipeCardLabels(dictionary: Dictionary, recipe: FeaturedRecipe) {
  const brewMethodKey = brewMethodLabelKey(recipe.brewMethod);
  return {
    premium: dictionary.common.premiumBadge,
    editorsChoice: dictionary.homeFeaturedRecipes.editorsChoice,
    ratio: dictionary.homeFeaturedRecipes.ratioLabel,
    time: dictionary.homeFeaturedRecipes.timeLabel,
    difficultyLabel: translate(dictionary, difficultyLabelKey(recipe.difficulty)),
    brewMethodLabel: brewMethodKey ? translate(dictionary, brewMethodKey) : recipe.brewMethod,
    imageAltTemplate: dictionary.homeFeaturedRecipes.imageAltTemplate,
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    pathname: "/account/favorites",
    locale,
    title: dictionary.metadata.favoritesTitle,
    description: dictionary.metadata.favoritesDescription,
    noIndex: true,
  });
}

export default async function DashboardFavoritesPage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const f = dictionary.favoritesPage;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login?redirectTo=/account/favorites");
  }

  const favoriteRecipes = await getUserFavoriteRecipes(supabase, data.user.id);

  return (
    <SectionFrame id="dashboard-favorites-page" ariaLabelledBy="dashboard-favorites-page-heading" padding="compact">
<PageHeader headingId="dashboard-favorites-page-heading" eyebrow={f.eyebrow} title={f.title} description={f.description} centered={false} />

      {favoriteRecipes.length === 0 ? (
        <div className="rounded-[1.5rem] border border-white/[0.09] bg-white/[0.03] px-8 py-16 text-center">
          <p className="text-lg font-medium text-stone-100">{f.noFavoritesTitle}</p>
          <p className="mt-2 text-sm text-stone-500">{f.noFavoritesDescription}</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-7 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 lg:gap-9">
          {favoriteRecipes.map((recipe) => (
            <div key={recipe.id} className="relative">
              <RecipeCard
                recipe={recipe}
                featured={false}
                href={`/recipes/${recipe.slug}`}
                labels={recipeCardLabels(dictionary, recipe)}
              />
              {recipe.id && (
                <div className="pointer-events-none absolute inset-0">
                  <div className="pointer-events-auto absolute bottom-6 end-6 z-10">
                    <FavoriteButton
                      recipeId={recipe.id}
                      isFavorited
                      currentPath="/account/favorites"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </SectionFrame>
  );
}

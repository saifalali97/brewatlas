import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Folio, FolioItem } from "@/app/components/atlas/folio";
import { FavoriteButton } from "@/app/components/recipes/favorite-button";
import { EmptyState } from "@/app/components/ui/empty-state";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { acTypography } from "@/lib/design-system/atlas-canon";
import { getUserFavoriteRecipes } from "@/lib/data/db-recipes";
import { translate } from "@/lib/i18n/format";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { brewMethodLabelKey, difficultyLabelKey } from "@/lib/i18n/home-labels";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";
import { createClient } from "@/lib/supabase/server";

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
      <PageHeader
        headingId="dashboard-favorites-page-heading"
        eyebrow={f.eyebrow}
        title={f.title}
        description={f.description}
        centered={false}
      />

      {favoriteRecipes.length === 0 ? (
        <EmptyState
          title={f.noFavoritesTitle}
          description={f.noFavoritesDescription}
          actionLabel={dictionary.homeFooter.browseRecipes}
          actionHref="/recipes"
        />
      ) : (
        <Folio ariaLabel={f.title}>
          {favoriteRecipes.map((recipe, index) => {
            const brewMethodKey = brewMethodLabelKey(recipe.brewMethod);
            return (
              <FolioItem
                key={recipe.id}
                href={`/recipes/${recipe.slug}`}
                index={String(index + 1).padStart(2, "0")}
                title={recipe.name}
                imageSrc={recipe.image}
                imageGrade="library"
                meta={
                  <p className={acTypography.folioMeta}>
                    {recipe.origin} ·{" "}
                    {brewMethodKey ? translate(dictionary, brewMethodKey) : recipe.brewMethod} ·{" "}
                    {translate(dictionary, difficultyLabelKey(recipe.difficulty))}
                  </p>
                }
                trailing={
                  recipe.id ? (
                    <FavoriteButton recipeId={recipe.id} isFavorited currentPath="/account/favorites" />
                  ) : undefined
                }
              />
            );
          })}
        </Folio>
      )}
    </SectionFrame>
  );
}

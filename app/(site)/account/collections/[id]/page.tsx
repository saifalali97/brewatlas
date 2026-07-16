import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CollectionManagePanel } from "@/app/components/collections/collection-manage-panel";
import { RemoveRecipeFromCollectionButton } from "@/app/components/collections/remove-recipe-from-collection-button";
import { RecipeCard } from "@/app/components/cards/recipe-card";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { getCollectionById } from "@/lib/data/collections";
import { getPublishedDbRecipes } from "@/lib/data/db-recipes";
import { translate } from "@/lib/i18n/format";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { brewMethodLabelKey, difficultyLabelKey } from "@/lib/i18n/home-labels";
import { getLocale } from "@/lib/i18n/locale";
import type { Dictionary } from "@/lib/i18n/types";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";
import { createClient } from "@/lib/supabase/server";
import type { FeaturedRecipe } from "@/types/homepage";
import type { LookupOption } from "@/types/recipe";

type CollectionDetailPageProps = {
  params: Promise<{ id: string }>;
};

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

export async function generateMetadata({ params }: CollectionDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    pathname: `/account/collections/${id}`,
    locale,
    title: dictionary.metadata.collectionDetailTitle,
    description: dictionary.metadata.collectionDetailDescription,
    noIndex: true,
  });
}

function toRecipeOptions(
  recipes: Awaited<ReturnType<typeof getPublishedDbRecipes>>,
  existingIds: Set<string>,
): LookupOption[] {
  return recipes
    .filter((recipe): recipe is (typeof recipes)[number] & { id: string } => {
      return typeof recipe.id === "string" && recipe.id.length > 0 && !existingIds.has(recipe.id);
    })
    .map((recipe) => ({ id: recipe.id, name: recipe.name }));
}

export default async function CollectionDetailPage({ params }: CollectionDetailPageProps) {
  const { id } = await params;
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const c = dictionary.collectionsPage;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect(`/login?redirectTo=/account/collections/${id}`);
  }

  const [collection, publishedRecipes] = await Promise.all([
    getCollectionById(supabase, id, data.user.id),
    getPublishedDbRecipes(supabase),
  ]);

  if (!collection) {
    notFound();
  }

  const existingIds = new Set(collection.recipes.map((recipe) => recipe.id).filter((recipeId): recipeId is string => Boolean(recipeId)));
  const availableRecipes = toRecipeOptions(publishedRecipes, existingIds);

  return (
    <SectionFrame id="collection-detail-page" ariaLabelledBy="collection-detail-page-heading" padding="compact">
      
<Link
        href="/account/collections"
        className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-stone-400 transition-colors duration-300 hover:text-amber-400/90 rtl:flex-row-reverse"
      >
        <ArrowLeft className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
        {c.backToCollections}
      </Link>

      <PageHeader headingId="collection-detail-page-heading" eyebrow={c.eyebrow} title={collection.name} description={c.description} centered={false} />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-start">
        <div>
          {collection.recipes.length === 0 ? (
            <div className="rounded-[1.5rem] border border-white/[0.09] bg-white/[0.03] px-8 py-16 text-center">
              <p className="text-lg font-medium text-stone-100">{c.noRecipesInCollectionTitle}</p>
              <p className="mt-2 text-sm text-stone-500">{c.noRecipesInCollectionDescription}</p>
            </div>
          ) : (
            <div className="grid gap-7 sm:grid-cols-2 sm:gap-8 lg:grid-cols-2 lg:gap-9">
              {collection.recipes.map((recipe) => (
                <div key={recipe.id} className="relative">
                  <RecipeCard
                    recipe={recipe}
                    featured={false}
                    href={`/recipes/${recipe.slug}`}
                    labels={recipeCardLabels(dictionary, recipe)}
                  />
                  {recipe.id && (
                    <RemoveRecipeFromCollectionButton collectionId={collection.id} recipeId={recipe.id} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-[1.5rem] border border-white/[0.1] bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-white/[0.01] p-6 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.48)] backdrop-blur-2xl sm:p-8">
          <CollectionManagePanel
            collectionId={collection.id}
            initialName={collection.name}
            availableRecipes={availableRecipes}
          />
        </div>
      </div>
    </SectionFrame>
  );
}

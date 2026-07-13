import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Coffee, Heart, MapPin, Scale } from "lucide-react";
import { DifficultyIndicator } from "@/app/components/ui/difficulty-indicator";
import { MetaTile } from "@/app/components/ui/meta-tile";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { RippleLink } from "@/app/components/ui/ripple-link";
import { DeleteRecipeButton } from "@/app/components/recipes/delete-recipe-button";
import { FavoriteButton } from "@/app/components/recipes/favorite-button";
import { cards, buttons } from "@/lib/constants/styles";
import { getAllRecipeSlugs, getRecipeBySlug } from "@/lib/data/recipes";
import { getDbRecipeBySlug, getFavoritesCount, getUserFavoriteRecipeIds } from "@/lib/data/db-recipes";
import { imageAlt } from "@/lib/seo/image-alt";
import { createClient } from "@/lib/supabase/server";
import type { RecipeListItem } from "@/types/recipe";

type RecipePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllRecipeSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: RecipePageProps): Promise<Metadata> {
  const { slug } = await params;
  const staticRecipe = getRecipeBySlug(slug);

  if (staticRecipe) {
    return {
      title: staticRecipe.name,
      description: staticRecipe.notes,
      alternates: { canonical: `/recipes/${slug}` },
      openGraph: {
        title: staticRecipe.name,
        description: staticRecipe.notes,
        images: [staticRecipe.image],
      },
    };
  }

  const supabase = await createClient();
  const dbRecipe = await getDbRecipeBySlug(supabase, slug);

  if (!dbRecipe) {
    return { title: "Recipe Not Found" };
  }

  return {
    title: dbRecipe.name,
    description: dbRecipe.notes,
    // Draft recipes are only ever visible to their author or an admin
    // (enforced by RLS), so they're excluded from search indexing.
    robots: dbRecipe.published ? undefined : { index: false, follow: false },
    alternates: { canonical: `/recipes/${slug}` },
    openGraph: {
      title: dbRecipe.name,
      description: dbRecipe.notes,
      images: [dbRecipe.image],
    },
  };
}

export default async function RecipePage({ params }: RecipePageProps) {
  const { slug } = await params;
  const staticRecipe = getRecipeBySlug(slug);

  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  let recipe: RecipeListItem | null = staticRecipe
    ? { ...staticRecipe, slug, source: "static" }
    : null;

  let favoritesCount = 0;
  let isFavorited = false;

  if (!recipe) {
    recipe = await getDbRecipeBySlug(supabase, slug);

    if (recipe?.id) {
      favoritesCount = await getFavoritesCount(supabase, recipe.id);
      if (authData.user) {
        const favoriteIds = await getUserFavoriteRecipeIds(supabase, authData.user.id);
        isFavorited = favoriteIds.has(recipe.id);
      }
    }
  }

  if (!recipe) {
    notFound();
  }

  const isOwner = Boolean(authData.user && recipe.authorId === authData.user.id);

  return (
    <SectionFrame id="recipe-detail" ariaLabelledBy="recipe-detail-heading" padding="compact">
      <Link
        href="/recipes"
        className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-stone-400 transition-colors duration-300 hover:text-amber-400/90"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to all recipes
      </Link>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div className={`relative h-72 overflow-hidden rounded-[1.5rem] border border-white/[0.11] sm:h-96 lg:h-full lg:min-h-[26rem]`}>
          <Image
            src={recipe.image}
            alt={imageAlt.recipe(recipe.name, recipe.country, recipe.brewMethod, recipe.roastLevel)}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority
            className="object-cover brightness-[0.9] contrast-[1.04] saturate-[0.94]"
          />
          <div className={cards.imageOverlay} />
          <div className={cards.imageAmberWash} />

          {recipe.source === "db" && !recipe.published && (
            <div className="absolute left-5 top-5 rounded-full border border-stone-500/40 bg-stone-900/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-stone-300 backdrop-blur-xl">
              Draft
            </div>
          )}

          {recipe.premium && (
            <div className="absolute right-5 top-5 rounded-full border border-amber-700/35 bg-amber-950/65 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-200/90 backdrop-blur-xl">
              Premium
            </div>
          )}

          <div className="absolute bottom-5 left-5 flex items-center gap-1.5 rounded-full border border-white/[0.12] bg-[#0a0705]/55 px-3 py-1 text-[10px] font-medium text-stone-200 backdrop-blur-xl">
            <MapPin className="h-3 w-3 text-amber-500/80" aria-hidden />
            {recipe.origin}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-amber-600/70">
              {recipe.country}
            </p>

            {recipe.source === "db" && recipe.id && (
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-xs text-stone-500">
                  <Heart className="h-3.5 w-3.5 text-amber-500/70" aria-hidden />
                  {favoritesCount}
                </span>
                {authData.user && (
                  <FavoriteButton
                    recipeId={recipe.id}
                    isFavorited={isFavorited}
                    currentPath={`/recipes/${slug}`}
                  />
                )}
              </div>
            )}
          </div>

          <h1
            id="recipe-detail-heading"
            className="mt-3 text-3xl font-semibold leading-[1.08] tracking-[-0.03em] text-stone-50 sm:text-4xl"
          >
            {recipe.name}
          </h1>
          <p className="mt-5 text-lg leading-[1.75] text-stone-400">{recipe.notes}</p>

          <div className="mt-8">
            <DifficultyIndicator
              level={recipe.difficulty}
              labelClassName="text-sm text-stone-400"
              className="flex items-center gap-2.5"
            />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <MetaTile icon={Coffee} label="Brew Method" value={recipe.brewMethod} />
            <MetaTile icon={Scale} label="Ratio" value={recipe.ratio} />
            <MetaTile icon={Clock} label="Brew Time" value={recipe.time} />
            <MetaTile icon={MapPin} label="Roast Level" value={recipe.roastLevel} />
          </div>

          {recipe.source === "db" && recipe.instructions && (
            <div className="mt-8 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-stone-500">
                Instructions
              </p>
              <p className="mt-2.5 whitespace-pre-line text-sm leading-relaxed text-stone-300">
                {recipe.instructions}
              </p>
            </div>
          )}

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            {isOwner ? (
              <>
                <RippleLink href={`/dashboard/recipes/${recipe.id}/edit`} className={`${buttons.primary} w-full sm:w-auto`}>
                  Edit Recipe
                </RippleLink>
                {recipe.id && <DeleteRecipeButton recipeId={recipe.id} recipeTitle={recipe.name} />}
              </>
            ) : (
              <RippleLink href="/premium" className={`${buttons.primary} w-full sm:w-auto`}>
                Unlock Full Guide
              </RippleLink>
            )}
            <RippleLink href="/recipes" className={`${buttons.secondary} w-full sm:w-auto`}>
              Browse More Recipes
            </RippleLink>
          </div>
        </div>
      </div>
    </SectionFrame>
  );
}

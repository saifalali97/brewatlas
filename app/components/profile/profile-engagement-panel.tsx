import Link from "next/link";
import { RecipeCard } from "@/app/components/cards/recipe-card";
import { StarRatingDisplay } from "@/app/components/reviews/star-rating";
import { RippleLink } from "@/app/components/ui/ripple-link";
import { getUserFavoriteRecipes } from "@/lib/data/db-recipes";
import {
  getCommunityStats,
  getUserAverageRatingGiven,
  getUserReviewsWritten,
} from "@/lib/data/community";
import { translate, interpolate } from "@/lib/i18n/format";
import { brewMethodLabelKey, difficultyLabelKey } from "@/lib/i18n/home-labels";
import type { Dictionary } from "@/lib/i18n/types";
import { buttons } from "@/lib/constants/styles";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { RecipeListItem } from "@/types/recipe";

type ProfileEngagementPanelProps = {
  supabase: SupabaseClient;
  userId: string;
  dictionary: Dictionary;
};

function recipeCardLabels(dictionary: Dictionary, recipe: RecipeListItem) {
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

export async function ProfileEngagementPanel({ supabase, userId, dictionary }: ProfileEngagementPanelProps) {
  const p = dictionary.profileEngagement;
  const [stats, reviewsWritten, averageRatingGiven, favoriteRecipes] = await Promise.all([
    getCommunityStats(supabase, userId),
    getUserReviewsWritten(supabase, userId, { limit: 6 }),
    getUserAverageRatingGiven(supabase, userId),
    getUserFavoriteRecipes(supabase, userId),
  ]);

  const favoritePreview = favoriteRecipes.slice(0, 3);

  return (
    <div className="mt-10 space-y-10">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-[1.25rem] border border-ba-espresso/10 bg-ba-pearl p-5">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-ac-espresso">{p.reviewsWrittenLabel}</p>
          <p className="mt-2 text-2xl font-semibold text-ac-espresso">{stats.reviewsWritten}</p>
        </div>
        <div className="rounded-[1.25rem] border border-ba-espresso/10 bg-ba-pearl p-5">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-ac-espresso">{p.averageRatingGivenLabel}</p>
          <div className="mt-2 flex items-center gap-2">
            <p className="text-2xl font-semibold text-ac-espresso">
              {averageRatingGiven !== null ? averageRatingGiven.toFixed(1) : "—"}
            </p>
            {averageRatingGiven !== null && (
              <StarRatingDisplay rating={averageRatingGiven} size="sm" />
            )}
          </div>
        </div>
        <div className="rounded-[1.25rem] border border-ba-espresso/10 bg-ba-pearl p-5">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-ac-espresso">{p.favoriteRecipesLabel}</p>
          <p className="mt-2 text-2xl font-semibold text-ac-espresso">{favoriteRecipes.length}</p>
        </div>
      </div>

      <section aria-labelledby="profile-favorites-heading">
        <div className="mb-5 flex items-end justify-between gap-4">
          <h2 id="profile-favorites-heading" className="text-lg font-semibold text-ac-espresso">
            {p.favoriteRecipesTitle}
          </h2>
          {favoriteRecipes.length > 0 && (
            <RippleLink href="/account/favorites" className="text-sm font-medium text-ac-espresso hover:text-ba-bronze">
              {p.viewAllFavorites}
            </RippleLink>
          )}
        </div>

        {favoritePreview.length === 0 ? (
          <p className="text-sm text-ac-espresso">{p.noFavoritesYet}</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {favoritePreview.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                featured={false}
                href={`/recipes/${recipe.slug}`}
                labels={recipeCardLabels(dictionary, recipe)}
              />
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="profile-reviews-heading">
        <h2 id="profile-reviews-heading" className="mb-5 text-lg font-semibold text-ac-espresso">
          {p.reviewsWrittenTitle}
        </h2>

        {reviewsWritten.length === 0 ? (
          <p className="text-sm text-ac-espresso">{p.noReviewsYet}</p>
        ) : (
          <div className="space-y-4">
            {reviewsWritten.map(({ review, recipeTitle, recipeSlug }) => (
              <article
                key={review.id}
                className="rounded-[1.25rem] border border-ba-espresso/08 bg-ba-sand/30 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <Link
                      href={`/recipes/${recipeSlug}`}
                      className="font-medium text-ac-espresso transition-colors hover:text-ba-bronze"
                    >
                      {recipeTitle}
                    </Link>
                    <div className="mt-2">
                      <StarRatingDisplay
                        rating={review.rating}
                        label={interpolate(p.starRatingLabel, { rating: review.rating })}
                        size="sm"
                      />
                    </div>
                  </div>
                  <RippleLink href={`/recipes/${recipeSlug}#reviews`} className={`${buttons.secondary} text-xs`}>
                    {p.viewRecipe}
                  </RippleLink>
                </div>
                {review.reviewText && (
                  <p className="mt-3 text-sm leading-relaxed text-ac-espresso">{review.reviewText}</p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

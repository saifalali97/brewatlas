"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useTransition } from "react";
import { RatingSummary } from "@/app/components/reviews/rating-summary";
import { RecipeReviewForm } from "@/app/components/reviews/recipe-review-form";
import { RecipeReviewItem } from "@/app/components/reviews/recipe-review-item";
import { forms } from "@/lib/constants/styles";
import { useTranslations } from "@/lib/i18n/translation-context";
import type { Dictionary, DictionaryKey } from "@/lib/i18n/types";
import type {
  RatingDistributionBucket,
  RecipeRatingSummary,
  RecipeReview,
  RecipeReviewsResult,
  ReviewSort,
} from "@/types/community";
import { REVIEW_SORTS } from "@/types/community";

type RecipeReviewsPanelProps = {
  recipeId: string;
  recipeSlug: string;
  summary: RecipeRatingSummary;
  distribution: RatingDistributionBucket[];
  reviewsResult: RecipeReviewsResult;
  userReview: RecipeReview | null;
  viewerId: string | null;
  isAuthenticated: boolean;
  reviewLabels: Dictionary["recipeReviews"];
};

const sortLabelKeys: Record<ReviewSort, keyof Dictionary["recipeReviews"]> = {
  newest: "sortNewest",
  highest: "sortHighest",
  lowest: "sortLowest",
  helpful: "sortHelpful",
};

export function RecipeReviewsPanel({
  recipeId,
  recipeSlug,
  summary,
  distribution,
  reviewsResult,
  userReview,
  viewerId,
  isAuthenticated,
  reviewLabels,
}: RecipeReviewsPanelProps) {
  const { t } = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const currentPath = `/recipes/${recipeSlug}`;
  const totalPages = Math.max(1, Math.ceil(reviewsResult.totalCount / reviewsResult.pageSize));

  const updateParams = useCallback(
    (sort: ReviewSort, page: number) => {
      const params = new URLSearchParams();
      if (sort !== "newest") params.set("reviewSort", sort);
      if (page > 1) params.set("reviewPage", String(page));
      const query = params.toString();
      startTransition(() => {
        router.replace(query ? `${pathname}?${query}#reviews` : `${pathname}#reviews`, { scroll: false });
      });
    },
    [pathname, router],
  );

  return (
    <section id="reviews" aria-labelledby="recipe-reviews-heading" className="mt-14 scroll-mt-28">
      <h2 id="recipe-reviews-heading" className="text-xs font-semibold uppercase tracking-[0.14em] text-ac-espresso">
        {t("recipeReviews.sectionTitle")}
      </h2>

      <div className="mt-6 space-y-8">
        <RatingSummary summary={summary} distribution={distribution} labels={reviewLabels} />

        <RecipeReviewForm
          recipeId={recipeId}
          currentPath={currentPath}
          existingReview={userReview}
          isAuthenticated={isAuthenticated}
        />

        <div>
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-base font-semibold text-ac-espresso">{t("recipeReviews.allReviews")}</h3>
            <div className="flex items-center gap-2">
              <label htmlFor="review-sort" className="text-sm text-ac-espresso">
                {t("recipeReviews.sortLabel")}
              </label>
              <select
                id="review-sort"
                value={reviewsResult.sort}
                onChange={(event) => updateParams(event.target.value as ReviewSort, 1)}
                className={`${forms.select} mt-0 min-w-[10rem]`}
                disabled={isPending}
              >
                {REVIEW_SORTS.map((sort) => (
                  <option key={sort} value={sort}>
                    {t(`recipeReviews.${sortLabelKeys[sort]}` as DictionaryKey)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isPending ? (
            <div className="space-y-4" aria-live="polite" aria-busy="true">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-28 animate-pulse rounded-[1.25rem] bg-ba-espresso/06" />
              ))}
            </div>
          ) : reviewsResult.reviews.length === 0 ? (
            <div className="rounded-[1.25rem] border border-ba-espresso/08 bg-ba-sand/30 px-6 py-12 text-center">
              <p className="text-sm font-medium text-ac-espresso">{t("recipeReviews.noReviewsTitle")}</p>
              <p className="mt-2 text-sm text-ac-espresso">{t("recipeReviews.noReviewsDescription")}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviewsResult.reviews.map((review) => (
                <RecipeReviewItem
                  key={review.id}
                  review={review}
                  currentPath={currentPath}
                  viewerId={viewerId}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && !isPending && (
            <div className="mt-8 flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={reviewsResult.page <= 1}
                onClick={() => updateParams(reviewsResult.sort, reviewsResult.page - 1)}
                className={`${forms.input} mt-0 w-auto cursor-pointer rounded-full px-4 py-2 text-sm disabled:opacity-40`}
              >
                {t("recipeReviews.previousPage")}
              </button>
              <span className="text-sm text-ac-espresso">
                {t("recipeReviews.pageIndicator", { page: reviewsResult.page, total: totalPages })}
              </span>
              <button
                type="button"
                disabled={reviewsResult.page >= totalPages}
                onClick={() => updateParams(reviewsResult.sort, reviewsResult.page + 1)}
                className={`${forms.input} mt-0 w-auto cursor-pointer rounded-full px-4 py-2 text-sm disabled:opacity-40`}
              >
                {t("recipeReviews.nextPage")}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

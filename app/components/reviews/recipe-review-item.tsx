"use client";

import { ThumbsUp } from "lucide-react";
import { StarRatingDisplay } from "@/app/components/reviews/star-rating";
import { useTranslations } from "@/lib/i18n/translation-context";
import { markReviewHelpfulAction, unmarkReviewHelpfulAction, flagReviewAction } from "@/lib/supabase/recipe-engagement-actions";
import type { RecipeReview } from "@/types/community";

type RecipeReviewItemProps = {
  review: RecipeReview;
  currentPath: string;
  viewerId: string | null;
};

function formatReviewDate(iso: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar" : "en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(iso));
}

export function RecipeReviewItem({ review, currentPath, viewerId }: RecipeReviewItemProps) {
  const { t, locale } = useTranslations();
  const isOwnReview = viewerId === review.user.id;
  const displayName = review.user.displayName ?? t("recipeReviews.anonymousReviewer");
  const helpfulAction = review.isHelpfulByViewer ? unmarkReviewHelpfulAction : markReviewHelpfulAction;

  return (
    <article className="rounded-[1.25rem] border border-white/[0.08] bg-white/[0.02] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium text-stone-100">{displayName}</p>
          {review.user.country && <p className="mt-0.5 text-xs text-stone-500">{review.user.country}</p>}
        </div>
        <div className="text-end">
          <StarRatingDisplay
            rating={review.rating}
            label={t("recipeReviews.starRatingLabel", { rating: review.rating })}
          />
          <p className="mt-1 text-xs text-stone-500">{formatReviewDate(review.createdAt, locale)}</p>
        </div>
      </div>

      {review.moderationStatus === "flagged" && isOwnReview && (
        <p className="mt-3 rounded-lg border border-amber-600/25 bg-amber-950/30 px-3 py-2 text-xs text-amber-200/90">
          {t("recipeReviews.flaggedNotice")}
        </p>
      )}

      {review.reviewText && (
        <p className="mt-4 text-sm leading-relaxed text-stone-300">{review.reviewText}</p>
      )}

      {!isOwnReview && viewerId && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <form action={helpfulAction}>
            <input type="hidden" name="reviewId" value={review.id} />
            <input type="hidden" name="currentPath" value={currentPath} />
            <button
              type="submit"
              aria-pressed={Boolean(review.isHelpfulByViewer)}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                review.isHelpfulByViewer
                  ? "border-amber-600/40 bg-amber-950/40 text-amber-200"
                  : "border-white/[0.1] bg-white/[0.03] text-stone-400 hover:border-amber-600/25 hover:text-stone-200"
              }`}
            >
              <ThumbsUp className="h-3.5 w-3.5" aria-hidden />
              {review.isHelpfulByViewer ? t("recipeReviews.helpfulMarked") : t("recipeReviews.markHelpful")}
              <span className="text-stone-500">({review.helpfulCount})</span>
            </button>
          </form>

          {review.moderationStatus === "visible" && (
            <form action={flagReviewAction}>
              <input type="hidden" name="reviewId" value={review.id} />
              <input type="hidden" name="currentPath" value={currentPath} />
              <button
                type="submit"
                className="text-xs font-medium text-stone-500 underline-offset-4 transition-colors hover:text-amber-400/90 hover:underline"
              >
                {t("recipeReviews.reportReview")}
              </button>
            </form>
          )}
        </div>
      )}

      {isOwnReview && review.helpfulCount > 0 && (
        <p className="mt-4 text-xs text-stone-500">
          {t("recipeReviews.helpfulCountLabel", { count: review.helpfulCount })}
        </p>
      )}
    </article>
  );
}

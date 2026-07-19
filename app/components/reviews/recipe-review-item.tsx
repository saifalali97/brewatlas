"use client";

import Link from "next/link";
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
    <article className="rounded-[1.25rem] border border-ba-espresso/08 bg-ba-sand/30 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href={`/users/${review.user.id}`} className="font-medium text-ac-espresso transition-colors hover:text-ba-bronze">
            {displayName}
          </Link>
          {review.user.country && <p className="mt-0.5 text-xs text-ac-espresso">{review.user.country}</p>}
        </div>
        <div className="text-end">
          <StarRatingDisplay
            rating={review.rating}
            label={t("recipeReviews.starRatingLabel", { rating: review.rating })}
          />
          <p className="mt-1 text-xs text-ac-espresso">{formatReviewDate(review.createdAt, locale)}</p>
        </div>
      </div>

      {review.moderationStatus === "flagged" && isOwnReview && (
        <p className="mt-3 rounded-lg border border-ba-gold/30 bg-ba-gold/10 px-3 py-2 text-xs text-ac-espresso">
          {t("recipeReviews.flaggedNotice")}
        </p>
      )}

      {review.reviewText && (
        <p className="mt-4 text-sm leading-relaxed text-ac-espresso">{review.reviewText}</p>
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
                  ? "border-ba-bronze/35 bg-ba-gold/15 text-ac-espresso"
                  : "border-ba-espresso/12 bg-ba-pearl text-ac-espresso hover:border-ba-bronze/30 hover:text-ba-bronze"
              }`}
            >
              <ThumbsUp className="h-3.5 w-3.5" aria-hidden />
              {review.isHelpfulByViewer ? t("recipeReviews.helpfulMarked") : t("recipeReviews.markHelpful")}
              <span className="text-ac-espresso">({review.helpfulCount})</span>
            </button>
          </form>

          {review.moderationStatus === "visible" && (
            <form action={flagReviewAction}>
              <input type="hidden" name="reviewId" value={review.id} />
              <input type="hidden" name="currentPath" value={currentPath} />
              <button
                type="submit"
                className="text-xs font-medium text-ac-espresso underline-offset-4 transition-colors hover:text-ba-bronze hover:underline"
              >
                {t("recipeReviews.reportReview")}
              </button>
            </form>
          )}
        </div>
      )}

      {isOwnReview && review.helpfulCount > 0 && (
        <p className="mt-4 text-xs text-ac-espresso">
          {t("recipeReviews.helpfulCountLabel", { count: review.helpfulCount })}
        </p>
      )}
    </article>
  );
}

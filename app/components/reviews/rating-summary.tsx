import { StarRatingDisplay } from "@/app/components/reviews/star-rating";
import { interpolate } from "@/lib/i18n/format";
import type { Dictionary } from "@/lib/i18n/types";
import type { RatingDistributionBucket, RecipeRatingSummary } from "@/types/community";

type RatingSummaryProps = {
  summary: RecipeRatingSummary;
  distribution: RatingDistributionBucket[];
  labels: Dictionary["recipeReviews"];
};

export function RatingSummary({ summary, distribution, labels }: RatingSummaryProps) {
  const averageLabel =
    summary.averageRating !== null
      ? interpolate(labels.averageRatingTemplate, { rating: summary.averageRating.toFixed(1) })
      : labels.noRatingsYet;

  return (
    <div className="grid gap-6 sm:grid-cols-[minmax(0,10rem)_minmax(0,1fr)] sm:items-center">
      <div className="text-center sm:text-start">
        <p className="text-4xl font-semibold tracking-tight text-ac-espresso">
          {summary.averageRating !== null ? summary.averageRating.toFixed(1) : "—"}
        </p>
        <StarRatingDisplay
          rating={summary.averageRating ?? 0}
          label={averageLabel}
          size="md"
        />
        <p className="mt-2 text-sm text-ac-espresso">
          {summary.reviewCount === 1
            ? interpolate(labels.reviewCountSingular, { count: summary.reviewCount })
            : interpolate(labels.reviewCountPlural, { count: summary.reviewCount })}
        </p>
      </div>

      <div className="space-y-2">
        {distribution.map((bucket) => (
          <div key={bucket.stars} className="flex items-center gap-3">
            <span className="w-10 text-end text-xs font-medium text-ac-espresso">
              {interpolate(labels.distributionStars, { stars: bucket.stars })}
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-ba-espresso/08">
              <div
                className="h-full rounded-full bg-amber-500/80 transition-all duration-500"
                style={{ width: `${bucket.percent}%` }}
                role="presentation"
              />
            </div>
            <span className="w-8 text-xs text-ac-espresso">{bucket.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

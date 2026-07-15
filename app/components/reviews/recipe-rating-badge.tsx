import Link from "next/link";
import { StarRatingDisplay } from "@/app/components/reviews/star-rating";
import { interpolate } from "@/lib/i18n/format";
import type { Dictionary } from "@/lib/i18n/types";
import type { RecipeRatingSummary } from "@/types/community";

type RecipeRatingBadgeProps = {
  summary: RecipeRatingSummary;
  labels: Dictionary["recipeReviews"];
};

/** Compact rating chip linking to the reviews section on recipe detail pages. */
export function RecipeRatingBadge({ summary, labels }: RecipeRatingBadgeProps) {
  if (summary.reviewCount === 0 || summary.averageRating === null) {
    return null;
  }

  const countLabel =
    summary.reviewCount === 1
      ? interpolate(labels.reviewCountSingular, { count: summary.reviewCount })
      : interpolate(labels.reviewCountPlural, { count: summary.reviewCount });

  return (
    <Link
      href="#reviews"
      className="inline-flex flex-wrap items-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.04] px-3 py-1.5 text-xs text-stone-300 transition-colors hover:border-amber-600/30 hover:text-stone-100"
    >
      <StarRatingDisplay
        rating={summary.averageRating}
        label={interpolate(labels.averageRatingTemplate, { rating: summary.averageRating.toFixed(1) })}
        size="sm"
      />
      <span className="font-medium text-stone-200">{summary.averageRating.toFixed(1)}</span>
      <span className="text-stone-500">({countLabel})</span>
    </Link>
  );
}

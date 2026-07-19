"use client";

import { useActionState, useState } from "react";
import { FormMessage } from "@/app/components/auth/form-message";
import { StarRatingInput } from "@/app/components/reviews/star-rating";
import { buttons, forms } from "@/lib/constants/styles";
import { useTranslations } from "@/lib/i18n/translation-context";
import {
  deleteRecipeReviewAction,
  submitRecipeReviewAction,
  type RecipeReviewActionState,
} from "@/lib/supabase/recipe-engagement-actions";
import type { RecipeReview } from "@/types/community";

type RecipeReviewFormProps = {
  recipeId: string;
  currentPath: string;
  existingReview: RecipeReview | null;
  isAuthenticated: boolean;
};

export function RecipeReviewForm({
  recipeId,
  currentPath,
  existingReview,
  isAuthenticated,
}: RecipeReviewFormProps) {
  const { t } = useTranslations();
  const [state, formAction, pending] = useActionState<RecipeReviewActionState, FormData>(
    submitRecipeReviewAction,
    undefined,
  );
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [reviewText, setReviewText] = useState(existingReview?.reviewText ?? "");

  if (!isAuthenticated) {
    return (
      <div className="rounded-[1.25rem] border border-ba-espresso/08 bg-ba-sand/30 px-5 py-6 text-center">
        <p className="text-sm text-ac-espresso">{t("recipeReviews.signInToReview")}</p>
      </div>
    );
  }

  return (
    <div className="rounded-[1.25rem] border border-ba-espresso/10 bg-ba-pearl p-5 sm:p-6">
      <h3 className="text-base font-semibold text-ac-espresso">
        {existingReview ? t("recipeReviews.editYourReview") : t("recipeReviews.writeReview")}
      </h3>

      <form action={formAction} className="mt-5 space-y-5">
        <input type="hidden" name="recipeId" value={recipeId} />
        <input type="hidden" name="currentPath" value={currentPath} />

        <div>
          <p className={forms.label}>{t("recipeReviews.yourRating")}</p>
          <div className="mt-2">
            <StarRatingInput name="rating" value={rating} onChange={setRating} disabled={pending} />
          </div>
        </div>

        <div>
          <label htmlFor="review-text" className={forms.label}>
            {t("recipeReviews.reviewTextLabel")}
          </label>
          <textarea
            id="review-text"
            name="reviewText"
            rows={4}
            value={reviewText}
            onChange={(event) => setReviewText(event.target.value)}
            placeholder={t("recipeReviews.reviewTextPlaceholder")}
            className={`${forms.input} min-h-[6rem] resize-y`}
            maxLength={2000}
            disabled={pending}
          />
        </div>

        <FormMessage error={state?.error} success={state?.success} />

        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={pending || rating < 1} className={`${buttons.primary} disabled:opacity-50`}>
            {pending
              ? t("recipeReviews.submitting")
              : existingReview
                ? t("recipeReviews.updateReview")
                : t("recipeReviews.submitReview")}
          </button>
        </div>
      </form>

      {existingReview && (
        <form action={deleteRecipeReviewAction} className="mt-3">
          <input type="hidden" name="recipeId" value={recipeId} />
          <input type="hidden" name="currentPath" value={currentPath} />
          <button type="submit" disabled={pending} className={`${buttons.secondary} disabled:opacity-50`}>
            {t("recipeReviews.deleteReview")}
          </button>
        </form>
      )}
    </div>
  );
}

"use client";

import {
  deleteOwnerReviewAction,
  hideOwnerReviewAction,
  restoreOwnerReviewAction,
} from "@/lib/supabase/owner-review-actions";
import type { Dictionary } from "@/lib/i18n/types";
import type { ReviewModerationStatus } from "@/types/community";

type OwnerReviewRowActionsProps = {
  reviewId: string;
  status: ReviewModerationStatus;
  labels: Dictionary["ownerReviewsPage"];
};

export function OwnerReviewRowActions({ reviewId, status, labels }: OwnerReviewRowActionsProps) {
  return (
    <div className="flex flex-col gap-2">
      {status !== "hidden" && (
        <form action={hideOwnerReviewAction}>
          <input type="hidden" name="reviewId" value={reviewId} />
          <button
            type="submit"
            className="text-xs font-medium text-stone-400 underline-offset-4 hover:text-amber-400/90 hover:underline"
          >
            {labels.hideAction}
          </button>
        </form>
      )}
      {status !== "visible" && (
        <form action={restoreOwnerReviewAction}>
          <input type="hidden" name="reviewId" value={reviewId} />
          <button
            type="submit"
            className="text-xs font-medium text-stone-400 underline-offset-4 hover:text-emerald-400/90 hover:underline"
          >
            {labels.restoreAction}
          </button>
        </form>
      )}
      <form
        action={deleteOwnerReviewAction}
        onSubmit={(event) => {
          if (!window.confirm(labels.deleteConfirm)) {
            event.preventDefault();
          }
        }}
      >
        <input type="hidden" name="reviewId" value={reviewId} />
        <button
          type="submit"
          className="text-xs font-medium text-red-400/80 underline-offset-4 hover:text-red-400 hover:underline"
        >
          {labels.deleteAction}
        </button>
      </form>
    </div>
  );
}

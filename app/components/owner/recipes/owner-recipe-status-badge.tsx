"use client";

import { statusBadgeClass } from "@/lib/recipes/recipe-status";
import { useTranslations } from "@/lib/i18n/translation-context";
import type { RecipePublishStatus } from "@/types/recipe-publishing";

const STATUS_LABEL_KEYS: Record<RecipePublishStatus, "ownerRecipePublishing.statusDraft" | "ownerRecipePublishing.statusPublished" | "ownerRecipePublishing.statusArchived" | "ownerRecipePublishing.statusScheduled"> = {
  draft: "ownerRecipePublishing.statusDraft",
  published: "ownerRecipePublishing.statusPublished",
  archived: "ownerRecipePublishing.statusArchived",
  scheduled: "ownerRecipePublishing.statusScheduled",
};

type OwnerRecipeStatusBadgeProps = {
  status: RecipePublishStatus;
  scheduledPublishAt?: string | null;
};

export function OwnerRecipeStatusBadge({ status, scheduledPublishAt }: OwnerRecipeStatusBadgeProps) {
  const { t } = useTranslations();

  return (
    <span
      className={`rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${statusBadgeClass(status)}`}
    >
      {t(STATUS_LABEL_KEYS[status])}
      {status === "scheduled" && scheduledPublishAt ? (
        <span className="ms-1 normal-case tracking-normal opacity-80">
          {new Date(scheduledPublishAt).toLocaleString()}
        </span>
      ) : null}
    </span>
  );
}

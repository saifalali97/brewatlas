"use client";

import Link from "next/link";
import { useState } from "react";
import { OwnerRecipeStatusBadge } from "@/app/components/owner/recipes/owner-recipe-status-badge";
import { buttons } from "@/lib/constants/styles";
import { useTranslations } from "@/lib/i18n/translation-context";
import type { RecipePublishStatus } from "@/types/recipe-publishing";

type OwnerRecipePublishToolbarProps = {
  recipeId?: string;
  status: RecipePublishStatus;
  scheduledPublishAt?: string | null;
  versionCount?: number;
  pending?: boolean;
  onIntentChange: (intent: string) => void;
};

export function OwnerRecipePublishToolbar({
  recipeId,
  status,
  scheduledPublishAt,
  versionCount = 0,
  pending = false,
  onIntentChange,
}: OwnerRecipePublishToolbarProps) {
  const { t } = useTranslations();
  const [scheduledValue, setScheduledValue] = useState(
    scheduledPublishAt ? scheduledPublishAt.slice(0, 16) : "",
  );

  return (
    <div className="space-y-4 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-stone-400">{t("ownerRecipePublishing.statusLabel")}</span>
          <OwnerRecipeStatusBadge status={status} scheduledPublishAt={scheduledPublishAt} />
        </div>
        {recipeId ? (
          <Link
            href={`/admin/recipes/${recipeId}/versions`}
            className="text-xs font-medium text-amber-400/90 underline-offset-4 hover:underline"
          >
            {t("ownerRecipePublishing.versionHistoryCta")}
            {versionCount > 0 ? ` (${versionCount})` : ""}
          </Link>
        ) : null}
      </div>

      <div>
        <label htmlFor="scheduledPublishAt" className="text-sm font-medium text-stone-300">
          {t("ownerRecipePublishing.scheduleLabel")}
        </label>
        <input
          id="scheduledPublishAt"
          name="scheduledPublishAt"
          type="datetime-local"
          value={scheduledValue}
          onChange={(event) => setScheduledValue(event.target.value)}
          className="mt-2 w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-3 text-sm text-stone-100 outline-none transition-colors duration-300 focus:border-amber-500/45 sm:max-w-xs"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          onClick={() => onIntentChange("draft")}
          className={`${buttons.secondary} h-10 px-4 text-xs disabled:opacity-70`}
        >
          {t("ownerRecipePublishing.saveDraftCta")}
        </button>
        <button
          type="submit"
          disabled={pending}
          onClick={() => onIntentChange("publish")}
          className={`${buttons.primary} h-10 px-4 text-xs disabled:opacity-70`}
        >
          {t("ownerRecipePublishing.publishCta")}
        </button>
        {status === "published" ? (
          <button
            type="submit"
            disabled={pending}
            onClick={() => onIntentChange("unpublish")}
            className={`${buttons.secondary} h-10 px-4 text-xs disabled:opacity-70`}
          >
            {t("ownerRecipePublishing.unpublishCta")}
          </button>
        ) : null}
        {scheduledValue ? (
          <button
            type="submit"
            disabled={pending}
            onClick={() => onIntentChange("schedule")}
            className={`${buttons.secondary} h-10 px-4 text-xs disabled:opacity-70`}
          >
            {t("ownerRecipePublishing.scheduleCta")}
          </button>
        ) : null}
        {status !== "archived" ? (
          <button
            type="submit"
            disabled={pending}
            onClick={() => onIntentChange("archive")}
            className={`${buttons.secondary} h-10 px-4 text-xs text-amber-200/90 disabled:opacity-70`}
          >
            {t("ownerRecipePublishing.archiveCta")}
          </button>
        ) : (
          <button
            type="submit"
            disabled={pending}
            onClick={() => onIntentChange("restore")}
            className={`${buttons.secondary} h-10 px-4 text-xs disabled:opacity-70`}
          >
            {t("ownerRecipePublishing.restoreCta")}
          </button>
        )}
      </div>
    </div>
  );
}

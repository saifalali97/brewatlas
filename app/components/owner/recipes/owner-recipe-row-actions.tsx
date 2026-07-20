"use client";

import {
  deleteOwnerRecipeAction,
  duplicateOfficialRecipeFormAction,
  featureOfficialRecipeFormAction,
  quickOwnerRecipeWorkflowAction,
  verifyOfficialRecipeFormAction,
} from "@/lib/supabase/owner-recipe-actions";
import { useTranslations } from "@/lib/i18n/translation-context";
import { translate } from "@/lib/i18n/format";
import type { RecipePublishStatus } from "@/types/recipe-publishing";
import type { RecipeKind, RecipeVerificationStatus } from "@/types/official-recipe";

type OwnerRecipeRowActionsProps = {
  recipeId: string;
  title: string;
  status: RecipePublishStatus;
  recipeKind?: RecipeKind | string | null;
  verificationStatus?: RecipeVerificationStatus | string | null;
  featured?: boolean;
};

export function OwnerRecipeRowActions({
  recipeId,
  title,
  status,
  recipeKind,
  verificationStatus,
  featured = false,
}: OwnerRecipeRowActionsProps) {
  const { t, dictionary } = useTranslations();
  const isOfficialLibrary =
    recipeKind === "official" || recipeKind === "competition" || recipeKind === "imported";

  return (
    <div className="flex flex-wrap items-center gap-4">
      {isOfficialLibrary ? (
        <>
          {verificationStatus !== "verified" && verificationStatus !== "competition_tested" ? (
            <form action={verifyOfficialRecipeFormAction} className="inline">
              <input type="hidden" name="recipeId" value={recipeId} />
              <input type="hidden" name="status" value="verified" />
              <button
                type="submit"
                className="text-xs font-medium text-emerald-400/90 underline-offset-4 hover:text-emerald-300 hover:underline"
              >
                Verify
              </button>
            </form>
          ) : null}
          <form action={duplicateOfficialRecipeFormAction} className="inline">
            <input type="hidden" name="recipeId" value={recipeId} />
            <button
              type="submit"
              className="text-xs font-medium text-stone-400 underline-offset-4 hover:text-amber-400/90 hover:underline"
            >
              Duplicate
            </button>
          </form>
          <form action={featureOfficialRecipeFormAction} className="inline">
            <input type="hidden" name="recipeId" value={recipeId} />
            <input type="hidden" name="featured" value={featured ? "0" : "1"} />
            <button
              type="submit"
              className="text-xs font-medium text-stone-400 underline-offset-4 hover:text-amber-400/90 hover:underline"
            >
              {featured ? "Unfeature" : "Feature"}
            </button>
          </form>
        </>
      ) : null}
      {status === "published" ? (
        <form action={quickOwnerRecipeWorkflowAction} className="inline">
          <input type="hidden" name="recipeId" value={recipeId} />
          <input type="hidden" name="publishIntent" value="unpublish" />
          <button
            type="submit"
            className="text-xs font-medium text-stone-400 underline-offset-4 hover:text-amber-400/90 hover:underline"
          >
            {t("ownerRecipePublishing.unpublishCta")}
          </button>
        </form>
      ) : status !== "archived" ? (
        <form action={quickOwnerRecipeWorkflowAction} className="inline">
          <input type="hidden" name="recipeId" value={recipeId} />
          <input type="hidden" name="publishIntent" value="publish" />
          <button
            type="submit"
            className="text-xs font-medium text-stone-400 underline-offset-4 hover:text-amber-400/90 hover:underline"
          >
            {t("ownerRecipePublishing.publishCta")}
          </button>
        </form>
      ) : (
        <form action={quickOwnerRecipeWorkflowAction} className="inline">
          <input type="hidden" name="recipeId" value={recipeId} />
          <input type="hidden" name="publishIntent" value="restore" />
          <button
            type="submit"
            className="text-xs font-medium text-stone-400 underline-offset-4 hover:text-amber-400/90 hover:underline"
          >
            {t("ownerRecipePublishing.restoreCta")}
          </button>
        </form>
      )}
      {status !== "archived" ? (
        <form
          action={quickOwnerRecipeWorkflowAction}
          className="inline"
          onSubmit={(event) => {
            if (!window.confirm(t("ownerRecipePublishing.archiveConfirmTemplate"))) {
              event.preventDefault();
            }
          }}
        >
          <input type="hidden" name="recipeId" value={recipeId} />
          <input type="hidden" name="publishIntent" value="archive" />
          <button
            type="submit"
            className="text-xs font-medium text-amber-300/80 underline-offset-4 hover:text-amber-300 hover:underline"
          >
            {t("ownerRecipePublishing.archiveCta")}
          </button>
        </form>
      ) : null}
      <form
        action={deleteOwnerRecipeAction}
        onSubmit={(event) => {
          if (!window.confirm(translate(dictionary, "ownerRecipesPage.deleteConfirmTemplate", { title }))) {
            event.preventDefault();
          }
        }}
      >
        <input type="hidden" name="recipeId" value={recipeId} />
        <button
          type="submit"
          className="text-xs font-medium text-red-400/80 underline-offset-4 transition-colors hover:text-red-400 hover:underline"
        >
          {t("common.delete")}
        </button>
      </form>
    </div>
  );
}

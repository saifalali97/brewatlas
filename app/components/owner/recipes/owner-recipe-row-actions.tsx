"use client";

import { deleteOwnerRecipeAction, quickOwnerRecipeWorkflowAction } from "@/lib/supabase/owner-recipe-actions";
import { useTranslations } from "@/lib/i18n/translation-context";
import { translate } from "@/lib/i18n/format";
import type { RecipePublishStatus } from "@/types/recipe-publishing";

type OwnerRecipeRowActionsProps = {
  recipeId: string;
  title: string;
  status: RecipePublishStatus;
};

export function OwnerRecipeRowActions({ recipeId, title, status }: OwnerRecipeRowActionsProps) {
  const { t, dictionary } = useTranslations();

  return (
    <div className="flex items-center gap-4">
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

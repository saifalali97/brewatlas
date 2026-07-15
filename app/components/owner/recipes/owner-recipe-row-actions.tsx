"use client";

import { deleteOwnerRecipeAction, toggleOwnerRecipePublishedAction } from "@/lib/supabase/owner-recipe-actions";
import { useTranslations } from "@/lib/i18n/translation-context";
import { translate } from "@/lib/i18n/format";

type OwnerRecipeRowActionsProps = {
  recipeId: string;
  title: string;
  published: boolean;
};

export function OwnerRecipeRowActions({ recipeId, title, published }: OwnerRecipeRowActionsProps) {
  const { t, dictionary } = useTranslations();

  return (
    <div className="flex items-center gap-4">
      <form
        action={toggleOwnerRecipePublishedAction}
        className="inline"
      >
        <input type="hidden" name="recipeId" value={recipeId} />
        <input type="hidden" name="published" value={published ? "false" : "true"} />
        <button
          type="submit"
          className="text-xs font-medium text-stone-400 underline-offset-4 hover:text-amber-400/90 hover:underline"
        >
          {published ? t("ownerRecipesPage.unpublishAction") : t("ownerRecipesPage.publishAction")}
        </button>
      </form>
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

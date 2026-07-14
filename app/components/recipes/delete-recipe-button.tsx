"use client";

import { deleteRecipeAction } from "@/lib/supabase/recipe-actions";
import { useTranslations } from "@/lib/i18n/translation-context";

type DeleteRecipeButtonProps = {
  recipeId: string;
  recipeTitle: string;
};

export function DeleteRecipeButton({ recipeId, recipeTitle }: DeleteRecipeButtonProps) {
  const { t } = useTranslations();
  return (
    <form
      action={deleteRecipeAction}
      onSubmit={(event) => {
        if (!window.confirm(t("recipes.deleteConfirmTemplate", { title: recipeTitle }))) {
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
  );
}

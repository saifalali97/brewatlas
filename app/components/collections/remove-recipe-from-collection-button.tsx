"use client";

import { useActionState } from "react";
import { FormMessage } from "@/app/components/auth/form-message";
import { useTranslations } from "@/lib/i18n/translation-context";
import { removeRecipeFromCollectionAction, type CollectionActionState } from "@/lib/supabase/collection-actions";

type RemoveRecipeFromCollectionButtonProps = {
  collectionId: string;
  recipeId: string;
};

export function RemoveRecipeFromCollectionButton({ collectionId, recipeId }: RemoveRecipeFromCollectionButtonProps) {
  const { t } = useTranslations();
  const [state, formAction, pending] = useActionState<CollectionActionState, FormData>(
    removeRecipeFromCollectionAction,
    undefined,
  );

  return (
    <form action={formAction} className="mt-3">
      <input type="hidden" name="collectionId" value={collectionId} />
      <input type="hidden" name="recipeId" value={recipeId} />
      <FormMessage error={state?.error} success={state?.success} />
      <button
        type="submit"
        disabled={pending}
        className="text-xs font-medium text-red-400/80 underline-offset-4 transition-colors hover:text-red-400 hover:underline disabled:opacity-70"
      >
        {pending ? t("collectionsPage.addingRecipeCta") : t("collectionsPage.removeRecipeCta")}
      </button>
    </form>
  );
}

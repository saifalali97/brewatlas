"use client";

import { useActionState } from "react";
import { FormMessage } from "@/app/components/auth/form-message";
import { buttons, forms } from "@/lib/constants/styles";
import { useTranslations } from "@/lib/i18n/translation-context";
import {
  addRecipeToCollectionAction,
  deleteCollectionAction,
  renameCollectionAction,
  type CollectionActionState,
} from "@/lib/supabase/collection-actions";
import type { LookupOption } from "@/types/recipe";

type CollectionManagePanelProps = {
  collectionId: string;
  initialName: string;
  availableRecipes: LookupOption[];
};

export function CollectionManagePanel({ collectionId, initialName, availableRecipes }: CollectionManagePanelProps) {
  const { t } = useTranslations();
  const [renameState, renameAction, renamePending] = useActionState<CollectionActionState, FormData>(
    renameCollectionAction,
    undefined,
  );
  const [addState, addAction, addPending] = useActionState<CollectionActionState, FormData>(
    addRecipeToCollectionAction,
    undefined,
  );
  const [deleteState, deleteAction, deletePending] = useActionState<CollectionActionState, FormData>(
    deleteCollectionAction,
    undefined,
  );

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-ac-espresso">{t("collectionsPage.renameSectionTitle")}</h2>
        <form action={renameAction} className="mt-5 space-y-5">
          <input type="hidden" name="collectionId" value={collectionId} />
          <div className="max-w-sm">
            <label htmlFor="renameCollectionName" className={forms.label}>
              {t("collectionsPage.nameLabel")}
            </label>
            <input
              id="renameCollectionName"
              name="name"
              type="text"
              required
              defaultValue={initialName}
              className={forms.input}
            />
          </div>
          <FormMessage error={renameState?.error} success={renameState?.success} />
          <button type="submit" disabled={renamePending} className={`${buttons.secondary} disabled:opacity-70 sm:w-auto`}>
            {renamePending ? t("collectionsPage.renamingCta") : t("collectionsPage.renameCta")}
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-ac-espresso">{t("collectionsPage.addRecipeSectionTitle")}</h2>
        <form action={addAction} className="mt-5 space-y-5">
          <input type="hidden" name="collectionId" value={collectionId} />
          <div className="max-w-sm">
            <label htmlFor="addRecipeId" className={forms.label}>
              {t("collectionsPage.addRecipeLabel")}
            </label>
            <select id="addRecipeId" name="recipeId" required className={forms.select}>
              <option value="">{t("profilePage.notSetOption")}</option>
              {availableRecipes.map((recipe) => (
                <option key={recipe.id} value={recipe.id}>
                  {recipe.name}
                </option>
              ))}
            </select>
          </div>
          <FormMessage error={addState?.error} success={addState?.success} />
          <button type="submit" disabled={addPending || availableRecipes.length === 0} className={`${buttons.primary} disabled:opacity-70 sm:w-auto`}>
            {addPending ? t("collectionsPage.addingRecipeCta") : t("collectionsPage.addRecipeCta")}
          </button>
        </form>
      </div>

      <form
        action={deleteAction}
        onSubmit={(event) => {
          if (!window.confirm(t("collectionsPage.deleteConfirmTemplate"))) {
            event.preventDefault();
          }
        }}
      >
        <input type="hidden" name="collectionId" value={collectionId} />
        <FormMessage error={deleteState?.error} success={deleteState?.success} />
        <button
          type="submit"
          disabled={deletePending}
          className="text-sm font-medium text-red-400/80 underline-offset-4 transition-colors hover:text-red-400 hover:underline disabled:opacity-70"
        >
          {deletePending ? t("collectionsPage.renamingCta") : t("collectionsPage.deleteCta")}
        </button>
      </form>
    </div>
  );
}

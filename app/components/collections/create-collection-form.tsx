"use client";

import { useActionState } from "react";
import { FormMessage } from "@/app/components/auth/form-message";
import { buttons, forms } from "@/lib/constants/styles";
import { useTranslations } from "@/lib/i18n/translation-context";
import { createCollectionAction, type CollectionActionState } from "@/lib/supabase/collection-actions";

type CreateCollectionFormProps = {
  canCreate: boolean;
};

export function CreateCollectionForm({ canCreate }: CreateCollectionFormProps) {
  const { t } = useTranslations();
  const [state, formAction, pending] = useActionState<CollectionActionState, FormData>(createCollectionAction, undefined);

  if (!canCreate) {
    return <p className="text-sm text-ac-espresso">{t("collectionsPage.limitReached")}</p>;
  }

  return (
    <form action={formAction} className="space-y-5">
      <div className="max-w-sm">
        <label htmlFor="collectionName" className={forms.label}>
          {t("collectionsPage.nameLabel")}
        </label>
        <input
          id="collectionName"
          name="name"
          type="text"
          required
          className={forms.input}
          placeholder={t("collectionsPage.namePlaceholder")}
        />
      </div>

      <FormMessage error={state?.error} success={state?.success} />

      <button type="submit" disabled={pending} className={`${buttons.primary} disabled:opacity-70 sm:w-auto`}>
        {pending ? t("collectionsPage.creatingCta") : t("collectionsPage.createCta")}
      </button>
    </form>
  );
}

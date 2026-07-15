"use client";

import { useState } from "react";
import { buttons, modal } from "@/lib/constants/styles";
import { translate } from "@/lib/i18n/format";
import { useTranslations } from "@/lib/i18n/translation-context";
import { restoreOwnerRecipeVersionAction } from "@/lib/supabase/owner-recipe-actions";

type OwnerRecipeRestoreModalProps = {
  recipeId: string;
  versionId: string;
  versionNumber: number;
  title: string;
};

export function OwnerRecipeRestoreModal({
  recipeId,
  versionId,
  versionNumber,
  title,
}: OwnerRecipeRestoreModalProps) {
  const { t, dictionary } = useTranslations();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-medium text-amber-400/90 underline-offset-4 hover:underline"
      >
        {t("ownerRecipePublishing.restoreVersionCta")}
      </button>

      {open ? (
        <div className={modal.overlay} onClick={() => setOpen(false)} role="presentation">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`restore-version-${versionId}`}
            className={modal.panel}
            onClick={(event) => event.stopPropagation()}
          >
            <div className={modal.header}>
              <h2 id={`restore-version-${versionId}`} className="text-lg font-semibold text-stone-100">
                {t("ownerRecipePublishing.restoreModalTitle")}
              </h2>
              <p className="mt-2 text-sm text-stone-500">
                {translate(dictionary, "ownerRecipePublishing.restoreModalDescriptionTemplate", {
                  version: String(versionNumber),
                  title,
                })}
              </p>
            </div>
            <div className={modal.footer}>
              <button type="button" onClick={() => setOpen(false)} className={`${buttons.secondary} h-10 px-4 text-xs`}>
                {t("common.cancel")}
              </button>
              <form action={restoreOwnerRecipeVersionAction}>
                <input type="hidden" name="recipeId" value={recipeId} />
                <input type="hidden" name="versionId" value={versionId} />
                <button type="submit" className={`${buttons.primary} h-10 px-4 text-xs`}>
                  {t("ownerRecipePublishing.confirmRestoreCta")}
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

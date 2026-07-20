"use client";

import { useActionState } from "react";
import { FormMessage } from "@/app/components/auth/form-message";
import { buttons, forms } from "@/lib/constants/styles";
import { useTranslations } from "@/lib/i18n/translation-context";
import {
  duplicateBrewSessionAction,
  importBrewSessionsAction,
  toggleBrewSessionFavoriteAction,
  type BrewSessionActionState,
} from "@/lib/supabase/brew-session-actions";

type BrewSessionRowActionsProps = {
  sessionId: string;
  favorite: boolean;
};

export function BrewSessionRowActions({ sessionId, favorite }: BrewSessionRowActionsProps) {
  const { t } = useTranslations();
  const l = (key: string) => t(`brewSessionsPage.${key}` as never);
  const [, duplicateAction] = useActionState<BrewSessionActionState, FormData>(duplicateBrewSessionAction, undefined);
  const [, favoriteAction] = useActionState<BrewSessionActionState, FormData>(toggleBrewSessionFavoriteAction, undefined);

  return (
    <div className="flex flex-wrap gap-3">
      <form action={duplicateAction}>
        <input type="hidden" name="sessionId" value={sessionId} />
        <button type="submit" className="text-xs text-ac-espresso underline-offset-2 hover:underline">{l("duplicateCta")}</button>
      </form>
      <form action={favoriteAction}>
        <input type="hidden" name="sessionId" value={sessionId} />
        <input type="hidden" name="favorite" value={favorite ? "false" : "true"} />
        <button type="submit" className="text-xs text-ac-espresso underline-offset-2 hover:underline">
          {favorite ? l("unfavoriteCta") : l("favoriteCta")}
        </button>
      </form>
    </div>
  );
}

type BrewSessionImportExportProps = {
  exportJson: string;
};

export function BrewSessionImportExport({ exportJson }: BrewSessionImportExportProps) {
  const { t } = useTranslations();
  const l = (key: string) => t(`brewSessionsPage.${key}` as never);
  const [importState, importAction, importPending] = useActionState<BrewSessionActionState, FormData>(
    importBrewSessionsAction,
    undefined,
  );

  return (
    <section className="mt-10 rounded-[1.5rem] border border-ba-espresso/10 bg-ba-pearl p-6">
      <h2 className="text-lg font-semibold text-ac-espresso">{l("importExportTitle")}</h2>
      <label className={`${forms.label} mt-4 block`}>
        JSON export
        <textarea readOnly value={exportJson} rows={6} className={`${forms.input} mt-2 font-mono text-xs`} />
      </label>
      <div className="mt-4 flex flex-wrap gap-3">
        <a href={`data:application/json;charset=utf-8,${encodeURIComponent(exportJson)}`} download="brew-sessions.json" className={buttons.secondary}>
          {l("exportJsonCta")}
        </a>
        <form action="/api/brew-sessions/export-csv" method="get">
          <button type="submit" className={buttons.secondary}>{l("exportCsvCta")}</button>
        </form>
      </div>
      <form action={importAction} className="mt-6 space-y-4">
        <label className={forms.label}>
          {l("importLabel")}
          <textarea name="importJson" rows={6} className={`${forms.input} font-mono text-xs`} placeholder='{"version": 1}' />
        </label>
        <FormMessage error={importState?.error} success={importState?.success} />
        <button type="submit" disabled={importPending} className={buttons.secondary}>
          {importPending ? l("savingCta") : l("importCta")}
        </button>
      </form>
    </section>
  );
}

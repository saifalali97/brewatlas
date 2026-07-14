"use client";

import Link from "next/link";
import { useActionState } from "react";
import { FormMessage } from "@/app/components/auth/form-message";
import { buttons, forms } from "@/lib/constants/styles";
import { useTranslations } from "@/lib/i18n/translation-context";
import {
  deleteBrewLogAction,
  logBrewAction,
  updateBrewLogAction,
  type BrewLogActionState,
} from "@/lib/supabase/brew-log-actions";
import type { LookupOption } from "@/types/recipe";

type BrewLogFormProps = {
  mode: "create" | "edit";
  brewLogId?: string;
  initialRecipeId: string;
  initialCoffeeName: string;
  initialGrinderId: string;
  initialGrindSize: string;
  initialWaterAmount: string;
  initialBrewTime: string;
  initialBrewedAt: string;
  initialBrewingDeviceId: string;
  initialBrewingMethodId: string;
  initialRating: string;
  initialNotes: string;
  initialIsFavorite: boolean;
  recipes: LookupOption[];
  grinders: LookupOption[];
  devices: LookupOption[];
  brewingMethods: LookupOption[];
};

const RATING_OPTIONS = ["1", "2", "3", "4", "5"] as const;

/** Brew log create/edit form — reuses `logBrewAction` / `updateBrewLogAction` / `deleteBrewLogAction`. */
export function BrewLogForm({
  mode,
  brewLogId,
  initialRecipeId,
  initialCoffeeName,
  initialGrinderId,
  initialGrindSize,
  initialWaterAmount,
  initialBrewTime,
  initialBrewedAt,
  initialBrewingDeviceId,
  initialBrewingMethodId,
  initialRating,
  initialNotes,
  initialIsFavorite,
  recipes,
  grinders,
  devices,
  brewingMethods,
}: BrewLogFormProps) {
  const { t } = useTranslations();
  const action = mode === "create" ? logBrewAction : updateBrewLogAction;
  const [state, formAction, pending] = useActionState<BrewLogActionState, FormData>(action, undefined);
  const [deleteState, deleteAction, deletePending] = useActionState<BrewLogActionState, FormData>(
    deleteBrewLogAction,
    undefined,
  );

  return (
    <div className="space-y-5">
      <form action={formAction} className="space-y-7">
        {mode === "edit" && brewLogId && <input type="hidden" name="brewLogId" value={brewLogId} />}

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="recipeId" className={forms.label}>
              {t("brewLogPage.recipeLabel")}
            </label>
            <select id="recipeId" name="recipeId" defaultValue={initialRecipeId} className={forms.select}>
              <option value="">{t("profilePage.notSetOption")}</option>
              {recipes.map((recipe) => (
                <option key={recipe.id} value={recipe.id}>
                  {recipe.name}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="coffeeName" className={forms.label}>
              {t("brewLogPage.coffeeLabel")}
            </label>
            <input
              id="coffeeName"
              name="coffeeName"
              type="text"
              defaultValue={initialCoffeeName}
              className={forms.input}
              placeholder={t("brewLogPage.coffeePlaceholder")}
            />
          </div>

          <div>
            <label htmlFor="grinderId" className={forms.label}>
              {t("brewLogPage.grinderLabel")}
            </label>
            <select id="grinderId" name="grinderId" defaultValue={initialGrinderId} className={forms.select}>
              <option value="">{t("profilePage.notSetOption")}</option>
              {grinders.map((grinder) => (
                <option key={grinder.id} value={grinder.id}>
                  {grinder.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="grindSize" className={forms.label}>
              {t("brewLogPage.grindSizeLabel")}
            </label>
            <input
              id="grindSize"
              name="grindSize"
              type="text"
              defaultValue={initialGrindSize}
              className={forms.input}
              placeholder={t("brewLogPage.grindSizePlaceholder")}
            />
          </div>

          <div>
            <label htmlFor="waterAmount" className={forms.label}>
              {t("brewLogPage.waterLabel")}
            </label>
            <input
              id="waterAmount"
              name="waterAmount"
              type="number"
              min="0"
              step="0.1"
              defaultValue={initialWaterAmount}
              className={forms.input}
              placeholder={t("brewLogPage.waterPlaceholder")}
            />
          </div>

          <div>
            <label htmlFor="brewTime" className={forms.label}>
              {t("brewLogPage.brewTimeLabel")}
            </label>
            <input
              id="brewTime"
              name="brewTime"
              type="text"
              defaultValue={initialBrewTime}
              className={forms.input}
              placeholder={t("brewLogPage.brewTimePlaceholder")}
            />
          </div>

          <div>
            <label htmlFor="brewedAt" className={forms.label}>
              {t("brewLogPage.brewedAtLabel")}
            </label>
            <input
              id="brewedAt"
              name="brewedAt"
              type="datetime-local"
              defaultValue={initialBrewedAt}
              className={forms.input}
            />
          </div>

          <div>
            <label htmlFor="brewingDeviceId" className={forms.label}>
              {t("brewLogPage.deviceLabel")}
            </label>
            <select
              id="brewingDeviceId"
              name="brewingDeviceId"
              defaultValue={initialBrewingDeviceId}
              className={forms.select}
            >
              <option value="">{t("profilePage.notSetOption")}</option>
              {devices.map((device) => (
                <option key={device.id} value={device.id}>
                  {device.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="brewingMethodId" className={forms.label}>
              {t("brewLogPage.methodLabel")}
            </label>
            <select
              id="brewingMethodId"
              name="brewingMethodId"
              defaultValue={initialBrewingMethodId}
              className={forms.select}
            >
              <option value="">{t("profilePage.notSetOption")}</option>
              {brewingMethods.map((method) => (
                <option key={method.id} value={method.id}>
                  {method.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="rating" className={forms.label}>
              {t("brewLogPage.ratingLabel")}
            </label>
            <select id="rating" name="rating" defaultValue={initialRating} className={forms.select}>
              <option value="">{t("profilePage.notSetOption")}</option>
              {RATING_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="notes" className={forms.label}>
              {t("brewLogPage.notesLabel")}
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={4}
              defaultValue={initialNotes}
              className={forms.input}
              placeholder={t("brewLogPage.notesPlaceholder")}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={forms.checkboxRow}>
              <input
                type="checkbox"
                name="isFavorite"
                defaultChecked={initialIsFavorite}
                className={forms.checkbox}
              />
              {t("brewLogPage.markFavoriteLabel")}
            </label>
          </div>
        </div>

        <FormMessage error={state?.error} success={state?.success} />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button type="submit" disabled={pending} className={`${buttons.primary} disabled:opacity-70 sm:w-auto`}>
            {pending
              ? mode === "create"
                ? t("brewLogPage.savingCta")
                : t("brewLogPage.updatingCta")
              : mode === "create"
                ? t("brewLogPage.saveCta")
                : t("brewLogPage.updateCta")}
          </button>

          <Link href="/dashboard/brew-history" className={`${buttons.secondary} sm:w-auto`}>
            {t("brewLogPage.backToHistory")}
          </Link>
        </div>
      </form>

      {mode === "edit" && brewLogId && (
        <form
          action={deleteAction}
          onSubmit={(event) => {
            if (!window.confirm(t("brewLogPage.deleteConfirmTemplate"))) {
              event.preventDefault();
            }
          }}
        >
          <input type="hidden" name="brewLogId" value={brewLogId} />
          <FormMessage error={deleteState?.error} success={deleteState?.success} />
          <button
            type="submit"
            disabled={deletePending}
            className="text-sm font-medium text-red-400/80 underline-offset-4 transition-colors hover:text-red-400 hover:underline disabled:opacity-70"
          >
            {deletePending ? t("brewLogPage.updatingCta") : t("brewLogPage.deleteCta")}
          </button>
        </form>
      )}
    </div>
  );
}

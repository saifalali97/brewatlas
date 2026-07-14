"use client";

import { useActionState } from "react";
import { FormMessage } from "@/app/components/auth/form-message";
import { buttons, forms } from "@/lib/constants/styles";
import { useTranslations } from "@/lib/i18n/translation-context";
import { deleteCoffeeSetupAction, saveCoffeeSetupAction, type CoffeeSetupActionState } from "@/lib/supabase/coffee-setup-actions";
import type { PreferredUnits } from "@/types/personal";
import type { LookupOption } from "@/types/recipe";

type CoffeeSetupFormProps = {
  initialGrinderId: string;
  initialBrewerDeviceId: string;
  initialXbloomDeviceId: string;
  initialEspressoMachine: string;
  initialKettle: string;
  initialScale: string;
  initialFilterTypeId: string;
  initialFavoriteMug: string;
  initialFavoriteServer: string;
  initialPreferredWaterProfileId: string;
  initialPreferredUnits: PreferredUnits | "";
  grinders: LookupOption[];
  devices: LookupOption[];
  xbloomDevices: LookupOption[];
  filterTypes: LookupOption[];
  waterProfiles: LookupOption[];
  hasSavedSetup: boolean;
};

/** "My Coffee Setup" equipment form -- reuses `saveCoffeeSetupAction`/`deleteCoffeeSetupAction` (`user_coffee_setups`). */
export function CoffeeSetupForm({
  initialGrinderId,
  initialBrewerDeviceId,
  initialXbloomDeviceId,
  initialEspressoMachine,
  initialKettle,
  initialScale,
  initialFilterTypeId,
  initialFavoriteMug,
  initialFavoriteServer,
  initialPreferredWaterProfileId,
  initialPreferredUnits,
  grinders,
  devices,
  xbloomDevices,
  filterTypes,
  waterProfiles,
  hasSavedSetup,
}: CoffeeSetupFormProps) {
  const { t } = useTranslations();
  const [saveState, saveAction, savePending] = useActionState<CoffeeSetupActionState, FormData>(
    saveCoffeeSetupAction,
    undefined,
  );
  const [clearState, clearAction, clearPending] = useActionState<CoffeeSetupActionState, FormData>(
    deleteCoffeeSetupAction,
    undefined,
  );

  return (
    <div className="space-y-5">
      <form action={saveAction} className="space-y-7">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="grinderId" className={forms.label}>
              {t("coffeeSetupPage.grinderLabel")}
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
            <label htmlFor="brewerDeviceId" className={forms.label}>
              {t("coffeeSetupPage.brewerLabel")}
            </label>
            <select id="brewerDeviceId" name="brewerDeviceId" defaultValue={initialBrewerDeviceId} className={forms.select}>
              <option value="">{t("profilePage.notSetOption")}</option>
              {devices.map((device) => (
                <option key={device.id} value={device.id}>
                  {device.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="xbloomDeviceId" className={forms.label}>
              {t("coffeeSetupPage.xbloomDeviceLabel")}
            </label>
            <select id="xbloomDeviceId" name="xbloomDeviceId" defaultValue={initialXbloomDeviceId} className={forms.select}>
              <option value="">{t("profilePage.notSetOption")}</option>
              {xbloomDevices.map((device) => (
                <option key={device.id} value={device.id}>
                  {device.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="espressoMachine" className={forms.label}>
              {t("coffeeSetupPage.espressoMachineLabel")}
            </label>
            <input
              id="espressoMachine"
              name="espressoMachine"
              type="text"
              defaultValue={initialEspressoMachine}
              className={forms.input}
              placeholder={t("coffeeSetupPage.espressoMachinePlaceholder")}
            />
          </div>

          <div>
            <label htmlFor="kettle" className={forms.label}>
              {t("coffeeSetupPage.kettleLabel")}
            </label>
            <input
              id="kettle"
              name="kettle"
              type="text"
              defaultValue={initialKettle}
              className={forms.input}
              placeholder={t("coffeeSetupPage.kettlePlaceholder")}
            />
          </div>

          <div>
            <label htmlFor="scale" className={forms.label}>
              {t("coffeeSetupPage.scaleLabel")}
            </label>
            <input
              id="scale"
              name="scale"
              type="text"
              defaultValue={initialScale}
              className={forms.input}
              placeholder={t("coffeeSetupPage.scalePlaceholder")}
            />
          </div>

          <div>
            <label htmlFor="filterTypeId" className={forms.label}>
              {t("coffeeSetupPage.filterTypeLabel")}
            </label>
            <select id="filterTypeId" name="filterTypeId" defaultValue={initialFilterTypeId} className={forms.select}>
              <option value="">{t("profilePage.notSetOption")}</option>
              {filterTypes.map((filterType) => (
                <option key={filterType.id} value={filterType.id}>
                  {filterType.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="preferredWaterProfileId" className={forms.label}>
              {t("coffeeSetupPage.waterProfileLabel")}
            </label>
            <select
              id="preferredWaterProfileId"
              name="preferredWaterProfileId"
              defaultValue={initialPreferredWaterProfileId}
              className={forms.select}
            >
              <option value="">{t("profilePage.notSetOption")}</option>
              {waterProfiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="favoriteMug" className={forms.label}>
              {t("coffeeSetupPage.favoriteMugLabel")}
            </label>
            <input
              id="favoriteMug"
              name="favoriteMug"
              type="text"
              defaultValue={initialFavoriteMug}
              className={forms.input}
              placeholder={t("coffeeSetupPage.favoriteMugPlaceholder")}
            />
          </div>

          <div>
            <label htmlFor="favoriteServer" className={forms.label}>
              {t("coffeeSetupPage.favoriteServerLabel")}
            </label>
            <input
              id="favoriteServer"
              name="favoriteServer"
              type="text"
              defaultValue={initialFavoriteServer}
              className={forms.input}
              placeholder={t("coffeeSetupPage.favoriteServerPlaceholder")}
            />
          </div>

          <div>
            <label htmlFor="preferredUnits" className={forms.label}>
              {t("coffeeSetupPage.preferredUnitsLabel")}
            </label>
            <select id="preferredUnits" name="preferredUnits" defaultValue={initialPreferredUnits} className={forms.select}>
              <option value="">{t("profilePage.notSetOption")}</option>
              <option value="metric">{t("coffeeSetupPage.unitsMetricOption")}</option>
              <option value="imperial">{t("coffeeSetupPage.unitsImperialOption")}</option>
            </select>
          </div>
        </div>

        <FormMessage error={saveState?.error} success={saveState?.success} />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <button type="submit" disabled={savePending} className={`${buttons.primary} disabled:opacity-70 sm:w-auto`}>
            {savePending ? t("coffeeSetupPage.savingCta") : t("coffeeSetupPage.saveCta")}
          </button>

          {hasSavedSetup && (
            <button
              type="submit"
              form="clear-coffee-setup-form"
              disabled={clearPending}
              className={`${buttons.secondary} disabled:opacity-70 sm:w-auto`}
            >
              {clearPending ? t("coffeeSetupPage.clearingCta") : t("coffeeSetupPage.clearCta")}
            </button>
          )}
        </div>
      </form>

      {hasSavedSetup && (
        <form id="clear-coffee-setup-form" action={clearAction}>
          <FormMessage error={clearState?.error} success={clearState?.success} />
        </form>
      )}
    </div>
  );
}

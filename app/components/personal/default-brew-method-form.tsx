"use client";

import { useActionState } from "react";
import { FormMessage } from "@/app/components/auth/form-message";
import { buttons, forms } from "@/lib/constants/styles";
import { useTranslations } from "@/lib/i18n/translation-context";
import { updateProfileAction, type ProfileActionState } from "@/lib/supabase/profile-actions";
import type { LookupOption } from "@/types/recipe";

type DefaultBrewMethodFormProps = {
  fullName: string;
  country: string;
  bio: string;
  favoriteDeviceId: string;
  initialFavoriteBrewingMethodId: string;
  brewingMethods: LookupOption[];
};

/**
 * "Default Brew Method" preference on the Coffee Setup page. Reuses the
 * existing `updateProfileAction` / `profiles.favorite_brewing_method_id`
 * (also editable on `/account/profile`) rather than duplicating it on
 * `user_coffee_setups` -- the other profile fields are carried as hidden
 * inputs so this focused form doesn't blank them out on submit.
 */
export function DefaultBrewMethodForm({
  fullName,
  country,
  bio,
  favoriteDeviceId,
  initialFavoriteBrewingMethodId,
  brewingMethods,
}: DefaultBrewMethodFormProps) {
  const { t } = useTranslations();
  const [state, formAction, pending] = useActionState<ProfileActionState, FormData>(updateProfileAction, undefined);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="fullName" value={fullName} />
      <input type="hidden" name="country" value={country} />
      <input type="hidden" name="bio" value={bio} />
      <input type="hidden" name="favoriteDeviceId" value={favoriteDeviceId} />

      <div className="max-w-sm">
        <label htmlFor="favoriteBrewingMethodId" className={forms.label}>
          {t("coffeeSetupPage.defaultBrewMethodLabel")}
        </label>
        <select
          id="favoriteBrewingMethodId"
          name="favoriteBrewingMethodId"
          defaultValue={initialFavoriteBrewingMethodId}
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

      <FormMessage error={state?.error} success={state?.success} />

      <button type="submit" disabled={pending} className={`${buttons.secondary} disabled:opacity-70 sm:w-auto`}>
        {pending ? t("profilePage.savingCta") : t("profilePage.saveProfileCta")}
      </button>
    </form>
  );
}

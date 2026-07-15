"use client";

import { useActionState } from "react";
import { FormMessage } from "@/app/components/auth/form-message";
import { buttons, forms } from "@/lib/constants/styles";
import { useTranslations } from "@/lib/i18n/translation-context";
import {
  updateCommunityFavoritesAction,
  type CommunityProfileActionState,
} from "@/lib/supabase/community-profile-actions";
import type { LookupOption } from "@/types/recipe";

type CommunityFavoritesFormProps = {
  initialOriginId: string;
  initialCoffeeId: string;
  initialRoasterId: string;
  initialGrinderId: string;
  initialOwnsXbloom: boolean;
  origins: LookupOption[];
  coffees: LookupOption[];
  roasters: LookupOption[];
  grinders: LookupOption[];
};

export function CommunityFavoritesForm({
  initialOriginId,
  initialCoffeeId,
  initialRoasterId,
  initialGrinderId,
  initialOwnsXbloom,
  origins,
  coffees,
  roasters,
  grinders,
}: CommunityFavoritesFormProps) {
  const { t } = useTranslations();
  const [state, formAction, pending] = useActionState<CommunityProfileActionState, FormData>(
    updateCommunityFavoritesAction,
    undefined,
  );

  return (
    <form action={formAction} className="mt-10 space-y-5 border-t border-white/[0.08] pt-10">
      <div>
        <h2 className="text-lg font-semibold text-stone-50">{t("profilePage.communityFavoritesTitle")}</h2>
        <p className="mt-1 text-sm text-stone-500">{t("profilePage.communityFavoritesDescription")}</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="favoriteOriginId" className={forms.label}>
            {t("profile.favoriteOrigin")}
          </label>
          <select id="favoriteOriginId" name="favoriteOriginId" defaultValue={initialOriginId} className={forms.select}>
            <option value="">{t("profilePage.notSetOption")}</option>
            {origins.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="favoriteCoffeeId" className={forms.label}>
            {t("profile.favoriteCoffee")}
          </label>
          <select id="favoriteCoffeeId" name="favoriteCoffeeId" defaultValue={initialCoffeeId} className={forms.select}>
            <option value="">{t("profilePage.notSetOption")}</option>
            {coffees.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="favoriteRoasterId" className={forms.label}>
            {t("profile.favoriteRoaster")}
          </label>
          <select id="favoriteRoasterId" name="favoriteRoasterId" defaultValue={initialRoasterId} className={forms.select}>
            <option value="">{t("profilePage.notSetOption")}</option>
            {roasters.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="favoriteGrinderId" className={forms.label}>
            {t("profile.favoriteGrinder")}
          </label>
          <select id="favoriteGrinderId" name="favoriteGrinderId" defaultValue={initialGrinderId} className={forms.select}>
            <option value="">{t("profilePage.notSetOption")}</option>
            {grinders.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label className={forms.checkboxRow}>
        <input type="checkbox" name="ownsXbloom" defaultChecked={initialOwnsXbloom} className={forms.checkbox} />
        {t("profile.ownsXbloom")}
      </label>

      <FormMessage error={state?.error} success={state?.success} />

      <button type="submit" disabled={pending} className={`${buttons.secondary} disabled:opacity-70`}>
        {pending ? t("profilePage.savingCta") : t("profilePage.saveCommunityFavoritesCta")}
      </button>
    </form>
  );
}

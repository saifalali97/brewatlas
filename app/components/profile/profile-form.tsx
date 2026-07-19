"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { FormMessage } from "@/app/components/auth/form-message";
import { buttons, forms } from "@/lib/constants/styles";
import { useTranslations } from "@/lib/i18n/translation-context";
import { updateProfileAction, type ProfileActionState } from "@/lib/supabase/profile-actions";
import type { LookupOption } from "@/types/recipe";

const inputClass = forms.input;
const selectClass = forms.select;
const labelClass = forms.label;

type ProfileFormProps = {
  initialFullName: string;
  initialCountry: string;
  initialBio: string;
  initialAvatarUrl: string | null;
  initialFavoriteBrewingMethodId: string;
  initialFavoriteDeviceId: string;
  initialProfileVisibility: "public" | "private";
  brewingMethods: LookupOption[];
  devices: LookupOption[];
};

export function ProfileForm({
  initialFullName,
  initialCountry,
  initialBio,
  initialAvatarUrl,
  initialFavoriteBrewingMethodId,
  initialFavoriteDeviceId,
  initialProfileVisibility,
  brewingMethods,
  devices,
}: ProfileFormProps) {
  const { t } = useTranslations();
  const [state, formAction, pending] = useActionState<ProfileActionState, FormData>(
    updateProfileAction,
    undefined,
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const displayAvatar = previewUrl ?? initialAvatarUrl;

  return (
    <form action={formAction} className="space-y-7">
      <div className="flex items-center gap-5">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-ba-espresso/12 bg-ba-sand/40">
          {displayAvatar ? (
            <Image
              src={displayAvatar}
              alt={t("profilePage.avatarAlt")}
              fill
              sizes="80px"
              className="object-cover"
              unoptimized={Boolean(previewUrl)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl font-medium text-ac-espresso">
              {initialFullName.charAt(0).toUpperCase() || "?"}
            </div>
          )}
        </div>
        <div>
          <label htmlFor="avatar" className={labelClass}>
            {t("profilePage.avatarLabel")}
          </label>
          <input
            id="avatar"
            name="avatar"
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={(event) => {
              const file = event.target.files?.[0];
              setPreviewUrl(file ? URL.createObjectURL(file) : null);
            }}
            className="mt-2 block text-sm text-ac-espresso file:mr-4 file:rounded-full file:border-0 file:bg-ba-sand/50 file:px-4 file:py-2 file:text-xs file:font-medium file:text-ac-espresso file:transition-colors hover:file:bg-ba-sand/70"
          />
          <p className="mt-1.5 text-xs text-ac-espresso">{t("profilePage.avatarHint")}</p>
        </div>
      </div>

      <div>
        <label htmlFor="fullName" className={labelClass}>
          {t("profile.displayName")}
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          required
          defaultValue={initialFullName}
          className={inputClass}
          placeholder={t("auth.namePlaceholder")}
        />
      </div>

      <div>
        <label htmlFor="country" className={labelClass}>
          {t("profile.country")}
        </label>
        <input
          id="country"
          name="country"
          type="text"
          defaultValue={initialCountry}
          className={inputClass}
          placeholder={t("profilePage.countryPlaceholder")}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="favoriteBrewingMethodId" className={labelClass}>
            {t("profile.favoriteBrewMethod")}
          </label>
          <select
            id="favoriteBrewingMethodId"
            name="favoriteBrewingMethodId"
            defaultValue={initialFavoriteBrewingMethodId}
            className={selectClass}
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
          <label htmlFor="favoriteDeviceId" className={labelClass}>
            {t("profilePage.favoriteDeviceLabel")}
          </label>
          <select
            id="favoriteDeviceId"
            name="favoriteDeviceId"
            defaultValue={initialFavoriteDeviceId}
            className={selectClass}
          >
            <option value="">{t("profilePage.notSetOption")}</option>
            {devices.map((device) => (
              <option key={device.id} value={device.id}>
                {device.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="bio" className={labelClass}>
          {t("profile.bio")}
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          defaultValue={initialBio}
          className={inputClass}
          placeholder={t("profilePage.bioPlaceholder")}
        />
      </div>

      <div>
        <label htmlFor="profileVisibility" className={labelClass}>
          {t("profilePage.visibilityLabel")}
        </label>
        <select
          id="profileVisibility"
          name="profileVisibility"
          defaultValue={initialProfileVisibility}
          className={selectClass}
        >
          <option value="public">{t("profilePage.visibilityPublic")}</option>
          <option value="private">{t("profilePage.visibilityPrivate")}</option>
        </select>
        <p className="mt-1.5 text-xs text-ac-espresso">{t("profilePage.visibilityHint")}</p>
      </div>

      <FormMessage error={state?.error} success={state?.success} />

      <button type="submit" disabled={pending} className={`${buttons.primary} w-full disabled:opacity-70 sm:w-auto`}>
        {pending ? t("profilePage.savingCta") : t("profilePage.saveProfileCta")}
      </button>
    </form>
  );
}

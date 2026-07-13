"use client";

import Image from "next/image";
import { useActionState, useState } from "react";
import { FormMessage } from "@/app/components/auth/form-message";
import { buttons } from "@/lib/constants/styles";
import { updateProfileAction, type ProfileActionState } from "@/lib/supabase/profile-actions";
import type { LookupOption } from "@/types/recipe";

const inputClass =
  "mt-2 w-full rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-3 text-sm text-stone-100 outline-none transition-colors duration-300 placeholder:text-stone-500 focus:border-amber-500/45";

const selectClass = `${inputClass} appearance-none`;

const labelClass = "text-sm font-medium text-stone-300";

type ProfileFormProps = {
  initialFullName: string;
  initialCountry: string;
  initialBio: string;
  initialAvatarUrl: string | null;
  initialFavoriteBrewingMethodId: string;
  initialFavoriteDeviceId: string;
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
  brewingMethods,
  devices,
}: ProfileFormProps) {
  const [state, formAction, pending] = useActionState<ProfileActionState, FormData>(
    updateProfileAction,
    undefined,
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const displayAvatar = previewUrl ?? initialAvatarUrl;

  return (
    <form action={formAction} className="space-y-7">
      <div className="flex items-center gap-5">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-white/[0.12] bg-white/[0.04]">
          {displayAvatar ? (
            <Image
              src={displayAvatar}
              alt="Profile avatar"
              fill
              sizes="80px"
              className="object-cover"
              unoptimized={Boolean(previewUrl)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-2xl font-medium text-stone-500">
              {initialFullName.charAt(0).toUpperCase() || "?"}
            </div>
          )}
        </div>
        <div>
          <label htmlFor="avatar" className={labelClass}>
            Avatar
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
            className="mt-2 block text-sm text-stone-400 file:mr-4 file:rounded-full file:border-0 file:bg-white/[0.08] file:px-4 file:py-2 file:text-xs file:font-medium file:text-stone-100 file:transition-colors hover:file:bg-white/[0.12]"
          />
          <p className="mt-1.5 text-xs text-stone-500">PNG, JPEG, WebP, or GIF. Max 4MB.</p>
        </div>
      </div>

      <div>
        <label htmlFor="fullName" className={labelClass}>
          Display name
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          required
          defaultValue={initialFullName}
          className={inputClass}
          placeholder="Jane Doe"
        />
      </div>

      <div>
        <label htmlFor="country" className={labelClass}>
          Country
        </label>
        <input
          id="country"
          name="country"
          type="text"
          defaultValue={initialCountry}
          className={inputClass}
          placeholder="United Arab Emirates"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="favoriteBrewingMethodId" className={labelClass}>
            Favorite brew method
          </label>
          <select
            id="favoriteBrewingMethodId"
            name="favoriteBrewingMethodId"
            defaultValue={initialFavoriteBrewingMethodId}
            className={selectClass}
          >
            <option value="">Not set</option>
            {brewingMethods.map((method) => (
              <option key={method.id} value={method.id}>
                {method.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="favoriteDeviceId" className={labelClass}>
            Favorite device
          </label>
          <select
            id="favoriteDeviceId"
            name="favoriteDeviceId"
            defaultValue={initialFavoriteDeviceId}
            className={selectClass}
          >
            <option value="">Not set</option>
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
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          rows={4}
          defaultValue={initialBio}
          className={inputClass}
          placeholder="Tell the community about your coffee journey…"
        />
      </div>

      <FormMessage error={state?.error} success={state?.success} />

      <button type="submit" disabled={pending} className={`${buttons.primary} w-full disabled:opacity-70 sm:w-auto`}>
        {pending ? "Saving…" : "Save Profile"}
      </button>
    </form>
  );
}

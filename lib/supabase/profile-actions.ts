"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { translate } from "@/lib/i18n/format";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { createClient } from "@/lib/supabase/server";

export type ProfileActionState = { error?: string; success?: string } | undefined;

const MAX_AVATAR_BYTES = 4 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = new Set(["image/png", "image/jpeg", "image/webp", "image/gif"]);

function optionalString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function updateProfileAction(
  _prevState: ProfileActionState,
  formData: FormData,
): Promise<ProfileActionState> {
  const supabase = await createClient();
  const dictionary = await getDictionary(await getLocale());
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    redirect("/login?redirectTo=/account/profile");
  }

  const fullName = optionalString(formData, "fullName");
  if (!fullName) {
    return { error: dictionary.profilePage.displayNameRequired };
  }

  const updates: Record<string, unknown> = {
    full_name: fullName,
    country: optionalString(formData, "country"),
    bio: optionalString(formData, "bio"),
    favorite_brewing_method_id: optionalString(formData, "favoriteBrewingMethodId"),
    favorite_device_id: optionalString(formData, "favoriteDeviceId"),
  };

  const avatarFile = formData.get("avatar");
  if (avatarFile instanceof File && avatarFile.size > 0) {
    if (avatarFile.size > MAX_AVATAR_BYTES) {
      return { error: dictionary.profilePage.avatarTooLarge };
    }
    if (!ALLOWED_AVATAR_TYPES.has(avatarFile.type)) {
      return { error: dictionary.profilePage.avatarInvalidType };
    }

    const extension = avatarFile.type.split("/")[1] ?? "png";
    const path = `${authData.user.id}/avatar.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, avatarFile, { upsert: true, contentType: avatarFile.type });

    if (uploadError) {
      return {
        error: translate(dictionary, "profilePage.uploadAvatarFailedTemplate", { message: uploadError.message }),
      };
    }

    const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(path);
    // Cache-bust so the new avatar shows up immediately even though the
    // storage path itself didn't change.
    updates.avatar_url = `${publicUrlData.publicUrl}?updated=${Date.now()}`;
  }

  const { error } = await supabase.from("profiles").update(updates).eq("id", authData.user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/account");
  revalidatePath("/account/profile");
  revalidatePath("/account/coffee-setup");
  return { success: dictionary.profilePage.profileUpdated };
}

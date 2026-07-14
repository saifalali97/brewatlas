"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { evaluateAndAwardBadges } from "@/lib/data/community";
import { createClient } from "@/lib/supabase/server";

/**
 * Server Action for the Coffee Community public-profile fields that go
 * beyond `updateProfileAction` (`lib/supabase/profile-actions.ts`):
 * favorite origin/coffee/roaster/grinder and xBloom ownership. Kept
 * separate so the existing profile form/action is untouched.
 */

export type CommunityProfileActionState = { error?: string; success?: string } | undefined;

function optionalString(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function updateCommunityFavoritesAction(
  _prevState: CommunityProfileActionState,
  formData: FormData,
): Promise<CommunityProfileActionState> {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    redirect("/login?redirectTo=/dashboard/profile");
  }

  const ownsXbloom = formData.get("ownsXbloom") === "on" || formData.get("ownsXbloom") === "true";

  const { error } = await supabase
    .from("profiles")
    .update({
      favorite_origin_id: optionalString(formData, "favoriteOriginId"),
      favorite_coffee_id: optionalString(formData, "favoriteCoffeeId"),
      favorite_roaster_id: optionalString(formData, "favoriteRoasterId"),
      favorite_grinder_id: optionalString(formData, "favoriteGrinderId"),
      owns_xbloom: ownsXbloom,
    })
    .eq("id", authData.user.id);

  if (error) {
    return { error: error.message };
  }

  // Setting owns_xbloom = true can immediately qualify the "xBloom Owner" badge.
  await evaluateAndAwardBadges(supabase, authData.user.id);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profile");
  return { success: "Community profile updated." };
}

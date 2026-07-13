import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { ProfileForm } from "@/app/components/profile/profile-form";
import { getBrewingMethodOptions, getDeviceOptions } from "@/lib/data/db-recipes";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/supabase/profile";
import type { ProfileRow } from "@/types/recipe";

export const metadata: Metadata = {
  title: "Edit Profile",
  description: "Update your BrewAtlas profile: display name, avatar, country, and brewing preferences.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "/dashboard/profile",
  },
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    redirect("/login?redirectTo=/dashboard/profile");
  }

  await ensureProfile(supabase, authData.user);

  const [{ data: profile }, brewingMethods, devices] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, avatar_url, country, role, bio, favorite_brewing_method_id, favorite_device_id, created_at")
      .eq("id", authData.user.id)
      .maybeSingle(),
    getBrewingMethodOptions(supabase),
    getDeviceOptions(supabase),
  ]);

  const typedProfile = profile as ProfileRow | null;

  return (
    <SectionFrame id="profile-page" ariaLabelledBy="profile-page-heading" padding="compact">
      <PageHeader
        eyebrow="Your Account"
        title="Edit Profile"
        description="Personalize your BrewAtlas presence: your name, avatar, and brewing preferences."
        centered={false}
      />

      <div className="max-w-2xl rounded-[1.5rem] border border-white/[0.1] bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-white/[0.01] p-6 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.48)] backdrop-blur-2xl sm:p-8">
        <ProfileForm
          initialFullName={typedProfile?.full_name ?? ""}
          initialCountry={typedProfile?.country ?? ""}
          initialBio={typedProfile?.bio ?? ""}
          initialAvatarUrl={typedProfile?.avatar_url ?? null}
          initialFavoriteBrewingMethodId={typedProfile?.favorite_brewing_method_id ?? ""}
          initialFavoriteDeviceId={typedProfile?.favorite_device_id ?? ""}
          brewingMethods={brewingMethods}
          devices={devices}
        />
      </div>
    </SectionFrame>
  );
}

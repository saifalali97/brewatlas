import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { ProfileForm } from "@/app/components/profile/profile-form";
import { CommunityFavoritesForm } from "@/app/components/profile/community-favorites-form";
import { ProfileEngagementPanel } from "@/app/components/profile/profile-engagement-panel";
import {
  getBrewingMethodOptions,
  getCoffeeOptions,
  getDeviceOptions,
  getGrinderOptions,
  getOriginOptions,
  getRoasterOptions,
} from "@/lib/data/db-recipes";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/supabase/profile";
import { buttons } from "@/lib/constants/styles";
import type { ProfileRow } from "@/types/recipe";
import type { ProfileVisibility } from "@/types/community";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    pathname: "/account/profile",
    locale,
    title: dictionary.metadata.profileTitle,
    description: dictionary.metadata.profileDescription,
    noIndex: true,
  });
}

export default async function ProfilePage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const p = dictionary.profilePage;
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    redirect("/login?redirectTo=/account/profile");
  }

  await ensureProfile(supabase, authData.user);

  const [
    { data: profile },
    brewingMethods,
    devices,
    origins,
    coffees,
    roasters,
    grinders,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "id, full_name, avatar_url, country, role, bio, favorite_brewing_method_id, favorite_device_id, favorite_origin_id, favorite_coffee_id, favorite_roaster_id, favorite_grinder_id, owns_xbloom, profile_visibility, created_at",
      )
      .eq("id", authData.user.id)
      .maybeSingle(),
    getBrewingMethodOptions(supabase),
    getDeviceOptions(supabase),
    getOriginOptions(supabase),
    getCoffeeOptions(supabase),
    getRoasterOptions(supabase),
    getGrinderOptions(supabase),
  ]);

  const typedProfile = profile as (ProfileRow & {
    favorite_origin_id?: string | null;
    favorite_coffee_id?: string | null;
    favorite_roaster_id?: string | null;
    favorite_grinder_id?: string | null;
    owns_xbloom?: boolean;
    profile_visibility?: ProfileVisibility;
  }) | null;

  return (
    <SectionFrame id="profile-page" ariaLabelledBy="profile-page-heading" padding="compact">
      
<div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader headingId="profile-page-heading" eyebrow={p.eyebrow} title={p.title} description={p.description} centered={false} />
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
          <Link href="/account/security" className={`${buttons.secondary} text-sm`}>
            {dictionary.dashboardPage.securityLabel}
          </Link>
          <Link href={`/users/${authData.user.id}`} className={`${buttons.secondary} text-sm`}>
            {p.viewPublicProfileCta}
          </Link>
        </div>
      </div>

      <div className="max-w-2xl rounded-[1.5rem] border border-ba-espresso/10 bg-ba-pearl p-6 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.48)] backdrop-blur-2xl sm:p-8">
        <ProfileForm
          initialFullName={typedProfile?.full_name ?? ""}
          initialCountry={typedProfile?.country ?? ""}
          initialBio={typedProfile?.bio ?? ""}
          initialAvatarUrl={typedProfile?.avatar_url ?? null}
          initialFavoriteBrewingMethodId={typedProfile?.favorite_brewing_method_id ?? ""}
          initialFavoriteDeviceId={typedProfile?.favorite_device_id ?? ""}
          initialProfileVisibility={typedProfile?.profile_visibility ?? "public"}
          brewingMethods={brewingMethods}
          devices={devices}
        />

        <CommunityFavoritesForm
          initialOriginId={typedProfile?.favorite_origin_id ?? ""}
          initialCoffeeId={typedProfile?.favorite_coffee_id ?? ""}
          initialRoasterId={typedProfile?.favorite_roaster_id ?? ""}
          initialGrinderId={typedProfile?.favorite_grinder_id ?? ""}
          initialOwnsXbloom={Boolean(typedProfile?.owns_xbloom)}
          origins={origins}
          coffees={coffees}
          roasters={roasters}
          grinders={grinders}
        />
      </div>

      <ProfileEngagementPanel supabase={supabase} userId={authData.user.id} dictionary={dictionary} />
    </SectionFrame>
  );
}

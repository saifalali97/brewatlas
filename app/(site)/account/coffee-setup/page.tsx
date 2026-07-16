import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CoffeeSetupForm } from "@/app/components/personal/coffee-setup-form";
import { DefaultBrewMethodForm } from "@/app/components/personal/default-brew-method-form";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import {
  getBrewingMethodOptions,
  getDeviceOptions,
  getFilterTypeOptions,
  getGrinderOptions,
  getWaterProfileOptions,
} from "@/lib/data/db-recipes";
import { getCoffeeSetup } from "@/lib/data/personal";
import { getXBloomDeviceOptions } from "@/lib/data/xbloom";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/supabase/profile";
import type { ProfileRow } from "@/types/recipe";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    pathname: "/account/coffee-setup",
    locale,
    title: dictionary.metadata.coffeeSetupTitle,
    description: dictionary.metadata.coffeeSetupDescription,
    noIndex: true,
  });
}

export default async function CoffeeSetupPage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const c = dictionary.coffeeSetupPage;
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    redirect("/login?redirectTo=/account/coffee-setup");
  }

  await ensureProfile(supabase, authData.user);

  const [{ data: profile }, coffeeSetup, grinders, devices, xbloomDevices, filterTypes, waterProfiles, brewingMethods] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("id, full_name, avatar_url, country, role, bio, favorite_brewing_method_id, favorite_device_id, created_at")
        .eq("id", authData.user.id)
        .maybeSingle(),
      getCoffeeSetup(supabase, authData.user.id),
      getGrinderOptions(supabase),
      getDeviceOptions(supabase),
      getXBloomDeviceOptions(supabase),
      getFilterTypeOptions(supabase),
      getWaterProfileOptions(supabase),
      getBrewingMethodOptions(supabase),
    ]);

  const typedProfile = profile as ProfileRow | null;

  return (
    <SectionFrame id="coffee-setup-page" ariaLabelledBy="coffee-setup-page-heading" padding="compact">
<PageHeader headingId="coffee-setup-page-heading" eyebrow={c.eyebrow} title={c.title} description={c.description} centered={false} />

      <div className="max-w-2xl space-y-8">
        <div className="rounded-[1.5rem] border border-white/[0.1] bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-white/[0.01] p-6 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.48)] backdrop-blur-2xl sm:p-8">
          <h2 className="text-lg font-semibold text-stone-50">{c.equipmentSectionTitle}</h2>
          <p className="mt-1.5 text-sm text-stone-500">{c.equipmentSectionDescription}</p>

          <div className="mt-7">
            <CoffeeSetupForm
              initialGrinderId={coffeeSetup?.grinderId ?? ""}
              initialBrewerDeviceId={coffeeSetup?.brewerDeviceId ?? ""}
              initialXbloomDeviceId={coffeeSetup?.xbloomDeviceId ?? ""}
              initialEspressoMachine={coffeeSetup?.espressoMachine ?? ""}
              initialKettle={coffeeSetup?.kettle ?? ""}
              initialScale={coffeeSetup?.scale ?? ""}
              initialFilterTypeId={coffeeSetup?.filterTypeId ?? ""}
              initialFavoriteMug={coffeeSetup?.favoriteMug ?? ""}
              initialFavoriteServer={coffeeSetup?.favoriteServer ?? ""}
              initialPreferredWaterProfileId={coffeeSetup?.preferredWaterProfileId ?? ""}
              initialPreferredUnits={coffeeSetup?.preferredUnits ?? ""}
              grinders={grinders}
              devices={devices}
              xbloomDevices={xbloomDevices}
              filterTypes={filterTypes}
              waterProfiles={waterProfiles}
              hasSavedSetup={Boolean(coffeeSetup)}
            />
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-white/[0.1] bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-white/[0.01] p-6 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.48)] backdrop-blur-2xl sm:p-8">
          <h2 className="text-lg font-semibold text-stone-50">{c.preferencesSectionTitle}</h2>
          <p className="mt-1.5 text-sm text-stone-500">{c.preferencesSectionDescription}</p>

          <div className="mt-7">
            <DefaultBrewMethodForm
              fullName={typedProfile?.full_name || authData.user.email || ""}
              country={typedProfile?.country ?? ""}
              bio={typedProfile?.bio ?? ""}
              favoriteDeviceId={typedProfile?.favorite_device_id ?? ""}
              initialFavoriteBrewingMethodId={typedProfile?.favorite_brewing_method_id ?? ""}
              brewingMethods={brewingMethods}
            />
          </div>
        </div>
      </div>
    </SectionFrame>
  );
}

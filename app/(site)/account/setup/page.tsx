import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { BrewingSetupExplorer } from "@/app/components/personal/brewing-setup-explorer";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import {
  getBrewingMethodOptions,
  getDeviceOptions,
  getFilterTypeOptions,
  getGrinderOptions,
  getWaterProfileOptions,
} from "@/lib/data/db-recipes";
import { ensureUserBrewingProfile, getUserBrewingSetup } from "@/lib/data/brewing-setup";
import { getXBloomDeviceOptions } from "@/lib/data/xbloom";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/supabase/profile";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    pathname: "/account/setup",
    locale,
    title: dictionary.metadata.brewingSetupTitle,
    description: dictionary.metadata.brewingSetupDescription,
    noIndex: true,
  });
}

export default async function BrewingSetupPage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const labels = dictionary.brewingSetupPage;
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();

  if (!authData.user) {
    redirect("/login?redirectTo=/account/setup");
  }

  await ensureProfile(supabase, authData.user);
  await ensureUserBrewingProfile(supabase, authData.user.id);

  const [
    setup,
    grinders,
    devices,
    xbloomDevices,
    filterTypes,
    waterProfiles,
    brewingMethods,
    originsRes,
    coffeesRes,
  ] = await Promise.all([
    getUserBrewingSetup(supabase, authData.user.id),
    getGrinderOptions(supabase),
    getDeviceOptions(supabase),
    getXBloomDeviceOptions(supabase),
    getFilterTypeOptions(supabase),
    getWaterProfileOptions(supabase),
    getBrewingMethodOptions(supabase),
    supabase.from("origins").select("id, country, region").order("country").order("region"),
    supabase.from("coffees").select("process, roast_level").limit(500),
  ]);

  const origins = (originsRes.data ?? []).map((row) => ({
    id: row.id as string,
    label: `${row.region as string}, ${row.country as string}`,
  }));

  const roastLevels = [...new Set((coffeesRes.data ?? []).map((row) => row.roast_level).filter(Boolean))] as string[];
  const processes = [...new Set((coffeesRes.data ?? []).map((row) => row.process).filter(Boolean))] as string[];

  return (
    <SectionFrame id="brewing-setup-page" ariaLabelledBy="brewing-setup-page-heading" padding="compact" wide>
      <PageHeader
        headingId="brewing-setup-page-heading"
        eyebrow={labels.eyebrow}
        title={labels.title}
        description={labels.description}
        centered={false}
      />
      <BrewingSetupExplorer
        setup={setup}
        grinders={grinders}
        devices={devices}
        xbloomDevices={xbloomDevices}
        filterTypes={filterTypes}
        waterProfiles={waterProfiles}
        brewingMethods={brewingMethods}
        origins={origins}
        roastLevels={roastLevels.sort()}
        processes={processes.sort()}
      />
    </SectionFrame>
  );
}

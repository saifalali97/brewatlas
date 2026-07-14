import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Cpu, Thermometer } from "lucide-react";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { GhostCtaLink } from "@/app/components/ui/ghost-cta-link";
import { getUserXBloomProfiles } from "@/lib/data/xbloom";
import { translate } from "@/lib/i18n/format";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    pathname: "/dashboard/xbloom",
    locale,
    title: dictionary.metadata.xbloomDashboardTitle,
    description: dictionary.metadata.xbloomDashboardDescription,
    noIndex: true,
  });
}

export default async function DashboardXBloomPage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const x = dictionary.xbloomDashboardPage;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login?redirectTo=/dashboard/xbloom");
  }

  const profiles = await getUserXBloomProfiles(supabase, data.user.id);

  return (
    <SectionFrame id="dashboard-xbloom-page" ariaLabelledBy="dashboard-xbloom-page-heading" padding="compact">
      <PageHeader eyebrow={x.eyebrow} title={x.title} description={x.description} centered={false} />

      {profiles.length === 0 ? (
        <div className="rounded-[1.5rem] border border-white/[0.09] bg-white/[0.03] px-8 py-16 text-center">
          <p className="text-lg font-medium text-stone-100">{x.noProfilesTitle}</p>
          <p className="mt-2 text-sm text-stone-500">{x.noProfilesDescription}</p>
          <div className="mt-6 flex justify-center">
            <GhostCtaLink href="/devices/xbloom" autoWidth>
              {x.learnAboutXbloom}
            </GhostCtaLink>
          </div>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-white/[0.09] bg-white/[0.03]">
          <ul className="divide-y divide-white/[0.07]">
            {profiles.map((profile) => (
              <li key={profile.id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
                <div>
                  <div className="flex items-center gap-2.5">
                    <Cpu className="h-3.5 w-3.5 text-amber-500/80" aria-hidden />
                    <Link
                      href={`/recipes/${profile.recipeSlug}`}
                      className="font-medium text-stone-100 underline-offset-4 hover:text-amber-400/90 hover:underline"
                    >
                      {profile.recipeTitle}
                    </Link>
                  </div>
                  <p className="mt-1 text-sm text-stone-500">
                    {profile.deviceModel ?? "xBloom"}
                    {profile.dose !== null
                      ? ` · ${translate(dictionary, "xbloomDashboardPage.doseSuffixTemplate", { dose: profile.dose })}`
                      : ""}
                  </p>
                </div>
                {profile.waterTemperature !== null && (
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-amber-400/90">
                    <Thermometer className="h-3.5 w-3.5" aria-hidden />
                    {profile.waterTemperature}°C
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </SectionFrame>
  );
}

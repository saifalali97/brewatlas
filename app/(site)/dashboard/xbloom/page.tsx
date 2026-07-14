import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Cpu, Thermometer } from "lucide-react";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { GhostCtaLink } from "@/app/components/ui/ghost-cta-link";
import { getUserXBloomProfiles } from "@/lib/data/xbloom";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "xBloom Profiles",
  description: "The xBloom brewing profiles attached to the recipes you've created on BrewAtlas.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "/dashboard/xbloom",
  },
};

export default async function DashboardXBloomPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login?redirectTo=/dashboard/xbloom");
  }

  const profiles = await getUserXBloomProfiles(supabase, data.user.id);

  return (
    <SectionFrame id="dashboard-xbloom-page" ariaLabelledBy="dashboard-xbloom-page-heading" padding="compact">
      <PageHeader
        eyebrow="Smart Brewing"
        title="xBloom Profiles"
        description="The xBloom brewing profiles saved to the recipes you've authored — dose, temperature, pulse pattern, and pour sequence."
        centered={false}
      />

      {profiles.length === 0 ? (
        <div className="rounded-[1.5rem] border border-white/[0.09] bg-white/[0.03] px-8 py-16 text-center">
          <p className="text-lg font-medium text-stone-100">No xBloom profiles yet</p>
          <p className="mt-2 text-sm text-stone-500">
            xBloom profiles attached to recipes you create will appear here.
          </p>
          <div className="mt-6 flex justify-center">
            <GhostCtaLink href="/devices/xbloom" autoWidth>
              Learn about xBloom
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
                    {profile.dose !== null ? ` · ${profile.dose}g dose` : ""}
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

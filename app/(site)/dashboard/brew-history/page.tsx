import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Heart, Star } from "lucide-react";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { getBrewLogs } from "@/lib/data/personal";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Brew History",
  description: "Your logged brews on BrewAtlas — recipe, device, method, rating, and notes.",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: "/dashboard/brew-history",
  },
};

function formatBrewedAt(value: string): string {
  return new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default async function DashboardBrewHistoryPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login?redirectTo=/dashboard/brew-history");
  }

  const brewLogs = await getBrewLogs(supabase, data.user.id);

  return (
    <SectionFrame id="dashboard-brew-history-page" ariaLabelledBy="dashboard-brew-history-page-heading" padding="compact">
      <PageHeader
        eyebrow="Brewing History"
        title="Brew History"
        description="Every brew you've logged on BrewAtlas, most recent first."
        centered={false}
      />

      {brewLogs.length === 0 ? (
        <div className="rounded-[1.5rem] border border-white/[0.09] bg-white/[0.03] px-8 py-16 text-center">
          <p className="text-lg font-medium text-stone-100">No brews logged yet</p>
          <p className="mt-2 text-sm text-stone-500">
            Log a brew from any recipe to start building your brewing history here.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-white/[0.09] bg-white/[0.03]">
          <ul className="divide-y divide-white/[0.07]">
            {brewLogs.map((log) => (
              <li key={log.id} className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
                <div>
                  <div className="flex items-center gap-2.5">
                    {log.recipeSlug ? (
                      <Link
                        href={`/recipes/${log.recipeSlug}`}
                        className="font-medium text-stone-100 underline-offset-4 hover:text-amber-400/90 hover:underline"
                      >
                        {log.recipeTitle ?? "Untitled Recipe"}
                      </Link>
                    ) : (
                      <p className="font-medium text-stone-100">{log.recipeTitle ?? "Freeform Brew"}</p>
                    )}
                    {log.isFavorite && <Heart className="h-3.5 w-3.5 fill-amber-500/80 text-amber-500/80" aria-hidden />}
                  </div>
                  <p className="mt-1 text-sm text-stone-500">
                    {formatBrewedAt(log.brewedAt)}
                    {log.brewingMethodName ? ` · ${log.brewingMethodName}` : ""}
                    {log.brewingDeviceName ? ` · ${log.brewingDeviceName}` : ""}
                  </p>
                  {log.notes && <p className="mt-1.5 max-w-xl text-sm text-stone-400">{log.notes}</p>}
                </div>
                {log.rating !== null && (
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-amber-400/90">
                    <Star className="h-3.5 w-3.5 fill-amber-400/90" aria-hidden />
                    {log.rating}/10
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

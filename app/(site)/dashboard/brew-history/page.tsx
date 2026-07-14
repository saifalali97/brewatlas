import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Heart, Star } from "lucide-react";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { getBrewLogs } from "@/lib/data/personal";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    pathname: "/dashboard/brew-history",
    locale,
    title: dictionary.metadata.brewHistoryTitle,
    description: dictionary.metadata.brewHistoryDescription,
    noIndex: true,
  });
}

function formatBrewedAt(value: string, locale: string): string {
  return new Date(value).toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" });
}

export default async function DashboardBrewHistoryPage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const b = dictionary.brewHistoryPage;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login?redirectTo=/dashboard/brew-history");
  }

  const brewLogs = await getBrewLogs(supabase, data.user.id);

  return (
    <SectionFrame id="dashboard-brew-history-page" ariaLabelledBy="dashboard-brew-history-page-heading" padding="compact">
      <PageHeader eyebrow={b.eyebrow} title={b.title} description={b.description} centered={false} />

      {brewLogs.length === 0 ? (
        <div className="rounded-[1.5rem] border border-white/[0.09] bg-white/[0.03] px-8 py-16 text-center">
          <p className="text-lg font-medium text-stone-100">{b.noBrewsTitle}</p>
          <p className="mt-2 text-sm text-stone-500">{b.noBrewsDescription}</p>
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
                        {log.recipeTitle ?? b.untitledRecipe}
                      </Link>
                    ) : (
                      <p className="font-medium text-stone-100">{log.recipeTitle ?? b.freeformBrew}</p>
                    )}
                    {log.isFavorite && <Heart className="h-3.5 w-3.5 fill-amber-500/80 text-amber-500/80" aria-hidden />}
                  </div>
                  <p className="mt-1 text-sm text-stone-500">
                    {formatBrewedAt(log.brewedAt, locale)}
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

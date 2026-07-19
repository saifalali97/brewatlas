import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Heart, Plus, Star } from "lucide-react";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { buttons } from "@/lib/constants/styles";
import { getBrewLogs } from "@/lib/data/personal";
import { translate } from "@/lib/i18n/format";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    pathname: "/account/brew-history",
    locale,
    title: dictionary.metadata.brewHistoryTitle,
    description: dictionary.metadata.brewHistoryDescription,
    noIndex: true,
  });
}

function formatBrewedAt(value: string, locale: string): string {
  return new Date(value).toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function DashboardBrewHistoryPage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const b = dictionary.brewHistoryPage;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/login?redirectTo=/account/brew-history");
  }

  const brewLogs = await getBrewLogs(supabase, data.user.id);

  return (
    <SectionFrame id="dashboard-brew-history-page" ariaLabelledBy="dashboard-brew-history-page-heading" padding="compact">
      
<div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader headingId="dashboard-brew-history-page-heading" eyebrow={b.eyebrow} title={b.title} description={b.description} centered={false} />

        <Link href="/account/brew-history/new" className={`${buttons.primary} h-10 min-w-0 gap-2 px-6 text-xs`}>
          <Plus className="h-3.5 w-3.5" aria-hidden />
          {b.logNewCta}
        </Link>
      </div>

      {brewLogs.length === 0 ? (
        <div className="rounded-[1.5rem] border border-ba-espresso/10 bg-ba-pearl px-8 py-16 text-center">
          <p className="text-lg font-medium text-ac-espresso">{b.noBrewsTitle}</p>
          <p className="mt-2 text-sm text-ac-espresso">{b.noBrewsDescription}</p>
          <Link href="/account/brew-history/new" className={`${buttons.secondary} mt-8`}>
            {b.logNewCta}
          </Link>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-ba-espresso/10 bg-ba-pearl">
          <ul className="divide-y divide-ba-espresso/[0.06]">
            {brewLogs.map((log) => {
              const details: string[] = [formatBrewedAt(log.brewedAt, locale)];
              if (log.coffeeName) details.push(translate(dictionary, "brewHistoryPage.coffeeTemplate", { name: log.coffeeName }));
              if (log.grinderName) details.push(translate(dictionary, "brewHistoryPage.grinderTemplate", { name: log.grinderName }));
              if (log.grindSize) details.push(translate(dictionary, "brewHistoryPage.grindSizeTemplate", { size: log.grindSize }));
              if (log.waterAmount !== null) {
                details.push(translate(dictionary, "brewHistoryPage.waterGramsTemplate", { amount: log.waterAmount }));
              }
              if (log.brewTime) details.push(translate(dictionary, "brewHistoryPage.brewTimeTemplate", { time: log.brewTime }));
              if (log.brewingMethodName) details.push(log.brewingMethodName);
              if (log.brewingDeviceName) details.push(log.brewingDeviceName);

              return (
                <li key={log.id} className="flex flex-wrap items-start justify-between gap-4 px-6 py-5">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      {log.recipeSlug ? (
                        <Link
                          href={`/recipes/${log.recipeSlug}`}
                          className="font-medium text-ac-espresso underline-offset-4 hover:text-ba-bronze hover:underline"
                        >
                          {log.recipeTitle ?? b.untitledRecipe}
                        </Link>
                      ) : (
                        <p className="font-medium text-ac-espresso">{log.recipeTitle ?? log.coffeeName ?? b.freeformBrew}</p>
                      )}
                      {log.isFavorite && (
                        <Heart className="h-3.5 w-3.5 fill-amber-500/80 text-amber-500/80" aria-hidden />
                      )}
                    </div>
                    <p className="mt-1 text-sm text-ac-espresso">{details.join(" · ")}</p>
                    {log.notes && <p className="mt-1.5 max-w-xl text-sm text-ac-espresso">{log.notes}</p>}
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    {log.rating !== null && (
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-ac-espresso">
                        <Star className="h-3.5 w-3.5 fill-amber-400/90" aria-hidden />
                        {log.rating}
                        {b.ratingOutOfFive}
                      </div>
                    )}
                    <Link
                      href={`/account/brew-history/${log.id}/edit`}
                      className="text-sm font-medium text-ac-espresso underline-offset-4 hover:underline"
                    >
                      {b.editCta}
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </SectionFrame>
  );
}

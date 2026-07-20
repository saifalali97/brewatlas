import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Heart, Plus, Star } from "lucide-react";
import { BrewSessionImportExport, BrewSessionRowActions } from "@/app/components/personal/brew-session-tools";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { buttons, forms } from "@/lib/constants/styles";
import { exportBrewSessions, getBrewSessionUserAnalytics, searchBrewSessions } from "@/lib/data/brew-sessions";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  searchParams: Promise<{
    q?: string;
    method?: string;
    origin?: string;
    roaster?: string;
    rating?: string;
    favorite?: string;
    dateFrom?: string;
    dateTo?: string;
    sort?: string;
    page?: string;
  }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    pathname: "/account/brew-sessions",
    locale,
    title: dictionary.metadata.brewSessionsTitle,
    description: dictionary.metadata.brewSessionsDescription,
    noIndex: true,
  });
}

function formatDate(value: string, locale: string) {
  return new Date(value).toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" });
}

export default async function BrewSessionsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const l = dictionary.brewSessionsPage;
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/login?redirectTo=/account/brew-sessions");

  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const sort = ["newest", "oldest", "highest_rated", "most_brewed"].includes(params.sort ?? "")
    ? (params.sort as "newest" | "oldest" | "highest_rated" | "most_brewed")
    : "newest";

  const [{ sessions, totalCount }, analytics, exportData] = await Promise.all([
    searchBrewSessions(supabase, authData.user.id, {
      query: params.q,
      method: params.method,
      origin: params.origin,
      roaster: params.roaster,
      rating: params.rating ? Number.parseInt(params.rating, 10) : undefined,
      favorite: params.favorite === "1" ? true : undefined,
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
      sort,
      page,
      pageSize: 20,
    }),
    getBrewSessionUserAnalytics(supabase, authData.user.id),
    exportBrewSessions(supabase, authData.user.id),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / 20));
  const exportJson = JSON.stringify(exportData, null, 2);

  return (
    <SectionFrame id="brew-sessions-page" ariaLabelledBy="brew-sessions-page-heading" padding="compact" wide>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader headingId="brew-sessions-page-heading" eyebrow={l.eyebrow} title={l.title} description={l.description} centered={false} />
        <Link href="/account/brew-sessions/new" className={`${buttons.primary} h-10 min-w-0 gap-2 px-6 text-xs`}>
          <Plus className="h-3.5 w-3.5" aria-hidden />
          {l.newCta}
        </Link>
      </div>

      <section className="mt-8 rounded-[1.5rem] border border-ba-espresso/10 bg-ba-pearl p-6">
        <h2 className="text-sm font-semibold text-ac-espresso">{l.analyticsTitle}</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 text-sm text-ac-espresso">
          <div><dt className="text-ac-espresso/70">{l.brewsThisWeek}</dt><dd className="font-medium">{analytics.brewsThisWeek}</dd></div>
          <div><dt className="text-ac-espresso/70">{l.brewsThisMonth}</dt><dd className="font-medium">{analytics.brewsThisMonth}</dd></div>
          <div><dt className="text-ac-espresso/70">{l.widgetAverageRating}</dt><dd className="font-medium">{analytics.averageRating ?? "—"}</dd></div>
          <div><dt className="text-ac-espresso/70">{l.longestStreak}</dt><dd className="font-medium">{analytics.longestStreak}</dd></div>
        </dl>
      </section>

      <form method="get" className="mt-8 grid gap-4 rounded-[1.5rem] border border-ba-espresso/10 bg-ba-pearl p-6 lg:grid-cols-4">
        <label className={forms.label}>
          Search
          <input name="q" defaultValue={params.q ?? ""} placeholder={l.searchPlaceholder} className={forms.input} />
        </label>
        <label className={forms.label}>
          {l.filterMethod}
          <input name="method" defaultValue={params.method ?? ""} className={forms.input} />
        </label>
        <label className={forms.label}>
          {l.filterOrigin}
          <input name="origin" defaultValue={params.origin ?? ""} className={forms.input} />
        </label>
        <label className={forms.label}>
          {l.filterRoaster}
          <input name="roaster" defaultValue={params.roaster ?? ""} className={forms.input} />
        </label>
        <label className={forms.label}>
          {l.filterRating}
          <select name="rating" defaultValue={params.rating ?? ""} className={forms.select}>
            <option value="">{l.notSetOption}</option>
            {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <label className={forms.label}>
          {l.filterDateFrom}
          <input type="date" name="dateFrom" defaultValue={params.dateFrom ?? ""} className={forms.input} />
        </label>
        <label className={forms.label}>
          {l.filterDateTo}
          <input type="date" name="dateTo" defaultValue={params.dateTo ?? ""} className={forms.input} />
        </label>
        <label className={forms.label}>
          Sort
          <select name="sort" defaultValue={sort} className={forms.select}>
            <option value="newest">{l.sortNewest}</option>
            <option value="oldest">{l.sortOldest}</option>
            <option value="highest_rated">{l.sortHighestRated}</option>
            <option value="most_brewed">{l.sortMostBrewed}</option>
          </select>
        </label>
        <label className={`${forms.checkboxRow} lg:col-span-2`}>
          <input type="checkbox" name="favorite" value="1" defaultChecked={params.favorite === "1"} className={forms.checkbox} />
          {l.filterFavorite}
        </label>
        <div className="flex items-end gap-3 lg:col-span-2">
          <button type="submit" className={buttons.primary}>{l.applyFilters}</button>
          <Link href="/account/brew-sessions" className={buttons.secondary}>{l.clearFilters}</Link>
        </div>
      </form>

      {sessions.length === 0 ? (
        <div className="mt-8 rounded-[1.5rem] border border-ba-espresso/10 bg-ba-pearl px-8 py-16 text-center">
          <p className="text-lg font-medium text-ac-espresso">{l.noSessionsTitle}</p>
          <p className="mt-2 text-sm text-ac-espresso">{l.noSessionsDescription}</p>
          <Link href="/account/brew-sessions/new" className={`${buttons.secondary} mt-8`}>{l.newCta}</Link>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-ba-espresso/10 bg-ba-pearl">
          <ul className="divide-y divide-ba-espresso/[0.06]">
            {sessions.map((session) => (
              <li key={session.id} className="flex flex-wrap items-start justify-between gap-4 px-6 py-5">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <Link href={`/account/brew-sessions/${session.id}`} className="font-medium text-ac-espresso underline-offset-4 hover:text-ba-bronze hover:underline">
                      {session.coffeeName ?? session.recipeTitle ?? l.title}
                    </Link>
                    {session.favorite ? <Heart className="h-3.5 w-3.5 fill-amber-500/80 text-amber-500/80" aria-hidden /> : null}
                  </div>
                  <p className="mt-1 text-sm text-ac-espresso">
                    {[formatDate(session.createdAt, locale), session.brewMethod, session.roaster, session.origin].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  {session.rating != null ? (
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-ac-espresso">
                      <Star className="h-3.5 w-3.5 fill-amber-400/90" aria-hidden />
                      {session.rating}{l.ratingOutOfFive}
                    </div>
                  ) : null}
                  <Link href={`/account/brew-sessions/${session.id}/edit`} className="text-sm font-medium text-ac-espresso underline-offset-4 hover:underline">{l.editCta}</Link>
                  <BrewSessionRowActions sessionId={session.id} favorite={session.favorite} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {totalPages > 1 ? (
        <nav className="mt-6 flex items-center justify-center gap-4 text-sm">
          {page > 1 ? <Link href={`/account/brew-sessions?page=${page - 1}`} className="text-ac-espresso hover:underline">← Previous</Link> : null}
          <span className="text-ac-espresso/70">Page {page} of {totalPages}</span>
          {page < totalPages ? <Link href={`/account/brew-sessions?page=${page + 1}`} className="text-ac-espresso hover:underline">Next →</Link> : null}
        </nav>
      ) : null}

      <BrewSessionImportExport exportJson={exportJson} />
    </SectionFrame>
  );
}

import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Coffee, Flame, Store, Users } from "lucide-react";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { acFocus, acTypography } from "@/lib/design-system/atlas-canon";
import {
  getMostActiveUsersLeaderboard,
  getTrendingBrewingMethods,
  getTrendingCoffees,
  getTrendingRecipes,
  getTrendingRoasters,
} from "@/lib/data/community";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    pathname: "/community/trending",
    locale,
    title: dictionary.communityPlatformPage.trendingTitle,
    description: dictionary.communityPage.description,
  });
}

function TrendingSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Flame;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[1.25rem] border border-ba-espresso/08 bg-ba-sand/30 p-6">
      <div className="flex items-center gap-2.5">
        <Icon className="h-4 w-4 text-ac-espresso" aria-hidden />
        <h2 className={acTypography.eyebrow}>{title}</h2>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default async function CommunityTrendingPage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const cp = dictionary.communityPlatformPage;
  const p = dictionary.communityPage;
  const supabase = await createClient();

  const [recipes, users, roasters, coffees, methods] = await Promise.all([
    getTrendingRecipes(supabase, 14, 8),
    getMostActiveUsersLeaderboard(supabase, 8),
    getTrendingRoasters(supabase, 14, 8),
    getTrendingCoffees(supabase, 14, 8),
    getTrendingBrewingMethods(supabase, 14, 8),
  ]);

  return (
    <SectionFrame id="community-trending" ariaLabelledBy="trending-heading" padding="compact">
      <PageHeader
        headingId="trending-heading"
        eyebrow={dictionary.community.title}
        title={cp.trendingTitle}
        description={p.description}
      />

      <div className="grid gap-8 lg:grid-cols-2">
        <TrendingSection title={dictionary.searchPage.sectionRecipes} icon={Flame}>
          {recipes.length === 0 ? (
            <p className={acTypography.body}>{p.noRecipeRatings}</p>
          ) : (
            <ol className="list-none space-y-3 p-0">
              {recipes.map((entry, index) => (
                <li key={entry.recipeId}>
                  <Link href={`/recipes/${entry.slug}`} className={`${acTypography.folioTitle} hover:text-ba-bronze ${acFocus.ring}`}>
                    <span className={`${acTypography.caption} me-2`}>{index + 1}.</span>
                    {entry.title}
                  </Link>
                  <p className={`${acTypography.folioMeta} ms-6`}>
                    {entry.brewCount} brews · {entry.likeCount} likes
                  </p>
                </li>
              ))}
            </ol>
          )}
        </TrendingSection>

        <TrendingSection title={cp.featuredUsersTitle} icon={Users}>
          {users.length === 0 ? (
            <p className={acTypography.body}>{p.noBrewersRanked}</p>
          ) : (
            <ol className="list-none space-y-3 p-0">
              {users.map((entry) => (
                <li key={entry.profile.id}>
                  <Link
                    href={`/users/${entry.profile.id}`}
                    className={`${acTypography.folioTitle} hover:text-ba-bronze ${acFocus.ring}`}
                  >
                    <span className={`${acTypography.caption} me-2`}>#{entry.rank}</span>
                    {entry.profile.displayName ?? p.anonymousBrewer}
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </TrendingSection>

        <TrendingSection title={cp.featuredRoastersTitle} icon={Store}>
          {roasters.length === 0 ? (
            <p className={acTypography.body}>{p.noActivityYet}</p>
          ) : (
            <ol className="list-none space-y-3 p-0">
              {roasters.map((entry, index) => (
                <li key={entry.roasterId} className="text-sm text-ac-espresso">
                  <span className={`${acTypography.caption} me-2`}>{index + 1}.</span>
                  {entry.roasterName}
                  <span className="ms-2 text-ac-espresso/70">({entry.activityCount})</span>
                </li>
              ))}
            </ol>
          )}
        </TrendingSection>

        <TrendingSection title={dictionary.searchPage.sectionVarieties} icon={Coffee}>
          {coffees.length === 0 ? (
            <p className={acTypography.body}>{p.noActivityYet}</p>
          ) : (
            <ol className="list-none space-y-3 p-0">
              {coffees.map((entry, index) => (
                <li key={entry.coffeeId} className="text-sm text-ac-espresso">
                  <span className={`${acTypography.caption} me-2`}>{index + 1}.</span>
                  {entry.coffeeName}
                  {entry.roasterName ? <span className="text-ac-espresso/70"> · {entry.roasterName}</span> : null}
                </li>
              ))}
            </ol>
          )}
        </TrendingSection>

        <TrendingSection title={dictionary.searchPage.filterMethod} icon={Flame}>
          {methods.length === 0 ? (
            <p className={acTypography.body}>{p.noActivityYet}</p>
          ) : (
            <ol className="list-none space-y-3 p-0">
              {methods.map((entry, index) => (
                <li key={entry.brewingMethodId} className="text-sm text-ac-espresso">
                  <span className={`${acTypography.caption} me-2`}>{index + 1}.</span>
                  {entry.methodName}
                  <span className="ms-2 text-ac-espresso/70">({entry.activityCount})</span>
                </li>
              ))}
            </ol>
          )}
        </TrendingSection>
      </div>

      <div className="mt-10">
        <Link href="/community" className={`${acTypography.nav} text-ac-espresso hover:text-ba-bronze ${acFocus.ring}`}>
          ← {dictionary.community.title}
        </Link>
      </div>
    </SectionFrame>
  );
}

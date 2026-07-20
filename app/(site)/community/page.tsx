import type { Metadata } from "next";
import Link from "next/link";
import { Award, Star, TrendingUp, Trophy } from "lucide-react";
import { PageHeader } from "@/app/components/ui/page-header";
import { PageEditorialPhoto } from "@/app/components/ui/page-editorial-photo";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { PAGE_EDITORIAL_IMAGES } from "@/lib/media/page-images";
import { acFocus, acTypography } from "@/lib/design-system/atlas-canon";
import { getHighestRatedRecipesLeaderboard, getTopBrewersLeaderboard, getActivityFeed } from "@/lib/data/community";
import {
  getFeaturedCafes,
  getFeaturedRoasters,
  getFeaturedUsers,
} from "@/lib/data/community-platform";
import { CommunityActivityFeed } from "@/app/components/profile/community-activity-feed";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { translate } from "@/lib/i18n/format";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    pathname: "/community",
    locale,
    title: dictionary.metadata.communityTitle,
    description: dictionary.metadata.communityDescription,
  });
}

export default async function CommunityPage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const p = dictionary.communityPage;
  const cp = dictionary.communityPlatformPage;
  const supabase = await createClient();
  const [topBrewers, topRecipes, activityFeed, featuredUsers, featuredRoasters, featuredCafes] = await Promise.all([
    getTopBrewersLeaderboard(supabase, 8),
    getHighestRatedRecipesLeaderboard(supabase, 6),
    getActivityFeed(supabase, 10),
    getFeaturedUsers(supabase, 4),
    getFeaturedRoasters(supabase, 4),
    getFeaturedCafes(supabase, 4),
  ]);

  return (
    <SectionFrame id="community" ariaLabelledBy="community-heading" padding="compact">
      <PageEditorialPhoto src={PAGE_EDITORIAL_IMAGES.community} alt="" priority />
      <PageHeader
        headingId="community-heading"
        eyebrow={p.eyebrow}
        title={dictionary.community.title}
        description={p.description}
      />

      <div className="mb-10 flex flex-wrap gap-3">
        <Link
          href="/community/leaderboards"
          className={`inline-flex h-10 items-center rounded-full border border-ba-espresso/12 px-5 text-sm font-medium text-ac-espresso hover:border-ba-bronze/30 ${acFocus.ring}`}
        >
          {cp.viewAllLeaderboards}
        </Link>
        <Link
          href="/community/trending"
          className={`inline-flex h-10 items-center rounded-full border border-ba-espresso/12 px-5 text-sm font-medium text-ac-espresso hover:border-ba-bronze/30 ${acFocus.ring}`}
        >
          {cp.viewTrending}
        </Link>
        <Link
          href="/community/following"
          className={`inline-flex h-10 items-center rounded-full border border-ba-espresso/12 px-5 text-sm font-medium text-ac-espresso hover:border-ba-bronze/30 ${acFocus.ring}`}
        >
          {cp.viewFollowingFeed}
        </Link>
      </div>

      {(featuredUsers.length > 0 || featuredRoasters.length > 0 || featuredCafes.length > 0) && (
        <div className="mb-14 grid gap-8 lg:grid-cols-3">
          {featuredUsers.length > 0 ? (
            <section>
              <h2 className={acTypography.eyebrow}>{cp.featuredUsersTitle}</h2>
              <ul className="mt-4 list-none space-y-3 p-0">
                {featuredUsers.map((user) => (
                  <li key={user.id}>
                    <Link href={`/users/${user.userId}`} className={`text-sm font-medium text-ac-espresso hover:text-ba-bronze ${acFocus.ring}`}>
                      {user.displayName ?? p.anonymousBrewer}
                    </Link>
                    {user.headline ? <p className="text-xs text-ac-espresso/70">{user.headline}</p> : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {featuredRoasters.length > 0 ? (
            <section>
              <h2 className={acTypography.eyebrow}>{cp.featuredRoastersTitle}</h2>
              <ul className="mt-4 list-none space-y-3 p-0">
                {featuredRoasters.map((roaster) => (
                  <li key={roaster.id} className="text-sm text-ac-espresso">
                    {roaster.name}
                    {roaster.headline ? <p className="text-xs text-ac-espresso/70">{roaster.headline}</p> : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {featuredCafes.length > 0 ? (
            <section>
              <h2 className={acTypography.eyebrow}>{cp.featuredCafesTitle}</h2>
              <ul className="mt-4 list-none space-y-3 p-0">
                {featuredCafes.map((cafe) => (
                  <li key={cafe.id} className="text-sm text-ac-espresso">
                    {cafe.name}
                    {cafe.city || cafe.country ? (
                      <p className="text-xs text-ac-espresso/70">{[cafe.city, cafe.country].filter(Boolean).join(", ")}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      )}

      <div className="grid gap-12 lg:grid-cols-2">
        <div>
          <div className="flex items-center gap-2.5">
            <Trophy className="h-4 w-4 text-ac-espresso" aria-hidden />
            <h2 className={acTypography.eyebrow}>{dictionary.community.topBrewers}</h2>
          </div>
          {topBrewers.length === 0 ? (
            <p className={`${acTypography.body} mt-6`}>{p.noBrewersRanked}</p>
          ) : (
            <ol className="mt-6 list-none space-y-0 p-0">
              {topBrewers.map((entry) => (
                <li key={entry.profile.id} className="ac-folio-divider flex items-center justify-between gap-4 py-5">
                  <div className="flex items-center gap-3">
                    <span className={acTypography.caption}>{entry.rank}</span>
                    <div>
                      <Link
                        href={`/users/${entry.profile.id}`}
                        className={`${acTypography.folioTitle} hover:text-ba-bronze ${acFocus.ring}`}
                      >
                        {entry.profile.displayName ?? p.anonymousBrewer}
                      </Link>
                      {entry.profile.country ? (
                        <p className={acTypography.folioMeta}>{entry.profile.country}</p>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-ac-espresso">
                    <Award className="h-3.5 w-3.5" aria-hidden />
                    {entry.value}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2.5">
            <TrendingUp className="h-4 w-4 text-ac-espresso" aria-hidden />
            <h2 className={acTypography.eyebrow}>{p.highestRatedRecipesHeading}</h2>
          </div>
          {topRecipes.length === 0 ? (
            <p className={`${acTypography.body} mt-6`}>{p.noRecipeRatings}</p>
          ) : (
            <ol className="mt-6 list-none space-y-0 p-0">
              {topRecipes.map((entry) => (
                <li key={entry.recipeId} className="ac-folio-divider flex items-center justify-between gap-4 py-5">
                  <div>
                    <span className={`${acTypography.caption} me-3`}>#{entry.rank}</span>
                    <Link
                      href={`/recipes/${entry.slug}`}
                      className={`${acTypography.folioTitle} hover:text-ba-bronze ${acFocus.ring}`}
                    >
                      {entry.title}
                    </Link>
                    <p className={`${acTypography.folioMeta} mt-1 ms-7`}>
                      {entry.reviewCount === 1
                        ? translate(dictionary, "communityPage.reviewsSingular", { count: entry.reviewCount })
                        : translate(dictionary, "communityPage.reviewsPlural", { count: entry.reviewCount })}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-ac-espresso">
                    <Star className="h-3.5 w-3.5 fill-ac-copper" aria-hidden />
                    {entry.averageRating.toFixed(1)}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      <section className="mt-14" aria-labelledby="community-activity-heading">
        <h2 id="community-activity-heading" className={acTypography.eyebrow}>
          {dictionary.community.activityFeed}
        </h2>
        <div className="mt-6">
          <CommunityActivityFeed items={activityFeed} dictionary={dictionary} locale={locale} />
        </div>
      </section>

      <div className="ac-folio-divider mt-14 flex flex-col gap-4 pt-10 sm:flex-row sm:items-center">
        <Link
          href="/signup"
          className={`inline-flex h-12 items-center justify-center rounded-full border border-ac-copper/40 px-8 text-sm font-medium tracking-[0.08em] uppercase text-ac-espresso hover:border-ac-copper/60 hover:bg-ac-espresso/[0.04] ${acFocus.ring}`}
        >
          {p.joinCommunity}
        </Link>
        <Link
          href="/recipes"
          className={`${acTypography.nav} text-ac-espresso hover:text-ba-bronze ${acFocus.ring}`}
        >
          {dictionary.homeFooter.browseRecipes} →
        </Link>
      </div>
    </SectionFrame>
  );
}

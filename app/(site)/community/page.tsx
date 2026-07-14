import type { Metadata } from "next";
import Link from "next/link";
import { Award, Star, TrendingUp, Trophy } from "lucide-react";
import { PageHeader } from "@/app/components/ui/page-header";
import { RippleLink } from "@/app/components/ui/ripple-link";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { buttons } from "@/lib/constants/styles";
import { getHighestRatedRecipesLeaderboard, getTopBrewersLeaderboard } from "@/lib/data/community";
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
  const supabase = await createClient();
  const [topBrewers, topRecipes] = await Promise.all([
    getTopBrewersLeaderboard(supabase, 8),
    getHighestRatedRecipesLeaderboard(supabase, 6),
  ]);

  return (
    <SectionFrame id="community" ariaLabelledBy="community-heading" padding="compact">
      <PageHeader eyebrow={p.eyebrow} title={dictionary.community.title} description={p.description} />

      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="flex items-center gap-2.5">
            <Trophy className="h-4 w-4 text-amber-500/85" aria-hidden />
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
              {dictionary.community.topBrewers}
            </h2>
          </div>
          <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-white/[0.09] bg-white/[0.03]">
            {topBrewers.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-stone-500">{p.noBrewersRanked}</div>
            ) : (
              <ul className="divide-y divide-white/[0.07]">
                {topBrewers.map((entry) => (
                  <li key={entry.profile.id} className="flex items-center justify-between gap-4 px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-amber-600/25 bg-amber-950/40 text-xs font-semibold text-amber-300/90">
                        {entry.rank}
                      </span>
                      <div>
                        <p className="font-medium text-stone-100">{entry.profile.displayName ?? p.anonymousBrewer}</p>
                        {entry.profile.country && <p className="text-xs text-stone-500">{entry.profile.country}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-amber-400/90">
                      <Award className="h-3.5 w-3.5" aria-hidden />
                      {entry.value}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2.5">
            <TrendingUp className="h-4 w-4 text-amber-500/85" aria-hidden />
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">
              {p.highestRatedRecipesHeading}
            </h2>
          </div>
          <div className="mt-4 overflow-hidden rounded-[1.5rem] border border-white/[0.09] bg-white/[0.03]">
            {topRecipes.length === 0 ? (
              <div className="px-6 py-12 text-center text-sm text-stone-500">{p.noRecipeRatings}</div>
            ) : (
              <ul className="divide-y divide-white/[0.07]">
                {topRecipes.map((entry) => (
                  <li key={entry.recipeId} className="flex items-center justify-between gap-4 px-6 py-4">
                    <div>
                      <span className="me-3 text-xs font-semibold text-stone-500">#{entry.rank}</span>
                      <Link
                        href={`/recipes/${entry.slug}`}
                        className="font-medium text-stone-100 underline-offset-4 hover:text-amber-400/90 hover:underline"
                      >
                        {entry.title}
                      </Link>
                      <p className="mt-1 ms-7 text-xs text-stone-500">
                        {entry.reviewCount === 1
                          ? translate(dictionary, "communityPage.reviewsSingular", { count: entry.reviewCount })
                          : translate(dictionary, "communityPage.reviewsPlural", { count: entry.reviewCount })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-amber-400/90">
                      <Star className="h-3.5 w-3.5 fill-amber-400/90" aria-hidden />
                      {entry.averageRating.toFixed(1)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="mt-14 flex flex-col gap-3 border-t border-white/[0.06] pt-10 sm:flex-row sm:items-center">
        <RippleLink href="/signup" className={`${buttons.primary} w-full sm:w-auto`}>
          {p.joinCommunity}
        </RippleLink>
        <RippleLink href="/recipes" className={`${buttons.secondary} w-full sm:w-auto`}>
          {dictionary.homeFooter.browseRecipes}
        </RippleLink>
      </div>
    </SectionFrame>
  );
}

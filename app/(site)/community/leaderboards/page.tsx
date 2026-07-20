import type { Metadata } from "next";
import Link from "next/link";
import { Award, Star, Trophy } from "lucide-react";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { acFocus, acTypography } from "@/lib/design-system/atlas-canon";
import { getLeaderboard } from "@/lib/data/community";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { translate } from "@/lib/i18n/format";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";
import { createClient } from "@/lib/supabase/server";
import type { LeaderboardKind, RecipeLeaderboardEntry, UserLeaderboardEntry } from "@/types/community";
import type { Dictionary } from "@/lib/i18n/types";

const LEADERBOARD_KINDS: LeaderboardKind[] = [
  "top_brewers",
  "most_active",
  "top_recipe_creators",
  "most_helpful",
  "highest_rated_recipes",
];

const KIND_LABELS: Record<LeaderboardKind, keyof Dictionary["community"] | "highestRated"> = {
  top_brewers: "topBrewers",
  most_active: "mostActive",
  top_recipe_creators: "topCreators",
  most_helpful: "mostHelpful",
  highest_rated_recipes: "highestRated",
};

type PageProps = {
  searchParams: Promise<{ kind?: string }>;
};

function parseKind(value: string | undefined): LeaderboardKind {
  if (value && (LEADERBOARD_KINDS as readonly string[]).includes(value)) {
    return value as LeaderboardKind;
  }
  return "top_brewers";
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    pathname: "/community/leaderboards",
    locale,
    title: dictionary.communityPlatformPage.leaderboardsTitle,
    description: dictionary.communityPage.description,
  });
}

export default async function CommunityLeaderboardsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const kind = parseKind(params.kind);
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const cp = dictionary.communityPlatformPage;
  const p = dictionary.communityPage;
  const supabase = await createClient();
  const entries = await getLeaderboard(supabase, kind, 20);

  return (
    <SectionFrame id="community-leaderboards" ariaLabelledBy="leaderboards-heading" padding="compact">
      <PageHeader
        headingId="leaderboards-heading"
        eyebrow={dictionary.community.title}
        title={cp.leaderboardsTitle}
        description={p.description}
      />

      <nav className="mb-8 flex flex-wrap gap-2" aria-label={cp.leaderboardsTitle}>
        {LEADERBOARD_KINDS.map((value) => {
          const isActive = kind === value;
          return (
            <Link
              key={value}
              href={`/community/leaderboards?kind=${value}`}
              aria-current={isActive ? "page" : undefined}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "border-ba-bronze/40 bg-ba-gold/15 text-ac-espresso"
                  : "border-ba-espresso/12 bg-ba-pearl text-ac-espresso hover:border-ba-bronze/30"
              }`}
            >
              {KIND_LABELS[value] === "highestRated"
                ? dictionary.communityPage.highestRatedRecipesHeading
                : dictionary.community[KIND_LABELS[value] as keyof Dictionary["community"]]}
            </Link>
          );
        })}
      </nav>

      {entries.length === 0 ? (
        <p className={acTypography.body}>{p.noBrewersRanked}</p>
      ) : kind === "highest_rated_recipes" ? (
        <ol className="list-none space-y-0 p-0">
          {(entries as RecipeLeaderboardEntry[]).map((entry) => (
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
      ) : (
        <ol className="list-none space-y-0 p-0">
          {(entries as UserLeaderboardEntry[]).map((entry) => (
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
                <Trophy className="h-3.5 w-3.5" aria-hidden />
                {kind === "top_brewers" ? <Award className="h-3.5 w-3.5" aria-hidden /> : null}
                {entry.value}
              </div>
            </li>
          ))}
        </ol>
      )}

      <div className="mt-10">
        <Link href="/community" className={`${acTypography.nav} text-ac-espresso hover:text-ba-bronze ${acFocus.ring}`}>
          ← {dictionary.community.title}
        </Link>
      </div>
    </SectionFrame>
  );
}

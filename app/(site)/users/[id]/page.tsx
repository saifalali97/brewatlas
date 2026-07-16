import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Award, MapPin, Users } from "lucide-react";
import { RecipeCard } from "@/app/components/cards/recipe-card";
import { CommunityActivityFeed } from "@/app/components/profile/community-activity-feed";
import { FollowButton } from "@/app/components/profile/follow-button";
import { StarRatingDisplay } from "@/app/components/reviews/star-rating";
import { PageHeader } from "@/app/components/ui/page-header";
import { RippleLink } from "@/app/components/ui/ripple-link";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { buttons } from "@/lib/constants/styles";
import { PremiumMemberBadge } from "@/app/components/subscription/subscription-status-badge";
import { getUserPublishedRecipes } from "@/lib/data/db-recipes";
import { getMembershipSummary } from "@/lib/data/membership";
import {
  getPublicProfile,
  getUserActivityFeed,
  getUserBadges,
  getUserReviewsWritten,
} from "@/lib/data/community";
import { brewMethodLabelKey, difficultyLabelKey } from "@/lib/i18n/home-labels";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { translate, interpolate } from "@/lib/i18n/format";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";
import { createClient } from "@/lib/supabase/server";
import type { Dictionary } from "@/lib/i18n/types";
import type { UserBadge } from "@/types/community";
import type { RecipeListItem } from "@/types/recipe";

type PublicProfileTab = "recipes" | "reviews" | "activity";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
};

function parseTab(value: string | undefined): PublicProfileTab {
  if (value === "reviews" || value === "activity") return value;
  return "recipes";
}

function recipeCardLabels(dictionary: Dictionary, recipe: RecipeListItem) {
  const brewMethodKey = brewMethodLabelKey(recipe.brewMethod);
  return {
    premium: dictionary.common.premiumBadge,
    editorsChoice: dictionary.homeFeaturedRecipes.editorsChoice,
    ratio: dictionary.homeFeaturedRecipes.ratioLabel,
    time: dictionary.homeFeaturedRecipes.timeLabel,
    difficultyLabel: translate(dictionary, difficultyLabelKey(recipe.difficulty)),
    brewMethodLabel: brewMethodKey ? translate(dictionary, brewMethodKey) : recipe.brewMethod,
    imageAltTemplate: dictionary.homeFeaturedRecipes.imageAltTemplate,
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const supabase = await createClient();
  const profile = await getPublicProfile(supabase, id);

  if (!profile) {
    return { title: dictionary.publicProfilePage.notFoundTitle, robots: { index: false, follow: false } };
  }

  const displayName = profile.displayName ?? dictionary.publicProfilePage.anonymousMember;
  const title = interpolate(dictionary.metadata.publicProfileTitleTemplate, { name: displayName });
  const description = profile.bio ?? interpolate(dictionary.metadata.publicProfileDescriptionTemplate, { name: displayName });

  return buildLocalizedMetadata({
    pathname: `/users/${id}`,
    locale,
    title,
    description,
  });
}

function FavoriteRow({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
      <span className="text-xs font-medium uppercase tracking-[0.12em] text-stone-500">{label}</span>
      <span className="text-sm text-stone-200">{value}</span>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-[1.25rem] border border-white/[0.08] bg-white/[0.02] p-4 text-center">
      <p className="text-2xl font-semibold text-stone-50">{value}</p>
      <p className="mt-1 text-xs text-stone-500">{label}</p>
    </div>
  );
}

function BadgesRow({ badges, labels }: { badges: UserBadge[]; labels: Dictionary["publicProfilePage"] }) {
  const earned = badges.filter((badge) => badge.earnedAt);
  if (earned.length === 0) return null;

  return (
    <div className="mt-6">
      <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-500">{labels.badgesTitle}</h2>
      <div className="mt-3 flex flex-wrap gap-2">
        {earned.map((badge) => (
          <span
            key={badge.id}
            className="inline-flex items-center gap-1.5 rounded-full border border-amber-600/25 bg-amber-950/30 px-3 py-1 text-xs font-medium text-amber-200/90"
          >
            <Award className="h-3.5 w-3.5" aria-hidden />
            {badge.name}
          </span>
        ))}
      </div>
    </div>
  );
}

export default async function PublicProfilePage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const tab = parseTab(resolvedSearchParams.tab);
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const labels = dictionary.publicProfilePage;
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getUser();
  const viewerId = authData.user?.id ?? null;

  const profile = await getPublicProfile(supabase, id, viewerId);
  if (!profile) {
    notFound();
  }

  const isOwner = viewerId === profile.id;
  const currentPath = `/users/${id}${tab !== "recipes" ? `?tab=${tab}` : ""}`;

  const [publishedRecipes, reviewsWritten, activity, badges, membership] = await Promise.all([
    getUserPublishedRecipes(supabase, id, { limit: 24 }),
    getUserReviewsWritten(supabase, id, { limit: 12 }),
    getUserActivityFeed(supabase, id, 20),
    getUserBadges(supabase, id),
    getMembershipSummary(supabase, id),
  ]);

  const isPremiumMember = membership.isPremium;

  const displayName = profile.displayName ?? labels.anonymousMember;

  const tabHref = (nextTab: PublicProfileTab) => (nextTab === "recipes" ? `/users/${id}` : `/users/${id}?tab=${nextTab}`);

  return (
    <SectionFrame id="public-profile" ariaLabelledBy="public-profile-heading" padding="compact">
      <PageHeader
        headingId="public-profile-heading"
        eyebrow={labels.eyebrow}
        title={displayName}
        description={profile.bio ?? labels.noBio}
        centered={false}
      />

      <div className="grid gap-8 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:gap-10">
        <aside className="space-y-6">
          <div className="rounded-[1.5rem] border border-white/[0.1] bg-white/[0.03] p-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative h-24 w-24 overflow-hidden rounded-full border border-white/[0.12] bg-white/[0.04]">
                {profile.avatarUrl ? (
                  <Image src={profile.avatarUrl} alt="" fill sizes="96px" className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl font-medium text-stone-500">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {isPremiumMember && (
                <div className="mt-3">
                  <PremiumMemberBadge dictionary={dictionary} />
                </div>
              )}

              {profile.country && (
                <p className="mt-4 inline-flex items-center gap-1.5 text-sm text-stone-400">
                  <MapPin className="h-3.5 w-3.5 text-amber-500/80" aria-hidden />
                  {profile.country}
                </p>
              )}

              <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-sm text-stone-400">
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-4 w-4" aria-hidden />
                  {interpolate(labels.followersCountTemplate, { count: profile.stats.followersCount })}
                </span>
                <span>{interpolate(labels.followingCountTemplate, { count: profile.stats.followingCount })}</span>
              </div>

              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <FollowButton
                  userId={profile.id}
                  isFollowing={Boolean(profile.isFollowedByViewer)}
                  isAuthenticated={Boolean(viewerId)}
                  isOwner={isOwner}
                  currentPath={currentPath}
                />
                {isOwner && (
                  <RippleLink href="/account/profile" className={`${buttons.secondary} text-sm`}>
                    {labels.editProfileCta}
                  </RippleLink>
                )}
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <FavoriteRow label={labels.favoriteBrewMethod} value={profile.favoriteBrewMethod?.name ?? null} />
              <FavoriteRow label={labels.favoriteDevice} value={profile.favoriteBrewer?.name ?? null} />
              <FavoriteRow label={labels.favoriteGrinder} value={profile.favoriteGrinder?.name ?? null} />
              <FavoriteRow label={labels.favoriteOrigin} value={profile.favoriteOrigin?.name ?? null} />
              <FavoriteRow label={labels.favoriteCoffee} value={profile.favoriteCoffee?.name ?? null} />
              <FavoriteRow label={labels.favoriteRoaster} value={profile.favoriteRoaster?.name ?? null} />
              {profile.ownsXbloom && (
                <div className="rounded-xl border border-amber-600/25 bg-amber-950/25 px-4 py-3 text-center text-xs font-medium text-amber-200/90">
                  {dictionary.profile.ownsXbloom}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <StatTile label={labels.statRecipes} value={profile.stats.recipesCreated} />
            <StatTile label={labels.statReviews} value={profile.stats.reviewsWritten} />
            <StatTile label={labels.statBrews} value={profile.stats.totalBrews} />
            <StatTile label={labels.statBrewScore} value={profile.stats.brewScore} />
          </div>

          <BadgesRow badges={badges} labels={labels} />
        </aside>

        <div>
          <nav className="mb-6 flex flex-wrap gap-2" aria-label={labels.tabsAriaLabel}>
            {(["recipes", "reviews", "activity"] as const).map((item) => {
              const isActive = tab === item;
              const label =
                item === "recipes" ? labels.tabRecipes : item === "reviews" ? labels.tabReviews : labels.tabActivity;
              return (
                <Link
                  key={item}
                  href={tabHref(item)}
                  aria-current={isActive ? "page" : undefined}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "border-amber-600/45 bg-amber-950/50 text-amber-100"
                      : "border-white/[0.1] bg-white/[0.04] text-stone-400 hover:border-amber-600/25 hover:text-stone-200"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {tab === "recipes" && (
            <section aria-labelledby="profile-recipes-heading">
              <h2 id="profile-recipes-heading" className="sr-only">
                {labels.tabRecipes}
              </h2>
              {publishedRecipes.length === 0 ? (
                <p className="text-sm text-stone-500">{labels.noRecipesYet}</p>
              ) : (
                <div className="grid gap-6 sm:grid-cols-2">
                  {publishedRecipes.map((recipe) => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      featured={false}
                      href={`/recipes/${recipe.slug}`}
                      labels={recipeCardLabels(dictionary, recipe)}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {tab === "reviews" && (
            <section aria-labelledby="profile-reviews-heading">
              <h2 id="profile-reviews-heading" className="sr-only">
                {labels.tabReviews}
              </h2>
              {reviewsWritten.length === 0 ? (
                <p className="text-sm text-stone-500">{labels.noReviewsYet}</p>
              ) : (
                <div className="space-y-4">
                  {reviewsWritten.map(({ review, recipeTitle, recipeSlug }) => (
                    <article
                      key={review.id}
                      className="rounded-[1.25rem] border border-white/[0.08] bg-white/[0.02] p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <Link href={`/recipes/${recipeSlug}`} className="font-medium text-stone-100 hover:text-amber-300">
                            {recipeTitle}
                          </Link>
                          <div className="mt-2">
                            <StarRatingDisplay
                              rating={review.rating}
                              label={interpolate(labels.starRatingLabel, { rating: review.rating })}
                              size="sm"
                            />
                          </div>
                        </div>
                        <RippleLink href={`/recipes/${recipeSlug}#reviews`} className={`${buttons.secondary} text-xs`}>
                          {labels.viewRecipeCta}
                        </RippleLink>
                      </div>
                      {review.reviewText && (
                        <p className="mt-3 text-sm leading-relaxed text-stone-400">{review.reviewText}</p>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {tab === "activity" && (
            <section aria-labelledby="profile-activity-heading">
              <h2 id="profile-activity-heading" className="mb-4 text-base font-semibold text-stone-100">
                {labels.tabActivity}
              </h2>
              <CommunityActivityFeed items={activity} dictionary={dictionary} locale={locale} />
            </section>
          )}
        </div>
      </div>
    </SectionFrame>
  );
}

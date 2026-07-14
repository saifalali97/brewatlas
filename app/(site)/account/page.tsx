import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import {
  BookOpen,
  Bell,
  Clock,
  Coffee,
  Cpu,
  FolderOpen,
  Heart,
  Plus,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";
import { RecipeCard } from "@/app/components/cards/recipe-card";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { featuredRecipes as staticRecipesEn } from "@/data/homepage";
import { getRecipeSlug } from "@/lib/data/recipes";
import { getUserFavoriteRecipes, getUserRecipes } from "@/lib/data/db-recipes";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getHomeContent } from "@/lib/i18n/get-home-content";
import { brewMethodLabelKey, difficultyLabelKey } from "@/lib/i18n/home-labels";
import { getLocale } from "@/lib/i18n/locale";
import { translate } from "@/lib/i18n/format";
import type { Dictionary } from "@/lib/i18n/types";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";
import { createClient } from "@/lib/supabase/server";
import { ensureProfile } from "@/lib/supabase/profile";
import { signOutAction } from "@/lib/supabase/actions";
import { buttons } from "@/lib/constants/styles";
import type { FeaturedRecipe } from "@/types/homepage";

/** Builds `RecipeCard`'s translated chrome labels for a given recipe, matching the pattern used on `/recipes`. */
function recipeCardLabels(dictionary: Dictionary, recipe: FeaturedRecipe) {
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

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    pathname: "/account",
    locale,
    title: dictionary.metadata.dashboardTitle,
    description: dictionary.metadata.dashboardDescription,
    noIndex: true,
  });
}

export default async function DashboardPage() {
  const locale = await getLocale();
  const [dictionary, content] = await Promise.all([getDictionary(locale), getHomeContent(locale)]);
  const d = dictionary.dashboardPage;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  // Proxy already redirects unauthenticated visitors away from /account;
  // this is the authoritative, non-bypassable check at the data source.
  if (!data.user) {
    redirect("/login?redirectTo=/account");
  }

  await ensureProfile(supabase, data.user);

  const [{ data: profile }, favoriteRecipes, ownRecipes] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, avatar_url, country, bio, brewing_methods(name), devices(name)")
      .eq("id", data.user.id)
      .maybeSingle(),
    getUserFavoriteRecipes(supabase, data.user.id),
    getUserRecipes(supabase, data.user.id),
  ]);

  const displayName = profile?.full_name || data.user.email || dictionary.communityPage.anonymousBrewer;
  const favoriteMethodName =
    (profile as { brewing_methods?: { name: string } | null } | null)?.brewing_methods?.name ?? d.notSet;
  // Display uses the locale's translated copy, but the slug is always
  // derived from the English name at the same array index so URLs never
  // change across locales.
  const recentRecipes = content.featuredRecipes.slice(0, 3).map((recipe, index) => ({
    recipe,
    slug: getRecipeSlug(staticRecipesEn[index]),
  }));

  const stats = [
    { icon: Heart, label: d.savedRecipesLabel, value: String(favoriteRecipes.length) },
    { icon: Coffee, label: d.recipesCreatedLabel, value: String(ownRecipes.length) },
    { icon: BookOpen, label: d.favoriteMethodLabel, value: favoriteMethodName },
  ];

  const quickLinks = [
    { icon: Sparkles, label: d.aiCoachLabel, description: d.aiCoachDescription, href: "/coach" },
    { icon: Clock, label: d.brewHistoryLabel, description: d.brewHistoryDescription, href: "/account/brew-history" },
    { icon: Users, label: d.communityLabel, description: d.communityDescription, href: "/community" },
    { icon: Coffee, label: d.premiumLabel, description: d.premiumDescription, href: "/premium" },
    { icon: Cpu, label: d.xbloomProfilesLabel, description: d.xbloomProfilesDescription, href: "/account/xbloom" },
    { icon: Wrench, label: d.coffeeSetupLabel, description: d.coffeeSetupDescription, href: "/account/coffee-setup" },
    { icon: Bell, label: d.notificationsLabel, description: d.notificationsDescription, href: "/account/notifications" },
    { icon: Heart, label: d.savedRecipesLabel, description: d.savedRecipesDescription, href: "/account/favorites" },
    { icon: FolderOpen, label: d.collectionsLabel, description: d.collectionsDescription, href: "/account/collections" },
  ];

  return (
    <SectionFrame id="dashboard-page" ariaLabelledBy="dashboard-page-heading" padding="compact">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          eyebrow={dictionary.profilePage.eyebrow}
          title={translate(dictionary, "dashboard.welcomeBack", { name: displayName })}
          description={d.snapshotDescription}
          centered={false}
        />

        <form action={signOutAction}>
          <button type="submit" className={`${buttons.secondary} h-10 min-w-0 px-6 text-xs`}>
            {d.signOut}
          </button>
        </form>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="flex items-center gap-4 rounded-2xl border border-white/[0.09] bg-white/[0.035] px-5 py-4 shadow-[0_16px_40px_-20px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-700/20 bg-amber-950/25 text-amber-500/80">
              <Icon className="h-[18px] w-[18px]" aria-hidden />
            </div>
            <div>
              <p className="text-2xl font-semibold tracking-tight text-stone-50">{value}</p>
              <p className="mt-1 text-sm text-stone-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-col gap-6 rounded-2xl border border-white/[0.09] bg-white/[0.035] p-6 shadow-[0_16px_40px_-20px_rgba(0,0,0,0.55)] backdrop-blur-2xl sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-white/[0.12] bg-white/[0.04]">
            {profile?.avatar_url ? (
              <Image src={profile.avatar_url} alt="" fill sizes="56px" className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg font-medium text-stone-500">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <p className="font-medium text-stone-100">{displayName}</p>
            <p className="mt-0.5 text-sm text-stone-500">
              {profile?.country || d.countryNotSet}
              {profile?.bio ? ` · ${profile.bio}` : ""}
            </p>
          </div>
        </div>
        <Link href="/account/profile" className={`${buttons.secondary} shrink-0`}>
          {d.editProfile}
        </Link>
      </div>

      <div className="mt-16">
        <h2 className="text-xl font-semibold tracking-tight text-stone-50">{d.quickLinksTitle}</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map(({ icon: Icon, label, description, href }) => (
            <Link
              key={label}
              href={href}
              className="flex items-center gap-4 rounded-2xl border border-white/[0.09] bg-white/[0.035] px-5 py-4 shadow-[0_16px_40px_-20px_rgba(0,0,0,0.55)] backdrop-blur-2xl transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-500/30 hover:bg-white/[0.05]"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-700/20 bg-amber-950/25 text-amber-500/80">
                <Icon className="h-[18px] w-[18px]" aria-hidden />
              </div>
              <div>
                <p className="font-medium text-stone-100">{label}</p>
                <p className="mt-0.5 text-sm text-stone-500">{description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-16">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight text-stone-50">{dictionary.dashboard.myRecipes}</h2>
          <div className="flex items-center gap-5">
            {ownRecipes.length > 0 && (
              <Link href="/account/recipes" className="text-sm font-medium text-amber-400/90 underline-offset-4 hover:underline">
                {d.manageAll}
              </Link>
            )}
            <Link href="/account/recipes/new" className={`${buttons.secondary} h-10 min-w-0 gap-2 px-5 text-xs`}>
              <Plus className="h-3.5 w-3.5" aria-hidden />
              {d.newRecipeCta}
            </Link>
          </div>
        </div>

        {ownRecipes.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-white/[0.09] bg-white/[0.03] px-6 py-8 text-sm text-stone-500">
            {d.noOwnRecipesYet}
          </p>
        ) : (
          <div className="mt-6 grid gap-7 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 lg:gap-9">
            {ownRecipes.slice(0, 3).map((recipe) => (
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
      </div>

      <div className="mt-16">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold tracking-tight text-stone-50">{d.favoriteRecipesTitle}</h2>
          {favoriteRecipes.length > 0 && (
            <Link href="/recipes" className="text-sm font-medium text-amber-400/90 underline-offset-4 hover:underline">
              {d.browseMore}
            </Link>
          )}
        </div>

        {favoriteRecipes.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-white/[0.09] bg-white/[0.03] px-6 py-8 text-sm text-stone-500">
            {d.noFavoritesYetPrefix}{" "}
            <Link href="/recipes" className="text-amber-400/90 underline-offset-4 hover:underline">
              {d.recipeLibraryLink}
            </Link>{" "}
            {d.noFavoritesYetSuffix}
          </p>
        ) : (
          <div className="mt-6 grid gap-7 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 lg:gap-9">
            {favoriteRecipes.slice(0, 3).map((recipe) => (
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
      </div>

      <div className="mt-16">
        <h2 className="text-xl font-semibold tracking-tight text-stone-50">
          {d.continueBrewing}
        </h2>
        <div className="mt-6 grid gap-7 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 lg:gap-9">
          {recentRecipes.map(({ recipe, slug }) => (
            <RecipeCard
              key={slug}
              recipe={recipe}
              featured={false}
              href={`/recipes/${slug}`}
              labels={recipeCardLabels(dictionary, recipe)}
            />
          ))}
        </div>
      </div>
    </SectionFrame>
  );
}

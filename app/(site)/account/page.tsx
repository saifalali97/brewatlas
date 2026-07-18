import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import {
  BookOpen,
  Bell,
  Clock,
  Coffee,
  Cpu,
  CreditCard,
  FolderOpen,
  Heart,
  Plus,
  Settings2,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";
import { Folio, FolioItem } from "@/app/components/atlas/folio";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { acFocus, acSurface, acTypography } from "@/lib/design-system/atlas-canon";
import { featuredRecipes as staticRecipesEn } from "@/data/homepage";
import { getRecipeSlug } from "@/lib/data/recipes";
import { getUserFavoriteRecipes, getUserRecipes } from "@/lib/data/db-recipes";
import { AccountSubscriptionSummary } from "@/app/components/subscription/account-subscription-summary";
import { getMembershipSummary } from "@/lib/data/membership";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getHomeContent } from "@/lib/i18n/get-home-content";
import { brewMethodLabelKey, difficultyLabelKey } from "@/lib/i18n/home-labels";
import { getLocale } from "@/lib/i18n/locale";
import type { Locale } from "@/types/i18n";
import { translate } from "@/lib/i18n/format";
import type { Dictionary } from "@/lib/i18n/types";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";
import { createClient } from "@/lib/supabase/server";
import { roleIsAdmin } from "@/lib/auth/is-admin";
import { ensureProfile } from "@/lib/supabase/profile";
import { signOutAction } from "@/lib/supabase/actions";
import type { FeaturedRecipe } from "@/types/homepage";
import type { MembershipSummary } from "@/types/membership";
import {
  CSP_CONNECT_SRC,
  isNextNavigationError,
  logAndRethrow,
  logAuthSessionMismatch,
  logSafariAccountComparison,
  logServerAuthDebug,
  logServerAuthException,
  summarizeAuthCookies,
  summarizeCookies,
  summarizeRscRequestHeaders,
} from "@/lib/debug/server-auth-debug";

function recipeFolioMeta(
  dictionary: Dictionary,
  recipe: { brewMethod: string; difficulty: FeaturedRecipe["difficulty"] },
) {
  const brewMethodKey = brewMethodLabelKey(recipe.brewMethod);
  return [
    brewMethodKey ? translate(dictionary, brewMethodKey) : recipe.brewMethod,
    translate(dictionary, difficultyLabelKey(recipe.difficulty)),
  ].join(" · ");
}

export async function generateMetadata(): Promise<Metadata> {
  logServerAuthDebug("AccountPage.generateMetadata", "entry", {});

  try {
    const locale = await getLocale();
    const dictionary = await getDictionary(locale);
    logServerAuthDebug("AccountPage.generateMetadata", "exit", { locale });
    return buildLocalizedMetadata({
      pathname: "/account",
      locale,
      title: dictionary.metadata.dashboardTitle,
      description: dictionary.metadata.dashboardDescription,
      noIndex: true,
    });
  } catch (error) {
    logServerAuthException("AccountPage.generateMetadata", error, { phase: "metadata" });
    throw error;
  }
}

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const authCookies = summarizeAuthCookies(cookieStore.getAll());
  const rscContext = summarizeRscRequestHeaders(headerStore);

  logServerAuthDebug("AccountPage", "entry", {
    cookiesReceived: summarizeCookies(cookieStore.getAll()),
    ...authCookies,
    rsc: rscContext,
    cspConnectSrcAllowsSupabase: CSP_CONNECT_SRC,
  });

  logSafariAccountComparison("AccountPage", "entry", {
    ...authCookies,
    rsc: rscContext,
    fetchCache: "default (no force-cache on /account)",
    serverComponent: true,
    cspConnectSrcAllowsSupabase: CSP_CONNECT_SRC,
  });

  let locale!: Locale;
  let dictionary!: Awaited<ReturnType<typeof getDictionary>>;
  let d!: Awaited<ReturnType<typeof getDictionary>>["dashboardPage"];
  let profile!: {
    full_name: string | null;
    avatar_url: string | null;
    country: string | null;
    bio: string | null;
    role: string | null;
    brewing_methods?: { name: string } | null;
    devices?: { name: string } | null;
  } | null;
  let favoriteRecipes!: Awaited<ReturnType<typeof getUserFavoriteRecipes>>;
  let ownRecipes!: Awaited<ReturnType<typeof getUserRecipes>>;
  let membership!: MembershipSummary;
  let displayName!: string;
  let isAdmin!: boolean;
  let favoriteMethodName!: string;
  let recentRecipes!: Array<{ recipe: FeaturedRecipe; slug: string }>;
  let stats!: Array<{ icon: typeof Heart; label: string; value: string }>;
  let quickLinks!: Array<{
    icon: typeof Heart;
    label: string;
    description: string;
    href: string;
  }>;

  try {
    locale = await getLocale();
    const [loadedDictionary, content] = await Promise.all([
      getDictionary(locale),
      getHomeContent(locale),
    ]);
    dictionary = loadedDictionary;
    d = dictionary.dashboardPage;
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();

    logServerAuthDebug("AccountPage", "step", {
      step: "getUser",
      userId: data.user?.id ?? null,
      ...authCookies,
      rsc: rscContext,
    });

    logSafariAccountComparison("AccountPage", "step", {
      step: "getUser",
      userId: data.user?.id ?? null,
      ...authCookies,
      authCookiePresentButNoUser: authCookies.hasAuthCookies && !data.user,
      rsc: rscContext,
    });

    logAuthSessionMismatch("AccountPage", {
      pathname: "/account",
      browser: rscContext.browser,
      serverComponentUserId: data.user?.id ?? null,
      authCookies,
    });

    if (!data.user) {
      logServerAuthDebug("AccountPage", "redirect", {
        target: "/login?redirectTo=/account",
        userId: null,
        reason: "unauthenticated",
      });
      redirect("/login?redirectTo=/account");
    }

    logServerAuthDebug("AccountPage", "step", { step: "ensureProfile", userId: data.user.id });
    await ensureProfile(supabase, data.user);

    logServerAuthDebug("AccountPage", "step", { step: "loadDashboardData", userId: data.user.id });
    const [profileResult, loadedFavorites, loadedOwnRecipes, loadedMembership] = await Promise.all([
      supabase
        .from("profiles")
        .select("full_name, avatar_url, country, bio, role, brewing_methods(name), devices(name)")
        .eq("id", data.user.id)
        .maybeSingle(),
      getUserFavoriteRecipes(supabase, data.user.id),
      getUserRecipes(supabase, data.user.id),
      getMembershipSummary(supabase, data.user.id),
    ]);

    profile = profileResult.data as typeof profile;
    favoriteRecipes = loadedFavorites;
    ownRecipes = loadedOwnRecipes;
    membership = loadedMembership;

    logServerAuthDebug("AccountPage", "step", {
      step: "dashboardDataLoaded",
      userId: data.user.id,
      favoriteCount: favoriteRecipes.length,
      ownRecipeCount: ownRecipes.length,
      membershipPlan: membership.plan,
    });

    displayName = profile?.full_name || data.user.email || dictionary.communityPage.anonymousBrewer;
    isAdmin = roleIsAdmin(profile?.role);
    favoriteMethodName =
      (profile as { brewing_methods?: { name: string } | null } | null)?.brewing_methods?.name ?? d.notSet;
    recentRecipes = content.featuredRecipes.slice(0, 3).map((recipe, index) => ({
      recipe,
      slug: getRecipeSlug(staticRecipesEn[index]),
    }));

    stats = [
      { icon: Heart, label: d.savedRecipesLabel, value: String(favoriteRecipes.length) },
      { icon: Coffee, label: d.recipesCreatedLabel, value: String(ownRecipes.length) },
      { icon: BookOpen, label: d.favoriteMethodLabel, value: favoriteMethodName },
    ];

    quickLinks = [
      { icon: Sparkles, label: d.aiCoachLabel, description: d.aiCoachDescription, href: "/coach" },
      { icon: Clock, label: d.brewHistoryLabel, description: d.brewHistoryDescription, href: "/account/brew-history" },
      { icon: Users, label: d.communityLabel, description: d.communityDescription, href: "/community" },
      { icon: Coffee, label: d.premiumLabel, description: d.premiumDescription, href: "/premium" },
      { icon: CreditCard, label: d.subscriptionLabel, description: d.subscriptionDescription, href: "/account/subscription" },
      { icon: Cpu, label: d.xbloomProfilesLabel, description: d.xbloomProfilesDescription, href: "/account/xbloom" },
      { icon: Wrench, label: d.coffeeSetupLabel, description: d.coffeeSetupDescription, href: "/account/coffee-setup" },
      { icon: Bell, label: d.notificationsLabel, description: d.notificationsDescription, href: "/account/notifications" },
      { icon: Settings2, label: d.notificationPreferencesLabel, description: d.notificationPreferencesDescription, href: "/account/notification-preferences" },
      { icon: Heart, label: d.savedRecipesLabel, description: d.savedRecipesDescription, href: "/account/favorites" },
      { icon: FolderOpen, label: d.collectionsLabel, description: d.collectionsDescription, href: "/account/collections" },
    ];

    logServerAuthDebug("AccountPage", "exit", { userId: data.user.id });
  } catch (error) {
    if (!isNextNavigationError(error)) {
      logServerAuthException("AccountPage", error, { phase: "data-load" });
    }
    logAndRethrow("AccountPage", error, { phase: "data-load" });
  }

  return (
    <SectionFrame id="dashboard-page" ariaLabelledBy="dashboard-page-heading" padding="compact">
      
<div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader headingId="dashboard-page-heading"
          eyebrow={dictionary.profilePage.eyebrow}
          title={translate(dictionary, "dashboard.welcomeBack", { name: displayName })}
          description={d.snapshotDescription}
          centered={false}
        />

        <form action={signOutAction}>
          <button
            type="submit"
            className={`${acTypography.nav} h-10 rounded-full border border-ac-espresso/12 px-6 text-ac-walnut/70 hover:border-ac-copper/35 hover:text-ac-espresso ${acFocus.ring}`}
          >
            {d.signOut}
          </button>
        </form>
      </div>

      <dl className="grid gap-8 border-b border-ac-espresso/[0.08] pb-10 sm:grid-cols-3">
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label}>
            <dt className={acTypography.eyebrow}>{label}</dt>
            <dd className="mt-3 flex items-center gap-3">
              <Icon className="h-4 w-4 text-ac-copper" aria-hidden />
              <span className="font-display text-3xl tracking-[-0.03em] text-ac-espresso">{value}</span>
            </dd>
          </div>
        ))}
      </dl>

      <div className={`${acSurface.plate} mt-10 flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8`}>
        <div className="flex items-center gap-4">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-ba-espresso/10 bg-ba-sand/30">
            {profile?.avatar_url ? (
              <Image src={profile.avatar_url} alt="" fill sizes="56px" className="object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-lg font-medium text-ba-coffee/55">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <p className={acTypography.h3}>{displayName}</p>
            <p className={`${acTypography.folioMeta} mt-1`}>
              {profile?.country || d.countryNotSet}
              {profile?.bio ? ` · ${profile.bio}` : ""}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {isAdmin ? (
            <Link
              href="/admin"
              className={`inline-flex h-10 items-center rounded-full border border-ac-copper/40 px-6 text-sm font-medium text-ac-espresso hover:border-ac-copper/60 ${acFocus.ring}`}
            >
              {d.adminDashboard}
            </Link>
          ) : null}
          <Link
            href="/account/profile"
            className={`${acTypography.nav} inline-flex h-10 items-center px-4 text-ac-copper hover:text-ac-espresso ${acFocus.ring}`}
          >
            {d.editProfile} →
          </Link>
        </div>
      </div>

      <AccountSubscriptionSummary membership={membership} dictionary={dictionary} locale={locale} />

      <div className="mt-16">
        <h2 className={acTypography.h2}>{d.quickLinksTitle}</h2>
        <Folio ariaLabel={d.quickLinksTitle} className="mt-8">
          {quickLinks.map(({ label, description, href }, index) => (
            <FolioItem
              key={label}
              href={href}
              index={String(index + 1).padStart(2, "0")}
              title={label}
              description={description}
            />
          ))}
        </Folio>
      </div>

      <div className="mt-16">
        <div className="flex items-center justify-between gap-4">
          <h2 className={acTypography.h2}>{dictionary.dashboard.myRecipes}</h2>
          <div className="flex items-center gap-5">
            {ownRecipes.length > 0 ? (
              <Link href="/account/recipes" className={`${acTypography.nav} text-ac-copper hover:text-ac-espresso ${acFocus.ring}`}>
                {d.manageAll}
              </Link>
            ) : null}
            <Link
              href="/account/recipes/new"
              className={`inline-flex h-10 items-center gap-2 rounded-full border border-ac-copper/35 px-5 text-sm font-medium text-ac-espresso hover:border-ac-copper/55 ${acFocus.ring}`}
            >
              <Plus className="h-3.5 w-3.5" aria-hidden />
              {d.newRecipeCta}
            </Link>
          </div>
        </div>

        {ownRecipes.length === 0 ? (
          <p className={`${acTypography.body} mt-6 ${acSurface.plate} px-6 py-8`}>{d.noOwnRecipesYet}</p>
        ) : (
          <Folio ariaLabel={dictionary.dashboard.myRecipes} className="mt-6">
            {ownRecipes.slice(0, 3).map((recipe, index) => (
              <FolioItem
                key={recipe.id}
                href={`/recipes/${recipe.slug}`}
                index={String(index + 1).padStart(2, "0")}
                title={recipe.name}
                imageSrc={recipe.image ?? undefined}
                imageGrade="library"
                meta={<p className={acTypography.folioMeta}>{recipeFolioMeta(dictionary, recipe)}</p>}
              />
            ))}
          </Folio>
        )}
      </div>

      <div className="mt-16">
        <div className="flex items-center justify-between gap-4">
          <h2 className={acTypography.h2}>{d.favoriteRecipesTitle}</h2>
          {favoriteRecipes.length > 0 ? (
            <Link href="/recipes" className={`${acTypography.nav} text-ac-copper hover:text-ac-espresso ${acFocus.ring}`}>
              {d.browseMore}
            </Link>
          ) : null}
        </div>

        {favoriteRecipes.length === 0 ? (
          <p className={`${acTypography.body} mt-6 ${acSurface.plate} px-6 py-8`}>
            {d.noFavoritesYetPrefix}{" "}
            <Link href="/recipes" className={`text-ac-copper hover:text-ac-espresso ${acFocus.ring}`}>
              {d.recipeLibraryLink}
            </Link>{" "}
            {d.noFavoritesYetSuffix}
          </p>
        ) : (
          <Folio ariaLabel={d.favoriteRecipesTitle} className="mt-6">
            {favoriteRecipes.slice(0, 3).map((recipe, index) => (
              <FolioItem
                key={recipe.id}
                href={`/recipes/${recipe.slug}`}
                index={String(index + 1).padStart(2, "0")}
                title={recipe.name}
                imageSrc={recipe.image ?? undefined}
                imageGrade="library"
                meta={<p className={acTypography.folioMeta}>{recipeFolioMeta(dictionary, recipe)}</p>}
              />
            ))}
          </Folio>
        )}
      </div>

      <div className="mt-16">
        <h2 className={acTypography.h2}>{d.continueBrewing}</h2>
        <Folio ariaLabel={d.continueBrewing} className="mt-6">
          {recentRecipes.map(({ recipe, slug }, index) => (
            <FolioItem
              key={slug}
              href={`/recipes/${slug}`}
              index={String(index + 1).padStart(2, "0")}
              title={recipe.name}
              imageSrc={recipe.image}
              imageGrade="library"
              meta={<p className={acTypography.folioMeta}>{recipeFolioMeta(dictionary, recipe)}</p>}
            />
          ))}
        </Folio>
      </div>
    </SectionFrame>
  );
}

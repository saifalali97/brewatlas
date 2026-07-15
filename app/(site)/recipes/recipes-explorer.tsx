"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Lock, Search } from "lucide-react";
import { RecipeCard } from "@/app/components/cards/recipe-card";
import { FavoriteButton } from "@/app/components/recipes/favorite-button";
import { EmptyState } from "@/app/components/ui/empty-state";
import { RippleLink } from "@/app/components/ui/ripple-link";
import { buttons } from "@/lib/constants/styles";
import { GUEST_RECIPE_LIMIT } from "@/lib/membership/premium";
import { brewMethodLabelKey, difficultyLabelKey } from "@/lib/i18n/home-labels";
import { useTranslations } from "@/lib/i18n/translation-context";
import type { RecipeListItem } from "@/types/recipe";

const filters = ["All", "V60", "Espresso", "Chemex", "Aeropress", "Cold Brew"] as const;

type Filter = (typeof filters)[number];

const filterLabelKeys: Record<
  Filter,
  "homeFilters.all" | "homeFilters.v60" | "homeFilters.espresso" | "homeFilters.chemex" | "homeFilters.aeropress" | "homeFilters.coldBrew"
> = {
  All: "homeFilters.all",
  V60: "homeFilters.v60",
  Espresso: "homeFilters.espresso",
  Chemex: "homeFilters.chemex",
  Aeropress: "homeFilters.aeropress",
  "Cold Brew": "homeFilters.coldBrew",
};

type RecipesExplorerProps = {
  recipes: RecipeListItem[];
  favoritedRecipeIds?: string[];
  isAuthenticated?: boolean;
  isPremium?: boolean;
  hiddenRecipeCount?: number;
  currentPath?: string;
  initialQuery?: string;
};

export function RecipesExplorer({
  recipes,
  favoritedRecipeIds = [],
  isAuthenticated = false,
  isPremium = false,
  hiddenRecipeCount = 0,
  currentPath = "/recipes",
  initialQuery = "",
}: RecipesExplorerProps) {
  const { t } = useTranslations();
  const [activeFilter, setActiveFilter] = useState<Filter>("All");
  const [search, setSearch] = useState(initialQuery);
  const favoritedSet = useMemo(() => new Set(favoritedRecipeIds), [favoritedRecipeIds]);
  const normalizedSearch = search.trim().toLowerCase();

  const filteredRecipes = recipes.filter((recipe) => {
    if (activeFilter !== "All" && recipe.brewMethod !== activeFilter) {
      return false;
    }

    if (!normalizedSearch) return true;

    const haystack = [
      recipe.name,
      recipe.roasterName,
      recipe.origin,
      recipe.country,
      recipe.brewMethod,
      recipe.deviceName,
      recipe.roastLevel,
      recipe.difficulty,
      ...(recipe.tags ?? []),
      ...(recipe.searchableExtras ?? []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalizedSearch);
  });

  const visibleRecipes =
    isPremium || isAuthenticated ? filteredRecipes : filteredRecipes.slice(0, GUEST_RECIPE_LIMIT);
  const lockedCount = isPremium || isAuthenticated ? 0 : Math.max(0, filteredRecipes.length - GUEST_RECIPE_LIMIT);
  const guestLimitBannerCount = hiddenRecipeCount > 0 ? hiddenRecipeCount : lockedCount;

  return (
    <div>
      <div className="mb-8">
        <label htmlFor="recipe-search" className="sr-only">
          {t("recipesPage.searchAriaLabel")}
        </label>
        <div className="relative max-w-md">
          <Search
            className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500"
            aria-hidden
          />
          <input
            id="recipe-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("recipesPage.searchPlaceholder")}
            className="w-full rounded-full border border-white/[0.1] bg-white/[0.04] py-3 ps-11 pe-5 text-sm text-stone-100 outline-none backdrop-blur-xl transition-colors duration-300 placeholder:text-stone-500 focus:border-amber-500/45"
          />
        </div>
      </div>

      <div className="mb-10 flex flex-wrap gap-2.5 md:mb-12">
        {filters.map((filter) => {
          const isActive = activeFilter === filter;
          const filterLabel = t(filterLabelKeys[filter]);
          return (
            <button
              key={filter}
              type="button"
              aria-label={t("homeFilters.filterByAria", { filter: filterLabel })}
              aria-pressed={isActive}
              onClick={() => setActiveFilter(filter)}
              className={`rounded-full border px-4 py-2.5 text-sm font-medium backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 active:scale-[0.98] ${
                isActive
                  ? "border-amber-600/45 bg-amber-950/50 text-amber-100 shadow-[0_0_32px_rgba(217,119,6,0.14)]"
                  : "border-white/[0.1] bg-white/[0.04] text-stone-400 hover:border-amber-600/25 hover:bg-white/[0.06] hover:text-stone-200 hover:shadow-[0_0_24px_rgba(217,119,6,0.08)]"
              }`}
            >
              {filterLabel}
            </button>
          );
        })}
      </div>

      <div className="grid gap-7 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 lg:gap-9">
        {visibleRecipes.map((recipe) => {
          const brewMethodKey = brewMethodLabelKey(recipe.brewMethod);
          return (
            <div key={`${recipe.source}-${recipe.slug}`} className="relative h-full">
              <RecipeCard
                recipe={recipe}
                featured={Boolean(recipe.featured) && activeFilter === "All" && !normalizedSearch}
                href={`/recipes/${recipe.slug}`}
                labels={{
                  premium: t("common.premiumBadge"),
                  editorsChoice: t("homeFeaturedRecipes.editorsChoice"),
                  ratio: t("homeFeaturedRecipes.ratioLabel"),
                  time: t("homeFeaturedRecipes.timeLabel"),
                  difficultyLabel: t(difficultyLabelKey(recipe.difficulty)),
                  brewMethodLabel: brewMethodKey ? t(brewMethodKey) : recipe.brewMethod,
                  imageAltTemplate: t("homeFeaturedRecipes.imageAltTemplate"),
                }}
              />
              {isAuthenticated && recipe.source === "db" && recipe.id && (
                <div className="pointer-events-none absolute inset-0">
                  <div className="pointer-events-auto absolute bottom-6 end-6 z-10">
                    <FavoriteButton
                      recipeId={recipe.id}
                      isFavorited={favoritedSet.has(recipe.id)}
                      currentPath={currentPath}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!isAuthenticated && !isPremium && guestLimitBannerCount > 0 && (
        <div className="relative mt-12 overflow-hidden rounded-[1.5rem] border border-amber-600/25 bg-gradient-to-b from-amber-950/35 via-[#0a0705]/90 to-[#0a0705] p-8 text-center shadow-[0_24px_64px_-24px_rgba(180,120,60,0.35)] sm:p-10">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-amber-600/10 blur-3xl"
          />
          <div className="relative mx-auto max-w-lg">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-amber-600/30 bg-amber-950/50 text-amber-400/90">
              <Lock className="h-5 w-5" aria-hidden />
            </div>
            <h2 className="mt-5 text-xl font-semibold tracking-tight text-stone-50 sm:text-2xl">
              {t("recipesPage.guestLimitTitle")}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-stone-400 sm:text-base">
              {t("recipesPage.guestLimitDescription", { count: String(guestLimitBannerCount) })}
            </p>
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <RippleLink href={`/login?redirectTo=${encodeURIComponent(currentPath)}`} className={`${buttons.primary} w-full sm:w-auto`}>
                {t("recipesPage.guestLimitSignInCta")}
              </RippleLink>
              <Link href="/premium" className={`${buttons.secondary} w-full sm:w-auto`}>
                {t("recipesPage.guestLimitPremiumCta")}
              </Link>
            </div>
          </div>
        </div>
      )}

      {visibleRecipes.length === 0 && (
        <EmptyState
          icon={<Search className="h-6 w-6" aria-hidden />}
          title={t("emptyStates.noRecipesMatchSearch")}
          description={t("emptyStates.noResultsHint")}
          actionLabel={t("emptyStates.startExploring")}
          actionHref="/recipes"
        />
      )}
    </div>
  );
}

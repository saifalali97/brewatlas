"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Cover } from "@/app/components/atlas/cover";
import { Folio, FolioItem } from "@/app/components/atlas/folio";
import { DifficultyIndicator } from "@/app/components/ui/difficulty-indicator";
import { EmptyState } from "@/app/components/ui/empty-state";
import { ArchiveMasthead } from "@/app/components/recipes/archive-masthead";
import { GuestArchiveInvitation } from "@/app/components/recipes/guest-archive-invitation";
import { PAGE_EDITORIAL_IMAGES } from "@/lib/media/page-images";
import {
  MethodIndex,
  type MethodFilter,
} from "@/app/components/recipes/method-index";
import { FavoriteButton } from "@/app/components/recipes/favorite-button";
import { OfficialRecipeBadge } from "@/app/components/recipes/official-recipe-badge";
import { acTypography } from "@/lib/design-system/atlas-canon";
import { MotionReveal } from "@/lib/design-system/motion";
import { GUEST_RECIPE_LIMIT } from "@/lib/membership/premium";
import { brewMethodLabelKey, difficultyLabelKey } from "@/lib/i18n/home-labels";
import { interpolate } from "@/lib/i18n/format";
import { useTranslations } from "@/lib/i18n/translation-context";
import type { DictionaryKey } from "@/lib/i18n/types";
import type { RecipeListItem } from "@/types/recipe";

type RecipesExplorerProps = {
  recipes: RecipeListItem[];
  favoritedRecipeIds?: string[];
  isAuthenticated?: boolean;
  isPremium?: boolean;
  hiddenRecipeCount?: number;
  currentPath?: string;
  initialQuery?: string;
};

function groupRecipesByLetter(recipes: RecipeListItem[]) {
  const groups = new Map<string, RecipeListItem[]>();

  for (const recipe of recipes) {
    const first = recipe.name.trim().charAt(0).toUpperCase();
    const letter = /[A-Z]/i.test(first) ? first.toUpperCase() : "#";
    const bucket = groups.get(letter) ?? [];
    bucket.push(recipe);
    groups.set(letter, bucket);
  }

  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
}

function buildFolioEntries(folioRecipes: RecipeListItem[], useLetterGroups: boolean) {
  const groups: Array<[string, RecipeListItem[]]> = useLetterGroups
    ? groupRecipesByLetter(folioRecipes)
    : [["", folioRecipes]];

  return groups.map(([letter, groupRecipes], groupIndex) => {
    const priorCount = groups
      .slice(0, groupIndex)
      .reduce((sum, [, recipes]) => sum + recipes.length, 0);

    return {
      letter,
      items: groupRecipes.map((recipe, index) => ({
        recipe,
        indexLabel: String(priorCount + index + 1).padStart(2, "0"),
      })),
    };
  });
}

function recipeLabels(
  recipe: RecipeListItem,
  t: (key: DictionaryKey, params?: Record<string, string | number>) => string,
) {
  const brewMethodKey = brewMethodLabelKey(recipe.brewMethod);
  return {
    difficultyLabel: t(difficultyLabelKey(recipe.difficulty)),
    brewMethodLabel: brewMethodKey ? t(brewMethodKey) : recipe.brewMethod,
    imageAlt: interpolate(t("homeFeaturedRecipes.imageAltTemplate"), {
      name: recipe.name,
      country: recipe.country,
      brewMethod: recipe.brewMethod,
      roastLevel: recipe.roastLevel,
    }),
  };
}

/** The Archive — cover feature, folio index, method navigation, invitation paywall. */
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
  const [activeFilter, setActiveFilter] = useState<MethodFilter>("All");
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

  const showCover = activeFilter === "All" && !normalizedSearch && visibleRecipes.length > 0;
  const coverRecipe = showCover
    ? visibleRecipes.find((recipe) => recipe.featured) ?? visibleRecipes[0]
    : null;

  const folioRecipes = coverRecipe
    ? visibleRecipes.filter((recipe) => recipe.slug !== coverRecipe.slug)
    : visibleRecipes;

  const useLetterGroups = activeFilter === "All" && !normalizedSearch;
  const folioEntries = buildFolioEntries(folioRecipes, useLetterGroups);

  return (
    <div>
      <ArchiveMasthead
        headingId="recipes-archive-heading"
        issueLabel={`${t("recipesPage.eyebrow")} · Vol. I`}
        title={t("recipesPage.title")}
        description={t("recipesPage.description")}
        searchLabel={t("recipesPage.searchAriaLabel")}
        searchPlaceholder={t("recipesPage.searchPlaceholder")}
        searchValue={search}
        onSearchChange={setSearch}
      />

      <MethodIndex
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        getLabel={(key) => t(key)}
        filterByAria={(filter) => t("homeFilters.filterByAria", { filter })}
      />

      {coverRecipe && (
        <MotionReveal className="mt-16">
          {(() => {
            const labels = recipeLabels(coverRecipe, t);
            return (
              <Cover
                href={`/recipes/${coverRecipe.slug}`}
                title={coverRecipe.name}
                eyebrow={
                  coverRecipe.featured
                    ? t("homeFeaturedRecipes.editorsChoice")
                    : `${coverRecipe.country} · ${labels.brewMethodLabel}`
                }
                imageSrc={coverRecipe.image}
                imageAlt={labels.imageAlt}
                ctaLabel={t("homeDiscover.enterLabel")}
                grade="library"
                priority
                meta={
                  <div className="space-y-4">
                    <p className={acTypography.body}>{coverRecipe.notes}</p>
                    <div className="flex flex-wrap items-center gap-6 text-sm text-ac-espresso">
                      <DifficultyIndicator
                        level={coverRecipe.difficulty}
                        label={labels.difficultyLabel}
                        labelClassName="text-sm text-ac-espresso"
                      />
                      <span>
                        {t("homeFeaturedRecipes.ratioLabel")}{" "}
                        <strong className="text-ac-espresso">{coverRecipe.ratio}</strong>
                      </span>
                      <span>
                        {t("homeFeaturedRecipes.timeLabel")}{" "}
                        <strong className="text-ac-espresso">{coverRecipe.time}</strong>
                      </span>
                    </div>
                  </div>
                }
              />
            );
          })()}
        </MotionReveal>
      )}

      {folioRecipes.length > 0 && (
        <div className="mt-20">
          {folioEntries.map(({ letter, items }) => (
            <section key={letter || "all"} className={letter ? "mt-12 first:mt-0" : undefined}>
              {letter ? (
                <p className={acTypography.eyebrow} aria-hidden>
                  {letter}
                </p>
              ) : null}
              <Folio
                ariaLabel={t("recipesPage.title")}
                className={letter ? "mt-4" : undefined}
              >
                {items.map(({ recipe, indexLabel }) => {
                  const labels = recipeLabels(recipe, t);

                  return (
                    <FolioItem
                      key={`${recipe.source}-${recipe.slug}`}
                      href={`/recipes/${recipe.slug}`}
                      title={recipe.name}
                      index={indexLabel}
                      imageSrc={recipe.image}
                      imageAlt={labels.imageAlt}
                      description={recipe.notes}
                      meta={
                        <p className={acTypography.folioMeta}>
                          {recipe.isVerifiedOfficial ? (
                            <>
                              <OfficialRecipeBadge
                                verificationStatus={recipe.verificationStatus ?? "verified"}
                                versionLabel={recipe.versionLabel}
                                compact
                              />
                              {" · "}
                            </>
                          ) : null}
                          {recipe.country} · {labels.brewMethodLabel}
                          {recipe.ratio ? ` · ${recipe.ratio}` : ""}
                        </p>
                      }
                      trailing={
                        isAuthenticated && recipe.source === "db" && recipe.id ? (
                          <FavoriteButton
                            recipeId={recipe.id}
                            isFavorited={favoritedSet.has(recipe.id)}
                            currentPath={currentPath}
                          />
                        ) : undefined
                      }
                    />
                  );
                })}
              </Folio>
            </section>
          ))}
        </div>
      )}

      {!isAuthenticated && !isPremium && guestLimitBannerCount > 0 && (
        <GuestArchiveInvitation
          title={t("recipesPage.guestLimitTitle")}
          description={t("recipesPage.guestLimitDescription", {
            count: String(guestLimitBannerCount),
          })}
          signInHref={`/login?redirectTo=${encodeURIComponent(currentPath)}`}
          signInLabel={t("recipesPage.guestLimitSignInCta")}
          premiumHref="/premium"
          premiumLabel={t("recipesPage.guestLimitPremiumCta")}
        />
      )}

      {visibleRecipes.length === 0 && (
        <EmptyState
          icon={<Search className="h-6 w-6" aria-hidden />}
          title={t("emptyStates.noRecipesMatchSearch")}
          description={t("emptyStates.noResultsHint")}
          actionLabel={t("emptyStates.startExploring")}
          actionHref="/recipes"
          imageSrc={PAGE_EDITORIAL_IMAGES.emptyRecipes}
          imageAlt={t("emptyStates.noRecipesMatchSearch")}
          className="mt-16"
        />
      )}
    </div>
  );
}

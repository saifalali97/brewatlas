"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
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
import { acFocus, acMotion, acTypography } from "@/lib/design-system/atlas-canon";
import { MotionReveal } from "@/lib/design-system/motion";
import { GUEST_RECIPE_LIMIT } from "@/lib/membership/premium";
import { brewMethodLabelKey, difficultyLabelKey } from "@/lib/i18n/home-labels";
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
  };
}

type RecipeListMetaProps = {
  recipe: RecipeListItem;
  brewMethodLabel: string;
  ratioLabel: string;
};

function RecipeListMeta({ recipe, brewMethodLabel, ratioLabel }: RecipeListMetaProps) {
  const detailParts = [
    recipe.origin,
    recipe.country,
    brewMethodLabel,
    recipe.ratio ? `${ratioLabel} ${recipe.ratio}` : null,
  ].filter(Boolean);

  return (
    <>
      {detailParts.length > 0 ? (
        <p className={`${acTypography.folioMeta} text-ac-espresso/62`}>{detailParts.join(" · ")}</p>
      ) : null}
      {recipe.isVerifiedOfficial ? (
        <div className="pt-0.5">
          <OfficialRecipeBadge
            verificationStatus={recipe.verificationStatus ?? "verified"}
            versionLabel={recipe.versionLabel}
            compact
            listTone
          />
        </div>
      ) : null}
    </>
  );
}

type RecipesArchiveLeadProps = {
  recipe: RecipeListItem;
  brewMethodLabel: string;
  difficultyLabel: string;
  ratioLabel: string;
  timeLabel: string;
  editorsChoiceLabel: string;
  ctaLabel: string;
};

/** Text-only featured entry — editorial lead, no photography. */
function RecipesArchiveLead({
  recipe,
  brewMethodLabel,
  difficultyLabel,
  ratioLabel,
  timeLabel,
  editorsChoiceLabel,
  ctaLabel,
}: RecipesArchiveLeadProps) {
  const eyebrow = recipe.featured
    ? editorsChoiceLabel
    : `${recipe.country} · ${brewMethodLabel}`;

  return (
    <Link
      href={`/recipes/${recipe.slug}`}
      className={`group block border-b border-ac-espresso/[0.08] pb-12 sm:pb-16 ${acFocus.ring} ${acMotion.transitionReveal}`}
    >
      <p className={acTypography.eyebrow}>{eyebrow}</p>
      <div className="mt-6 lg:mt-8">
        <h2 className={`max-w-3xl ${acTypography.displayLg}`}>{recipe.name}</h2>
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
          {recipe.isVerifiedOfficial ? (
            <OfficialRecipeBadge
              verificationStatus={recipe.verificationStatus ?? "verified"}
              versionLabel={recipe.versionLabel}
              compact
            />
          ) : null}
          {recipe.origin ? (
            <p className="text-sm font-medium tracking-wide text-ac-palm">{recipe.origin}</p>
          ) : null}
        </div>
        {recipe.notes ? (
          <p className={`mt-5 max-w-2xl ${acTypography.body} leading-[1.75]`}>{recipe.notes}</p>
        ) : null}
        <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-ac-espresso/[0.06] pt-8 text-sm text-ac-espresso/80">
          <span className="font-medium text-ac-espresso">{brewMethodLabel}</span>
          {recipe.ratio ? (
            <span>
              {ratioLabel}{" "}
              <strong className="font-medium text-ac-espresso">{recipe.ratio}</strong>
            </span>
          ) : null}
          <DifficultyIndicator
            level={recipe.difficulty}
            label={difficultyLabel}
            labelClassName="text-sm text-ac-espresso/80"
          />
          {recipe.time ? (
            <span>
              {timeLabel}{" "}
              <strong className="font-medium text-ac-espresso">{recipe.time}</strong>
            </span>
          ) : null}
        </div>
        <span
          className={`${acTypography.nav} mt-8 inline-flex items-center gap-2 text-ac-espresso ${acMotion.transition}`}
        >
          {ctaLabel}
          <span
            aria-hidden
            className="inline-block transition-transform duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1 motion-reduce:transform-none"
          >
            →
          </span>
        </span>
      </div>
    </Link>
  );
}

/** The Archive — folio index, method navigation, invitation paywall. */
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
  const ratioLabel = t("homeFeaturedRecipes.ratioLabel");
  const timeLabel = t("homeFeaturedRecipes.timeLabel");

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
        <MotionReveal className="mt-14 sm:mt-16">
          {(() => {
            const labels = recipeLabels(coverRecipe, t);
            return (
              <RecipesArchiveLead
                recipe={coverRecipe}
                brewMethodLabel={labels.brewMethodLabel}
                difficultyLabel={labels.difficultyLabel}
                ratioLabel={ratioLabel}
                timeLabel={timeLabel}
                editorsChoiceLabel={t("homeFeaturedRecipes.editorsChoice")}
                ctaLabel={t("homeDiscover.enterLabel")}
              />
            );
          })()}
        </MotionReveal>
      )}

      {folioRecipes.length > 0 && (
        <div className="mt-14 sm:mt-20">
          {folioEntries.map(({ letter, items }) => (
            <section key={letter || "all"} className={letter ? "mt-14 first:mt-0 sm:mt-16" : undefined}>
              {letter ? (
                <p className={`${acTypography.eyebrow} text-ac-espresso/50`} aria-hidden>
                  {letter}
                </p>
              ) : null}
              <Folio
                ariaLabel={t("recipesPage.title")}
                className={letter ? "mt-3 sm:mt-4" : undefined}
              >
                {items.map(({ recipe, indexLabel }) => {
                  const labels = recipeLabels(recipe, t);
                  const isFavorited =
                    Boolean(recipe.id) && favoritedSet.has(recipe.id as string);

                  return (
                    <FolioItem
                      key={`${recipe.source}-${recipe.slug}`}
                      href={`/recipes/${recipe.slug}`}
                      title={recipe.name}
                      index={indexLabel}
                      description={recipe.notes}
                      editorialInteractive
                      meta={
                        <RecipeListMeta
                          recipe={recipe}
                          brewMethodLabel={labels.brewMethodLabel}
                          ratioLabel={ratioLabel}
                        />
                      }
                      trailing={
                        isAuthenticated && recipe.source === "db" && recipe.id ? (
                          <div
                            className={[
                              "transition-opacity duration-200 ease-out",
                              isFavorited
                                ? "opacity-100"
                                : "opacity-100 lg:opacity-0 lg:group-hover/row:opacity-100 lg:group-focus-within/row:opacity-100",
                            ].join(" ")}
                          >
                            <FavoriteButton
                              recipeId={recipe.id}
                              isFavorited={isFavorited}
                              currentPath={currentPath}
                            />
                          </div>
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

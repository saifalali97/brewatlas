"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { RecipeCard } from "@/app/components/cards/recipe-card";
import { dsFocus, dsMotion, filterChips } from "@/lib/constants/styles";
import { EmptyState } from "@/app/components/ui/empty-state";
import { RippleLink } from "@/app/components/ui/ripple-link";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { SectionIntro } from "@/app/components/ui/section-intro";
import { brewMethodLabelKey, difficultyLabelKey } from "@/lib/i18n/home-labels";
import { useTranslations } from "@/lib/i18n/translation-context";
import type { FeaturedRecipe } from "@/types/homepage";

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

type FeaturedRecipeItem = {
  recipe: FeaturedRecipe;
  slug: string;
};

type FeaturedRecipesSectionProps = {
  items: FeaturedRecipeItem[];
  btnSecondary: string;
};

/** Horizontal premium recipe rail — editorial, not a generic grid. */
export function FeaturedRecipesSection({ items, btnSecondary }: FeaturedRecipesSectionProps) {
  const { t } = useTranslations();
  const [activeFilter, setActiveFilter] = useState<Filter>("All");

  const filteredItems =
    activeFilter === "All"
      ? items
      : items.filter(({ recipe }) => recipe.brewMethod === activeFilter);

  const scrollRail = (direction: "left" | "right") => {
    const rail = document.getElementById("featured-recipes-rail");
    if (!rail) return;
    const amount = direction === "left" ? -360 : 360;
    rail.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <SectionFrame id="recipes" ariaLabelledBy="recipes-heading" theme="light" padding="compact">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <SectionIntro
          headingId="recipes-heading"
          eyebrow={t("homeFeaturedRecipes.eyebrow")}
          title={t("homeFeaturedRecipes.title")}
          description={t("homeFeaturedRecipes.description")}
        />
        <div className="hidden gap-2 lg:flex">
          <button
            type="button"
            onClick={() => scrollRail("left")}
            aria-label="Scroll recipes left"
            className={`flex h-11 w-11 items-center justify-center rounded-full border border-ba-espresso/10 bg-ba-pearl ${dsMotion.transition} hover:border-ba-bronze/30 ${dsFocus.ring}`}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => scrollRail("right")}
            aria-label="Scroll recipes right"
            className={`flex h-11 w-11 items-center justify-center rounded-full border border-ba-espresso/10 bg-ba-pearl ${dsMotion.transition} hover:border-ba-bronze/30 ${dsFocus.ring}`}
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
          </button>
        </div>
      </div>

      <div className="mb-8 flex flex-wrap gap-2.5">
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
              className={`${filterChips.base} ${isActive ? filterChips.active : filterChips.inactive}`}
            >
              {filterLabel}
            </button>
          );
        })}
      </div>

      {filteredItems.length === 0 ? (
        <EmptyState title={t("homeFeaturedRecipes.noResults")} />
      ) : (
        <div
          id="featured-recipes-rail"
          className="scrollbar-hide -mx-6 flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-4 sm:-mx-8 sm:px-8 lg:-mx-12 lg:gap-8 lg:px-12"
        >
          {filteredItems.map(({ recipe, slug }, index) => {
            const brewMethodKey = brewMethodLabelKey(recipe.brewMethod);
            return (
              <div
                key={slug}
                className="w-[85vw] shrink-0 snap-start sm:w-[22rem] lg:w-[26rem]"
              >
                <RecipeCard
                  recipe={recipe}
                  featured={index === 0 && activeFilter === "All"}
                  href={`/recipes/${slug}`}
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
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-12 text-center">
        <RippleLink href="/recipes" className={btnSecondary}>
          {t("homeFeaturedRecipes.viewAll")}
        </RippleLink>
      </div>
    </SectionFrame>
  );
}

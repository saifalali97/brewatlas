"use client";

import { useState } from "react";
import { RecipeCard } from "@/app/components/cards/recipe-card";
import { dsFocus, dsMotion } from "@/lib/constants/styles";
import { EmptyState } from "@/app/components/ui/empty-state";
import { RippleLink } from "@/app/components/ui/ripple-link";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { SectionIntro } from "@/app/components/ui/section-intro";
import { brewMethodLabelKey, difficultyLabelKey } from "@/lib/i18n/home-labels";
import { useTranslations } from "@/lib/i18n/translation-context";
import type { FeaturedRecipe } from "@/types/homepage";

const filters = ["All", "V60", "Espresso", "Chemex", "Aeropress", "Cold Brew"] as const;

type Filter = (typeof filters)[number];

const filterLabelKeys: Record<Filter, "homeFilters.all" | "homeFilters.v60" | "homeFilters.espresso" | "homeFilters.chemex" | "homeFilters.aeropress" | "homeFilters.coldBrew"> = {
  All: "homeFilters.all",
  V60: "homeFilters.v60",
  Espresso: "homeFilters.espresso",
  Chemex: "homeFilters.chemex",
  Aeropress: "homeFilters.aeropress",
  "Cold Brew": "homeFilters.coldBrew",
};

type FeaturedRecipesSectionProps = {
  recipes: FeaturedRecipe[];
  btnSecondary: string;
};

export function FeaturedRecipesSection({
  recipes,
  btnSecondary,
}: FeaturedRecipesSectionProps) {
  const { t } = useTranslations();
  const [activeFilter, setActiveFilter] = useState<Filter>("All");

  const filteredRecipes =
    activeFilter === "All"
      ? recipes
      : recipes.filter((recipe) => recipe.brewMethod === activeFilter);

  return (
    <SectionFrame id="recipes" ariaLabelledBy="recipes-heading">
      <SectionIntro
        headingId="recipes-heading"
        eyebrow={t("homeFeaturedRecipes.eyebrow")}
        title={t("homeFeaturedRecipes.title")}
        description={t("homeFeaturedRecipes.description")}
      />

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
              className={`rounded-full border px-4 py-2.5 text-sm font-medium backdrop-blur-xl ${dsMotion.transition} hover:-translate-y-0.5 active:scale-[0.98] ${dsFocus.ring} ${
                isActive
                  ? "border-uae-warm-gold/40 bg-uae-warm-gold/10 text-uae-pearl shadow-[0_0_32px_rgba(192,138,46,0.12)]"
                  : "border-white/[0.1] bg-white/[0.04] text-stone-400 hover:border-uae-warm-gold/25 hover:bg-white/[0.06] hover:text-stone-200"
              }`}
            >
              {filterLabel}
            </button>
          );
        })}
      </div>

      <div className="grid gap-7 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 lg:gap-9">
        {filteredRecipes.map((recipe) => {
          const brewMethodKey = brewMethodLabelKey(recipe.brewMethod);
          return (
            <RecipeCard
              key={recipe.name}
              recipe={recipe}
              featured={Boolean(recipe.featured) && activeFilter === "All"}
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
          );
        })}
      </div>

      {filteredRecipes.length === 0 && (
        <EmptyState title={t("homeFeaturedRecipes.noResults")} actionLabel={t("emptyStates.startExploring")} actionHref="/recipes" />
      )}

      <div className="mt-16 flex justify-center md:mt-20">
        <RippleLink
          href="/recipes"
          className={`${btnSecondary} min-w-[240px] border-amber-600/30 bg-white/[0.05] px-10 backdrop-blur-xl transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-amber-500/45 hover:bg-white/[0.08] hover:shadow-[0_0_48px_rgba(217,119,6,0.18),0_16px_40px_-16px_rgba(0,0,0,0.4)] motion-reduce:hover:translate-y-0`}
        >
          {t("homeFeaturedRecipes.viewAll")}
        </RippleLink>
      </div>
    </SectionFrame>
  );
}

"use client";

import { useState } from "react";
import { RecipeCard } from "@/app/components/cards/recipe-card";
import { getRecipeSlug } from "@/lib/data/recipes";
import type { FeaturedRecipe } from "@/types/homepage";

const filters = ["All", "V60", "Espresso", "Chemex", "Aeropress", "Cold Brew"] as const;

type Filter = (typeof filters)[number];

type RecipesExplorerProps = {
  recipes: FeaturedRecipe[];
};

export function RecipesExplorer({ recipes }: RecipesExplorerProps) {
  const [activeFilter, setActiveFilter] = useState<Filter>("All");

  const filteredRecipes =
    activeFilter === "All"
      ? recipes
      : recipes.filter((recipe) => recipe.brewMethod === activeFilter);

  return (
    <div>
      <div className="mb-10 flex flex-wrap gap-2.5 md:mb-12">
        {filters.map((filter) => {
          const isActive = activeFilter === filter;
          return (
            <button
              key={filter}
              type="button"
              aria-label={`Filter recipes by ${filter}`}
              aria-pressed={isActive}
              onClick={() => setActiveFilter(filter)}
              className={`rounded-full border px-4 py-2.5 text-sm font-medium backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 active:scale-[0.98] ${
                isActive
                  ? "border-amber-600/45 bg-amber-950/50 text-amber-100 shadow-[0_0_32px_rgba(217,119,6,0.14)]"
                  : "border-white/[0.1] bg-white/[0.04] text-stone-400 hover:border-amber-600/25 hover:bg-white/[0.06] hover:text-stone-200 hover:shadow-[0_0_24px_rgba(217,119,6,0.08)]"
              }`}
            >
              {filter}
            </button>
          );
        })}
      </div>

      <div className="grid gap-7 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 lg:gap-9">
        {filteredRecipes.map((recipe) => (
          <RecipeCard
            key={recipe.name}
            recipe={recipe}
            featured={Boolean(recipe.featured) && activeFilter === "All"}
            href={`/recipes/${getRecipeSlug(recipe)}`}
          />
        ))}
      </div>

      {filteredRecipes.length === 0 && (
        <p className="py-16 text-center text-sm text-stone-500">
          No recipes match this filter yet.
        </p>
      )}
    </div>
  );
}

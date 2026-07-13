"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { RecipeCard } from "@/app/components/cards/recipe-card";
import { FavoriteButton } from "@/app/components/recipes/favorite-button";
import type { RecipeListItem } from "@/types/recipe";

const filters = ["All", "V60", "Espresso", "Chemex", "Aeropress", "Cold Brew"] as const;

type Filter = (typeof filters)[number];

type RecipesExplorerProps = {
  recipes: RecipeListItem[];
  favoritedRecipeIds?: string[];
  isAuthenticated?: boolean;
  currentPath?: string;
};

export function RecipesExplorer({
  recipes,
  favoritedRecipeIds = [],
  isAuthenticated = false,
  currentPath = "/recipes",
}: RecipesExplorerProps) {
  const [activeFilter, setActiveFilter] = useState<Filter>("All");
  const [search, setSearch] = useState("");
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

  return (
    <div>
      <div className="mb-8">
        <label htmlFor="recipe-search" className="sr-only">
          Search recipes
        </label>
        <div className="relative max-w-md">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500"
            aria-hidden
          />
          <input
            id="recipe-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by coffee, roaster, origin, farm, process, method, device, tag…"
            className="w-full rounded-full border border-white/[0.1] bg-white/[0.04] py-3 pl-11 pr-5 text-sm text-stone-100 outline-none backdrop-blur-xl transition-colors duration-300 placeholder:text-stone-500 focus:border-amber-500/45"
          />
        </div>
      </div>

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
          <div key={`${recipe.source}-${recipe.slug}`} className="relative h-full">
            <RecipeCard
              recipe={recipe}
              featured={Boolean(recipe.featured) && activeFilter === "All" && !normalizedSearch}
              href={`/recipes/${recipe.slug}`}
            />
            {isAuthenticated && recipe.source === "db" && recipe.id && (
              <div className="pointer-events-none absolute inset-0">
                <div className="pointer-events-auto absolute bottom-6 right-6 z-10">
                  <FavoriteButton
                    recipeId={recipe.id}
                    isFavorited={favoritedSet.has(recipe.id)}
                    currentPath={currentPath}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredRecipes.length === 0 && (
        <p className="py-16 text-center text-sm text-stone-500">
          No recipes match your search yet.
        </p>
      )}
    </div>
  );
}

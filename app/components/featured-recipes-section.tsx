"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { RevealOnScroll } from "./reveal-on-scroll";
import { RippleLink } from "./ripple-link";

export type FeaturedRecipe = {
  name: string;
  country: string;
  origin: string;
  brewMethod: string;
  roastLevel: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  ratio: string;
  time: string;
  notes: string;
  image: string;
  premium?: boolean;
  featured?: boolean;
};

const filters = ["All", "V60", "Espresso", "Chemex", "Aeropress", "Cold Brew"] as const;

type Filter = (typeof filters)[number];

const difficultyLevel: Record<FeaturedRecipe["difficulty"], number> = {
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
};

type FeaturedRecipesSectionProps = {
  recipes: FeaturedRecipe[];
  btnSecondary: string;
};

function DifficultyIndicator({ level }: { level: FeaturedRecipe["difficulty"] }) {
  const filled = difficultyLevel[level];

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {[1, 2, 3].map((dot) => (
          <span
            key={dot}
            className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
              dot <= filled ? "bg-amber-500/80" : "bg-white/15"
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-stone-500">{level}</span>
    </div>
  );
}

function RecipeCard({
  recipe,
  featured,
}: {
  recipe: FeaturedRecipe;
  featured: boolean;
}) {
  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-white/[0.06] bg-gradient-to-br from-white/[0.06] via-white/[0.02] to-transparent shadow-[0_8px_32px_-12px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:border-amber-700/25 hover:shadow-[0_28px_56px_-16px_rgba(180,120,60,0.18)] ${
        featured ? "lg:col-span-2" : ""
      }`}
    >
      <div className={`relative overflow-hidden ${featured ? "h-56 sm:h-64 lg:h-72" : "h-48 sm:h-52"}`}>
        <Image
          src={recipe.image}
          alt={`${recipe.name} — ${recipe.country}`}
          fill
          unoptimized
          sizes={featured ? "(min-width: 1024px) 66vw, 100vw" : "(min-width: 1024px) 33vw, 50vw"}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0705] via-[#0a0705]/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950/10 via-transparent to-[#0a0705]/30" />

        <div className="absolute left-5 top-5 flex flex-wrap gap-2">
          <span className="rounded-full border border-white/10 bg-[#0a0705]/55 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-stone-300 backdrop-blur-md">
            {recipe.brewMethod}
          </span>
          <span className="rounded-full border border-amber-800/20 bg-amber-950/45 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-amber-400/90 backdrop-blur-md">
            {recipe.roastLevel}
          </span>
        </div>

        {recipe.premium && (
          <div className="absolute right-5 top-5 rounded-full border border-amber-700/30 bg-amber-950/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-300/90 backdrop-blur-md">
            Premium
          </div>
        )}

        {recipe.featured && (
          <div className="absolute bottom-5 left-5 rounded-full border border-amber-600/35 bg-amber-950/55 px-3.5 py-1.5 text-[11px] font-medium text-amber-200/90 backdrop-blur-md">
            Recipe of the Week
          </div>
        )}
      </div>

      <div className={`flex flex-1 flex-col ${featured ? "p-8 lg:p-10" : "p-7 lg:p-8"}`}>
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-amber-600/70">
            {recipe.country}
          </p>
          <h3
            className={`mt-2 font-medium leading-snug tracking-tight text-stone-50 transition-colors duration-300 group-hover:text-amber-100 ${
              featured ? "text-xl lg:text-2xl" : "text-lg"
            }`}
          >
            {recipe.name}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-stone-500">{recipe.origin}</p>
          <p className={`mt-4 leading-[1.75] text-stone-400 ${featured ? "text-sm lg:text-[0.9375rem]" : "text-sm"}`}>
            {recipe.notes}
          </p>
        </div>

        <div className="mt-7 border-t border-white/[0.06] pt-6">
          <DifficultyIndicator level={recipe.difficulty} />
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-stone-500">
            <span>
              Ratio{" "}
              <strong className="font-medium text-stone-300">{recipe.ratio}</strong>
            </span>
            <span>
              Time{" "}
              <strong className="font-medium text-stone-300">{recipe.time}</strong>
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

export function FeaturedRecipesSection({
  recipes,
  btnSecondary,
}: FeaturedRecipesSectionProps) {
  const [activeFilter, setActiveFilter] = useState<Filter>("All");

  const filteredRecipes = useMemo(() => {
    if (activeFilter === "All") return recipes;
    return recipes.filter((recipe) => recipe.brewMethod === activeFilter);
  }, [activeFilter, recipes]);

  return (
    <section id="recipes" className="relative px-5 py-40 sm:px-6 md:px-7 md:py-44 lg:px-8 lg:py-48">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#0a0705] via-[#0a0705]/80 to-transparent"
      />

      <RevealOnScroll>
        <div className="relative mx-auto max-w-6xl">
          <div className="mb-14 max-w-2xl md:mb-16 lg:mb-20">
            <p className="text-[0.8125rem] font-medium uppercase tracking-[0.24em] text-amber-500/90">
              Curated Collection
            </p>
            <h2 className="mt-5 text-3xl font-semibold leading-[1.08] tracking-[-0.03em] text-stone-50 sm:text-4xl lg:text-[3.25rem]">
              Featured Recipes
            </h2>
            <p className="mt-7 max-w-xl text-lg leading-[1.78] text-stone-400 md:text-xl md:leading-[1.72]">
              Handpicked by our barista community. Each recipe includes grind size,
              water temperature, and step-by-step guidance.
            </p>
          </div>

          <div className="mb-10 flex flex-wrap gap-2.5 md:mb-12">
            {filters.map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <button
                  key={filter}
                  type="button"
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

          <div className="grid gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3 lg:gap-8">
            {filteredRecipes.map((recipe) => (
              <RecipeCard
                key={recipe.name}
                recipe={recipe}
                featured={Boolean(recipe.featured) && activeFilter === "All"}
              />
            ))}
          </div>

          {filteredRecipes.length === 0 && (
            <p className="py-16 text-center text-sm text-stone-500">
              No recipes match this filter yet.
            </p>
          )}

          <div className="mt-14 flex justify-center md:mt-16">
            <RippleLink
              href="#recipes"
              className={`${btnSecondary} min-w-[220px] border-amber-600/25 bg-white/[0.04] backdrop-blur-md transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:border-amber-500/40 hover:bg-white/[0.07] hover:shadow-[0_0_40px_rgba(217,119,6,0.14)]`}
            >
              View All Recipes
            </RippleLink>
          </div>
        </div>
      </RevealOnScroll>
    </section>
  );
}

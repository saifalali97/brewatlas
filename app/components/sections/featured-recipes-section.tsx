"use client";

import Image from "next/image";
import { useState } from "react";
import { DifficultyIndicator } from "@/app/components/ui/difficulty-indicator";
import { RippleLink } from "@/app/components/ui/ripple-link";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { SectionIntro } from "@/app/components/ui/section-intro";
import type { FeaturedRecipe } from "@/types/homepage";
import { imageAlt } from "@/lib/seo/image-alt";

const filters = ["All", "V60", "Espresso", "Chemex", "Aeropress", "Cold Brew"] as const;

type Filter = (typeof filters)[number];

type FeaturedRecipesSectionProps = {
  recipes: FeaturedRecipe[];
  btnSecondary: string;
};

function RecipeCard({
  recipe,
  featured,
}: {
  recipe: FeaturedRecipe;
  featured: boolean;
}) {
  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border bg-gradient-to-br from-white/[0.08] via-white/[0.035] to-white/[0.01] shadow-[0_12px_40px_-16px_rgba(0,0,0,0.48)] backdrop-blur-2xl transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-2 hover:shadow-[0_32px_68px_-20px_rgba(180,120,60,0.2)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${
        featured
          ? "lg:col-span-2 border-amber-600/25 ring-1 ring-amber-500/20 shadow-[0_20px_56px_-20px_rgba(180,120,60,0.18)] hover:border-amber-500/35"
          : "border-white/[0.11] hover:border-amber-600/28"
      }`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[1.5rem] bg-gradient-to-b from-white/[0.07] via-transparent to-transparent"
      />

      <div className={`relative overflow-hidden ${featured ? "h-56 sm:h-64 lg:h-[19rem]" : "h-48 sm:h-52 lg:h-56"}`}>
        <Image
          src={recipe.image}
          alt={imageAlt.recipe(recipe.name, recipe.country, recipe.brewMethod, recipe.roastLevel)}
          fill
          sizes={featured ? "(min-width: 1024px) 66vw, 100vw" : "(min-width: 1024px) 33vw, 50vw"}
          className="object-cover brightness-[0.88] contrast-[1.04] saturate-[0.92] transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.045] motion-reduce:transform-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0705] via-[#0a0705]/15 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950/8 via-transparent to-[#0a0705]/25" />

        <div className="absolute left-5 top-5 flex flex-wrap gap-2">
          <span className="rounded-full border border-white/[0.14] bg-[#0a0705]/50 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-stone-200 backdrop-blur-xl">
            {recipe.brewMethod}
          </span>
          <span className="rounded-full border border-amber-700/25 bg-amber-950/50 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-amber-300/90 backdrop-blur-xl">
            {recipe.roastLevel}
          </span>
        </div>

        {recipe.premium && (
          <div className="absolute right-5 top-5 rounded-full border border-amber-700/35 bg-amber-950/65 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-200/90 backdrop-blur-xl">
            Premium
          </div>
        )}

        {recipe.featured && (
          <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-full border border-amber-500/40 bg-gradient-to-r from-amber-950/70 to-[#0a0705]/60 px-4 py-1.5 text-[11px] font-medium text-amber-100/95 shadow-[0_0_28px_rgba(217,119,6,0.15)] backdrop-blur-xl">
            <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 text-amber-400" aria-hidden>
              <path d="M8 2l1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4L2.2 6.2l4-.6L8 2z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
            </svg>
            Editor&apos;s Choice
          </div>
        )}
      </div>

      <div className={`relative flex flex-1 flex-col ${featured ? "p-8 lg:p-10" : "p-7 lg:p-8"}`}>
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
          <DifficultyIndicator
            level={recipe.difficulty}
            labelClassName="text-xs text-stone-500"
            className="flex items-center gap-2"
          />
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

  const filteredRecipes =
    activeFilter === "All"
      ? recipes
      : recipes.filter((recipe) => recipe.brewMethod === activeFilter);

  return (
    <SectionFrame id="recipes" ariaLabelledBy="recipes-heading">
      <SectionIntro
        headingId="recipes-heading"
        eyebrow="Curated Collection"
        title="Featured Recipes"
        description="Handpicked by our barista community. Each recipe includes grind size, water temperature, and step-by-step guidance."
      />

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
          />
        ))}
      </div>

      {filteredRecipes.length === 0 && (
        <p className="py-16 text-center text-sm text-stone-500">
          No recipes match this filter yet.
        </p>
      )}

      <div className="mt-16 flex justify-center md:mt-20">
        <RippleLink
          href="#recipes"
          className={`${btnSecondary} min-w-[240px] border-amber-600/30 bg-white/[0.05] px-10 backdrop-blur-xl transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-amber-500/45 hover:bg-white/[0.08] hover:shadow-[0_0_48px_rgba(217,119,6,0.18),0_16px_40px_-16px_rgba(0,0,0,0.4)] motion-reduce:hover:translate-y-0`}
        >
          View All Recipes
        </RippleLink>
      </div>
    </SectionFrame>
  );
}

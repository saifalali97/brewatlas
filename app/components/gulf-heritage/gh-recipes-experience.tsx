"use client";

import { useState } from "react";
import { GhRecipeCard } from "@/app/components/gulf-heritage/gh-recipe-card";
import { GhRecipeDetail } from "@/app/components/gulf-heritage/gh-recipe-detail";
import { GhPendingContent } from "@/app/components/gulf-heritage/gh-pending-content";
import { ghTypography } from "@/app/components/gulf-heritage/shared/gh-styles";
import { isRecipeVerified } from "@/types/gulf-heritage-recipe";
import type { GulfHeritageRecipeReference } from "@/types/gulf-heritage-recipe";
import type { GulfHeritageEditorialStatus } from "@/types/gulf-heritage-editorial";

type GhRecipesExperienceProps = {
  title: string;
  recipes: readonly GulfHeritageRecipeReference[];
  country: string;
  category: string;
  editorialStatus: GulfHeritageEditorialStatus;
  verifiedContentComingSoon: string;
  statusLabels: Record<GulfHeritageEditorialStatus | "unverified", string>;
  fieldLabels: {
    difficulty: string;
    preparationTime: string;
    servingSize: string;
    equipment: string;
    ingredients: string;
    steps: string;
    tips: string;
    notes: string;
    warnings: string;
    references: string;
    temperature: string;
    servingSuggestions: string;
    historicalNotes: string;
  };
  ingredientLabels: {
    main: string;
    optional: string;
    garnishes: string;
    notes: string;
  };
  presentationLabels: {
    stepTemplate: string;
  };
};

/** Related recipes section with card grid and expandable verified recipe detail. */
export function GhRecipesExperience({
  title,
  recipes,
  country,
  category,
  editorialStatus,
  verifiedContentComingSoon,
  statusLabels,
  fieldLabels,
  ingredientLabels,
  presentationLabels,
}: GhRecipesExperienceProps) {
  const verifiedRecipes = recipes.filter(isRecipeVerified);
  const [activeSlug, setActiveSlug] = useState<string | null>(verifiedRecipes[0]?.slug ?? null);
  const activeRecipe = recipes.find((recipe) => recipe.slug === activeSlug) ?? verifiedRecipes[0] ?? null;

  if (recipes.length === 0) {
    return (
      <section aria-labelledby="gh-recipes-heading" className="mt-14">
        <h2 id="gh-recipes-heading" className={ghTypography.sectionTitle}>
          {title}
        </h2>
        <div className="mt-5">
          <GhPendingContent message={verifiedContentComingSoon} />
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="gh-recipes-heading" className="mt-14 scroll-mt-28" id="gh-section-recipes">
      <h2 id="gh-recipes-heading" className={ghTypography.sectionTitle}>
        {title}
      </h2>

      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {recipes.map((recipe) => (
          <li key={recipe.slug}>
            <GhRecipeCard
              recipe={recipe}
              verifiedContentComingSoon={verifiedContentComingSoon}
              statusLabels={statusLabels}
              fieldLabels={fieldLabels}
              selected={activeRecipe?.slug === recipe.slug}
              onSelect={isRecipeVerified(recipe) ? () => setActiveSlug(recipe.slug) : undefined}
            />
          </li>
        ))}
      </ul>

      {activeRecipe && isRecipeVerified(activeRecipe) ? (
        <div className="mt-10">
          <GhRecipeDetail
            recipe={activeRecipe}
            country={country}
            category={category}
            editorialStatus={editorialStatus}
            verifiedContentComingSoon={verifiedContentComingSoon}
            statusLabels={statusLabels}
            fieldLabels={fieldLabels}
            ingredientLabels={ingredientLabels}
            presentationLabels={presentationLabels}
          />
        </div>
      ) : null}
    </section>
  );
}

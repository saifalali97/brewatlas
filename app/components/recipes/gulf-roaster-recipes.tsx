import { ArrowRight, Clock } from "lucide-react";
import {
  EmptyState,
  RecipeCard,
  SectionDescription,
  SectionTitle,
} from "@/app/components/recipes/directory";
import { DifficultyIndicator } from "@/app/components/ui/difficulty-indicator";
import { StarRatingDisplay } from "@/app/components/reviews/star-rating";
import { rdLayout, rdTypography } from "@/lib/design-system/recipes-directory";
import { gulfRecipePath } from "@/lib/gulf-directory/countries";
import type { GulfRoasterPageRecipe } from "@/lib/gulf-directory/roaster-page-data";
import type { Difficulty } from "@/types/homepage";

type GulfRoasterRecipesProps = {
  title: string;
  description: string;
  recipes: GulfRoasterPageRecipe[];
  hotLabel: string;
  icedLabel: string;
  coffeeLabel: string;
  brewTimeLabel: string;
  ratingLabel: string;
  exploreLabel: string;
  emptyLabel: string;
  difficultyLabels: Record<Difficulty, string>;
  brewMethodLabels: Record<string, string>;
  imageAltTemplate: string;
};

function metaLine(parts: Array<string | null | undefined>): string | null {
  const clean = parts.map((part) => part?.trim()).filter((part): part is string => Boolean(part));
  return clean.length > 0 ? clean.join(" · ") : null;
}

/** Responsive recipe grid for a Gulf roaster page. */
export function GulfRoasterRecipes({
  title,
  description,
  recipes,
  hotLabel,
  icedLabel,
  coffeeLabel,
  brewTimeLabel,
  ratingLabel,
  exploreLabel,
  emptyLabel,
  difficultyLabels,
  brewMethodLabels,
  imageAltTemplate,
}: GulfRoasterRecipesProps) {
  return (
    <section
      aria-labelledby="gulf-roaster-recipes-heading"
      className={rdLayout.container}
    >
      <div className="max-w-2xl">
        <SectionTitle id="gulf-roaster-recipes-heading">{title}</SectionTitle>
        {description ? <SectionDescription>{description}</SectionDescription> : null}
      </div>

      {recipes.length === 0 ? (
        <EmptyState>{emptyLabel}</EmptyState>
      ) : (
        <div className={`${rdLayout.gridGap} ${rdLayout.recipeGrid}`}>
          {recipes.map((recipe) => {
            const details = metaLine([
              recipe.origin,
              recipe.variety,
              recipe.process,
              recipe.roastLevel,
            ]);
            const flavor = recipe.flavorNotes.length > 0 ? recipe.flavorNotes.join(" · ") : null;

            return (
              <RecipeCard
                key={recipe.id}
                href={gulfRecipePath(recipe.slug)}
                name={recipe.name}
                image={recipe.image}
                imageAlt={imageAltTemplate.replace("{name}", recipe.name)}
                brewMethodLabel={brewMethodLabels[recipe.brewMethod] ?? recipe.brewMethod}
                temperatureLabel={recipe.isIced ? icedLabel : hotLabel}
                subtitle={
                  <div className="mt-2 space-y-1.5 text-sm text-[#1A1410]/70">
                    <p>
                      {coffeeLabel}:{" "}
                      <span className="font-medium text-[#1A1410]">{recipe.coffeeName}</span>
                    </p>
                    {details ? <p>{details}</p> : null}
                    {flavor ? <p className="text-[#1A1410]/60">{flavor}</p> : null}
                  </div>
                }
                footer={
                  <div className="space-y-3">
                    <DifficultyIndicator
                      level={recipe.difficulty}
                      label={difficultyLabels[recipe.difficulty]}
                      labelClassName="text-sm text-[#1A1410]/80"
                    />
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[#1A1410]/75">
                      <span className="inline-flex items-center gap-1.5" aria-label={ratingLabel}>
                        <StarRatingDisplay rating={recipe.rating} size="sm" />
                        <span className="font-medium text-[#1A1410]">
                          {recipe.rating.toFixed(1)}
                        </span>
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-[#A67B4A]" strokeWidth={1.75} aria-hidden />
                        <span className={rdTypography.metaMuted}>{brewTimeLabel}</span>
                        <span className="font-medium text-[#1A1410]">{recipe.brewTime}</span>
                      </span>
                    </div>
                    <p className="inline-flex items-center gap-1.5 pt-1 text-[13px] font-medium text-[#A67B4A]">
                      {exploreLabel}
                      <ArrowRight className="h-3.5 w-3.5 rtl:-scale-x-100" aria-hidden />
                    </p>
                  </div>
                }
              />
            );
          })}
        </div>
      )}
    </section>
  );
}

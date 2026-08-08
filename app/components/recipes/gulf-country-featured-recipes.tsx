import {
  RecipeCard,
  SectionDescription,
  SectionTitle,
} from "@/app/components/recipes/directory";
import { DifficultyIndicator } from "@/app/components/ui/difficulty-indicator";
import { rdLayout } from "@/lib/design-system/recipes-directory";
import { gulfRecipePath } from "@/lib/gulf-directory/countries";
import type { GulfCountryPageRecipe } from "@/lib/gulf-directory/country-page-types";

type GulfCountryFeaturedRecipesProps = {
  title: string;
  description: string;
  recipes: GulfCountryPageRecipe[];
  hotLabel: string;
  icedLabel: string;
  difficultyLabels: Record<string, string>;
  brewMethodLabels: Record<string, string>;
  imageAltTemplate: string;
};

/** Featured recipes strip for a Gulf country page. */
export function GulfCountryFeaturedRecipes({
  title,
  description,
  recipes,
  hotLabel,
  icedLabel,
  difficultyLabels,
  brewMethodLabels,
  imageAltTemplate,
}: GulfCountryFeaturedRecipesProps) {
  if (recipes.length === 0) return null;

  return (
    <section
      aria-labelledby="gulf-country-featured-heading"
      className={rdLayout.container}
    >
      <div className="max-w-2xl">
        <SectionTitle id="gulf-country-featured-heading">{title}</SectionTitle>
        {description ? <SectionDescription>{description}</SectionDescription> : null}
      </div>

      <div className={`${rdLayout.gridGap} ${rdLayout.recipeGrid}`}>
        {recipes.map((recipe) => (
          <RecipeCard
            key={recipe.id}
            href={gulfRecipePath(recipe.slug)}
            name={recipe.name}
            image={recipe.image}
            imageAlt={imageAltTemplate.replace("{name}", recipe.name)}
            brewMethodLabel={brewMethodLabels[recipe.brewMethod] ?? recipe.brewMethod}
            temperatureLabel={recipe.isIced ? icedLabel : hotLabel}
            subtitle={<p className="mt-2 text-sm text-[#1A1410]/70">{recipe.roasterName}</p>}
            footer={
              <DifficultyIndicator
                level={recipe.difficulty}
                label={difficultyLabels[recipe.difficulty] ?? recipe.difficulty}
                labelClassName="text-sm text-[#1A1410]/80"
              />
            }
          />
        ))}
      </div>
    </section>
  );
}

import Link from "next/link";
import { OptimizedImage } from "@/app/components/ui/optimized-image";
import { DifficultyIndicator } from "@/app/components/ui/difficulty-indicator";
import { badges, cards } from "@/lib/constants/styles";
import { IMAGE_SIZE_PRESETS } from "@/lib/media/responsive-image";
import { gulfRecipePath } from "@/lib/gulf-directory/countries";
import type { GulfCountryPageRecipe } from "@/lib/gulf-directory/country-page-data";

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
      className="mx-auto max-w-[1200px] px-6 sm:px-8 lg:px-10"
    >
      <div className="max-w-2xl">
        <h2
          id="gulf-country-featured-heading"
          className="font-display text-[1.75rem] font-bold tracking-[-0.03em] text-[#1A1410] sm:text-[2rem]"
        >
          {title}
        </h2>
        <p className="mt-2.5 text-[0.9375rem] leading-[1.7] text-[#1A1410]/60">{description}</p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {recipes.map((recipe) => (
          <Link
            key={recipe.id}
            href={gulfRecipePath(recipe.slug)}
            className={`${cards.premiumShell} group flex h-full flex-col`}
          >
            <div className="relative h-44 overflow-hidden sm:h-48">
              <OptimizedImage
                src={recipe.image}
                alt={imageAltTemplate.replace("{name}", recipe.name)}
                sizes={IMAGE_SIZE_PRESETS.recipeCard}
                loading="lazy"
                className={`${cards.cardPhoto} transition-transform duration-500 group-hover:scale-[1.03]`}
              />
              <div className={cards.imageOverlay} />
              <div className="absolute start-4 top-4 flex flex-wrap gap-2">
                <span className={badges.tag}>
                  {brewMethodLabels[recipe.brewMethod] ?? recipe.brewMethod}
                </span>
                <span className={badges.accent}>{recipe.isIced ? icedLabel : hotLabel}</span>
              </div>
            </div>

            <div className="flex flex-1 flex-col p-5 sm:p-6">
              <h3 className="font-display text-lg leading-snug tracking-[-0.02em] text-ba-espresso transition-colors group-hover:text-ba-bronze">
                {recipe.name}
              </h3>
              <p className="mt-2 text-sm text-ac-espresso/70">{recipe.roasterName}</p>
              <div className="mt-5 border-t border-ba-espresso/[0.06] pt-4">
                <DifficultyIndicator
                  level={recipe.difficulty}
                  label={difficultyLabels[recipe.difficulty] ?? recipe.difficulty}
                  labelClassName="text-sm text-ac-espresso/80"
                />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

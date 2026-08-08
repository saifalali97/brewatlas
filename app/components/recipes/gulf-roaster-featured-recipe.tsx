import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { OptimizedImage } from "@/app/components/ui/optimized-image";
import { DifficultyIndicator } from "@/app/components/ui/difficulty-indicator";
import { StarRatingDisplay } from "@/app/components/reviews/star-rating";
import {
  SectionDescription,
  SectionTitle,
} from "@/app/components/recipes/directory";
import { badges } from "@/lib/constants/styles";
import {
  rdBorder,
  rdButton,
  rdCard,
  rdLayout,
  rdMotion,
  rdRadius,
  rdShadow,
  rdSurface,
  rdTypography,
} from "@/lib/design-system/recipes-directory";
import { gulfRecipePath } from "@/lib/gulf-directory/countries";
import type { GulfRoasterPageRecipe } from "@/lib/gulf-directory/roaster-page-data";
import { IMAGE_SIZE_PRESETS } from "@/lib/media/responsive-image";
type GulfRoasterFeaturedRecipeProps = {
  title: string;
  description: string;
  recipe: GulfRoasterPageRecipe;
  hotLabel: string;
  icedLabel: string;
  exploreLabel: string;
  brewMethodLabel: string;
  difficultyLabel: string;
  imageAltTemplate: string;
};

/** Large editorial featured recipe card for a Gulf roaster page. */
export function GulfRoasterFeaturedRecipe({
  title,
  description,
  recipe,
  hotLabel,
  icedLabel,
  exploreLabel,
  brewMethodLabel,
  difficultyLabel,
  imageAltTemplate,
}: GulfRoasterFeaturedRecipeProps) {
  return (
    <section
      aria-labelledby="gulf-roaster-featured-heading"
      className={rdLayout.container}
    >
      <div className="max-w-2xl">
        <SectionTitle id="gulf-roaster-featured-heading">{title}</SectionTitle>
        {description ? <SectionDescription>{description}</SectionDescription> : null}
      </div>

      <article
        className={`group ${rdLayout.gridGap} overflow-hidden ${rdRadius.card} ${rdBorder.gold22} ${rdSurface.card} ${rdShadow.card} ${rdMotion.card} lg:grid lg:grid-cols-2`}
      >
        <div className="relative min-h-[240px] overflow-hidden sm:min-h-[300px] lg:min-h-[420px]">
          <OptimizedImage
            src={recipe.image}
            alt={imageAltTemplate.replace("{name}", recipe.name)}
            sizes={IMAGE_SIZE_PRESETS.recipeCard}
            className={`object-cover ${rdMotion.imageZoomSlow}`}
          />
          <div className={rdCard.imageOverlay} />
          <div className="absolute start-4 top-4 flex flex-wrap gap-2">
            <span className={badges.tag}>{brewMethodLabel}</span>
            <span className={badges.accent}>{recipe.isIced ? icedLabel : hotLabel}</span>
          </div>
        </div>

        <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
          <p className={`text-[0.75rem] font-medium uppercase tracking-[0.08em] ${rdTypography.copper}`}>
            {recipe.coffeeName}
          </p>
          <h3 className={`mt-3 ${rdTypography.cardTitleLg} sm:text-[2rem]`}>{recipe.name}</h3>
          <p className="mt-3 text-[0.9375rem] leading-[1.7] text-[#1A1410]/65">{recipe.lead}</p>

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            <DifficultyIndicator
              level={recipe.difficulty}
              label={difficultyLabel}
              labelClassName="text-sm text-[#1A1410]/80"
            />
            <div className="flex items-center gap-2">
              <StarRatingDisplay rating={recipe.rating} size="sm" />
              <span className="text-sm font-medium text-[#1A1410]">{recipe.rating.toFixed(1)}</span>
            </div>
            <span className={rdTypography.meta}>{recipe.brewTime}</span>
          </div>

          <div className="mt-8">
            <Link href={gulfRecipePath(recipe.slug)} className={`${rdButton.pillSolid} min-w-[180px]`}>
              {exploreLabel}
              <ArrowRight className="h-3.5 w-3.5 rtl:-scale-x-100" aria-hidden />
            </Link>
          </div>
        </div>
      </article>
    </section>
  );
}

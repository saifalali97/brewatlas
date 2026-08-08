import { RecipeCard } from "@/app/components/recipes/directory";
import { OfficialRecipeBadge } from "@/app/components/recipes/official-recipe-badge";
import { DifficultyIndicator } from "@/app/components/ui/difficulty-indicator";
import { StarRatingDisplay } from "@/app/components/reviews/star-rating";
import { rdCard } from "@/lib/design-system/recipes-directory";
import type { RoasteryRecipeItem } from "@/lib/data/gulf-directory";

export type RoasteryRecipeCardLabels = {
  hot: string;
  iced: string;
  difficultyLabel: string;
  brewMethodLabel: string;
  deviceLabel: string;
  coffeeLabel: string;
  ratingLabel: string;
  noRating: string;
  imageAltTemplate: string;
};

type RoasteryRecipeCardProps = {
  recipe: RoasteryRecipeItem;
  href: string;
  labels: RoasteryRecipeCardLabels;
};

/** Recipe card for roastery directory pages — method, temperature, difficulty, device, coffee, rating. */
export function RoasteryRecipeCard({ recipe, href, labels }: RoasteryRecipeCardProps) {
  return (
    <RecipeCard
      href={href}
      name={recipe.name}
      image={recipe.image}
      imageAlt={labels.imageAltTemplate.replace("{name}", recipe.name)}
      imageBlur={recipe.imageBlur}
      imageWidth={recipe.imageWidth}
      imageHeight={recipe.imageHeight}
      brewMethodLabel={labels.brewMethodLabel || recipe.brewMethod}
      temperatureLabel={recipe.isIced ? labels.iced : labels.hot}
    >
      <div className="flex-1">
        {recipe.isVerifiedOfficial ? (
          <div className="mt-2">
            <OfficialRecipeBadge
              verificationStatus={recipe.verificationStatus ?? "verified"}
              versionLabel={recipe.versionLabel}
              compact
              listTone
            />
          </div>
        ) : null}
        {recipe.coffeeName ? (
          <p className="mt-3 text-sm text-[#1A1410]/80">
            {labels.coffeeLabel}:{" "}
            <span className="font-medium text-[#1A1410]">{recipe.coffeeName}</span>
          </p>
        ) : null}
      </div>

      <div className={`${rdCard.recipeFooter} space-y-3 text-sm text-[#1A1410]/80`}>
        <DifficultyIndicator
          level={recipe.difficulty}
          label={labels.difficultyLabel}
          labelClassName="text-sm text-[#1A1410]/80"
        />
        {recipe.deviceName ? (
          <p>
            {labels.deviceLabel}:{" "}
            <span className="font-medium text-[#1A1410]">{recipe.deviceName}</span>
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="text-xs font-medium uppercase tracking-[0.14em] text-[#1A1410]/60">
            {labels.ratingLabel}
          </span>
          {recipe.averageRating !== null && recipe.reviewCount > 0 ? (
            <div className="flex items-center gap-2">
              <StarRatingDisplay rating={recipe.averageRating} size="sm" />
              <span className="font-medium text-[#1A1410]">{recipe.averageRating.toFixed(1)}</span>
            </div>
          ) : (
            <span>{labels.noRating}</span>
          )}
        </div>
      </div>
    </RecipeCard>
  );
}

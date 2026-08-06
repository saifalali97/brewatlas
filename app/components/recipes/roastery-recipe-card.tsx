import Link from "next/link";
import { OptimizedImage } from "@/app/components/ui/optimized-image";
import { DifficultyIndicator } from "@/app/components/ui/difficulty-indicator";
import { OfficialRecipeBadge } from "@/app/components/recipes/official-recipe-badge";
import { StarRatingDisplay } from "@/app/components/reviews/star-rating";
import { badges, cards } from "@/lib/constants/styles";
import { IMAGE_SIZE_PRESETS } from "@/lib/media/responsive-image";
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
  const temperatureBadge = recipe.isIced ? labels.iced : labels.hot;

  return (
    <Link href={href} className={`${cards.premiumShell} group flex h-full flex-col`}>
      <div className="relative h-44 overflow-hidden sm:h-48">
        <OptimizedImage
          src={recipe.image}
          alt={labels.imageAltTemplate.replace("{name}", recipe.name)}
          blurDataUrl={recipe.imageBlur}
          width={recipe.imageWidth ?? undefined}
          height={recipe.imageHeight ?? undefined}
          sizes={IMAGE_SIZE_PRESETS.recipeCard}
          loading="lazy"
          className={`${cards.cardPhoto} transition-transform duration-500 group-hover:scale-[1.03]`}
        />
        <div className={cards.imageOverlay} />
        <div className="absolute start-4 top-4 flex flex-wrap gap-2">
          <span className={badges.tag}>{labels.brewMethodLabel || recipe.brewMethod}</span>
          <span className={badges.accent}>{temperatureBadge}</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex-1">
          <h3 className="font-display text-lg leading-snug tracking-[-0.02em] text-ba-espresso transition-colors group-hover:text-ba-bronze">
            {recipe.name}
          </h3>
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
            <p className="mt-3 text-sm text-ac-espresso/80">
              {labels.coffeeLabel}: <span className="font-medium text-ac-espresso">{recipe.coffeeName}</span>
            </p>
          ) : null}
        </div>

        <div className="mt-5 space-y-3 border-t border-ba-espresso/[0.06] pt-4 text-sm text-ac-espresso/80">
          <DifficultyIndicator
            level={recipe.difficulty}
            label={labels.difficultyLabel}
            labelClassName="text-sm text-ac-espresso/80"
          />
          {recipe.deviceName ? (
            <p>
              {labels.deviceLabel}: <span className="font-medium text-ac-espresso">{recipe.deviceName}</span>
            </p>
          ) : null}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="text-xs font-medium uppercase tracking-[0.14em] text-ac-espresso/60">
              {labels.ratingLabel}
            </span>
            {recipe.averageRating !== null && recipe.reviewCount > 0 ? (
              <div className="flex items-center gap-2">
                <StarRatingDisplay rating={recipe.averageRating} size="sm" />
                <span className="font-medium text-ac-espresso">{recipe.averageRating.toFixed(1)}</span>
              </div>
            ) : (
              <span>{labels.noRating}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

import Image from "next/image";
import Link from "next/link";
import { Clock, Droplets, Scale, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DifficultyIndicator } from "@/app/components/ui/difficulty-indicator";
import { cards, meta } from "@/lib/constants/styles";
import type { Recipe } from "@/types/recipe";

type RecipeCardProps = {
  recipe: Recipe;
};

function RecipeRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-stone-400">
      <Star className="h-3.5 w-3.5 fill-amber-500/80 text-amber-500/80" aria-hidden />
      <span className="font-medium text-stone-200">{rating.toFixed(1)}</span>
    </div>
  );
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <article className={cards.premiumShell}>
      <div aria-hidden className={cards.premiumSheen} />
      <div aria-hidden className={cards.premiumGlow} />

      <Link
        href={`/recipes/${recipe.slug}`}
        aria-label={`View ${recipe.title} recipe`}
        className="flex h-full flex-col focus-visible:outline-none"
      >
        <div className="relative h-48 overflow-hidden sm:h-52">
          <Image
            src={recipe.image}
            alt={`${recipe.title} brewed with ${recipe.brewingMethod}`}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover brightness-[0.88] contrast-[1.04] saturate-[0.92] transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <div className={cards.imageOverlay} />
          <div className={cards.imageAmberWash} />

          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <Badge>{recipe.brewingMethod}</Badge>
            <Badge variant="accent">{recipe.roastLevel}</Badge>
          </div>
        </div>

        <div className="relative flex flex-1 flex-col p-6 lg:p-7">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-amber-600/70">
                {recipe.origin}
              </p>
              <h2 className="mt-2 text-lg font-medium leading-snug tracking-tight text-stone-50 transition-colors group-hover:text-amber-100">
                {recipe.title}
              </h2>
              <p className="mt-1.5 text-sm text-stone-500">{recipe.roaster}</p>
            </div>
            <RecipeRating rating={recipe.rating} />
          </div>

          <p className="mt-4 text-sm text-stone-400">
            <span className="text-stone-500">Process:</span> {recipe.process}
          </p>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <div className={meta.tileCompact}>
              <Scale className={meta.iconInline} aria-hidden />
              <div>
                <p className={meta.label}>Dose</p>
                <p className={meta.value}>{recipe.coffeeDose}</p>
              </div>
            </div>
            <div className={meta.tileCompact}>
              <Droplets className={meta.iconInline} aria-hidden />
              <div>
                <p className={meta.label}>Water</p>
                <p className={meta.value}>{recipe.waterAmount}</p>
              </div>
            </div>
            <div className={meta.tileCompact}>
              <Clock className={meta.iconInline} aria-hidden />
              <div>
                <p className={meta.label}>Time</p>
                <p className={meta.value}>{recipe.brewTime}</p>
              </div>
            </div>
          </div>

          <div className="mt-5 border-t border-white/[0.06] pt-5">
            <DifficultyIndicator
              level={recipe.difficulty}
              labelClassName="text-xs text-stone-500"
              className="flex items-center gap-2"
            />
          </div>
        </div>
      </Link>
    </article>
  );
}

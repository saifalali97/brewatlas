import { Clock, ShieldCheck, Users } from "lucide-react";
import { GhPendingContent } from "@/app/components/gulf-heritage/gh-pending-content";
import { OptimizedImage } from "@/app/components/ui/optimized-image";
import { ghMotion, ghSurfaces, ghTypography } from "@/app/components/gulf-heritage/shared/gh-styles";
import { resolveGulfHeritageImageUrl } from "@/types/gulf-heritage-images";
import { isRecipeVerified } from "@/types/gulf-heritage-recipe";
import type { GulfHeritageRecipeReference } from "@/types/gulf-heritage-recipe";
import type { GulfHeritageEditorialStatus } from "@/types/gulf-heritage-editorial";
import { CULTURE_IMAGE_PLACEHOLDER } from "@/types/culture";

type GhRecipeCardProps = {
  recipe: GulfHeritageRecipeReference;
  verifiedContentComingSoon: string;
  statusLabels: Record<GulfHeritageEditorialStatus | "unverified", string>;
  fieldLabels: {
    difficulty: string;
    preparationTime: string;
    servingSize: string;
  };
  onSelect?: () => void;
  selected?: boolean;
};

/** Compact recipe card for related recipes grid. */
export function GhRecipeCard({
  recipe,
  verifiedContentComingSoon,
  statusLabels,
  fieldLabels,
  onSelect,
  selected = false,
}: GhRecipeCardProps) {
  const verified = isRecipeVerified(recipe);
  const heroImage =
    recipe.images[0] ?? resolveGulfHeritageImageUrl(recipe.stepImages[0] ?? null) ?? CULTURE_IMAGE_PLACEHOLDER;

  return (
    <article
      className={`${ghSurfaces.cardElevated} ${ghMotion.cardHover} flex h-full flex-col overflow-hidden motion-reduce:transform-none ${
        selected ? "ring-2 ring-ba-bronze/40" : ""
      }`}
    >
      <div className="relative aspect-[16/10] overflow-hidden border-b border-ba-espresso/6 bg-ba-sand/30">
        <OptimizedImage
          src={heroImage}
          alt={recipe.title}
          fill
          loading="lazy"
          sizes="(min-width: 640px) 320px, 80vw"
          className="object-cover object-center"
        />
        {verified ? (
          <span className="absolute start-3 top-3 inline-flex items-center gap-1 rounded-full border border-emerald-700/15 bg-emerald-50/90 px-2.5 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-emerald-900/80 backdrop-blur-sm">
            <ShieldCheck aria-hidden className="h-3 w-3" strokeWidth={2} />
            {statusLabels.verified}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-semibold tracking-[-0.01em] text-ac-espresso">{recipe.title}</h3>

        {verified ? (
          <>
            <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-ac-espresso/70">
              {recipe.difficulty ? (
                <div className="inline-flex items-center gap-1">
                  <Users aria-hidden className="h-3.5 w-3.5 text-ba-bronze/80" />
                  <dt className="sr-only">{fieldLabels.difficulty}</dt>
                  <dd>{recipe.difficulty}</dd>
                </div>
              ) : null}
              {recipe.preparationTime ? (
                <div className="inline-flex items-center gap-1">
                  <Clock aria-hidden className="h-3.5 w-3.5 text-ba-bronze/80" />
                  <dt className="sr-only">{fieldLabels.preparationTime}</dt>
                  <dd>{recipe.preparationTime}</dd>
                </div>
              ) : null}
              {recipe.servingSize ? (
                <div className="inline-flex items-center gap-1">
                  <Users aria-hidden className="h-3.5 w-3.5 text-ba-bronze/80" />
                  <dt className="sr-only">{fieldLabels.servingSize}</dt>
                  <dd>{recipe.servingSize}</dd>
                </div>
              ) : null}
            </dl>
            {recipe.notes ? (
              <p className={`${ghTypography.metaLabel} mt-3 line-clamp-2 normal-case tracking-normal text-ac-espresso/65`}>
                {recipe.notes}
              </p>
            ) : null}
          </>
        ) : (
          <div className="mt-3 flex-1">
            <GhPendingContent message={verifiedContentComingSoon} />
          </div>
        )}

        {onSelect ? (
          <button
            type="button"
            onClick={onSelect}
            className="mt-4 text-start text-sm font-medium text-ba-bronze hover:text-ac-espresso"
          >
            {verified ? "View recipe" : verifiedContentComingSoon}
          </button>
        ) : null}
      </div>
    </article>
  );
}

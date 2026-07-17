import Link from "next/link";
import { OptimizedImage } from "@/app/components/ui/optimized-image";
import { IMAGE_SIZE_PRESETS } from "@/lib/media/responsive-image";
import { DifficultyIndicator } from "@/app/components/ui/difficulty-indicator";
import { badges, cards } from "@/lib/constants/styles";
import { interpolate } from "@/lib/i18n/format";
import { imageAlt } from "@/lib/seo/image-alt";
import type { FeaturedRecipe } from "@/types/homepage";

export type RecipeCardLabels = {
  premium: string;
  editorsChoice: string;
  ratio: string;
  time: string;
  difficultyLabel: string;
  brewMethodLabel: string;
  imageAltTemplate: string;
};

const defaultRecipeCardLabels: RecipeCardLabels = {
  premium: "Premium",
  editorsChoice: "Editor's Choice",
  ratio: "Ratio",
  time: "Time",
  difficultyLabel: "",
  brewMethodLabel: "",
  imageAltTemplate: imageAlt.recipeTemplate,
};

type RecipeCardProps = {
  recipe: FeaturedRecipe;
  featured: boolean;
  href?: string;
  labels?: Partial<RecipeCardLabels>;
};

type RecipeCardBodyProps = {
  recipe: FeaturedRecipe & { imageBlur?: string | null; imageWidth?: number | null; imageHeight?: number | null };
  featured: boolean;
  labels: RecipeCardLabels;
};

function RecipeCardBody({ recipe, featured, labels }: RecipeCardBodyProps) {
  const brewMethodLabel = labels.brewMethodLabel || recipe.brewMethod;
  const difficultyLabel = labels.difficultyLabel || undefined;

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[1.25rem] bg-gradient-to-b from-ba-pearl via-transparent to-transparent"
      />

      <div className={`relative overflow-hidden ${featured ? "h-56 sm:h-64 lg:h-[19rem]" : "h-48 sm:h-52 lg:h-56"}`}>
        <OptimizedImage
          src={recipe.image}
          alt={interpolate(labels.imageAltTemplate, {
            name: recipe.name,
            country: recipe.country,
            brewMethod: recipe.brewMethod,
            roastLevel: recipe.roastLevel,
          })}
          blurDataUrl={recipe.imageBlur}
          width={recipe.imageWidth ?? undefined}
          height={recipe.imageHeight ?? undefined}
          sizes={featured ? IMAGE_SIZE_PRESETS.recipeCardFeatured : IMAGE_SIZE_PRESETS.recipeCard}
          loading="lazy"
          className={`${cards.cardPhoto} saturate-[0.96] transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04] motion-reduce:transform-none`}
        />
        <div className={cards.imageOverlay} />
        <div className={cards.imageAmberWash} />

        <div className="absolute start-5 top-5 flex flex-wrap gap-2">
          <span className={badges.tag}>{brewMethodLabel}</span>
          <span className={badges.accent}>{recipe.roastLevel}</span>
        </div>

        {recipe.premium && (
          <div className={`absolute end-5 top-5 ${badges.premiumDark}`}>{labels.premium}</div>
        )}

        {recipe.featured && (
          <div className={`absolute bottom-5 start-5 flex items-center gap-2 rounded-full border border-ba-gold/35 bg-ba-gold/15 px-4 py-1.5 text-[11px] font-medium text-ba-pearl backdrop-blur-xl`}>
            <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 text-ba-gold" aria-hidden>
              <path
                d="M8 2l1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4L2.2 6.2l4-.6L8 2z"
                stroke="currentColor"
                strokeWidth="1.1"
                strokeLinejoin="round"
              />
            </svg>
            {labels.editorsChoice}
          </div>
        )}
      </div>

      <div className={`relative flex flex-1 flex-col ${featured ? "p-8 lg:p-10" : "p-7 lg:p-8"}`}>
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-ba-bronze/80">{recipe.country}</p>
          <h3
            className={`font-display mt-2 leading-snug tracking-[-0.02em] text-ba-espresso transition-colors duration-300 group-hover:text-ba-coffee ${
              featured ? "text-xl lg:text-2xl" : "text-lg"
            }`}
          >
            {recipe.name}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-ba-coffee/65">{recipe.origin}</p>
          <p
            className={`mt-4 leading-[1.75] text-ba-coffee/72 ${featured ? "text-sm lg:text-[0.9375rem]" : "text-sm"}`}
          >
            {recipe.notes}
          </p>
        </div>

        <div className="mt-7 border-t border-ba-espresso/[0.06] pt-6">
          <DifficultyIndicator
            level={recipe.difficulty}
            label={difficultyLabel}
            labelClassName="text-xs text-ba-coffee/55"
            className="flex items-center gap-2"
          />
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-ba-coffee/55">
            <span>
              {labels.ratio}{" "}
              <strong className="font-medium text-ba-espresso">{recipe.ratio}</strong>
            </span>
            <span>
              {labels.time}{" "}
              <strong className="font-medium text-ba-espresso">{recipe.time}</strong>
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

export function RecipeCard({ recipe, featured, href, labels }: RecipeCardProps) {
  const resolvedLabels: RecipeCardLabels = { ...defaultRecipeCardLabels, ...labels };
  const className = `${cards.premiumShell} ${
    featured ? "ring-1 ring-ba-gold/15 hover:ring-ba-gold/25" : ""
  }`;

  if (href) {
    return (
      <Link href={href} className={className}>
        <RecipeCardBody recipe={recipe} featured={featured} labels={resolvedLabels} />
      </Link>
    );
  }

  return (
    <article className={className}>
      <RecipeCardBody recipe={recipe} featured={featured} labels={resolvedLabels} />
    </article>
  );
}

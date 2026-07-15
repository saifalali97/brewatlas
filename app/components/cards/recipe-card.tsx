import Link from "next/link";
import { OptimizedImage } from "@/app/components/ui/optimized-image";
import { IMAGE_SIZE_PRESETS } from "@/lib/media/responsive-image";
import { DifficultyIndicator } from "@/app/components/ui/difficulty-indicator";
import { interpolate } from "@/lib/i18n/format";
import { imageAlt } from "@/lib/seo/image-alt";
import type { FeaturedRecipe } from "@/types/homepage";

export type RecipeCardLabels = {
  premium: string;
  editorsChoice: string;
  ratio: string;
  time: string;
  /** Translated label for `recipe.difficulty` (see `lib/i18n/home-labels.ts`). Defaults to the raw English enum value. */
  difficultyLabel: string;
  /** Translated label for `recipe.brewMethod` badge. Defaults to the raw (canonical English) value. */
  brewMethodLabel: string;
  /** Translated `{name} {country} {brewMethod} {roastLevel}` image alt template. */
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
  /** When provided, the whole card becomes a link (e.g. to a recipe detail page). */
  href?: string;
  /** Translated copy for this card's chrome. Defaults to English so existing callers (e.g. `/recipes`) are unaffected. */
  labels?: Partial<RecipeCardLabels>;
};

type RecipeCardBodyProps = {
  recipe: FeaturedRecipe & { imageBlur?: string | null; imageWidth?: number | null; imageHeight?: number | null };
  featured: boolean;
  labels: RecipeCardLabels;
};

function RecipeCardBody({
  recipe,
  featured,
  labels,
}: RecipeCardBodyProps) {
  const brewMethodLabel = labels.brewMethodLabel || recipe.brewMethod;
  const difficultyLabel = labels.difficultyLabel || undefined;
  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[1.5rem] bg-gradient-to-b from-white/[0.07] via-transparent to-transparent"
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
          className="object-cover brightness-[0.88] contrast-[1.04] saturate-[0.92] transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.045] motion-reduce:transform-none"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0705] via-[#0a0705]/15 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950/8 via-transparent to-[#0a0705]/25" />

        <div className="absolute start-5 top-5 flex flex-wrap gap-2">
          <span className="rounded-full border border-white/[0.14] bg-[#0a0705]/50 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-stone-200 backdrop-blur-xl">
            {brewMethodLabel}
          </span>
          <span className="rounded-full border border-amber-700/25 bg-amber-950/50 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-amber-300/90 backdrop-blur-xl">
            {recipe.roastLevel}
          </span>
        </div>

        {recipe.premium && (
          <div className="absolute end-5 top-5 rounded-full border border-amber-700/35 bg-amber-950/65 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-amber-200/90 backdrop-blur-xl">
            {labels.premium}
          </div>
        )}

        {recipe.featured && (
          <div className="absolute bottom-5 start-5 flex items-center gap-2 rounded-full border border-amber-500/40 bg-gradient-to-r from-amber-950/70 to-[#0a0705]/60 px-4 py-1.5 text-[11px] font-medium text-amber-100/95 shadow-[0_0_28px_rgba(217,119,6,0.15)] backdrop-blur-xl">
            <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 text-amber-400" aria-hidden>
              <path d="M8 2l1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4L2.2 6.2l4-.6L8 2z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
            </svg>
            {labels.editorsChoice}
          </div>
        )}
      </div>

      <div className={`relative flex flex-1 flex-col ${featured ? "p-8 lg:p-10" : "p-7 lg:p-8"}`}>
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-amber-600/70">
            {recipe.country}
          </p>
          <h3
            className={`mt-2 font-medium leading-snug tracking-tight text-stone-50 transition-colors duration-300 group-hover:text-amber-100 ${
              featured ? "text-xl lg:text-2xl" : "text-lg"
            }`}
          >
            {recipe.name}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-stone-500">{recipe.origin}</p>
          <p className={`mt-4 leading-[1.75] text-stone-400 ${featured ? "text-sm lg:text-[0.9375rem]" : "text-sm"}`}>
            {recipe.notes}
          </p>
        </div>

        <div className="mt-7 border-t border-white/[0.06] pt-6">
          <DifficultyIndicator
            level={recipe.difficulty}
            label={difficultyLabel}
            labelClassName="text-xs text-stone-500"
            className="flex items-center gap-2"
          />
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-stone-500">
            <span>
              {labels.ratio}{" "}
              <strong className="font-medium text-stone-300">{recipe.ratio}</strong>
            </span>
            <span>
              {labels.time}{" "}
              <strong className="font-medium text-stone-300">{recipe.time}</strong>
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

export function RecipeCard({ recipe, featured, href, labels }: RecipeCardProps) {
  const resolvedLabels: RecipeCardLabels = { ...defaultRecipeCardLabels, ...labels };
  const className = `group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border bg-gradient-to-br from-white/[0.08] via-white/[0.035] to-white/[0.01] shadow-[0_12px_40px_-16px_rgba(0,0,0,0.48)] backdrop-blur-2xl transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-2 hover:shadow-[0_32px_68px_-20px_rgba(180,120,60,0.2)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${
    featured
      ? "lg:col-span-2 border-amber-600/25 ring-1 ring-amber-500/20 shadow-[0_20px_56px_-20px_rgba(180,120,60,0.18)] hover:border-amber-500/35"
      : "border-white/[0.11] hover:border-amber-600/28"
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

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { OptimizedImage } from "@/app/components/ui/optimized-image";
import { acFocus, acTypography } from "@/lib/design-system/atlas-canon";
import { IMAGE_SIZE_PRESETS } from "@/lib/media/responsive-image";

type RecipeEditorialHeroProps = {
  backHref: string;
  backLabel: string;
  imageSrc: string;
  imageAlt: string;
  eyebrow?: string;
  title: string;
  lead?: string;
  /** Supporting facts rendered under the title (method, ratio, etc.) */
  facts?: ReactNode;
  badge?: ReactNode;
  overlay?: ReactNode;
  actions?: ReactNode;
  blurDataUrl?: string | null;
  imageWidth?: number | null;
  imageHeight?: number | null;
};

function joinClasses(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/** Full-bleed recipe hero — editorial article opening, not a dashboard card. */
export function RecipeEditorialHero({
  backHref,
  backLabel,
  imageSrc,
  imageAlt,
  eyebrow,
  title,
  lead,
  facts,
  badge,
  overlay,
  actions,
  blurDataUrl,
}: RecipeEditorialHeroProps) {
  return (
    <article>
      <Link
        href={backHref}
        className={joinClasses(
          acTypography.nav,
          "mb-8 inline-flex min-h-11 items-center gap-2 text-ac-espresso/75 hover:text-ba-bronze",
          acFocus.ring,
        )}
      >
        <ArrowLeft className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
        {backLabel}
      </Link>

      <div className="relative -mx-6 aspect-[16/10] max-h-[72svh] overflow-hidden sm:-mx-8 lg:-mx-12 xl:-mx-16">
        <OptimizedImage
          src={imageSrc}
          alt={imageAlt}
          blurDataUrl={blurDataUrl ?? undefined}
          fill
          sizes={IMAGE_SIZE_PRESETS.recipeDetailCover}
          priority
          className="object-cover object-center photo-grade-library motion-safe:transition-transform motion-safe:duration-[220ms] motion-safe:hover:scale-[1.01] motion-reduce:transform-none"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-ac-espresso/30 via-transparent to-transparent"
        />
        {badge ? <div className="absolute end-5 top-5 sm:end-8 sm:top-8">{badge}</div> : null}
        {overlay ? <div className="absolute start-5 bottom-5 sm:start-8 sm:bottom-8">{overlay}</div> : null}
      </div>

      <div className="mx-auto max-w-3xl pt-14 md:pt-16">
        {eyebrow ? <p className={`${acTypography.eyebrow} text-ac-espresso/50`}>{eyebrow}</p> : null}
        <h1
          id="recipe-detail-heading"
          className={joinClasses(acTypography.displayLg, eyebrow ? "mt-4 md:mt-5" : "mt-0")}
        >
          {title}
        </h1>
        {facts ? <div className="mt-1">{facts}</div> : null}
        {lead ? (
          <p className={joinClasses(acTypography.body, "mt-5 max-w-2xl text-ac-espresso/72 md:mt-6")}>{lead}</p>
        ) : null}
        {actions ? (
          <div className="mt-10 border-t border-ac-espresso/[0.06] pt-8 md:mt-12">{actions}</div>
        ) : null}
      </div>
    </article>
  );
}

export function RecipeEditorialSection({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={joinClasses("mx-auto max-w-3xl", className)}>
      <div className="ac-brass-rule mb-9 md:mb-10" aria-hidden />
      <h2 className={`${acTypography.eyebrow} text-ac-espresso/70`}>{title}</h2>
      <div className="mt-7 md:mt-8">{children}</div>
    </section>
  );
}

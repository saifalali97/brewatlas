import type { ReactNode } from "react";
import Link from "next/link";
import { OptimizedImage } from "@/app/components/ui/optimized-image";
import { badges } from "@/lib/constants/styles";
import {
  rdCard,
  rdLayout,
  rdMotion,
  rdTypography,
} from "@/lib/design-system/recipes-directory";
import { IMAGE_SIZE_PRESETS } from "@/lib/media/responsive-image";

export type RecipeCardProps = {
  href: string;
  name: string;
  image: string;
  imageAlt: string;
  imageBlur?: string | null;
  imageWidth?: number | null;
  imageHeight?: number | null;
  brewMethodLabel: string;
  temperatureLabel: string;
  subtitle?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
};

/** Shared Recipes directory recipe card shell (image, badges, title, slots). */
export function RecipeCard({
  href,
  name,
  image,
  imageAlt,
  imageBlur,
  imageWidth,
  imageHeight,
  brewMethodLabel,
  temperatureLabel,
  subtitle,
  footer,
  children,
}: RecipeCardProps) {
  return (
    <Link href={href} className={rdCard.recipe}>
      <div className={rdLayout.recipeImage}>
        <OptimizedImage
          src={image}
          alt={imageAlt}
          blurDataUrl={imageBlur ?? undefined}
          width={imageWidth ?? undefined}
          height={imageHeight ?? undefined}
          sizes={IMAGE_SIZE_PRESETS.recipeCard}
          loading="lazy"
          className={`ac-card-photo object-cover ${rdMotion.imageZoomSlow}`}
        />
        <div className={rdCard.imageOverlay} />
        <div className="absolute start-4 top-4 flex flex-wrap gap-2">
          <span className={badges.tag}>{brewMethodLabel}</span>
          <span className={badges.accent}>{temperatureLabel}</span>
        </div>
      </div>

      <div className={rdCard.recipeBody}>
        <h3 className={rdTypography.recipeTitle}>{name}</h3>
        {subtitle}
        {children}
        {footer ? <div className={rdCard.recipeFooter}>{footer}</div> : null}
      </div>
    </Link>
  );
}

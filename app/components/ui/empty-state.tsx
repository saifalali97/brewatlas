import { OptimizedImage } from "@/app/components/ui/optimized-image";
import type { ReactNode } from "react";
import Link from "next/link";
import { acFocus, acSurface, acTypography } from "@/lib/design-system/atlas-canon";

type EmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  icon?: ReactNode;
  imageSrc?: string;
  imageAlt?: string;
  className?: string;
};

/** Shared empty-state — editorial plate with optional lifestyle photography. */
export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  icon,
  imageSrc,
  imageAlt,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`${acSurface.plate} overflow-hidden px-8 py-16 text-center ${className}`.trim()}>
      {imageSrc ? (
        <div className="relative mx-auto mb-8 aspect-[16/10] max-w-md overflow-hidden rounded-sm">
          <OptimizedImage
            src={imageSrc}
            alt={imageAlt ?? title}
            fill
            sizes="(min-width: 768px) 400px, 80vw"
            className="object-cover object-center"
          />
        </div>
      ) : icon ? (
        <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center text-ac-espresso">{icon}</div>
      ) : null}
      <h2 className={acTypography.h3}>{title}</h2>
      {description ? (
        <p className={`${acTypography.body} mx-auto mt-3 max-w-md`}>{description}</p>
      ) : null}
      {actionLabel && actionHref ? (
        <Link
          href={actionHref}
          className={`${acTypography.nav} mt-8 inline-flex h-11 items-center rounded-full border border-ac-copper/35 px-6 text-ac-espresso hover:border-ac-copper/55 hover:bg-ac-espresso/[0.03] ${acFocus.ring}`}
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

import type { ReactNode } from "react";
import Link from "next/link";
import { buttons, dsTypography, surfaces } from "@/lib/constants/styles";

type EmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  actionHref?: string;
  icon?: ReactNode;
  className?: string;
};

/** Shared empty-state card used across list and explorer views. */
export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  icon,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`${surfaces.emptyState} ${className}`.trim()}>
      {icon ? (
        <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-ba-gold/25 bg-ba-gold/10 text-ba-bronze">
          {icon}
        </div>
      ) : null}
      <h2 className={`font-display text-lg text-ba-espresso`}>{title}</h2>
      {description ? (
        <p className={`mx-auto mt-2 max-w-md text-sm ${dsTypography.caption}`}>{description}</p>
      ) : null}
      {actionLabel && actionHref ? (
        <Link href={actionHref} className={`${buttons.secondary} mt-6 inline-flex h-10 min-w-0 px-5 text-xs`}>
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

import type { ReactNode } from "react";
import Link from "next/link";
import { buttons } from "@/lib/constants/styles";

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
    <div
      className={`rounded-[1.5rem] border border-white/[0.08] bg-white/[0.02] px-6 py-16 text-center ${className}`}
    >
      {icon ? <div className="mx-auto mb-4 flex justify-center text-amber-500/80">{icon}</div> : null}
      <p className="text-base font-medium text-stone-200">{title}</p>
      {description ? <p className="mx-auto mt-2 max-w-md text-sm text-stone-500">{description}</p> : null}
      {actionLabel && actionHref ? (
        <Link href={actionHref} className={`${buttons.secondary} mt-6 inline-flex h-10 min-w-0 px-5 text-xs`}>
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

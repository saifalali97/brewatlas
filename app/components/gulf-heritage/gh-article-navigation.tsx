import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { acFocus } from "@/lib/design-system/atlas-canon";
import { ghMotion, ghSurfaces } from "@/app/components/gulf-heritage/shared/gh-styles";
import type { GhNavLink } from "@/app/components/gulf-heritage/shared/gh-navigation-utils";

type GhArticleNavigationProps = {
  previousLabel: string;
  nextLabel: string;
  previous: GhNavLink | null;
  next: GhNavLink | null;
};

/** Previous / next article navigation within a category. */
export function GhArticleNavigation({ previousLabel, nextLabel, previous, next }: GhArticleNavigationProps) {
  if (!previous && !next) return null;

  return (
    <nav aria-label="Article navigation" className={`mt-12 grid gap-3 sm:grid-cols-2 ${ghMotion.fadeIn}`}>
      {previous ? (
        <Link
          href={previous.href}
          className={`${ghSurfaces.card} ${ghMotion.cardHover} group flex flex-col gap-2 p-5 motion-reduce:transform-none ${acFocus.ring}`}
        >
          <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-ac-espresso/55">
            <ArrowLeft aria-hidden className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5 motion-reduce:transform-none" />
            {previousLabel}
          </span>
          <span className="font-medium text-ac-espresso">{previous.title}</span>
        </Link>
      ) : (
        <div aria-hidden className="hidden sm:block" />
      )}

      {next ? (
        <Link
          href={next.href}
          className={`${ghSurfaces.card} ${ghMotion.cardHover} group flex flex-col items-end gap-2 p-5 text-end motion-reduce:transform-none ${acFocus.ring}`}
        >
          <span className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-ac-espresso/55">
            {nextLabel}
            <ArrowRight aria-hidden className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none" />
          </span>
          <span className="font-medium text-ac-espresso">{next.title}</span>
        </Link>
      ) : null}
    </nav>
  );
}

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { GulfHeritageEditorialStatusBadge } from "@/app/components/gulf-heritage/gulf-heritage-editorial-status";
import { GhPendingContent } from "@/app/components/gulf-heritage/gh-pending-content";
import { ghMotion, ghSurfaces, ghTypography } from "@/app/components/gulf-heritage/shared/gh-styles";
import { acFocus } from "@/lib/design-system/atlas-canon";
import { getUaePageDefinition } from "@/lib/content/gulf-heritage/uae/pages";
import type { GulfHeritageEditorialStatus } from "@/types/gulf-heritage-editorial";
import type { GulfHeritagePageCopy, GulfHeritagePageSlug } from "@/types/gulf-heritage";

type GhRelatedContentGridProps = {
  title: string;
  country: string;
  category: string;
  readLabel: string;
  pendingDescription: string;
  statusLabels: Record<GulfHeritageEditorialStatus, string>;
  pages: Array<{ slug: GulfHeritagePageSlug; copy: GulfHeritagePageCopy; href: string }>;
};

/** Related content grid with editorial status and descriptions. */
export function GhRelatedContentGrid({
  title,
  country,
  category,
  readLabel,
  pendingDescription,
  statusLabels,
  pages,
}: GhRelatedContentGridProps) {
  if (pages.length === 0) return null;

  return (
    <section aria-labelledby="gh-related-content-heading" className="mt-14">
      <h2 id="gh-related-content-heading" className={ghTypography.sectionTitle}>
        {title}
      </h2>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2">
        {pages.map((page) => {
          const definition = getUaePageDefinition(page.slug);
          const editorialStatus = definition?.editorialStatus ?? "pending-review";

          return (
            <li key={page.slug}>
              <article
                className={`${ghSurfaces.cardElevated} ${ghMotion.cardHover} group flex h-full flex-col p-5 motion-reduce:transform-none`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className={ghTypography.metaLabel}>{category}</span>
                  <span className="text-ac-espresso/25">·</span>
                  <span className={ghTypography.metaLabel}>{country}</span>
                </div>

                <h3 className="mt-3 text-lg font-semibold tracking-[-0.02em] text-ac-espresso">{page.copy.title}</h3>

                <div className="mt-2">
                  <GulfHeritageEditorialStatusBadge status={editorialStatus} labels={statusLabels} />
                </div>

                <div className="mt-3 flex-1">
                  {page.copy.intro ? (
                    <p className="line-clamp-3 text-sm leading-relaxed text-ac-espresso/75">{page.copy.intro}</p>
                  ) : page.copy.seoDescription ? (
                    <p className="line-clamp-3 text-sm leading-relaxed text-ac-espresso/75">{page.copy.seoDescription}</p>
                  ) : (
                    <GhPendingContent message={pendingDescription} />
                  )}
                </div>

                <Link
                  href={page.href}
                  className={`mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-ba-bronze transition-colors hover:text-ac-espresso ${acFocus.ring}`}
                >
                  {readLabel}
                  <ArrowUpRight
                    aria-hidden
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transform-none"
                  />
                </Link>
              </article>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

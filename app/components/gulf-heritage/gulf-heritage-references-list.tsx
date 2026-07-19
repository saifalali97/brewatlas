import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { GhPendingContent } from "@/app/components/gulf-heritage/gh-pending-content";
import { ghMotion, ghSurfaces, ghTypography } from "@/app/components/gulf-heritage/shared/gh-styles";
import { acFocus } from "@/lib/design-system/atlas-canon";
import { hasGulfHeritageReferences } from "@/types/gulf-heritage-reference";
import type { GulfHeritageReference, GulfHeritageReferenceType } from "@/types/gulf-heritage-reference";

type GulfHeritageReferencesListProps = {
  title: string;
  references: readonly GulfHeritageReference[];
  pendingMessage: string;
  typeLabels: Record<GulfHeritageReferenceType, string>;
  fieldLabels: {
    organization: string;
    publication: string;
    retrievedDate: string;
    url: string;
  };
};

/** Renders verified references with improved typography. */
export function GulfHeritageReferencesList({
  title,
  references,
  pendingMessage,
  typeLabels,
  fieldLabels,
}: GulfHeritageReferencesListProps) {
  return (
    <section aria-labelledby="gh-references-heading" className="mt-14 scroll-mt-28">
      <h2 id="gh-references-heading" className={ghTypography.sectionTitle}>
        {title}
      </h2>

      {hasGulfHeritageReferences(references) ? (
        <ul className="mt-6 space-y-3">
          {references.map((reference, index) => (
            <li
              key={`${reference.sourceName}-${index}`}
              className={`${ghSurfaces.card} ${ghMotion.fadeIn} px-5 py-5 sm:px-6`}
            >
              <p className="text-base font-semibold tracking-[-0.01em] text-ac-espresso">{reference.sourceName}</p>
              <p className={`${ghTypography.metaLabel} mt-2 text-ba-bronze`}>{typeLabels[reference.type]}</p>

              <dl className="mt-3 space-y-1.5 text-sm text-ac-espresso/78">
                {reference.organization ? (
                  <div>
                    <dt className="inline font-medium text-ac-espresso/90">{fieldLabels.organization}: </dt>
                    <dd className="inline">{reference.organization}</dd>
                  </div>
                ) : null}
                {reference.publication ? (
                  <div>
                    <dt className="inline font-medium text-ac-espresso/90">{fieldLabels.publication}: </dt>
                    <dd className="inline">{reference.publication}</dd>
                  </div>
                ) : null}
                {reference.retrievedDate ? (
                  <div>
                    <dt className="inline font-medium text-ac-espresso/90">{fieldLabels.retrievedDate}: </dt>
                    <dd className="inline">{reference.retrievedDate}</dd>
                  </div>
                ) : null}
              </dl>

              {reference.url ? (
                <Link
                  href={reference.url}
                  className={`mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-ba-bronze underline-offset-2 hover:text-ac-espresso hover:underline ${acFocus.ring}`}
                  rel="noopener noreferrer"
                >
                  {fieldLabels.url}
                  <ExternalLink aria-hidden className="h-3.5 w-3.5" strokeWidth={2} />
                </Link>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <div className={`${ghSurfaces.articlePanel} mt-5 px-6 py-7`}>
          <GhPendingContent message={pendingMessage} />
        </div>
      )}
    </section>
  );
}

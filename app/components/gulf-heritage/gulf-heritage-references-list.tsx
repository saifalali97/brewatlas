import { GulfHeritageContentSection } from "@/app/components/gulf-heritage/gulf-heritage-content-section";
import { GulfHeritagePendingContent } from "@/app/components/gulf-heritage/gulf-heritage-pending-content";
import { surfaces } from "@/lib/constants/styles";
import { hasGulfHeritageReferences } from "@/types/gulf-heritage-reference";
import type { GulfHeritageReference } from "@/types/gulf-heritage-reference";

type GulfHeritageReferencesListProps = {
  title: string;
  references: readonly GulfHeritageReference[];
  pendingMessage: string;
};

/** Renders verified references or a pending placeholder. */
export function GulfHeritageReferencesList({
  title,
  references,
  pendingMessage,
}: GulfHeritageReferencesListProps) {
  return (
    <GulfHeritageContentSection title={title}>
      {hasGulfHeritageReferences(references) ? (
        <ul className={`${surfaces.lightList} divide-y divide-ba-espresso/08`}>
          {references.map((reference, index) => (
            <li key={`${reference.title}-${index}`} className="px-5 py-4 text-sm text-ac-espresso">
              <p className="font-medium">{reference.title}</p>
              {reference.organization ? <p className="mt-1">{reference.organization}</p> : null}
              {reference.author ? <p className="mt-1">{reference.author}</p> : null}
              {reference.url ? (
                <a href={reference.url} className="mt-2 inline-block underline" rel="noopener noreferrer">
                  {reference.url}
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <GulfHeritagePendingContent message={pendingMessage} />
      )}
    </GulfHeritageContentSection>
  );
}

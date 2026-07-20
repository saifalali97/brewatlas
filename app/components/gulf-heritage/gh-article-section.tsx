import { GhFactCard } from "@/app/components/gulf-heritage/gh-fact-card";
import { GhPullQuote } from "@/app/components/gulf-heritage/gh-pull-quote";
import { GhTimelineBlock } from "@/app/components/gulf-heritage/gh-timeline-block";
import { GhPendingContent } from "@/app/components/gulf-heritage/gh-pending-content";
import {
  extractLeadSentence,
  parseGlossaryEntries,
  splitEditorialParagraphs,
} from "@/app/components/gulf-heritage/shared/gh-text-utils";
import { ghMotion, ghSurfaces, ghTypography } from "@/app/components/gulf-heritage/shared/gh-styles";

export type GhArticleSectionVariant = "default" | "history" | "cultural" | "glossary" | "preparation";

type GhArticleSectionProps = {
  id: string;
  title: string;
  body: string | null;
  pendingMessage: string;
  variant?: GhArticleSectionVariant;
};

function DefaultBody({ body }: { body: string }) {
  const paragraphs = splitEditorialParagraphs(body);
  return (
    <div className={`${ghTypography.prose} ${ghTypography.proseWide}`}>
      {paragraphs.map((paragraph) => (
        <p key={paragraph.slice(0, 48)}>{paragraph}</p>
      ))}
    </div>
  );
}

/** Premium article section — renders verified copy with museum-quality typography. */
export function GhArticleSection({
  id,
  title,
  body,
  pendingMessage,
  variant = "default",
}: GhArticleSectionProps) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className={`scroll-mt-28 ${ghMotion.slideUp}`}>
      <h2 id={`${id}-heading`} className={ghTypography.sectionTitle}>
        {title}
      </h2>

      <div className={`${ghSurfaces.articlePanel} mt-5 overflow-hidden`}>
        <div className="px-6 py-7 sm:px-8 sm:py-8">
          {!body ? (
            <GhPendingContent message={pendingMessage} />
          ) : variant === "glossary" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {parseGlossaryEntries(body).map((entry) => (
                <GhFactCard key={entry.term} term={entry.term} definition={entry.definition} />
              ))}
            </div>
          ) : variant === "history" ? (
            <GhTimelineBlock title={title} entries={splitEditorialParagraphs(body)} showTitle={false} />
          ) : variant === "cultural" ? (
            (() => {
              const { lead, remainder } = extractLeadSentence(body);
              return (
                <div className="space-y-6">
                  <GhPullQuote quote={lead} />
                  {remainder ? <DefaultBody body={remainder} /> : null}
                </div>
              );
            })()
          ) : (
            <DefaultBody body={body} />
          )}
        </div>
      </div>
    </section>
  );
}

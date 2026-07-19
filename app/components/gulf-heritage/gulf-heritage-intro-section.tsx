import { GhPullQuote } from "@/app/components/gulf-heritage/gh-pull-quote";
import { GhPendingContent } from "@/app/components/gulf-heritage/gh-pending-content";
import { ghMotion, ghSurfaces, ghTypography } from "@/app/components/gulf-heritage/shared/gh-styles";

type GulfHeritageIntroSectionProps = {
  title: string;
  intro: string | null;
  pendingMessage: string;
};

/** Page introduction with pull-quote styling for verified copy. */
export function GulfHeritageIntroSection({ title, intro, pendingMessage }: GulfHeritageIntroSectionProps) {
  return (
    <section id="gh-section-intro" aria-labelledby="gh-intro-heading" className={`mt-10 scroll-mt-28 ${ghMotion.slideUp}`}>
      <h2 id="gh-intro-heading" className={ghTypography.sectionTitle}>
        {title}
      </h2>
      <div className="mt-5">
        {intro ? (
          <GhPullQuote quote={intro} />
        ) : (
          <div className={`${ghSurfaces.articlePanel} px-6 py-7 sm:px-8`}>
            <GhPendingContent message={pendingMessage} />
          </div>
        )}
      </div>
    </section>
  );
}

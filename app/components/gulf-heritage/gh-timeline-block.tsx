import { ghSurfaces, ghTypography } from "@/app/components/gulf-heritage/shared/gh-styles";

type GhTimelineBlockProps = {
  title: string;
  entries: readonly string[];
  showTitle?: boolean;
};

/** Timeline-style presentation for historical editorial sections. */
export function GhTimelineBlock({ title, entries, showTitle = true }: GhTimelineBlockProps) {
  if (entries.length === 0) return null;

  const headingId = `gh-timeline-${title.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div aria-labelledby={showTitle ? headingId : undefined}>
      {showTitle ? (
        <h2 id={headingId} className={ghTypography.sectionTitle}>
          {title}
        </h2>
      ) : null}
      <ol className={`relative space-y-0 ${showTitle ? "mt-6" : ""}`}>
        <div aria-hidden className="absolute bottom-2 start-[0.6875rem] top-2 w-px bg-ba-espresso/10" />
        {entries.map((entry, index) => (
          <li key={`${index}-${entry.slice(0, 24)}`} className="relative ps-8 pb-6 last:pb-0">
            <span
              aria-hidden
              className="absolute start-0 top-1.5 flex h-[1.375rem] w-[1.375rem] items-center justify-center rounded-full border border-ba-bronze/30 bg-ba-pearl text-[0.625rem] font-semibold text-ba-bronze"
            >
              {index + 1}
            </span>
            <div className={`${ghSurfaces.articlePanelInset} p-4 sm:p-5`}>
              <p className="text-sm leading-relaxed text-ac-espresso/88 sm:text-[0.9375rem]">{entry}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

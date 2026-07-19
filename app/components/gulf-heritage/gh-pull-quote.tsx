import { ghSurfaces, ghTypography } from "@/app/components/gulf-heritage/shared/gh-styles";

type GhPullQuoteProps = {
  quote: string;
  attribution?: string | null;
};

/** Pull quote for editorial highlights — uses existing verified copy only. */
export function GhPullQuote({ quote, attribution }: GhPullQuoteProps) {
  return (
    <figure className={`${ghSurfaces.articlePanel} relative overflow-hidden px-6 py-7 sm:px-8 sm:py-8`}>
      <div aria-hidden className="absolute inset-y-0 start-0 w-1 bg-gradient-to-b from-ba-gold/70 via-ba-bronze/50 to-transparent" />
      <blockquote className="ps-4 font-display text-xl leading-[1.35] tracking-[-0.02em] text-ac-espresso sm:text-2xl">
        {quote}
      </blockquote>
      {attribution ? (
        <figcaption className={`${ghTypography.metaLabel} mt-4 ps-4 text-ac-espresso/60`}>{attribution}</figcaption>
      ) : null}
    </figure>
  );
}

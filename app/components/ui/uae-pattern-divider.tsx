/**
 * A thin, repeating triangular motif in the spirit of Al Sadu weaving
 * (geometric bands of triangles/diamonds) -- an original abstract SVG,
 * not a reproduction of any specific textile or trademark. Purely
 * decorative (`aria-hidden`); not used by any existing page, only by
 * new UAE-brand components that opt in.
 */
export function UaePatternDivider({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden className={`h-3 w-full overflow-hidden ${className}`}>
      <svg
        viewBox="0 0 120 12"
        preserveAspectRatio="none"
        className="h-full w-full text-uae-warm-gold"
      >
        <defs>
          <pattern id="uae-sadu-motif" width="12" height="12" patternUnits="userSpaceOnUse">
            <path d="M0 12 L6 0 L12 12 Z" fill="currentColor" opacity="0.55" />
            <path d="M0 0 L6 12 L12 0 Z" fill="currentColor" opacity="0.22" />
          </pattern>
        </defs>
        <rect width="120" height="12" fill="url(#uae-sadu-motif)" />
      </svg>
    </div>
  );
}

/** Soft desert dune transition between homepage chapters. */
export function SectionCurve({ flip = false, className = "" }: { flip?: boolean; className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none relative -mt-px h-16 w-full overflow-hidden sm:h-20 lg:h-24 ${className}`.trim()}
    >
      <svg
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        className={`absolute inset-0 h-full w-full ${flip ? "rotate-180" : ""}`}
      >
        <path
          d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,50 1440,40 L1440,80 L0,80 Z"
          className="fill-ba-pearl"
        />
      </svg>
    </div>
  );
}

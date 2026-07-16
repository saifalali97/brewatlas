type SectionCurveFill = "limestone" | "pearl" | "sand" | "espresso";

const fillClass: Record<SectionCurveFill, string> = {
  limestone: "fill-ac-limestone",
  pearl: "fill-ac-pearl",
  sand: "fill-ac-sand",
  espresso: "fill-ac-espresso",
};

/** Dune transition between homepage chapters. */
export function SectionCurve({
  flip = false,
  fill = "pearl",
  className = "",
}: {
  flip?: boolean;
  fill?: SectionCurveFill;
  className?: string;
}) {
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
          className={fillClass[fill]}
        />
      </svg>
    </div>
  );
}

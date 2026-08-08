import type { PlaceholderFlavorProfile } from "@/lib/gulf-directory/placeholder-recipe-detail";

type PlaceholderRecipeFlavorWheelProps = {
  title: string;
  profile: PlaceholderFlavorProfile;
  labels: {
    sweetness: string;
    acidity: string;
    body: string;
    bitterness: string;
    finish: string;
  };
};

const AXES = [
  { key: "sweetness", angle: -90 },
  { key: "acidity", angle: -18 },
  { key: "body", angle: 54 },
  { key: "bitterness", angle: 126 },
  { key: "finish", angle: 198 },
] as const;

function polar(cx: number, cy: number, radius: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
}

/** Decorative flavor wheel for placeholder recipe pages (no existing component to reuse). */
export function PlaceholderRecipeFlavorWheel({
  title,
  profile,
  labels,
}: PlaceholderRecipeFlavorWheelProps) {
  const cx = 120;
  const cy = 120;
  const maxR = 88;

  const points = AXES.map(({ key, angle }) => {
    const value = profile[key] / 100;
    return polar(cx, cy, maxR * value, angle);
  });
  const polygon = points.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <section aria-labelledby="recipe-flavor-wheel-heading">
      <h2 id="recipe-flavor-wheel-heading" className="font-display text-xl tracking-[-0.02em] text-[#1A1410]">
        {title}
      </h2>
      <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-10">
        <svg viewBox="0 0 240 240" className="h-56 w-56 shrink-0 sm:h-64 sm:w-64" role="img" aria-hidden>
          {[0.25, 0.5, 0.75, 1].map((scale) => (
            <circle
              key={scale}
              cx={cx}
              cy={cy}
              r={maxR * scale}
              fill="none"
              stroke="#C4A574"
              strokeOpacity={0.28}
              strokeWidth="1"
            />
          ))}
          {AXES.map(({ angle }) => {
            const end = polar(cx, cy, maxR, angle);
            return (
              <line
                key={angle}
                x1={cx}
                y1={cy}
                x2={end.x}
                y2={end.y}
                stroke="#C4A574"
                strokeOpacity={0.35}
                strokeWidth="1"
              />
            );
          })}
          <polygon points={polygon} fill="rgba(166,123,74,0.22)" stroke="#A67B4A" strokeWidth="2" />
          {points.map((point, index) => (
            <circle key={AXES[index].key} cx={point.x} cy={point.y} r="4" fill="#A67B4A" />
          ))}
        </svg>

        <ul className="grid w-full max-w-xs grid-cols-1 gap-3 text-sm">
          {AXES.map(({ key }) => (
            <li key={key} className="flex items-center justify-between gap-4 border-b border-[#C4A574]/20 pb-2">
              <span className="text-[#1A1410]/55">{labels[key]}</span>
              <span className="font-medium tabular-nums text-[#1A1410]">{profile[key]}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

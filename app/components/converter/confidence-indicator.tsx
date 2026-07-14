import type { ConfidenceLevel } from "@/lib/converter";

const CONFIDENCE_FILL: Record<ConfidenceLevel, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

type ConfidenceIndicatorProps = {
  level: ConfidenceLevel;
  label: string;
  levelLabel: string;
};

/**
 * How much to trust a conversion's recommendations (Phase 18), shown as a
 * filled-dot meter -- deliberately the same visual language as
 * `DifficultyIndicator` (see `app/components/ui/difficulty-indicator.tsx`)
 * rather than introducing a new status-color system for the converter.
 */
export function ConfidenceIndicator({ level, label, levelLabel }: ConfidenceIndicatorProps) {
  const filled = CONFIDENCE_FILL[level];

  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-medium text-stone-400">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3].map((dot) => (
          <span
            key={dot}
            className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
              dot <= filled ? "bg-amber-500/80" : "bg-white/15"
            }`}
          />
        ))}
      </div>
      <span className="text-[11px] font-semibold text-stone-200">{levelLabel}</span>
    </div>
  );
}

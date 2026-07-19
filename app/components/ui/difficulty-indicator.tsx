import type { Difficulty } from "@/types/homepage";

const difficultyLevel: Record<Difficulty, number> = {
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
};

type DifficultyIndicatorProps = {
  level: Difficulty;
  /** Translated label to display instead of the raw (always-English) `level`. Defaults to `level` so callers that don't localize keep today's behavior. */
  label?: string;
  labelClassName?: string;
  className?: string;
};

export function DifficultyIndicator({
  level,
  label,
  labelClassName = "text-[10px] text-ac-espresso",
  className = "flex items-center gap-1.5",
}: DifficultyIndicatorProps) {
  const filled = difficultyLevel[level];

  return (
    <div className={className}>
      <div className="flex gap-1">
        {[1, 2, 3].map((dot) => (
          <span
            key={dot}
            className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
              dot <= filled ? "bg-ba-bronze/80" : "bg-ba-espresso/10"
            }`}
          />
        ))}
      </div>
      <span className={labelClassName}>{label ?? level}</span>
    </div>
  );
}

import type { Difficulty } from "@/types/homepage";

const difficultyLevel: Record<Difficulty, number> = {
  Beginner: 1,
  Intermediate: 2,
  Advanced: 3,
};

type DifficultyIndicatorProps = {
  level: Difficulty;
  labelClassName?: string;
  className?: string;
};

export function DifficultyIndicator({
  level,
  labelClassName = "text-[10px] text-stone-500",
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
              dot <= filled ? "bg-amber-500/80" : "bg-white/15"
            }`}
          />
        ))}
      </div>
      <span className={labelClassName}>{level}</span>
    </div>
  );
}

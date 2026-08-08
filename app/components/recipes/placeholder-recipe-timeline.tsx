import type { PlaceholderRecipeStep } from "@/lib/gulf-directory/placeholder-recipe-detail";
import {
  rdBorder,
  rdRadius,
  rdSurface,
  rdTypography,
} from "@/lib/design-system/recipes-directory";

type PlaceholderRecipeTimelineProps = {
  title: string;
  steps: PlaceholderRecipeStep[];
};

/** Visual brew timeline for placeholder recipe pages. */
export function PlaceholderRecipeTimeline({ title, steps }: PlaceholderRecipeTimelineProps) {
  if (steps.length === 0) return null;

  const total = steps.reduce((sum, step) => sum + Math.max(step.durationSeconds, 1), 0);

  return (
    <section aria-labelledby="recipe-brew-timeline-heading">
      <h2
        id="recipe-brew-timeline-heading"
        className="font-display text-xl tracking-[-0.02em] text-[#1A1410]"
      >
        {title}
      </h2>

      <div
        className={`mt-6 overflow-hidden ${rdRadius.filter} ${rdBorder.gold22} ${rdSurface.card} p-4 sm:p-6`}
      >
        <div className={`flex h-3 w-full overflow-hidden ${rdRadius.pill} ${rdSurface.sandSoft}`}>
          {steps.map((step, index) => {
            const width = (Math.max(step.durationSeconds, 1) / total) * 100;
            const tone = index % 2 === 0 ? "bg-[#A67B4A]" : "bg-[#C4A574]";
            return (
              <div
                key={step.id}
                className={`${tone} h-full first:rounded-s-full last:rounded-e-full`}
                style={{ width: `${width}%` }}
                title={`${step.timeLabel}: ${step.notes}`}
              />
            );
          })}
        </div>

        <ol className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <li key={step.id} className="min-w-0">
              <p className={`text-[0.6875rem] font-medium uppercase tracking-[0.08em] ${rdTypography.copper}`}>
                {String(step.pourNumber).padStart(2, "0")} · {step.timeLabel}
              </p>
              <p className="mt-1.5 text-sm font-medium text-[#1A1410]">{step.waterAmount}</p>
              <p className="mt-1 text-sm leading-relaxed text-[#1A1410]/60">{step.notes}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

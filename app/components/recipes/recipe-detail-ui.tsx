import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { MetaTile } from "@/app/components/ui/meta-tile";
import { acTypography } from "@/lib/design-system/atlas-canon";

export const recipeDetailSectionSpacing = "mt-16 md:mt-20";

type RecipeHeroFactLineProps = {
  items: Array<string | null | undefined>;
};

/** Muted supporting facts under the recipe title — does not compete with the headline. */
export function RecipeHeroFactLine({ items }: RecipeHeroFactLineProps) {
  const facts = items.filter(Boolean) as string[];
  if (facts.length === 0) return null;

  return (
    <p className="mt-6 max-w-2xl text-sm leading-relaxed tracking-[-0.01em] text-ac-espresso/62">
      {facts.join(" · ")}
    </p>
  );
}

export type BrewSpecItem = {
  icon: LucideIcon;
  label: string;
  value: string | null | undefined;
};

type RecipeBrewSpecGridProps = {
  specs: BrewSpecItem[];
  /** Accessible label for the spec group */
  ariaLabel: string;
};

/** Primary brewing setup — scannable at a glance. */
export function RecipeBrewSpecGrid({ specs, ariaLabel }: RecipeBrewSpecGridProps) {
  const visible = specs.filter((spec) => Boolean(spec.value));
  if (visible.length === 0) return null;

  return (
    <section aria-label={ariaLabel} className="mt-10 sm:mt-12">
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
        {visible.map((spec) => (
          <li key={spec.label} className="h-full">
            <MetaTile icon={spec.icon} label={spec.label} value={spec.value as string} variant="brewSpec" />
          </li>
        ))}
      </ul>
    </section>
  );
}

type RecipeFlavorNotesPanelProps = {
  title: string;
  notes: string;
};

export function RecipeFlavorNotesPanel({ title, notes }: RecipeFlavorNotesPanelProps) {
  if (!notes.trim()) return null;

  return (
    <section
      aria-labelledby="recipe-flavor-notes-heading"
      className="mt-10 rounded-2xl border border-ba-espresso/[0.08] bg-gradient-to-br from-ba-sand/35 via-ac-pearl to-ac-pearl px-6 py-8 shadow-[0_1px_0_rgba(26,20,16,0.04)] sm:mt-12 sm:px-8 sm:py-10 motion-safe:transition-[box-shadow,border-color] motion-safe:duration-200 motion-safe:hover:border-ba-espresso/[0.12] motion-safe:hover:shadow-[0_12px_40px_-28px_rgba(26,20,16,0.18)] motion-reduce:transition-none"
    >
      <h2 id="recipe-flavor-notes-heading" className={acTypography.eyebrow}>
        {title}
      </h2>
      <p className="mt-5 max-w-[42rem] font-display text-xl leading-[1.55] tracking-[-0.02em] text-ac-espresso sm:text-[1.375rem] sm:leading-[1.6]">
        {notes}
      </p>
    </section>
  );
}

export type RecipePourStep = {
  id: string | number;
  pourNumber: number;
  waterAmount?: string | null;
  timeLabel?: string | null;
  notes?: string | null;
};

type RecipePourStepListProps = {
  steps: RecipePourStep[];
  pourPrefix: string;
  atTimeLabel: string;
};

export function RecipePourStepList({ steps, pourPrefix, atTimeLabel }: RecipePourStepListProps) {
  if (steps.length === 0) return null;

  return (
    <ol className="space-y-0">
      {steps.map((step, index) => (
        <li
          key={step.id}
          className="ac-folio-divider grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-2 py-5 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-x-6 sm:py-7 md:max-w-[42rem]"
        >
          <span
            aria-hidden
            className="font-display text-2xl tabular-nums leading-none text-ac-espresso/28 sm:text-[1.75rem]"
          >
            {String(step.pourNumber).padStart(2, "0")}
          </span>
          <div className="min-w-0 pt-0.5">
            <p className="text-sm font-medium text-ac-espresso">
              {pourPrefix} {step.pourNumber}
            </p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ac-espresso/78">
              {step.waterAmount ? <span>{step.waterAmount}</span> : null}
              {step.timeLabel ? (
                <span>
                  {atTimeLabel} {step.timeLabel}
                </span>
              ) : null}
            </div>
            {step.notes ? (
              <p className={`${acTypography.body} mt-3 max-w-[40rem] text-ac-espresso/88`}>{step.notes}</p>
            ) : null}
            {index < steps.length - 1 ? (
              <span className="sr-only">{`Step ${step.pourNumber} of ${steps.length}`}</span>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}

type RecipeDetailActionBarProps = {
  primary: ReactNode;
  secondary?: ReactNode;
  className?: string;
};

/** Primary CTA dominant; secondary tools grouped and visually quieter. */
export function RecipeDetailActionBar({ primary, secondary, className = "" }: RecipeDetailActionBarProps) {
  return (
    <div
      className={`mt-12 flex flex-col gap-4 border-t border-ac-espresso/[0.06] pt-8 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between ${className}`}
    >
      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">{primary}</div>
      {secondary ? (
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
          {secondary}
        </div>
      ) : null}
    </div>
  );
}

type RecipeProseContentProps = {
  children: ReactNode;
  className?: string;
};

export function RecipeProseContent({ children, className = "" }: RecipeProseContentProps) {
  return (
    <div
      className={`max-w-[42rem] text-base leading-[1.75] text-ac-body md:text-[1.0625rem] md:leading-[1.78] ${className}`}
    >
      {children}
    </div>
  );
}

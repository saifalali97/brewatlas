import { OptimizedImage } from "@/app/components/ui/optimized-image";
import { GhTipCard } from "@/app/components/gulf-heritage/gh-tip-card";
import { GhWarningCard } from "@/app/components/gulf-heritage/gh-warning-card";
import { ghMotion, ghSurfaces, ghTypography } from "@/app/components/gulf-heritage/shared/gh-styles";
import { resolveGulfHeritageImageAlt, resolveGulfHeritageImageUrl } from "@/types/gulf-heritage-images";
import type { GulfHeritageRecipeStep } from "@/types/gulf-heritage-recipe";

type GhRecipeStepsProps = {
  title: string;
  steps: readonly GulfHeritageRecipeStep[];
  stepLabelTemplate: string;
};

function StepCard({
  step,
  stepLabel,
}: {
  step: GulfHeritageRecipeStep;
  stepLabel: string;
}) {
  const imageUrl = resolveGulfHeritageImageUrl(step.image);
  const hasImage = Boolean(imageUrl && step.image);

  return (
    <article
      className={`${ghSurfaces.card} ${ghMotion.cardHover} overflow-hidden motion-reduce:transform-none`}
      aria-labelledby={`gh-step-${step.order}-title`}
    >
      <div className={`flex flex-col ${hasImage ? "lg:flex-row" : ""}`}>
        <div className="flex-1 p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ba-espresso text-sm font-semibold text-ba-pearl">
              {step.order}
            </span>
            <h5 id={`gh-step-${step.order}-title`} className="text-base font-semibold text-ac-espresso">
              {stepLabel}
            </h5>
            {step.duration ? (
              <span className={`${ghTypography.metaLabel} ms-auto text-ac-espresso/55`}>{step.duration}</span>
            ) : null}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-ac-espresso/88 sm:text-[0.9375rem]">{step.instruction}</p>
        </div>

        {hasImage && step.image && imageUrl ? (
          <div className="relative min-h-[12rem] border-t border-ba-espresso/6 bg-ba-sand/20 lg:w-[42%] lg:border-s lg:border-t-0">
            <OptimizedImage
              src={imageUrl}
              alt={resolveGulfHeritageImageAlt(step.image, stepLabel)}
              fill
              loading="lazy"
              sizes="(min-width: 1024px) 320px, 42vw"
              className="object-cover object-center"
            />
          </div>
        ) : null}
      </div>
    </article>
  );
}

/** Step-by-step preparation cards with optional images. */
export function GhRecipeSteps({
  title,
  steps,
  stepLabelTemplate,
}: GhRecipeStepsProps) {
  if (steps.length === 0) return null;

  return (
    <section aria-labelledby="gh-recipe-steps-heading">
      <h4 id="gh-recipe-steps-heading" className={ghTypography.sectionTitle}>
        {title}
      </h4>
      <ol className="mt-5 space-y-4">
        {steps.map((step) => (
          <li key={step.order}>
            <StepCard
              step={step}
              stepLabel={stepLabelTemplate.replace("{n}", String(step.order))}
            />
          </li>
        ))}
      </ol>
    </section>
  );
}

type GhRecipeTipsSectionProps = {
  title: string;
  tips: readonly string[];
};

export function GhRecipeTipsSection({ title, tips }: GhRecipeTipsSectionProps) {
  if (tips.length === 0) return null;

  return (
    <section aria-labelledby="gh-recipe-tips-heading">
      <h4 id="gh-recipe-tips-heading" className={ghTypography.sectionTitle}>
        {title}
      </h4>
      <div className="mt-5 space-y-3">
        {tips.map((tip) => (
          <GhTipCard key={tip}>{tip}</GhTipCard>
        ))}
      </div>
    </section>
  );
}

type GhRecipeWarningsSectionProps = {
  title: string;
  warnings: readonly string[];
};

export function GhRecipeWarningsSection({ title, warnings }: GhRecipeWarningsSectionProps) {
  if (warnings.length === 0) return null;

  return (
    <section aria-labelledby="gh-recipe-warnings-heading">
      <h4 id="gh-recipe-warnings-heading" className={ghTypography.sectionTitle}>
        {title}
      </h4>
      <div className="mt-5 space-y-3">
        {warnings.map((warning) => (
          <GhWarningCard key={warning}>{warning}</GhWarningCard>
        ))}
      </div>
    </section>
  );
}

type GhRecipeServingSectionProps = {
  title: string;
  servingNotes: string | null;
};

export function GhRecipeServingSection({ title, servingNotes }: GhRecipeServingSectionProps) {
  if (!servingNotes) return null;

  return (
    <section aria-labelledby="gh-recipe-serving-heading">
      <h4 id="gh-recipe-serving-heading" className={ghTypography.sectionTitle}>
        {title}
      </h4>
      <div className={`${ghSurfaces.articlePanel} mt-5 px-6 py-6 sm:px-8`}>
        <p className="text-sm leading-relaxed text-ac-espresso/88 sm:text-[0.9375rem]">{servingNotes}</p>
      </div>
    </section>
  );
}

type GhRecipeHistoricalNotesProps = {
  title: string;
  notes: string | null;
};

export function GhRecipeHistoricalNotes({ title, notes }: GhRecipeHistoricalNotesProps) {
  if (!notes) return null;

  return (
    <section aria-labelledby="gh-recipe-history-heading">
      <h4 id="gh-recipe-history-heading" className={ghTypography.sectionTitle}>
        {title}
      </h4>
      <div className={`${ghSurfaces.articlePanel} mt-5 border-s-4 border-s-ba-bronze/40 px-6 py-6 sm:px-8`}>
        <p className="text-sm leading-relaxed text-ac-espresso/82 sm:text-[0.9375rem]">{notes}</p>
      </div>
    </section>
  );
}

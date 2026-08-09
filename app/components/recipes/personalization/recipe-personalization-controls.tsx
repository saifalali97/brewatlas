"use client";

import { BadgeCheck, Sparkles } from "lucide-react";
import { acFocus, acTypography } from "@/lib/design-system/atlas-canon";
import {
  DOSE_PRESETS_G,
  DYNAMIC_BREW_METHODS,
  RATIO_PRESETS,
  methodLabel,
  type DynamicBrewMethod,
} from "@/lib/recipes/personalization/dynamic-brew";
import type { RecipeServingStyle } from "@/lib/recipes/personalization";

export type RecipePersonalizationLabels = {
  servingStyleLabel: string;
  hotOption: string;
  icedOption: string;
  officialBadge: string;
  personalizedBadge: string;
  roasterRecommendedBadge: string;
  resetCta: string;
  brewMethodLabel: string;
  coffeeDoseLabel: string;
  brewRatioLabel: string;
  customValue: string;
  guidanceTitle: string;
  saveMyRecipeCta: string;
  duplicateRecipeCta: string;
  shareRecipeCta: string;
  resetToRoasterCta: string;
};

type RecipePersonalizationControlsProps = {
  servingStyle: RecipeServingStyle;
  brewMethod: DynamicBrewMethod;
  coffeeDoseG: number;
  brewRatio: number;
  isPersonalized: boolean;
  hasOfficialRecipe: boolean;
  guidance: string[];
  labels: RecipePersonalizationLabels;
  onServingStyleChange: (style: RecipeServingStyle) => void;
  onBrewMethodChange: (method: DynamicBrewMethod) => void;
  onCoffeeDoseChange: (doseG: number) => void;
  onBrewRatioChange: (ratio: number) => void;
  onReset: () => void;
  onSaveMyRecipe?: () => void;
  onDuplicateRecipe?: () => void;
  onShareRecipe?: () => void;
};

function ChipGroup<T extends string | number>({
  label,
  value,
  options,
  format = String,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  format?: (value: T) => string;
  onChange: (value: T) => void;
}) {
  return (
    <div className="space-y-2">
      <p className={acTypography.eyebrow}>{label}</p>
      <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
        {options.map((option) => {
          const selected = option === value;
          return (
            <button
              key={String(option)}
              type="button"
              onClick={() => onChange(option)}
              className={`min-h-[36px] rounded-full px-3 text-sm tracking-[-0.01em] transition-colors ${acFocus.ring} ${
                selected
                  ? "bg-ac-espresso text-ba-pearl"
                  : "border border-ba-espresso/10 bg-ba-pearl text-ac-espresso/70 hover:text-ac-espresso"
              }`}
            >
              {format(option)}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Dynamic Recipe System controls — method, dose, ratio, hot/iced, guidance, actions. */
export function RecipePersonalizationControls({
  servingStyle,
  brewMethod,
  coffeeDoseG,
  brewRatio,
  isPersonalized,
  hasOfficialRecipe,
  guidance,
  labels,
  onServingStyleChange,
  onBrewMethodChange,
  onCoffeeDoseChange,
  onBrewRatioChange,
  onReset,
  onSaveMyRecipe,
  onDuplicateRecipe,
  onShareRecipe,
}: RecipePersonalizationControlsProps) {
  const badgeLabel = isPersonalized
    ? labels.personalizedBadge
    : hasOfficialRecipe
      ? labels.roasterRecommendedBadge
      : labels.officialBadge;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <p className={acTypography.eyebrow}>{labels.servingStyleLabel}</p>
          <div
            role="radiogroup"
            aria-label={labels.servingStyleLabel}
            className="inline-flex rounded-full border border-ba-espresso/10 bg-ba-pearl p-1"
          >
            {(
              [
                { id: "hot" as const, label: labels.hotOption },
                { id: "iced" as const, label: labels.icedOption },
              ] as const
            ).map((option) => {
              const selected = servingStyle === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => onServingStyleChange(option.id)}
                  className={`min-h-[40px] rounded-full px-4 text-sm tracking-[-0.01em] transition-colors ${acFocus.ring} ${
                    selected
                      ? "bg-ac-espresso text-ba-pearl"
                      : "text-ac-espresso/70 hover:text-ac-espresso"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
              isPersonalized
                ? "bg-ba-bronze/15 text-ba-espresso"
                : "bg-ac-espresso/[0.06] text-ac-espresso/70"
            }`}
          >
            {isPersonalized ? (
              <Sparkles className="h-3 w-3" aria-hidden />
            ) : (
              <BadgeCheck className="h-3 w-3" aria-hidden />
            )}
            {badgeLabel}
          </span>

          {isPersonalized ? (
            <button
              type="button"
              onClick={onReset}
              className={`${acTypography.nav} text-ac-espresso/70 underline-offset-4 hover:text-ba-bronze hover:underline ${acFocus.ring}`}
            >
              {labels.resetToRoasterCta}
            </button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <ChipGroup
          label={labels.brewMethodLabel}
          value={brewMethod}
          options={DYNAMIC_BREW_METHODS}
          format={methodLabel}
          onChange={onBrewMethodChange}
        />
        <ChipGroup
          label={labels.coffeeDoseLabel}
          value={coffeeDoseG}
          options={DOSE_PRESETS_G}
          format={(g) => `${g}g`}
          onChange={onCoffeeDoseChange}
        />
        <ChipGroup
          label={labels.brewRatioLabel}
          value={brewRatio}
          options={RATIO_PRESETS}
          format={(r) => `1:${r}`}
          onChange={onBrewRatioChange}
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <label className="block space-y-1.5 text-sm text-ac-espresso/70">
          <span className={acTypography.eyebrow}>{labels.customValue}</span>
          <span className="flex flex-wrap gap-2">
            <input
              type="number"
              min={5}
              max={60}
              step={0.5}
              value={coffeeDoseG}
              onChange={(event) => onCoffeeDoseChange(Number(event.target.value) || 0)}
              className="w-24 rounded-lg border border-ba-espresso/15 bg-white px-3 py-2 text-ac-espresso"
              aria-label={labels.coffeeDoseLabel}
            />
            <input
              type="number"
              min={10}
              max={20}
              step={0.5}
              value={brewRatio}
              onChange={(event) => onBrewRatioChange(Number(event.target.value) || 0)}
              className="w-24 rounded-lg border border-ba-espresso/15 bg-white px-3 py-2 text-ac-espresso"
              aria-label={labels.brewRatioLabel}
            />
          </span>
        </label>

        <div className="flex flex-wrap gap-2">
          {onSaveMyRecipe ? (
            <button
              type="button"
              onClick={onSaveMyRecipe}
              className={`min-h-[40px] rounded-full border border-ba-espresso/15 bg-ba-pearl px-4 text-sm text-ac-espresso ${acFocus.ring}`}
            >
              {labels.saveMyRecipeCta}
            </button>
          ) : null}
          {onDuplicateRecipe ? (
            <button
              type="button"
              onClick={onDuplicateRecipe}
              className={`min-h-[40px] rounded-full border border-ba-espresso/15 bg-ba-pearl px-4 text-sm text-ac-espresso ${acFocus.ring}`}
            >
              {labels.duplicateRecipeCta}
            </button>
          ) : null}
          {onShareRecipe ? (
            <button
              type="button"
              onClick={onShareRecipe}
              className={`min-h-[40px] rounded-full border border-ba-espresso/15 bg-ba-pearl px-4 text-sm text-ac-espresso ${acFocus.ring}`}
            >
              {labels.shareRecipeCta}
            </button>
          ) : null}
        </div>
      </div>

      {guidance.length > 0 ? (
        <div className="space-y-2">
          <p className={acTypography.eyebrow}>{labels.guidanceTitle}</p>
          <div className="flex flex-wrap gap-2">
            {guidance.map((item) => (
              <span
                key={item}
                className="rounded-full bg-ac-espresso/[0.05] px-3 py-1 text-xs tracking-[-0.01em] text-ac-espresso/75"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

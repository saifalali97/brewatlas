"use client";

import { BadgeCheck, Minus, Plus, Sparkles } from "lucide-react";
import { TasteDirectionPanel } from "@/app/components/recipes/personalization/taste-direction-panel";
import { acFocus, acTypography } from "@/lib/design-system/atlas-canon";
import {
  DYNAMIC_BREW_METHODS,
  methodLabel,
  type DynamicBrewMethod,
} from "@/lib/recipes/personalization/dynamic-brew";
import { formatGrams } from "@/lib/recipes/personalization/parse";
import {
  MAX_GRIND_OFFSET,
  MAX_POUR_COUNT,
  MIN_GRIND_OFFSET,
  MIN_POUR_COUNT,
  type TasteDirectionResult,
  type TemperatureBounds,
} from "@/lib/recipes/personalization";
import type { RecipeServingStyle } from "@/lib/recipes/personalization";

export type RecipePersonalizationLabels = {
  customizeTitle: string;
  roastersRecipeLabel: string;
  yourBrewLabel: string;
  yourCustomizedIcedBrewLabel: string;
  originalRecipeLabel: string;
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
  totalWaterLabel: string;
  hotWaterLabel: string;
  iceLabel: string;
  pourPrefix: string;
  poursLabel: string;
  poursCountLabel: string;
  temperatureLabel: string;
  officialTemperatureLabel: string;
  resetTemperatureCta: string;
  grindSizeLabel: string;
  grindFinerLabel: string;
  grindCoarserLabel: string;
  grindOfficialLabel: string;
  rpmLabel: string;
  openInXbloomCta: string;
  tasteDirectionTitle: string;
  tasteGuidanceNote: string;
  tasteSweetness: string;
  tasteAcidity: string;
  tasteBody: string;
  tasteBitterness: string;
  tasteExtraction: string;
  tasteSummaryFuller: string;
  tasteSummaryBrighter: string;
  tasteSummarySofter: string;
  tasteSummaryBalanced: string;
  tasteSummaryIced: string;
  tasteTempUpExtraction: string;
  tasteTempUpBody: string;
  tasteTempUpBitterness: string;
  tasteTempUpAcidity: string;
  tasteTempDownExtraction: string;
  tasteTempDownAcidity: string;
  tasteTempDownBody: string;
  tasteTempDownBitterness: string;
  tastePoursUpAgitation: string;
  tastePoursUpExtraction: string;
  tastePoursDownAgitation: string;
  tastePoursDownExtraction: string;
  tasteRatioUpDilution: string;
  tasteRatioUpClarity: string;
  tasteRatioDownStrength: string;
  tasteRatioDownIntensity: string;
  tasteDoseUpStrength: string;
  tasteDoseDownStrength: string;
  tasteGrindFinerExtraction: string;
  tasteGrindFinerBitterness: string;
  tasteGrindCoarserExtraction: string;
  tasteGrindCoarserAcidity: string;
  tasteIcedDilution: string;
};

type OfficialSummary = {
  doseG: number | null;
  waterG: number | null;
  ratioLabel: string | null;
  temperatureLabel?: string | null;
};

type BrewSummary = {
  doseG: number | null;
  totalWaterG: number | null;
  ratioLabel: string | null;
  hotWaterG: number | null;
  iceG: number | null;
  temperatureLabel: string | null;
  grindSize: string | null;
  rpm: number | null;
  pourCount: number;
  pourChainLabel: string | null;
  pours: Array<{
    id: string;
    pourNumber: number;
    waterAmountG: number | null;
    waterAmountLabel: string;
  }>;
};

type RecipePersonalizationControlsProps = {
  servingStyle: RecipeServingStyle;
  brewMethod: DynamicBrewMethod;
  coffeeDoseG: number;
  brewRatio: number;
  pourCount: number;
  brewTemperatureC: number | null;
  temperatureBounds: TemperatureBounds | null;
  grindOffset: number;
  isPersonalized: boolean;
  hasOfficialRecipe: boolean;
  showBrewMethod?: boolean;
  doseScalable?: boolean;
  ratioScalable?: boolean;
  poursScalable?: boolean;
  temperatureScalable?: boolean;
  grindScalable?: boolean;
  hotSupported?: boolean;
  icedSupported?: boolean;
  officialSummary: OfficialSummary;
  brewSummary: BrewSummary;
  tasteDirection: TasteDirectionResult | null;
  labels: RecipePersonalizationLabels;
  xbloomShareUrl?: string | null;
  onServingStyleChange: (style: RecipeServingStyle) => void;
  onBrewMethodChange: (method: DynamicBrewMethod) => void;
  onCoffeeDoseChange: (doseG: number) => void;
  onBrewRatioChange: (ratio: number) => void;
  onPourCountChange: (count: number) => void;
  onTemperatureChange: (tempC: number) => void;
  onTemperatureReset: () => void;
  onGrindOffsetChange: (offset: number) => void;
  onReset: () => void;
  onSaveMyRecipe?: () => void;
  onDuplicateRecipe?: () => void;
  onShareRecipe?: () => void;
};

function Stepper({
  label,
  value,
  display,
  step,
  min,
  max,
  onChange,
  prefix,
}: {
  label: string;
  value: number;
  display: string;
  step: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  prefix?: string;
}) {
  return (
    <div className="space-y-2">
      <p className={acTypography.eyebrow}>{label}</p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={`${label} -`}
          onClick={() => onChange(Math.max(min, Math.round((value - step) * 10) / 10))}
          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ba-espresso/15 bg-ba-pearl text-ac-espresso ${acFocus.ring}`}
        >
          <Minus className="h-4 w-4" aria-hidden />
        </button>
        <div className="min-w-[7rem] flex-1 rounded-xl border border-ba-espresso/10 bg-white px-3 py-2 text-center text-sm tracking-[-0.01em] text-ac-espresso">
          {prefix ? <span className="text-ac-espresso/55">{prefix}</span> : null}
          {display}
        </div>
        <button
          type="button"
          aria-label={`${label} +`}
          onClick={() => onChange(Math.min(max, Math.round((value + step) * 10) / 10))}
          className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ba-espresso/15 bg-ba-pearl text-ac-espresso ${acFocus.ring}`}
        >
          <Plus className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}

/** Interactive Customize your brew controls — official reference vs live custom brew. */
export function RecipePersonalizationControls({
  servingStyle,
  brewMethod,
  coffeeDoseG,
  brewRatio,
  pourCount,
  brewTemperatureC,
  temperatureBounds,
  grindOffset,
  isPersonalized,
  hasOfficialRecipe,
  showBrewMethod = true,
  doseScalable = true,
  ratioScalable = true,
  poursScalable = true,
  temperatureScalable = true,
  grindScalable = true,
  hotSupported = true,
  icedSupported = true,
  officialSummary,
  brewSummary,
  tasteDirection,
  labels,
  xbloomShareUrl,
  onServingStyleChange,
  onBrewMethodChange,
  onCoffeeDoseChange,
  onBrewRatioChange,
  onPourCountChange,
  onTemperatureChange,
  onTemperatureReset,
  onGrindOffsetChange,
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

  const officialLine = [
    officialSummary.doseG != null ? formatGrams(officialSummary.doseG) : null,
    officialSummary.waterG != null ? formatGrams(officialSummary.waterG) : null,
    officialSummary.ratioLabel,
    officialSummary.temperatureLabel,
  ]
    .filter(Boolean)
    .join(" · ");

  const yourBrewTitle =
    servingStyle === "iced" ? labels.yourCustomizedIcedBrewLabel : labels.yourBrewLabel;

  const styleOptions = [
    ...(hotSupported ? [{ id: "hot" as const, label: labels.hotOption }] : []),
    ...(icedSupported ? [{ id: "iced" as const, label: labels.icedOption }] : []),
  ];

  const grindDisplay =
    grindOffset === 0
      ? labels.grindOfficialLabel
      : grindOffset < 0
        ? labels.grindFinerLabel
        : labels.grindCoarserLabel;

  return (
    <div className="space-y-6 rounded-2xl border border-ba-espresso/10 bg-gradient-to-b from-ba-pearl to-white p-5 sm:p-6">
      <div className="space-y-2">
        <p className={acTypography.eyebrow}>{labels.originalRecipeLabel}</p>
        <p className="text-sm tracking-[-0.01em] text-ac-espresso/80">
          <span className="font-medium text-ac-espresso">{labels.roastersRecipeLabel}</span>
          {officialLine ? ` — ${officialLine}` : null}
        </p>
      </div>

      <div className="flex items-center justify-center text-ac-espresso/30" aria-hidden>
        <span className="inline-block text-lg leading-none">↓</span>
      </div>

      <div className="space-y-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-lg tracking-[-0.02em] text-ac-espresso">{labels.customizeTitle}</h3>
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

        <div className={`grid gap-5 ${doseScalable && ratioScalable ? "sm:grid-cols-2" : ""}`}>
          {doseScalable ? (
            <Stepper
              label={labels.coffeeDoseLabel}
              value={coffeeDoseG}
              display={`${coffeeDoseG}g`}
              step={0.5}
              min={5}
              max={60}
              onChange={onCoffeeDoseChange}
            />
          ) : null}
          {ratioScalable ? (
            <Stepper
              label={labels.brewRatioLabel}
              value={brewRatio}
              display={`${brewRatio}`}
              prefix="1 : "
              step={0.1}
              min={5}
              max={25}
              onChange={onBrewRatioChange}
            />
          ) : null}
        </div>

        {poursScalable ? (
          <Stepper
            label={labels.poursLabel}
            value={pourCount}
            display={labels.poursCountLabel.replace("{count}", String(pourCount))}
            step={1}
            min={MIN_POUR_COUNT}
            max={MAX_POUR_COUNT}
            onChange={onPourCountChange}
          />
        ) : null}

        {temperatureScalable && temperatureBounds && brewTemperatureC != null ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <p className={acTypography.eyebrow}>{labels.temperatureLabel}</p>
              <button
                type="button"
                onClick={onTemperatureReset}
                className={`${acTypography.nav} text-ac-espresso/60 underline-offset-4 hover:text-ba-bronze hover:underline ${acFocus.ring}`}
              >
                {labels.resetTemperatureCta}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={`${labels.temperatureLabel} -`}
                onClick={() =>
                  onTemperatureChange(
                    Math.max(temperatureBounds.min, brewTemperatureC - temperatureBounds.step),
                  )
                }
                className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ba-espresso/15 bg-ba-pearl text-ac-espresso ${acFocus.ring}`}
              >
                <Minus className="h-4 w-4" aria-hidden />
              </button>
              <div className="min-w-[7rem] flex-1 rounded-xl border border-ba-espresso/10 bg-white px-3 py-2 text-center text-sm tracking-[-0.01em] text-ac-espresso">
                {Math.round(brewTemperatureC)}°C
              </div>
              <button
                type="button"
                aria-label={`${labels.temperatureLabel} +`}
                onClick={() =>
                  onTemperatureChange(
                    Math.min(temperatureBounds.max, brewTemperatureC + temperatureBounds.step),
                  )
                }
                className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ba-espresso/15 bg-ba-pearl text-ac-espresso ${acFocus.ring}`}
              >
                <Plus className="h-4 w-4" aria-hidden />
              </button>
            </div>
            <input
              type="range"
              min={temperatureBounds.min}
              max={temperatureBounds.max}
              step={temperatureBounds.step}
              value={brewTemperatureC}
              onChange={(event) => onTemperatureChange(Number(event.target.value))}
              aria-label={labels.temperatureLabel}
              className="w-full accent-ba-bronze"
            />
            <p className="text-xs text-ac-espresso/55">
              {labels.officialTemperatureLabel.replace(
                "{temp}",
                `${temperatureBounds.officialC}°C`,
              )}
            </p>
          </div>
        ) : null}

        {grindScalable ? (
          <div className="space-y-2">
            <p className={acTypography.eyebrow}>{labels.grindSizeLabel}</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={labels.grindFinerLabel}
                onClick={() => onGrindOffsetChange(Math.max(MIN_GRIND_OFFSET, grindOffset - 1))}
                className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ba-espresso/15 bg-ba-pearl text-ac-espresso ${acFocus.ring}`}
              >
                <Minus className="h-4 w-4" aria-hidden />
              </button>
              <div className="min-w-[7rem] flex-1 rounded-xl border border-ba-espresso/10 bg-white px-3 py-2 text-center text-sm tracking-[-0.01em] text-ac-espresso">
                {grindDisplay}
              </div>
              <button
                type="button"
                aria-label={labels.grindCoarserLabel}
                onClick={() => onGrindOffsetChange(Math.min(MAX_GRIND_OFFSET, grindOffset + 1))}
                className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-ba-espresso/15 bg-ba-pearl text-ac-espresso ${acFocus.ring}`}
              >
                <Plus className="h-4 w-4" aria-hidden />
              </button>
            </div>
          </div>
        ) : null}

        {styleOptions.length > 0 ? (
          <div className="space-y-2">
            <p className={acTypography.eyebrow}>{labels.servingStyleLabel}</p>
            <div
              role="radiogroup"
              aria-label={labels.servingStyleLabel}
              className="inline-flex rounded-full border border-ba-espresso/10 bg-ba-pearl p-1"
            >
              {styleOptions.map((option) => {
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
        ) : null}

        {showBrewMethod ? (
          <div className="space-y-2">
            <p className={acTypography.eyebrow}>{labels.brewMethodLabel}</p>
            <div className="flex flex-wrap gap-2" role="group" aria-label={labels.brewMethodLabel}>
              {DYNAMIC_BREW_METHODS.map((method) => {
                const selected = brewMethod === method;
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => onBrewMethodChange(method)}
                    className={`min-h-[36px] rounded-full px-3 text-sm tracking-[-0.01em] transition-colors ${acFocus.ring} ${
                      selected
                        ? "bg-ac-espresso text-ba-pearl"
                        : "border border-ba-espresso/10 bg-ba-pearl text-ac-espresso/70 hover:text-ac-espresso"
                    }`}
                  >
                    {methodLabel(method)}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

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
          {xbloomShareUrl ? (
            <a
              href={xbloomShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex min-h-[40px] items-center rounded-full border border-ba-espresso/15 bg-ba-pearl px-4 text-sm text-ac-espresso ${acFocus.ring}`}
            >
              {labels.openInXbloomCta}
            </a>
          ) : null}
        </div>
      </div>

      <div className="space-y-4 border-t border-ba-espresso/10 pt-5">
        <h4 className="text-base tracking-[-0.02em] text-ac-espresso">{yourBrewTitle}</h4>
        <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-ac-espresso/55">{labels.coffeeDoseLabel}</dt>
            <dd className="mt-0.5 text-ac-espresso">
              {brewSummary.doseG != null ? formatGrams(brewSummary.doseG) : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-ac-espresso/55">{labels.brewRatioLabel}</dt>
            <dd className="mt-0.5 text-ac-espresso">{brewSummary.ratioLabel ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-ac-espresso/55">{labels.totalWaterLabel}</dt>
            <dd className="mt-0.5 text-ac-espresso">
              {brewSummary.totalWaterG != null ? formatGrams(brewSummary.totalWaterG) : "—"}
            </dd>
          </div>
          {servingStyle === "iced" && brewSummary.hotWaterG != null ? (
            <div>
              <dt className="text-ac-espresso/55">{labels.hotWaterLabel}</dt>
              <dd className="mt-0.5 text-ac-espresso">{formatGrams(brewSummary.hotWaterG)}</dd>
            </div>
          ) : null}
          {servingStyle === "iced" && brewSummary.iceG != null ? (
            <div>
              <dt className="text-ac-espresso/55">{labels.iceLabel}</dt>
              <dd className="mt-0.5 text-ac-espresso">{formatGrams(brewSummary.iceG)}</dd>
            </div>
          ) : null}
          {brewSummary.temperatureLabel ? (
            <div>
              <dt className="text-ac-espresso/55">{labels.temperatureLabel}</dt>
              <dd className="mt-0.5 text-ac-espresso">{brewSummary.temperatureLabel}</dd>
            </div>
          ) : null}
          {brewSummary.grindSize ? (
            <div>
              <dt className="text-ac-espresso/55">{labels.grindSizeLabel}</dt>
              <dd className="mt-0.5 text-ac-espresso">{brewSummary.grindSize}</dd>
            </div>
          ) : null}
          <div>
            <dt className="text-ac-espresso/55">{labels.poursLabel}</dt>
            <dd className="mt-0.5 text-ac-espresso">
              {labels.poursCountLabel.replace("{count}", String(brewSummary.pourCount))}
            </dd>
          </div>
          <div>
            <dt className="text-ac-espresso/55">{labels.servingStyleLabel}</dt>
            <dd className="mt-0.5 text-ac-espresso">
              {servingStyle === "iced" ? labels.icedOption : labels.hotOption}
            </dd>
          </div>
          {brewSummary.rpm != null ? (
            <div>
              <dt className="text-ac-espresso/55">{labels.rpmLabel}</dt>
              <dd className="mt-0.5 text-ac-espresso">{brewSummary.rpm}</dd>
            </div>
          ) : null}
        </dl>

        {brewSummary.pourChainLabel ? (
          <p className="text-sm tracking-[-0.01em] text-ac-espresso/85">{brewSummary.pourChainLabel}</p>
        ) : null}

        {brewSummary.pours.some((pour) => pour.waterAmountG != null) ? (
          <ul className="space-y-1.5 text-sm text-ac-espresso/85">
            {brewSummary.pours
              .filter((pour) => pour.waterAmountG != null)
              .map((pour) => (
                <li
                  key={pour.id}
                  className="flex justify-between gap-3 border-b border-ba-espresso/5 py-1.5 last:border-0"
                >
                  <span>
                    {labels.pourPrefix} {pour.pourNumber}
                  </span>
                  <span>{pour.waterAmountLabel}</span>
                </li>
              ))}
          </ul>
        ) : null}
      </div>

      {tasteDirection ? (
        <TasteDirectionPanel
          title={labels.tasteDirectionTitle}
          guidanceNote={labels.tasteGuidanceNote}
          result={tasteDirection}
        />
      ) : null}
    </div>
  );
}

"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { X } from "lucide-react";
import {
  ConversionPreferences,
  DEFAULT_CONVERSION_PREFERENCES,
  type ConversionPreferencesState,
} from "@/app/components/converter/conversion-preferences";
import { ConverterPreview, type ConverterPreviewValues } from "@/app/components/converter/converter-preview";
import { DeviceSelector } from "@/app/components/converter/device-selector";
import type { ConverterSourceRecipe } from "@/app/components/converter/recipe-converter-button";
import { buttons, forms, modal } from "@/lib/constants/styles";
import { convertRecipe } from "@/lib/converter";
import { useTranslations } from "@/lib/i18n/translation-context";

type RecipeConverterModalProps = {
  isOpen: boolean;
  onClose: () => void;
  /** The recipe's current brewing device/method, shown read-only (e.g. "V60"). */
  currentDevice: string;
  /** The recipe's own brewing parameters, used as the conversion engine's source values. */
  sourceRecipe?: ConverterSourceRecipe;
};

/**
 * Universal Recipe Converter modal (Phase 17.1 UI, Phase 17.2 engine). The
 * output preview recalculates live via `lib/converter` as soon as a target
 * device is picked; the "Convert Recipe" action itself stays disabled --
 * applying/saving a converted recipe is a later phase.
 */
export function RecipeConverterModal({ isOpen, onClose, currentDevice, sourceRecipe }: RecipeConverterModalProps) {
  const { t } = useTranslations();
  const titleId = useId();
  const subtitleId = useId();

  const [targetDevice, setTargetDevice] = useState("");
  const [preferences, setPreferences] = useState<ConversionPreferencesState>(DEFAULT_CONVERSION_PREFERENCES);

  const previewValues = useMemo<ConverterPreviewValues | undefined>(() => {
    if (!targetDevice) return undefined;

    const result = convertRecipe({
      sourceMethod: currentDevice,
      targetMethod: targetDevice,
      doseG: sourceRecipe?.doseG,
      waterG: sourceRecipe?.waterG,
      grindSize: sourceRecipe?.grindSize,
      temperatureC: sourceRecipe?.temperatureC,
      bloomAmountG: sourceRecipe?.bloomAmountG,
      bloomTime: sourceRecipe?.bloomTime,
      brewTime: sourceRecipe?.brewTime,
      poursCount: sourceRecipe?.poursCount,
      preferences,
    });

    if (!result.supported) return undefined;

    const bloomDisplay =
      result.bloom.grams === null || result.bloom.timeSeconds === null
        ? t("recipeConverter.notApplicableValue")
        : `${result.bloom.grams}g / ${result.bloom.timeSeconds}s`;

    const poursDisplay =
      result.pours.count > 0
        ? t("recipeConverter.poursCountValue", { count: result.pours.count })
        : result.targetCategory === "coldBrew"
          ? t("recipeConverter.singleSteepValue")
          : t("recipeConverter.singlePourValue");

    return {
      dose: result.dose.display,
      water: result.water.display,
      grindSize: result.grindSize.display,
      temperature: result.temperature.display,
      bloom: bloomDisplay,
      pours: poursDisplay,
      brewTime: result.brewTime.display,
    };
  }, [currentDevice, targetDevice, sourceRecipe, preferences, t]);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={modal.overlay}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={subtitleId} className={modal.panel}>
        <div className={modal.header}>
          <div className="min-w-0">
            <h2 id={titleId} className="text-xl font-semibold tracking-tight text-stone-50">
              {t("recipeConverter.modalTitle")}
            </h2>
            <p id={subtitleId} className="mt-1.5 max-w-md text-sm leading-relaxed text-stone-400">
              {t("recipeConverter.modalSubtitle")}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t("recipeConverter.closeModalAriaLabel")}
            className={modal.closeButton}
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <div className={modal.body}>
          <div className="flex flex-col gap-8">
            <div>
              <p className={forms.label}>{t("recipeConverter.currentDeviceLabel")}</p>
              <div className={forms.readOnlyField}>{currentDevice}</div>
            </div>

            <DeviceSelector
              id="converter-target-device"
              label={t("recipeConverter.targetDeviceLabel")}
              placeholder={t("recipeConverter.targetDevicePlaceholder")}
              value={targetDevice}
              onChange={setTargetDevice}
              excludeDevice={currentDevice}
            />

            <ConversionPreferences
              label={t("recipeConverter.preferencesLabel")}
              preferences={preferences}
              onChange={setPreferences}
              bodyLabel={t("recipeConverter.preserveBodyLabel")}
              sweetnessLabel={t("recipeConverter.preserveSweetnessLabel")}
              acidityLabel={t("recipeConverter.preserveAcidityLabel")}
            />

            <ConverterPreview
              label={t("recipeConverter.outputPreviewLabel")}
              comingSoonValue={t("recipeConverter.comingSoonValue")}
              doseLabel={t("recipeConverter.doseLabel")}
              waterLabel={t("recipeConverter.waterLabel")}
              grindSizeLabel={t("recipeConverter.grindSizeLabel")}
              temperatureLabel={t("recipeConverter.temperatureLabel")}
              bloomLabel={t("recipeConverter.bloomLabel")}
              poursLabel={t("recipeConverter.poursLabel")}
              brewTimeLabel={t("recipeConverter.brewTimeLabel")}
              values={previewValues}
            />
          </div>
        </div>

        <div className={modal.footer}>
          <button type="button" onClick={onClose} className={`${buttons.secondary} w-full sm:w-auto`}>
            {t("common.cancel")}
          </button>
          <button
            type="button"
            disabled
            aria-disabled="true"
            title={t("recipeConverter.convertButtonComingSoon")}
            className={`${buttons.primary} w-full cursor-not-allowed opacity-60 hover:scale-100 hover:shadow-none sm:w-auto`}
          >
            {t("recipeConverter.convertButtonComingSoon")}
          </button>
        </div>
      </div>
    </div>
  );
}

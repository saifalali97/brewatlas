"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { RecipeConverterModal } from "@/app/components/converter/recipe-converter-modal";
import { buttons } from "@/lib/constants/styles";
import { useTranslations } from "@/lib/i18n/translation-context";

/**
 * The recipe's own brewing parameters, fed to the conversion engine
 * (`lib/converter`) as the source recipe. Every field is optional -- a
 * static editorial recipe (`FeaturedRecipe`) only has a brew time, while a
 * DB recipe (`RecipeFullDetail`) can supply the full set. Anything omitted
 * falls back to the source method's own extraction profile defaults.
 */
export type ConverterSourceRecipe = {
  doseG?: number | null;
  waterG?: number | null;
  grindSize?: string | null;
  temperatureC?: number | null;
  bloomAmountG?: number | null;
  bloomTime?: string | null;
  brewTime?: string | null;
  poursCount?: number | null;
};

type RecipeConverterButtonProps = {
  /** The recipe's current brewing device/method, shown read-only inside the modal (e.g. "V60"). */
  currentDevice: string;
  /** The recipe's own brewing parameters, used as the conversion engine's source values. */
  sourceRecipe?: ConverterSourceRecipe;
  className?: string;
};

/** Secondary entry point for the Universal Recipe Converter (Phase 17.1 UI, Phase 17.2 engine) -- drop into any recipe page's action row. */
export function RecipeConverterButton({ currentDevice, sourceRecipe, className }: RecipeConverterButtonProps) {
  const { t } = useTranslations();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`${buttons.ghostCta}${buttons.ghostCtaAutoWidth} h-11 min-w-0 gap-2 px-5 sm:min-h-12 ${className ?? ""}`}
      >
        <RefreshCw className="h-4 w-4" aria-hidden />
        {t("recipeConverter.convertButtonLabel")}
      </button>
      {isOpen && (
        <RecipeConverterModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          currentDevice={currentDevice}
          sourceRecipe={sourceRecipe}
        />
      )}
    </>
  );
}

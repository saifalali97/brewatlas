"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { RecipeConverterModal } from "@/app/components/converter/recipe-converter-modal";
import { buttons } from "@/lib/constants/styles";
import { useTranslations } from "@/lib/i18n/translation-context";

type RecipeConverterButtonProps = {
  /** The recipe's current brewing device/method, shown read-only inside the modal (e.g. "V60"). */
  currentDevice: string;
  className?: string;
};

/** Secondary entry point for the Universal Recipe Converter (Phase 17.1) -- drop into any recipe page's action row. */
export function RecipeConverterButton({ currentDevice, className }: RecipeConverterButtonProps) {
  const { t } = useTranslations();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`${buttons.secondary} w-full gap-2 sm:w-auto ${className ?? ""}`}
      >
        <RefreshCw className="h-4 w-4" aria-hidden />
        {t("recipeConverter.convertButtonLabel")}
      </button>
      {isOpen && (
        <RecipeConverterModal isOpen={isOpen} onClose={() => setIsOpen(false)} currentDevice={currentDevice} />
      )}
    </>
  );
}

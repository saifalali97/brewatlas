import { Clock, Coffee, Droplets, Lightbulb, Percent, Scale, Settings2, Sparkles, Thermometer } from "lucide-react";
import { ConfidenceIndicator } from "@/app/components/converter/confidence-indicator";
import { MetaTile } from "@/app/components/ui/meta-tile";
import { cards } from "@/lib/constants/styles";
import { useTranslations } from "@/lib/i18n/translation-context";
import type { DictionaryKey } from "@/lib/i18n/types";
import type { ConfidenceLevel } from "@/lib/converter";
import type { CoachToolResult, ExplanationPointCode, FlavorNoteCode } from "@/types/coach-tools";

const EXPLANATION_KEYS: Record<ExplanationPointCode, DictionaryKey> = {
  deviceBaseline: "coachTools.explainDeviceBaseline",
  roastLevelLight: "coachTools.explainRoastLevelLight",
  roastLevelMedium: "coachTools.explainRoastLevelMedium",
  roastLevelMediumDark: "coachTools.explainRoastLevelMediumDark",
  roastLevelDark: "coachTools.explainRoastLevelDark",
  processWashed: "coachTools.explainProcessWashed",
  processNatural: "coachTools.explainProcessNatural",
  processHoney: "coachTools.explainProcessHoney",
  processAnaerobic: "coachTools.explainProcessAnaerobic",
  notesPreference: "coachTools.explainNotesPreference",
  correctedGrind: "coachTools.explainCorrectedGrind",
  correctedTemperature: "coachTools.explainCorrectedTemperature",
  correctedBrewTime: "coachTools.explainCorrectedBrewTime",
  correctedRatio: "coachTools.explainCorrectedRatio",
  correctedBloom: "coachTools.explainCorrectedBloom",
  withinIdealRange: "coachTools.explainWithinIdealRange",
  missingData: "coachTools.explainMissingData",
};

const FLAVOR_KEYS: Record<FlavorNoteCode, DictionaryKey> = {
  floral: "coachTools.flavorFloral",
  citrus: "coachTools.flavorCitrus",
  berry: "coachTools.flavorBerry",
  stoneFruit: "coachTools.flavorStoneFruit",
  tropicalFruit: "coachTools.flavorTropicalFruit",
  winey: "coachTools.flavorWiney",
  chocolate: "coachTools.flavorChocolate",
  nutty: "coachTools.flavorNutty",
  caramel: "coachTools.flavorCaramel",
  spice: "coachTools.flavorSpice",
  herbal: "coachTools.flavorHerbal",
  clean: "coachTools.flavorClean",
  bright: "coachTools.flavorBright",
  heavy: "coachTools.flavorHeavy",
  syrupy: "coachTools.flavorSyrupy",
  balanced: "coachTools.flavorBalanced",
  sour: "coachTools.flavorSour",
  bitter: "coachTools.flavorBitter",
  flat: "coachTools.flavorFlat",
  muddy: "coachTools.flavorMuddy",
};

const CONFIDENCE_KEYS: Record<ConfidenceLevel, DictionaryKey> = {
  high: "recipeConverter.confidenceHigh",
  medium: "recipeConverter.confidenceMedium",
  low: "recipeConverter.confidenceLow",
};

type CoachResponseCardProps = {
  result: CoachToolResult;
};

const NOT_APPLICABLE = "—";

/**
 * The uniform "AI response" card every coach tool renders (Phase 19):
 * suggested recipe, explanation, confidence, and flavor prediction.
 * Reuses `MetaTile` and `ConfidenceIndicator` (already established by
 * `/coach` and the Universal Recipe Converter) rather than introducing
 * a new card layout.
 */
export function CoachResponseCard({ result }: CoachResponseCardProps) {
  const { t } = useTranslations();
  const { suggestedRecipe: recipe } = result;

  const tiles = [
    { icon: Coffee, label: t("coachTools.brewMethodLabel"), value: recipe.brewMethod ?? NOT_APPLICABLE },
    { icon: Scale, label: t("recipeConverter.doseLabel"), value: recipe.doseG !== null ? `${recipe.doseG}g` : NOT_APPLICABLE },
    { icon: Droplets, label: t("recipeConverter.waterLabel"), value: recipe.waterG !== null ? `${recipe.waterG}g` : NOT_APPLICABLE },
    { icon: Percent, label: t("coachTools.ratioLabel"), value: recipe.ratioDisplay ?? NOT_APPLICABLE },
    { icon: Settings2, label: t("recipeConverter.grindSizeLabel"), value: recipe.grindSize ?? NOT_APPLICABLE },
    { icon: Thermometer, label: t("recipeConverter.temperatureLabel"), value: recipe.temperatureC !== null ? `${recipe.temperatureC}°C` : NOT_APPLICABLE },
    { icon: Clock, label: t("recipeConverter.brewTimeLabel"), value: recipe.brewTimeDisplay ?? NOT_APPLICABLE },
  ];

  return (
    <div className={`${cards.premiumShell} p-6 lg:p-8`}>
      <div aria-hidden className={cards.premiumSheen} />
      <div aria-hidden className={cards.premiumGlow} />

      <div className="relative flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-stone-500">{t("coachTools.responseHeading")}</p>
        <ConfidenceIndicator
          level={result.confidence}
          label={t("recipeConverter.confidenceLabel")}
          levelLabel={t(CONFIDENCE_KEYS[result.confidence])}
        />
      </div>

      <div className="relative mt-5">
        <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-amber-400/80">{t("coachTools.suggestedRecipeLabel")}</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tiles.map((tile) => (
            <MetaTile key={tile.label} icon={tile.icon} label={tile.label} value={tile.value} />
          ))}
        </div>
      </div>

      <div className="relative mt-6">
        <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-amber-400/80">
          <Lightbulb className="h-3.5 w-3.5" aria-hidden />
          {t("coachTools.explanationLabel")}
        </p>
        <ul className="mt-2.5 space-y-1.5">
          {result.explanation.map((point, index) => (
            <li key={`${point.code}-${index}`} className="text-sm leading-relaxed text-stone-300">
              {t(EXPLANATION_KEYS[point.code], point.params)}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative mt-6 border-t border-white/[0.06] pt-5">
        <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-amber-400/80">
          <Sparkles className="h-3.5 w-3.5" aria-hidden />
          {t("coachTools.flavorPredictionLabel")}
        </p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {result.flavorPrediction.map((flavor) => (
            <span
              key={flavor}
              className="rounded-full border border-amber-600/25 bg-amber-950/25 px-3 py-1 text-xs font-medium text-amber-200/90"
            >
              {t(FLAVOR_KEYS[flavor])}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

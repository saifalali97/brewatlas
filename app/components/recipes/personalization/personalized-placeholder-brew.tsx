"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Droplets,
  FlaskConical,
  Scale,
  Settings2,
  Thermometer,
  Timer,
} from "lucide-react";
import { RecipeEditorialSection } from "@/app/components/recipes/recipe-editorial-hero";
import {
  RecipeBrewSpecGrid,
  RecipePourStepList,
  recipeDetailSectionSpacing,
} from "@/app/components/recipes/recipe-detail-ui";
import { PlaceholderRecipeTimeline } from "@/app/components/recipes/placeholder-recipe-timeline";
import {
  RecipePersonalizationControls,
  type RecipePersonalizationLabels,
} from "@/app/components/recipes/personalization/recipe-personalization-controls";
import type { PlaceholderRecipeDetail } from "@/lib/gulf-directory/placeholder-recipe-types";
import {
  brewSnapshotFromPlaceholder,
  DEFAULT_PERSONALIZATION_CONFIG,
  displayBloom,
  displayDose,
  displayTemperature,
  displayWater,
  inferOfficialRatio,
  personalizeBrewSnapshot,
  poursForUi,
  type DynamicBrewMethod,
  type PersonalizationCopy,
  type RecipeServingStyle,
} from "@/lib/recipes/personalization";
import {
  extractionGuidanceLabels,
  parseBrewMethodLabel,
} from "@/lib/recipes/personalization/dynamic-brew";
import {
  adjustmentsFromWindowLocation,
  personalRecipeShareUrl,
  savePersonalRecipe,
  syncPersonalizationSearchParams,
} from "@/lib/recipes/personalization/personal-recipe-storage";

type PersonalizedPlaceholderBrewProps = {
  recipe: PlaceholderRecipeDetail;
  labels: RecipePersonalizationLabels;
  copy: PersonalizationCopy;
  hasOfficialRecipe?: boolean;
  sectionTitles: {
    brewRecipeTitle: string;
    stepsTitle: string;
    timelineTitle: string;
    equipmentTitle: string;
    tipsTitle: string;
    extractionTitle: string;
  };
  detailLabels: {
    coffeeDoseLabel: string;
    waterLabel: string;
    waterTempLabel: string;
    ratioLabel: string;
    grindSizeLabel: string;
    bloomLabel: string;
    totalBrewTimeLabel: string;
    pourPrefix: string;
    atTimeLabel: string;
  };
};

function isXbloomShareUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname.toLowerCase().includes("xbloom")) return url;
  } catch {
    return null;
  }
  return null;
}

/** Client brew band for Gulf recipes — Recipe Personalization Engine. */
export function PersonalizedPlaceholderBrew({
  recipe,
  labels,
  copy,
  hasOfficialRecipe = false,
  sectionTitles,
  detailLabels,
}: PersonalizedPlaceholderBrewProps) {
  const official = useMemo(() => brewSnapshotFromPlaceholder(recipe), [recipe]);
  const officialMethod = parseBrewMethodLabel(recipe.brewMethod);
  const officialDose = official.coffeeDoseG && official.coffeeDoseG > 0 ? official.coffeeDoseG : 20;
  const officialRatio = inferOfficialRatio(official) ?? 15;
  const [fromUrl] = useState(adjustmentsFromWindowLocation);

  const [servingStyle, setServingStyle] = useState<RecipeServingStyle>(
    () => fromUrl.servingStyle ?? official.servingStyle,
  );
  const [brewMethod, setBrewMethod] = useState<DynamicBrewMethod>(
    () => fromUrl.brewMethod ?? officialMethod,
  );
  const [coffeeDoseG, setCoffeeDoseG] = useState(() => fromUrl.coffeeDoseG ?? officialDose);
  const [brewRatio, setBrewRatio] = useState(() => fromUrl.brewRatio ?? officialRatio);

  const adjustments = useMemo(
    () => ({
      servingStyle,
      brewMethod,
      coffeeDoseG,
      brewRatio,
    }),
    [servingStyle, brewMethod, coffeeDoseG, brewRatio],
  );

  const result = useMemo(
    () => personalizeBrewSnapshot(official, adjustments, copy, DEFAULT_PERSONALIZATION_CONFIG),
    [official, adjustments, copy],
  );

  useEffect(() => {
    syncPersonalizationSearchParams(adjustments, result.isPersonalized);
  }, [adjustments, result.isPersonalized]);

  const brew = result.personalized;
  const pours = poursForUi(brew);
  const guidance = extractionGuidanceLabels(brewRatio).map((item) => item.label);
  const icedPersonalizedTotal = (brew.hotWaterG ?? 0) + (brew.iceG ?? 0);
  const totalWaterG =
    brew.servingStyle === "iced"
      ? icedPersonalizedTotal > 0
        ? icedPersonalizedTotal
        : null
      : brew.hotWaterG;
  const icedOfficialTotal = (official.hotWaterG ?? 0) + (official.iceG ?? 0);
  const officialWater =
    official.servingStyle === "iced"
      ? icedOfficialTotal > 0
        ? icedOfficialTotal
        : null
      : official.hotWaterG;

  const reset = () => {
    setServingStyle(official.servingStyle);
    setBrewMethod(officialMethod);
    setCoffeeDoseG(officialDose);
    setBrewRatio(officialRatio);
  };

  const brewSpecs = [
    { icon: Scale, label: detailLabels.coffeeDoseLabel, value: displayDose(brew) },
    { icon: Droplets, label: detailLabels.waterLabel, value: displayWater(brew, copy) },
    { icon: Thermometer, label: detailLabels.waterTempLabel, value: displayTemperature(brew) },
    { icon: FlaskConical, label: detailLabels.ratioLabel, value: brew.ratioLabel },
    { icon: Settings2, label: detailLabels.grindSizeLabel, value: brew.grindSize },
    { icon: Timer, label: detailLabels.bloomLabel, value: displayBloom(brew) },
    { icon: Timer, label: detailLabels.totalBrewTimeLabel, value: brew.totalBrewTimeLabel },
  ];

  return (
    <>
      <div className={recipeDetailSectionSpacing}>
        <RecipePersonalizationControls
          servingStyle={result.activeServingStyle}
          brewMethod={brewMethod}
          coffeeDoseG={coffeeDoseG}
          brewRatio={brewRatio}
          isPersonalized={result.isPersonalized}
          hasOfficialRecipe={hasOfficialRecipe}
          showBrewMethod
          officialSummary={{
            doseG: official.coffeeDoseG,
            waterG: officialWater && officialWater > 0 ? officialWater : null,
            ratioLabel: official.ratioLabel,
          }}
          brewSummary={{
            doseG: brew.coffeeDoseG,
            totalWaterG,
            ratioLabel: brew.ratioLabel,
            hotWaterG: brew.hotWaterG,
            iceG: brew.iceG,
            temperatureLabel: displayTemperature(brew),
            grindSize: brew.grindSize,
            rpm: brew.rpm,
            pours: brew.pours,
          }}
          guidance={guidance}
          labels={labels}
          xbloomShareUrl={isXbloomShareUrl(recipe.sourceUrl)}
          onServingStyleChange={setServingStyle}
          onBrewMethodChange={setBrewMethod}
          onCoffeeDoseChange={setCoffeeDoseG}
          onBrewRatioChange={setBrewRatio}
          onReset={reset}
          onSaveMyRecipe={() => savePersonalRecipe(recipe.slug, adjustments)}
          onDuplicateRecipe={() => {
            savePersonalRecipe(`${recipe.slug}-copy`, adjustments);
          }}
          onShareRecipe={async () => {
            const url = personalRecipeShareUrl(recipe.slug, adjustments);
            if (navigator.share) {
              try {
                await navigator.share({ title: recipe.name, url });
                return;
              } catch {
                /* fall through */
              }
            }
            try {
              await navigator.clipboard.writeText(url);
            } catch {
              /* ignore */
            }
          }}
        />
      </div>

      <div className={recipeDetailSectionSpacing}>
        <RecipeEditorialSection title={sectionTitles.brewRecipeTitle}>
          <RecipeBrewSpecGrid specs={brewSpecs} ariaLabel={sectionTitles.brewRecipeTitle} />
        </RecipeEditorialSection>
      </div>

      <div className={recipeDetailSectionSpacing}>
        <RecipeEditorialSection title={sectionTitles.stepsTitle}>
          <RecipePourStepList
            steps={pours}
            pourPrefix={detailLabels.pourPrefix}
            atTimeLabel={detailLabels.atTimeLabel}
          />
        </RecipeEditorialSection>
      </div>

      <div className={`${recipeDetailSectionSpacing} mx-auto max-w-3xl`}>
        <PlaceholderRecipeTimeline title={sectionTitles.timelineTitle} steps={pours} />
      </div>

      {brew.equipment.length > 0 ? (
        <div className={recipeDetailSectionSpacing}>
          <RecipeEditorialSection title={sectionTitles.equipmentTitle}>
            <ul className="grid gap-3 sm:grid-cols-2">
              {brew.equipment.map((item) => (
                <li
                  key={`${item.name}-${item.detail}`}
                  className="rounded-xl border border-ba-espresso/10 bg-ba-pearl/60 px-4 py-3"
                >
                  <p className="text-sm font-medium text-ac-espresso">{item.name}</p>
                  {item.detail ? (
                    <p className="mt-1 text-sm text-ac-espresso/70">{item.detail}</p>
                  ) : null}
                </li>
              ))}
            </ul>
          </RecipeEditorialSection>
        </div>
      ) : null}

      {brew.brewingTips.length > 0 ? (
        <div className={recipeDetailSectionSpacing}>
          <RecipeEditorialSection title={sectionTitles.tipsTitle}>
            <ul className="list-disc space-y-2 ps-5 text-sm text-ac-espresso/80">
              {brew.brewingTips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </RecipeEditorialSection>
        </div>
      ) : null}

      {brew.extractionNotes.length > 0 ? (
        <div className={recipeDetailSectionSpacing}>
          <RecipeEditorialSection title={sectionTitles.extractionTitle}>
            <ul className="list-disc space-y-2 ps-5 text-sm text-ac-espresso/80">
              {brew.extractionNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </RecipeEditorialSection>
        </div>
      ) : null}
    </>
  );
}

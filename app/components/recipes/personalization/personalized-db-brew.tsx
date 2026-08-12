"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Clock,
  Droplets,
  Filter,
  Scale,
  Settings2,
  Snowflake,
  Thermometer,
} from "lucide-react";
import { MetaTile } from "@/app/components/ui/meta-tile";
import { RecipeEditorialSection } from "@/app/components/recipes/recipe-editorial-hero";
import {
  RecipeBrewSpecGrid,
  RecipePourStepList,
  recipeDetailSectionSpacing,
} from "@/app/components/recipes/recipe-detail-ui";
import {
  RecipePersonalizationControls,
  type RecipePersonalizationLabels,
} from "@/app/components/recipes/personalization/recipe-personalization-controls";
import {
  baselinePourCount,
  brewSnapshotFromDbRecipe,
  calculateTasteDirection,
  clampGrindOffset,
  clampPourCount,
  clampTemperatureC,
  countNumericPours,
  displayDose,
  displayIce,
  displayTemperature,
  displayWater,
  formatGrams,
  inferOfficialRatio,
  personalizeBrewSnapshot,
  personalizationConfigFromRecipe,
  poursForUi,
  temperatureBoundsForRecipe,
  type DynamicBrewMethod,
  type PersonalizationCopy,
  type RecipeServingStyle,
} from "@/lib/recipes/personalization";
import { parseBrewMethodLabel } from "@/lib/recipes/personalization/dynamic-brew";
import {
  adjustmentsFromWindowLocation,
  personalRecipeShareUrl,
  savePersonalRecipe,
  syncPersonalizationSearchParams,
} from "@/lib/recipes/personalization/personal-recipe-storage";
import { saveUserCustomRecipeAction } from "@/lib/supabase/personal-recipe-actions";
import type { RecipeFullDetail } from "@/types/recipe";

type PersonalizedDbBrewProps = {
  recipe: RecipeFullDetail;
  labels: RecipePersonalizationLabels;
  copy: PersonalizationCopy;
  detailLabels: {
    brewingDetailsTitle: string;
    coffeeDoseLabel: string;
    waterLabel: string;
    grindSizeLabel: string;
    waterTempLabel: string;
    brewTimeLabel: string;
    ratioLabel: string;
    deviceLabel: string;
    grinderLabel: string;
    filterLabel: string;
    waterRecipeLabel: string;
    bloomLabel: string;
    iceLabel: string;
    pourStructureTitle: string;
    pourPrefix: string;
    atTimeLabel: string;
    tipsTitle: string;
    extractionTitle: string;
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

function pourChainLabel(
  pours: Array<{ waterAmountG: number | null }>,
): string | null {
  const amounts = pours
    .map((pour) => pour.waterAmountG)
    .filter((value): value is number => value != null && value > 0)
    .map((value) => formatGrams(value) ?? `${value}g`);
  if (amounts.length === 0) return null;
  return amounts.join(" → ");
}

/** Client brew band for DB recipes — Recipe Personalization Engine. */
export function PersonalizedDbBrew({ recipe, labels, copy, detailLabels }: PersonalizedDbBrewProps) {
  const official = useMemo(() => brewSnapshotFromDbRecipe(recipe), [recipe]);
  const config = useMemo(() => personalizationConfigFromRecipe(recipe), [recipe]);
  const officialMethod = parseBrewMethodLabel(recipe.brewingMethodName);
  const officialDose = official.coffeeDoseG && official.coffeeDoseG > 0 ? official.coffeeDoseG : 20;
  const officialRatio = inferOfficialRatio(official) ?? 15;
  const officialPourCount = baselinePourCount(official);
  const hasOfficialPours = countNumericPours(official.pours) > 0;
  const tempBounds = useMemo(
    () => temperatureBoundsForRecipe(official, officialMethod),
    [official, officialMethod],
  );
  const [fromUrl] = useState(adjustmentsFromWindowLocation);

  const [servingStyle, setServingStyle] = useState<RecipeServingStyle>(
    () => fromUrl.servingStyle ?? official.servingStyle,
  );
  const [brewMethod, setBrewMethod] = useState<DynamicBrewMethod>(
    () => fromUrl.brewMethod ?? officialMethod,
  );
  const [coffeeDoseG, setCoffeeDoseG] = useState(() => fromUrl.coffeeDoseG ?? officialDose);
  const [brewRatio, setBrewRatio] = useState(() => fromUrl.brewRatio ?? officialRatio);
  const [pourCount, setPourCount] = useState(() =>
    fromUrl.pourCount != null ? clampPourCount(fromUrl.pourCount) : officialPourCount,
  );
  const [poursTouched, setPoursTouched] = useState(() => fromUrl.pourCount != null);
  const [brewTemperatureC, setBrewTemperatureC] = useState<number | null>(() => {
    if (fromUrl.brewTemperatureC != null && tempBounds) {
      return clampTemperatureC(fromUrl.brewTemperatureC, tempBounds);
    }
    return official.temperatureC != null ? Math.round(official.temperatureC) : null;
  });
  const [tempTouched, setTempTouched] = useState(() => fromUrl.brewTemperatureC != null);
  const [grindOffset, setGrindOffset] = useState(() => clampGrindOffset(fromUrl.grindOffset));

  const methodMatchesOfficial = brewMethod === officialMethod;
  const adjustments = useMemo(
    () => ({
      servingStyle,
      brewMethod,
      coffeeDoseG,
      brewRatio,
      pourCount:
        poursTouched || (hasOfficialPours && methodMatchesOfficial)
          ? pourCount
          : undefined,
      brewTemperatureC:
        tempTouched && brewTemperatureC != null ? brewTemperatureC : undefined,
      grindOffset: grindOffset !== 0 ? grindOffset : undefined,
    }),
    [
      servingStyle,
      brewMethod,
      coffeeDoseG,
      brewRatio,
      pourCount,
      hasOfficialPours,
      poursTouched,
      methodMatchesOfficial,
      brewTemperatureC,
      tempTouched,
      grindOffset,
    ],
  );

  const result = useMemo(
    () => personalizeBrewSnapshot(official, adjustments, copy, config),
    [official, adjustments, copy, config],
  );

  useEffect(() => {
    syncPersonalizationSearchParams(adjustments, result.isPersonalized);
  }, [adjustments, result.isPersonalized]);

  const brew = result.personalized;
  const pours = poursForUi(brew);
  const displayPourCount =
    countNumericPours(brew.pours) || (hasOfficialPours || poursTouched ? pourCount : 0);

  const tasteDirection = useMemo(
    () =>
      calculateTasteDirection(official, brew, adjustments, {
        sweetness: labels.tasteSweetness,
        acidity: labels.tasteAcidity,
        body: labels.tasteBody,
        bitterness: labels.tasteBitterness,
        extraction: labels.tasteExtraction,
        summaryFuller: labels.tasteSummaryFuller,
        summaryBrighter: labels.tasteSummaryBrighter,
        summarySofter: labels.tasteSummarySofter,
        summaryBalanced: labels.tasteSummaryBalanced,
        summaryIced: labels.tasteSummaryIced,
        tempUpExtraction: labels.tasteTempUpExtraction,
        tempUpBody: labels.tasteTempUpBody,
        tempUpBitterness: labels.tasteTempUpBitterness,
        tempUpAcidity: labels.tasteTempUpAcidity,
        tempDownExtraction: labels.tasteTempDownExtraction,
        tempDownAcidity: labels.tasteTempDownAcidity,
        tempDownBody: labels.tasteTempDownBody,
        tempDownBitterness: labels.tasteTempDownBitterness,
        poursUpAgitation: labels.tastePoursUpAgitation,
        poursUpExtraction: labels.tastePoursUpExtraction,
        poursDownAgitation: labels.tastePoursDownAgitation,
        poursDownExtraction: labels.tastePoursDownExtraction,
        ratioUpDilution: labels.tasteRatioUpDilution,
        ratioUpClarity: labels.tasteRatioUpClarity,
        ratioDownStrength: labels.tasteRatioDownStrength,
        ratioDownIntensity: labels.tasteRatioDownIntensity,
        doseUpStrength: labels.tasteDoseUpStrength,
        doseDownStrength: labels.tasteDoseDownStrength,
        grindFinerExtraction: labels.tasteGrindFinerExtraction,
        grindFinerBitterness: labels.tasteGrindFinerBitterness,
        grindCoarserExtraction: labels.tasteGrindCoarserExtraction,
        grindCoarserAcidity: labels.tasteGrindCoarserAcidity,
        icedDilution: labels.tasteIcedDilution,
      }),
    [official, brew, adjustments, labels],
  );

  const bloomValue =
    brew.bloomAmountG !== null
      ? `${brew.bloomAmountG}g${brew.bloomTimeLabel ? ` / ${brew.bloomTimeLabel}` : ""}`
      : null;

  const icedOfficialTotal = (official.hotWaterG ?? 0) + (official.iceG ?? 0);
  const officialWater =
    official.servingStyle === "iced"
      ? icedOfficialTotal > 0
        ? icedOfficialTotal
        : null
      : official.hotWaterG;
  const icedPersonalizedTotal = (brew.hotWaterG ?? 0) + (brew.iceG ?? 0);
  const totalWaterG =
    brew.servingStyle === "iced"
      ? icedPersonalizedTotal > 0
        ? icedPersonalizedTotal
        : null
      : brew.hotWaterG;

  const reset = () => {
    setServingStyle(official.servingStyle);
    setBrewMethod(officialMethod);
    setCoffeeDoseG(officialDose);
    setBrewRatio(officialRatio);
    setPourCount(officialPourCount);
    setPoursTouched(false);
    setBrewTemperatureC(
      official.temperatureC != null ? Math.round(official.temperatureC) : null,
    );
    setTempTouched(false);
    setGrindOffset(0);
  };

  if (!config.enabled) {
    return (
      <>
        <RecipeBrewSpecGrid
          ariaLabel={detailLabels.brewingDetailsTitle}
          specs={[
            { icon: Scale, label: detailLabels.coffeeDoseLabel, value: displayDose(official) },
            { icon: Droplets, label: detailLabels.waterLabel, value: displayWater(official, copy) },
            { icon: Settings2, label: detailLabels.grindSizeLabel, value: official.grindSize },
            {
              icon: Thermometer,
              label: detailLabels.waterTempLabel,
              value: displayTemperature(official),
            },
            { icon: Clock, label: detailLabels.brewTimeLabel, value: official.brewTimeLabel },
            { icon: Scale, label: detailLabels.ratioLabel, value: official.ratioLabel },
          ]}
        />
        {poursForUi(official).length > 0 ? (
          <RecipeEditorialSection
            title={detailLabels.pourStructureTitle}
            className={recipeDetailSectionSpacing}
          >
            <RecipePourStepList
              pourPrefix={detailLabels.pourPrefix}
              atTimeLabel={detailLabels.atTimeLabel}
              steps={poursForUi(official)}
            />
          </RecipeEditorialSection>
        ) : null}
      </>
    );
  }

  return (
    <>
      <div className="mt-8 md:mt-10">
        <RecipePersonalizationControls
          servingStyle={result.activeServingStyle}
          brewMethod={brewMethod}
          coffeeDoseG={coffeeDoseG}
          brewRatio={brewRatio}
          pourCount={pourCount}
          brewTemperatureC={brewTemperatureC}
          temperatureBounds={tempBounds}
          grindOffset={grindOffset}
          isPersonalized={result.isPersonalized}
          hasOfficialRecipe={recipe.verificationStatus === "verified"}
          showBrewMethod={Boolean(recipe.brewingMethodName)}
          doseScalable={config.doseScalable}
          ratioScalable={config.ratioScalable}
          poursScalable={config.poursScalable}
          temperatureScalable={config.temperatureScalable && tempBounds != null}
          grindScalable={config.grindScalable}
          hotSupported={config.hotSupported}
          icedSupported={config.icedSupported}
          officialSummary={{
            doseG: official.coffeeDoseG,
            waterG: officialWater && officialWater > 0 ? officialWater : null,
            ratioLabel: official.ratioLabel,
            temperatureLabel: displayTemperature(official),
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
            pourCount: displayPourCount || pourCount,
            pourChainLabel: pourChainLabel(brew.pours),
            pours: brew.pours,
          }}
          tasteDirection={tasteDirection}
          labels={labels}
          xbloomShareUrl={isXbloomShareUrl(recipe.sourceUrl)}
          onServingStyleChange={setServingStyle}
          onBrewMethodChange={setBrewMethod}
          onCoffeeDoseChange={setCoffeeDoseG}
          onBrewRatioChange={setBrewRatio}
          onPourCountChange={(count) => {
            setPoursTouched(true);
            setPourCount(clampPourCount(count));
          }}
          onTemperatureChange={(tempC) => {
            if (!tempBounds) return;
            setTempTouched(true);
            setBrewTemperatureC(clampTemperatureC(tempC, tempBounds));
          }}
          onTemperatureReset={() => {
            setTempTouched(false);
            setBrewTemperatureC(
              official.temperatureC != null ? Math.round(official.temperatureC) : null,
            );
          }}
          onGrindOffsetChange={(offset) => setGrindOffset(clampGrindOffset(offset))}
          onReset={reset}
          onSaveMyRecipe={async () => {
            savePersonalRecipe(recipe.slug, adjustments);
            try {
              await saveUserCustomRecipeAction({
                baseRecipeId: recipe.id,
                baseRecipeSlug: recipe.slug,
                title: recipe.title,
                adjustments,
              });
            } catch {
              /* guest / network — localStorage already saved */
            }
          }}
          onDuplicateRecipe={async () => {
            savePersonalRecipe(`${recipe.slug}-copy`, adjustments);
            try {
              await saveUserCustomRecipeAction({
                baseRecipeId: recipe.id,
                baseRecipeSlug: recipe.slug,
                title: `${recipe.title} (copy)`,
                adjustments,
                isDuplicate: true,
              });
            } catch {
              /* guest / network — localStorage already saved */
            }
          }}
          onShareRecipe={async () => {
            const url = personalRecipeShareUrl(recipe.slug, adjustments);
            if (navigator.share) {
              try {
                await navigator.share({ title: recipe.title, url });
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

      <RecipeBrewSpecGrid
        ariaLabel={detailLabels.brewingDetailsTitle}
        specs={[
          { icon: Scale, label: detailLabels.coffeeDoseLabel, value: displayDose(brew) },
          { icon: Droplets, label: detailLabels.waterLabel, value: displayWater(brew, copy) },
          { icon: Settings2, label: detailLabels.grindSizeLabel, value: brew.grindSize },
          { icon: Thermometer, label: detailLabels.waterTempLabel, value: displayTemperature(brew) },
          { icon: Clock, label: detailLabels.brewTimeLabel, value: brew.brewTimeLabel },
          { icon: Scale, label: detailLabels.ratioLabel, value: brew.ratioLabel },
        ]}
      />

      <RecipeEditorialSection title={detailLabels.brewingDetailsTitle} className={recipeDetailSectionSpacing}>
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          {recipe.deviceName ? (
            <MetaTile icon={Settings2} label={detailLabels.deviceLabel} value={recipe.deviceName} />
          ) : null}
          {recipe.grinderName ? (
            <MetaTile icon={Settings2} label={detailLabels.grinderLabel} value={recipe.grinderName} />
          ) : null}
          {recipe.filterTypeName ? (
            <MetaTile icon={Filter} label={detailLabels.filterLabel} value={recipe.filterTypeName} />
          ) : null}
          {recipe.waterProfileName ? (
            <MetaTile
              icon={Droplets}
              label={detailLabels.waterRecipeLabel}
              value={brew.waterProfileLabel ?? recipe.waterProfileName}
            />
          ) : null}
          {bloomValue ? <MetaTile icon={Droplets} label={detailLabels.bloomLabel} value={bloomValue} /> : null}
          {displayIce(brew) ? (
            <MetaTile icon={Snowflake} label={detailLabels.iceLabel} value={displayIce(brew) as string} />
          ) : null}
        </div>
      </RecipeEditorialSection>

      {pours.length > 0 ? (
        <RecipeEditorialSection title={detailLabels.pourStructureTitle} className={recipeDetailSectionSpacing}>
          <RecipePourStepList
            pourPrefix={detailLabels.pourPrefix}
            atTimeLabel={detailLabels.atTimeLabel}
            steps={pours}
          />
        </RecipeEditorialSection>
      ) : null}

      {brew.brewingTips.length > 0 ? (
        <RecipeEditorialSection title={detailLabels.tipsTitle} className={recipeDetailSectionSpacing}>
          <ul className="list-disc space-y-2 ps-5 text-sm text-ac-espresso/80">
            {brew.brewingTips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </RecipeEditorialSection>
      ) : null}

      {brew.extractionNotes.length > 0 ? (
        <RecipeEditorialSection title={detailLabels.extractionTitle} className={recipeDetailSectionSpacing}>
          <ul className="list-disc space-y-2 ps-5 text-sm text-ac-espresso/80">
            {brew.extractionNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </RecipeEditorialSection>
      ) : null}
    </>
  );
}

"use client";

import { useMemo, useState } from "react";
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
  brewSnapshotFromDbRecipe,
  displayDose,
  displayIce,
  displayTemperature,
  displayWater,
  personalizeBrewSnapshot,
  poursForUi,
  type DynamicBrewMethod,
  type PersonalizationCopy,
  type RecipeServingStyle,
} from "@/lib/recipes/personalization";
import {
  extractRatioDenominator,
  extractionGuidanceLabels,
  parseBrewMethodLabel,
} from "@/lib/recipes/personalization/dynamic-brew";
import {
  adjustmentsFromWindowLocation,
  personalRecipeShareUrl,
  savePersonalRecipe,
} from "@/lib/recipes/personalization/personal-recipe-storage";
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

/** Client brew band for DB recipes — Dynamic Recipe System personalization. */
export function PersonalizedDbBrew({ recipe, labels, copy, detailLabels }: PersonalizedDbBrewProps) {
  const official = useMemo(() => brewSnapshotFromDbRecipe(recipe), [recipe]);
  const officialMethod = parseBrewMethodLabel(recipe.brewingMethodName);
  const officialDose = official.coffeeDoseG && official.coffeeDoseG > 0 ? official.coffeeDoseG : 20;
  const officialRatio = extractRatioDenominator(official.ratioLabel) ?? 15;
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
    () => personalizeBrewSnapshot(official, adjustments, copy),
    [official, adjustments, copy],
  );

  const brew = result.personalized;
  const pours = poursForUi(brew);
  const guidance = extractionGuidanceLabels(brewRatio).map((item) => item.label);
  const bloomValue =
    brew.bloomAmountG !== null
      ? `${brew.bloomAmountG}g${brew.bloomTimeLabel ? ` / ${brew.bloomTimeLabel}` : ""}`
      : null;

  const reset = () => {
    setServingStyle(official.servingStyle);
    setBrewMethod(officialMethod);
    setCoffeeDoseG(officialDose);
    setBrewRatio(officialRatio);
  };

  return (
    <>
      <div className="mt-8 md:mt-10">
        <RecipePersonalizationControls
          servingStyle={result.activeServingStyle}
          brewMethod={brewMethod}
          coffeeDoseG={coffeeDoseG}
          brewRatio={brewRatio}
          isPersonalized={result.isPersonalized}
          hasOfficialRecipe={recipe.verificationStatus === "verified"}
          guidance={guidance}
          labels={labels}
          onServingStyleChange={setServingStyle}
          onBrewMethodChange={setBrewMethod}
          onCoffeeDoseChange={setCoffeeDoseG}
          onBrewRatioChange={setBrewRatio}
          onReset={reset}
          onSaveMyRecipe={() => savePersonalRecipe(recipe.slug, adjustments)}
          onDuplicateRecipe={() => savePersonalRecipe(`${recipe.slug}-copy`, adjustments)}
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
          <ul className="space-y-3 text-sm leading-relaxed text-ac-espresso/80">
            {brew.brewingTips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </RecipeEditorialSection>
      ) : null}

      {brew.extractionNotes.length > 0 ? (
        <RecipeEditorialSection title={detailLabels.extractionTitle} className={recipeDetailSectionSpacing}>
          <ul className="space-y-3 text-sm leading-relaxed text-ac-espresso/80">
            {brew.extractionNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </RecipeEditorialSection>
      ) : null}
    </>
  );
}

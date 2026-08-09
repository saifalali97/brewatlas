"use client";

import { useMemo, useState } from "react";
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
  displayBloom,
  displayDose,
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

/** Client brew band for Gulf recipes — full Dynamic Recipe System personalization. */
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
          guidance={guidance}
          labels={labels}
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

      <div className={recipeDetailSectionSpacing}>
        <RecipeEditorialSection title={sectionTitles.equipmentTitle}>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {brew.equipment.map((item) => (
              <li
                key={`${item.name}-${item.detail}`}
                className="rounded-2xl border border-ba-espresso/[0.08] bg-ba-pearl px-5 py-4"
              >
                <p className="font-medium text-ac-espresso">{item.name}</p>
                <p className="mt-1 text-sm text-ac-espresso/65">{item.detail}</p>
              </li>
            ))}
          </ul>
        </RecipeEditorialSection>
      </div>

      {brew.brewingTips.length > 0 ? (
        <div className={`${recipeDetailSectionSpacing} mx-auto max-w-3xl`}>
          <RecipeEditorialSection title={sectionTitles.tipsTitle}>
            <ul className="space-y-3 text-sm leading-relaxed text-ac-espresso/80">
              {brew.brewingTips.map((tip) => (
                <li key={tip}>{tip}</li>
              ))}
            </ul>
          </RecipeEditorialSection>
        </div>
      ) : null}

      {brew.extractionNotes.length > 0 ? (
        <div className={`${recipeDetailSectionSpacing} mx-auto max-w-3xl`}>
          <RecipeEditorialSection title={sectionTitles.extractionTitle}>
            <ul className="space-y-3 text-sm leading-relaxed text-ac-espresso/80">
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

import { GhRecipeHero } from "@/app/components/gulf-heritage/gh-recipe-hero";
import { GhRecipeEquipment } from "@/app/components/gulf-heritage/gh-recipe-equipment";
import { GhRecipeIngredients } from "@/app/components/gulf-heritage/gh-recipe-ingredients";
import {
  GhRecipeHistoricalNotes,
  GhRecipeServingSection,
  GhRecipeSteps,
  GhRecipeTipsSection,
  GhRecipeWarningsSection,
} from "@/app/components/gulf-heritage/gh-recipe-steps";
import { GhPendingContent } from "@/app/components/gulf-heritage/gh-pending-content";
import { GhSectionDivider } from "@/app/components/gulf-heritage/gh-section-divider";
import { ghMotion } from "@/app/components/gulf-heritage/shared/gh-styles";
import type { GulfHeritageEditorialStatus } from "@/types/gulf-heritage-editorial";
import { isRecipeVerified } from "@/types/gulf-heritage-recipe";
import type { GulfHeritageRecipeReference } from "@/types/gulf-heritage-recipe";

type GhRecipeDetailProps = {
  recipe: GulfHeritageRecipeReference;
  country: string;
  category: string;
  editorialStatus: GulfHeritageEditorialStatus;
  verifiedContentComingSoon: string;
  statusLabels: Record<GulfHeritageEditorialStatus | "unverified", string>;
  fieldLabels: {
    difficulty: string;
    preparationTime: string;
    servingSize: string;
    equipment: string;
    ingredients: string;
    steps: string;
    tips: string;
    notes: string;
    warnings: string;
    temperature: string;
    servingSuggestions: string;
    historicalNotes: string;
  };
  ingredientLabels: {
    main: string;
    optional: string;
    garnishes: string;
    notes: string;
  };
  presentationLabels: {
    stepTemplate: string;
  };
};

/** Full structured recipe experience for verified catalog entries. */
export function GhRecipeDetail({
  recipe,
  country,
  category,
  editorialStatus,
  verifiedContentComingSoon,
  statusLabels,
  fieldLabels,
  ingredientLabels,
  presentationLabels,
}: GhRecipeDetailProps) {
  const verified = isRecipeVerified(recipe);

  if (!verified) {
    return (
      <div className={`${ghMotion.fadeIn} rounded-2xl border border-ba-espresso/8 bg-ba-pearl px-6 py-8`}>
        <h3 className="text-lg font-semibold text-ac-espresso">{recipe.title}</h3>
        <div className="mt-3">
          <GhPendingContent message={verifiedContentComingSoon} />
        </div>
      </div>
    );
  }

  return (
    <article id={`gh-recipe-${recipe.slug}`} className={`space-y-10 ${ghMotion.fadeIn}`} aria-label={recipe.title}>
      <GhRecipeHero
        recipe={recipe}
        country={country}
        category={category}
        editorialStatus={editorialStatus}
        statusLabels={statusLabels}
        fieldLabels={fieldLabels}
      />

      {recipe.waterTemperature ? (
        <div className="rounded-xl border border-ba-espresso/8 bg-ba-sand/30 px-5 py-4 text-sm">
          <span className="font-medium text-ac-espresso">{fieldLabels.temperature}: </span>
          <span className="text-ac-espresso/82">{recipe.waterTemperature}</span>
        </div>
      ) : null}

      <GhRecipeEquipment title={fieldLabels.equipment} equipment={recipe.equipmentList} />

      <GhSectionDivider className="my-8" />

      <GhRecipeIngredients
        title={fieldLabels.ingredients}
        ingredients={recipe.ingredientsList}
        labels={ingredientLabels}
      />

      <GhSectionDivider className="my-8" />

      <GhRecipeSteps
        title={fieldLabels.steps}
        steps={recipe.steps}
        stepLabelTemplate={presentationLabels.stepTemplate}
      />

      <GhRecipeTipsSection title={fieldLabels.tips} tips={recipe.tips} />
      <GhRecipeWarningsSection title={fieldLabels.warnings} warnings={recipe.warnings} />
      <GhRecipeServingSection title={fieldLabels.servingSuggestions} servingNotes={recipe.servingNotes} />
      <GhRecipeHistoricalNotes title={fieldLabels.historicalNotes} notes={recipe.notes} />
    </article>
  );
}

import { GulfHeritageContentSection } from "@/app/components/gulf-heritage/gulf-heritage-content-section";
import { GulfHeritagePendingContent } from "@/app/components/gulf-heritage/gulf-heritage-pending-content";
import { badges, surfaces } from "@/lib/constants/styles";
import { isRecipeVerified } from "@/types/gulf-heritage-recipe";
import type { GulfHeritageRecipeReference } from "@/types/gulf-heritage-recipe";
import type { GulfHeritageEditorialStatus } from "@/types/gulf-heritage-editorial";

type GulfHeritageRecipesSectionProps = {
  title: string;
  recipes: readonly GulfHeritageRecipeReference[];
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
    references: string;
    temperature: string;
  };
};

function RecipeStatusBadge({ status, labels }: { status: string; labels: GulfHeritageRecipesSectionProps["statusLabels"] }) {
  const label = labels[status as keyof typeof labels] ?? status;
  return <span className={`${badges.premiumCompact} ms-2 inline-flex align-middle`}>{label}</span>;
}

/** Related recipes section — shows catalog entries with verification status and structured slots. */
export function GulfHeritageRecipesSection({
  title,
  recipes,
  verifiedContentComingSoon,
  statusLabels,
  fieldLabels,
}: GulfHeritageRecipesSectionProps) {
  return (
    <GulfHeritageContentSection title={title}>
      {recipes.length === 0 ? (
        <GulfHeritagePendingContent message={verifiedContentComingSoon} />
      ) : (
        <ul className={`${surfaces.lightList} divide-y divide-ba-espresso/08`}>
          {recipes.map((recipe) => (
            <li key={recipe.slug} className="px-5 py-4 text-sm text-ac-espresso">
              <p className="font-medium">
                {recipe.title}
                <RecipeStatusBadge status={recipe.verification.status} labels={statusLabels} />
              </p>

              {isRecipeVerified(recipe) ? (
                <dl className="mt-3 space-y-1 text-sm">
                  {recipe.difficulty ? (
                    <div>
                      <dt className="inline font-medium">{fieldLabels.difficulty}: </dt>
                      <dd className="inline">{recipe.difficulty}</dd>
                    </div>
                  ) : null}
                  {recipe.preparationTime ? (
                    <div>
                      <dt className="inline font-medium">{fieldLabels.preparationTime}: </dt>
                      <dd className="inline">{recipe.preparationTime}</dd>
                    </div>
                  ) : null}
                  {recipe.servingSize ? (
                    <div>
                      <dt className="inline font-medium">{fieldLabels.servingSize}: </dt>
                      <dd className="inline">{recipe.servingSize}</dd>
                    </div>
                  ) : null}
                  {recipe.equipmentList.length > 0 ? (
                    <div>
                      <dt className="font-medium">{fieldLabels.equipment}</dt>
                      <dd>{recipe.equipmentList.join(", ")}</dd>
                    </div>
                  ) : null}
                  {recipe.ingredientsList.length > 0 ? (
                    <div>
                      <dt className="font-medium">{fieldLabels.ingredients}</dt>
                      <dd>
                        <ul className="mt-1 list-disc ps-5">
                          {recipe.ingredientsList.map((item) => (
                            <li key={`${item.name}-${item.amount}`}>
                              {[item.amount, item.unit, item.name].filter(Boolean).join(" ")}
                              {item.notes ? ` (${item.notes})` : ""}
                            </li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                  ) : null}
                  {recipe.waterTemperature ? (
                    <div>
                      <dt className="inline font-medium">{fieldLabels.temperature}: </dt>
                      <dd className="inline">{recipe.waterTemperature}</dd>
                    </div>
                  ) : null}
                  {recipe.steps.length > 0 ? (
                    <div>
                      <dt className="font-medium">{fieldLabels.steps}</dt>
                      <dd>
                        <ol className="mt-1 list-decimal ps-5">
                          {recipe.steps.map((step) => (
                            <li key={step.order}>
                              {step.instruction}
                              {step.duration ? ` (${step.duration})` : ""}
                            </li>
                          ))}
                        </ol>
                      </dd>
                    </div>
                  ) : null}
                  {recipe.tips.length > 0 ? (
                    <div>
                      <dt className="font-medium">{fieldLabels.tips}</dt>
                      <dd>
                        <ul className="mt-1 list-disc ps-5">
                          {recipe.tips.map((tip) => (
                            <li key={tip}>{tip}</li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                  ) : null}
                  {recipe.warnings.length > 0 ? (
                    <div>
                      <dt className="font-medium">{fieldLabels.warnings}</dt>
                      <dd>
                        <ul className="mt-1 list-disc ps-5">
                          {recipe.warnings.map((warning) => (
                            <li key={warning}>{warning}</li>
                          ))}
                        </ul>
                      </dd>
                    </div>
                  ) : null}
                  {recipe.notes ? (
                    <div>
                      <dt className="inline font-medium">{fieldLabels.notes}: </dt>
                      <dd className="inline">{recipe.notes}</dd>
                    </div>
                  ) : null}
                </dl>
              ) : (
                <p className="mt-2 text-ac-espresso/80">{verifiedContentComingSoon}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </GulfHeritageContentSection>
  );
}

/** @deprecated Use GulfHeritageRecipesSection */
export function GulfHeritageVerifiedRecipesSection(props: Omit<GulfHeritageRecipesSectionProps, "recipes"> & {
  recipes: readonly GulfHeritageRecipeReference[];
}) {
  return <GulfHeritageRecipesSection {...props} />;
}

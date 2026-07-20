import type { RecipeFullDetail } from "@/types/recipe";
import { OfficialRecipeBadge } from "@/app/components/recipes/official-recipe-badge";
import { MarkdownRenderer } from "@/app/components/ai-coach/markdown-renderer";

type OfficialRecipeDetailPanelProps = {
  recipe: RecipeFullDetail;
};

export function OfficialRecipeDetailPanel({ recipe }: OfficialRecipeDetailPanelProps) {
  if (recipe.recipeKind !== "official" && recipe.recipeKind !== "competition") {
    return null;
  }

  const sections = [
    { title: "Why this recipe works", content: recipe.whyItWorks },
    { title: "Recipe science", content: recipe.recipeScience },
    { title: "Pour structure", content: recipe.pourStructure },
    { title: "Common mistakes", content: recipe.commonMistakes },
    { title: "Adjustments", content: recipe.adjustments },
    { title: "Finish", content: recipe.finishNotes },
    { title: "Grinder recommendation", content: recipe.grinderRecommendation },
    { title: "Water recommendation", content: recipe.waterRecommendation },
    { title: "Equipment", content: recipe.equipmentNotes },
  ].filter((section) => section.content?.trim());

  if (sections.length === 0 && (recipe.faq?.length ?? 0) === 0) {
    return (
      <div className="mt-8">
        <OfficialRecipeBadge verificationStatus={recipe.verificationStatus} versionLabel={recipe.versionLabel} />
      </div>
    );
  }

  return (
    <section className="mt-10 space-y-6 rounded-2xl border border-ba-espresso/10 bg-ba-pearl/60 p-6">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-xl font-semibold text-ba-charcoal">Official BrewAtlas Recipe</h2>
        <OfficialRecipeBadge verificationStatus={recipe.verificationStatus} versionLabel={recipe.versionLabel} />
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.title}>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-stone-500">{section.title}</h3>
            <MarkdownRenderer content={section.content ?? ""} />
          </div>
        ))}

        {recipe.faq && recipe.faq.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-stone-500">FAQ</h3>
            <div className="space-y-4">
              {recipe.faq.map((item) => (
                <div key={item.question}>
                  <p className="font-medium text-ba-charcoal">{item.question}</p>
                  <div className="mt-1 text-sm text-stone-600">
                    <MarkdownRenderer content={item.answer} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

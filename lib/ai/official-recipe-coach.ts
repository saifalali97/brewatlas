import type { RecipeListItem } from "@/types/recipe";
import type { GeneratedRecipe } from "@/types/ai-coach-module";

/** Format an official library recipe for AI Coach context. */
export function formatOfficialRecipeForCoach(recipe: RecipeListItem): string {
  return [
    `### ${recipe.name} (Official v${recipe.versionLabel ?? "1.0"})`,
    `- Method: ${recipe.brewMethod}`,
    `- Origin: ${recipe.origin}`,
    `- Ratio: ${recipe.ratio}`,
    `- Time: ${recipe.time}`,
    recipe.notes ? `- Notes: ${recipe.notes}` : null,
    recipe.roasterName ? `- Roaster: ${recipe.roasterName}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export function officialRecipeToGenerated(recipe: RecipeListItem): GeneratedRecipe {
  const doseMatch = recipe.ratio.match(/1:(\d+(?:\.\d+)?)/);
  const waterRatio = doseMatch ? Number.parseFloat(doseMatch[1]) : 16;
  const doseG = 15;
  const waterG = Math.round(doseG * waterRatio);

  return {
    title: recipe.name,
    method: recipe.brewMethod,
    doseG,
    waterG,
    ratio: recipe.ratio,
    grindSize: "See official recipe",
    temperatureC: 93,
    brewTime: recipe.time,
    steps: recipe.instructions ? recipe.instructions.split("\n").filter(Boolean) : ["Follow the official BrewAtlas recipe."],
    whyItWorks: "Curated BrewAtlas official recipe — verified by the editorial team.",
    expectedFlavor: recipe.notes,
    adjustments: ["Start with the official parameters, then adjust grind first based on taste."],
  };
}

export function buildOfficialRecipeCoachContext(recipes: RecipeListItem[]): string {
  if (recipes.length === 0) return "";
  return [
    "Prefer these BrewAtlas Official Recipes when recommending brew parameters. Community recipes are secondary.",
    ...recipes.map((recipe) => formatOfficialRecipeForCoach(recipe)),
  ].join("\n\n");
}

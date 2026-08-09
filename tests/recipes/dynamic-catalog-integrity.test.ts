import { describe, expect, it } from "vitest";
import { GULF_COFFEE_CATALOG_SEEDS } from "@/lib/data/directory/seeds/gulf-coffee-catalog";
import { listGulfRecipeDetails } from "@/lib/data/directory/seeds/recipe-library";

describe("gulf dynamic catalog integrity", () => {
  it("loads recipes for all newly added roasters", () => {
    const recipes = listGulfRecipeDetails();
    const newSlugs = [
      "absolute-coffee",
      "south-roastery",
      "trivali-roastery",
      "black-knight-roastery",
      "black-horse-roastery",
      "ananas-roastery",
      "kiffa-roastery",
      "c-and-b-roastery",
    ];
    for (const slug of newSlugs) {
      expect(recipes.filter((recipe) => recipe.roasterSlug === slug).length).toBeGreaterThanOrEqual(
        3,
      );
    }
    expect(GULF_COFFEE_CATALOG_SEEDS.length).toBe(62);
    expect(recipes.length).toBe(183);
  });
});

import { describe, expect, it } from "vitest";
import { GULF_COFFEE_CATALOG_SEEDS } from "@/lib/data/directory/seeds/gulf-coffee-catalog";
import { listGulfRecipeDetails } from "@/lib/data/directory/seeds/recipe-library";
import { resolveRecipeCardImage } from "@/lib/gulf-directory/recipe-card-image";

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

  it("uses coffee product images on cards when catalog provides them", () => {
    const recipes = listGulfRecipeDetails().filter((recipe) =>
      [
        "absolute-coffee",
        "south-roastery",
        "trivali-roastery",
        "black-horse-roastery",
        "kiffa-roastery",
      ].includes(recipe.roasterSlug),
    );
    const withProductImage = recipes.filter(
      (recipe) =>
        recipe.image.startsWith("https://cdn.shopify.com") ||
        recipe.image.startsWith("https://media.zid.store") ||
        recipe.image.startsWith("https://cdn.salla.sa"),
    );
    expect(withProductImage.length).toBeGreaterThanOrEqual(30);
  });

  it("resolves card image priority without inventing media", () => {
    expect(
      resolveRecipeCardImage({
        productImageUrl: "https://cdn.shopify.com/product.png",
        recipeImageUrl: "/images/methods/pour-over.webp",
      }),
    ).toBe("https://cdn.shopify.com/product.png");
    expect(
      resolveRecipeCardImage({
        productImageUrl: null,
        recipeImageUrl: "/images/methods/pour-over.webp",
        fallbackImageUrl: "/images/methods/pour-over.webp",
      }),
    ).toBe("/images/methods/pour-over.webp");
  });
});

import { describe, expect, it } from "vitest";
import {
  GULF_COFFEE_CATALOG_SEEDS,
  coffeeCatalogKey,
} from "@/lib/data/directory/seeds/gulf-coffee-catalog";
import { GULF_COFFEE_CATALOG_EXPANSION_SEEDS } from "@/lib/data/directory/seeds/gulf-coffee-catalog-expansion";
import { GULF_ROASTER_SEEDS } from "@/lib/data/directory/seeds/gulf-roasters";
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
      "yoof-roastery",
    ];
    for (const slug of newSlugs) {
      expect(recipes.filter((recipe) => recipe.roasterSlug === slug).length).toBeGreaterThanOrEqual(
        3,
      );
    }
    expect(GULF_COFFEE_CATALOG_SEEDS.length).toBe(71 + GULF_COFFEE_CATALOG_EXPANSION_SEEDS.length);
    expect(recipes.length).toBe(121 + GULF_COFFEE_CATALOG_SEEDS.length);
  });

  it("keeps catalog keys unique per roaster/slug", () => {
    const keys = GULF_COFFEE_CATALOG_SEEDS.map(coffeeCatalogKey);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("only references verified Gulf roasters", () => {
    const roasterSlugs = new Set(GULF_ROASTER_SEEDS.map((roaster) => roaster.slug));
    for (const coffee of GULF_COFFEE_CATALOG_SEEDS) {
      expect(roasterSlugs.has(coffee.roasterSlug)).toBe(true);
      expect(coffee.productUrl.startsWith("http")).toBe(true);
      expect(coffee.slug.length).toBeGreaterThan(0);
    }
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

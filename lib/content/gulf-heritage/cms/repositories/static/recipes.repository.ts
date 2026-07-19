import { getUaePageRecipes } from "@/lib/content/gulf-heritage/uae/recipes";
import { createStaticCmsBase } from "@/lib/content/gulf-heritage/cms/repositories/static/cms-base";
import type { GulfHeritageRecipesRepository } from "@/lib/content/gulf-heritage/cms/repositories/types";

export const staticGulfHeritageRecipesRepository: GulfHeritageRecipesRepository = {
  async listByPage(pageSlug, locale) {
    const recipes = getUaePageRecipes(pageSlug);

    return recipes.map((recipe, index) => ({
      ...createStaticCmsBase("recipe", `${pageSlug}:${recipe.slug}`, locale),
      countrySlug: "united-arab-emirates",
      pageSlug,
      recipe,
      slug: recipe.slug,
      id: `gh:recipe:${pageSlug}:${recipe.slug}:${locale}:${index}`,
    }));
  },
};

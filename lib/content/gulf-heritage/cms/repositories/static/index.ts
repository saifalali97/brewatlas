import { staticGulfHeritageArticlesRepository } from "@/lib/content/gulf-heritage/cms/repositories/static/articles.repository";
import { staticGulfHeritageCategoriesRepository } from "@/lib/content/gulf-heritage/cms/repositories/static/categories.repository";
import { staticGulfHeritageCountriesRepository } from "@/lib/content/gulf-heritage/cms/repositories/static/countries.repository";
import { staticGulfHeritageImagesRepository } from "@/lib/content/gulf-heritage/cms/repositories/static/images.repository";
import { staticGulfHeritagePagesRepository } from "@/lib/content/gulf-heritage/cms/repositories/static/pages.repository";
import { staticGulfHeritageRecipesRepository } from "@/lib/content/gulf-heritage/cms/repositories/static/recipes.repository";
import { staticGulfHeritageReferencesRepository } from "@/lib/content/gulf-heritage/cms/repositories/static/references.repository";
import { staticGulfHeritageRoastersRepository } from "@/lib/content/gulf-heritage/cms/repositories/static/roasters.repository";
import type { GulfHeritageCmsRepositories } from "@/lib/content/gulf-heritage/cms/repositories/types";

/** Default CMS repositories — static registries today; swap for Supabase implementations later. */
export const staticGulfHeritageCmsRepositories: GulfHeritageCmsRepositories = {
  countries: staticGulfHeritageCountriesRepository,
  categories: staticGulfHeritageCategoriesRepository,
  articles: staticGulfHeritageArticlesRepository,
  roasters: staticGulfHeritageRoastersRepository,
  recipes: staticGulfHeritageRecipesRepository,
  references: staticGulfHeritageReferencesRepository,
  images: staticGulfHeritageImagesRepository,
  pages: staticGulfHeritagePagesRepository,
};

export {
  staticGulfHeritageArticlesRepository,
  staticGulfHeritageCategoriesRepository,
  staticGulfHeritageCountriesRepository,
  staticGulfHeritageImagesRepository,
  staticGulfHeritagePagesRepository,
  staticGulfHeritageRecipesRepository,
  staticGulfHeritageReferencesRepository,
  staticGulfHeritageRoastersRepository,
};

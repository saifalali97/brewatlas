import { getRecipeSlug } from "@/lib/data/recipes";
import { featuredRecipes } from "@/data/homepage";
import type { StaticRecipeDetail } from "@/types/static-recipe-detail";
import { ethiopianYirgacheffePourOver } from "@/lib/data/static-recipe-details/ethiopian-yirgacheffe-pour-over";
import { kyotoColdBrew } from "@/lib/data/static-recipe-details/kyoto-cold-brew";
import { signatureCortado } from "@/lib/data/static-recipe-details/signature-cortado";
import { espressoTonic } from "@/lib/data/static-recipe-details/espresso-tonic";
import { panamaGeishaChemex } from "@/lib/data/static-recipe-details/panama-geisha-chemex";
import { sumatraMandhelingMoka } from "@/lib/data/static-recipe-details/sumatra-mandheling-moka";
import { costaRicaHoneyAeropress } from "@/lib/data/static-recipe-details/costa-rica-honey-aeropress";
import { rwandaBourbonV60 } from "@/lib/data/static-recipe-details/rwanda-bourbon-v60";

const STATIC_RECIPE_DETAILS: Record<string, StaticRecipeDetail> = {
  [getRecipeSlug(featuredRecipes[0]!)]: ethiopianYirgacheffePourOver,
  [getRecipeSlug(featuredRecipes[1]!)]: kyotoColdBrew,
  [getRecipeSlug(featuredRecipes[2]!)]: signatureCortado,
  [getRecipeSlug(featuredRecipes[3]!)]: espressoTonic,
  [getRecipeSlug(featuredRecipes[4]!)]: panamaGeishaChemex,
  [getRecipeSlug(featuredRecipes[5]!)]: sumatraMandhelingMoka,
  [getRecipeSlug(featuredRecipes[6]!)]: costaRicaHoneyAeropress,
  [getRecipeSlug(featuredRecipes[7]!)]: rwandaBourbonV60,
};

export function getStaticRecipeDetail(slug: string): StaticRecipeDetail | undefined {
  return STATIC_RECIPE_DETAILS[slug];
}

export function getAllStaticRecipeDetailSlugs(): string[] {
  return Object.keys(STATIC_RECIPE_DETAILS);
}

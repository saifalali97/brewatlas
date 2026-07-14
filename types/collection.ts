import type { DbRecipeRow } from "@/types/recipe";
import type { RecipeListItem } from "@/types/recipe";

/** `public.recipe_collections` row, camelCased. */
export type RecipeCollectionRow = {
  id: string;
  userId: string;
  name: string;
  recipeCount: number;
  createdAt: string;
  updatedAt: string;
};

/** A collection with its member recipes, for the collection detail page. */
export type RecipeCollectionDetail = RecipeCollectionRow & {
  recipes: RecipeListItem[];
};

/** Raw `recipe_collections` row as selected from Supabase (list view). */
export type DbRecipeCollectionRow = {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
  recipe_collection_items: { recipe_id: string }[] | null | undefined;
};

/** Raw collection row joined with recipe data for the detail view. */
export type DbRecipeCollectionDetailRow = {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
  recipe_collection_items: {
    recipe_id: string;
    recipes: DbRecipeRow | null;
  }[] | null | undefined;
};

import type { FeaturedRecipe } from "@/types/homepage";

/** Generic `{ id, name }` shape used to populate lookup <select>s. */
export type LookupOption = {
  id: string;
  name: string;
};

/** `public.profiles` row, including the preference columns added for the profile page. */
export type ProfileRow = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  country: string | null;
  role: "user" | "admin";
  bio: string | null;
  favorite_brewing_method_id: string | null;
  favorite_device_id: string | null;
  created_at: string;
};

/** Raw shape of a `recipes` row selected with its lookup joins. */
export type DbRecipeRow = {
  id: string;
  title: string;
  slug: string;
  author_id: string | null;
  coffee_dose: number | null;
  water: number | null;
  ice: number | null;
  grind_size: string | null;
  temperature: number | null;
  bloom: string | null;
  brew_time: string | null;
  tasting_notes: string | null;
  instructions: string | null;
  image_url: string | null;
  featured: boolean;
  premium_only: boolean;
  published: boolean;
  created_at: string;
  updated_at: string;
  brewing_methods: { id: string; name: string } | null;
  devices: { id: string; name: string } | null;
  origins: { id: string; country: string; region: string } | null;
  roasters: { id: string; name: string } | null;
};

/**
 * Unified shape the recipe listing/search/detail UI renders, so the same
 * `RecipeCard` and page templates work whether a recipe comes from the
 * static editorial catalog (`data/homepage.ts`) or the `recipes` table.
 */
export type RecipeListItem = FeaturedRecipe & {
  slug: string;
  source: "static" | "db";
  id?: string;
  authorId?: string | null;
  published?: boolean;
  roasterName?: string;
  deviceName?: string;
  favoritesCount?: number;
  instructions?: string | null;
};

export const RECIPE_IMAGE_PLACEHOLDER = "/images/coffee-placeholder.svg";

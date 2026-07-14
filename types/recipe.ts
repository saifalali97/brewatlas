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

export type TagRow = {
  id: string;
  name: string;
  slug: string;
};

export type PourRow = {
  id: string;
  pour_number: number;
  water_amount: number | null;
  time_label: string | null;
  notes: string | null;
};

export type RecipeImageRow = {
  id: string;
  url: string;
  position: number;
};

/** Raw shape of a `coffees` row selected with its roaster/origin joins. */
export type CoffeeRow = {
  id: string;
  name: string;
  farm: string | null;
  producer: string | null;
  variety: string | null;
  process: string | null;
  altitude: string | null;
  roast_level: string | null;
  roast_date: string | null;
  roasters: { id: string; name: string } | null;
  origins: { id: string; country: string; region: string } | null;
};

/** Raw shape of a `recipes` row selected with all of its lookup/child joins. */
export type DbRecipeRow = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  video_url: string | null;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | null;
  estimated_brew_time: string | null;
  author_id: string | null;
  coffee_dose: number | null;
  water_amount: number | null;
  ice_amount: number | null;
  grind_size: string | null;
  water_temperature: number | null;
  ratio: string | null;
  bloom_amount: number | null;
  bloom_time: string | null;
  total_brew_time: string | null;
  beverage_weight: number | null;
  tds: number | null;
  extraction_percentage: number | null;
  tasting_notes: string | null;
  instructions: string | null;
  cover_image_url: string | null;
  sweetness: number | null;
  acidity: number | null;
  body: number | null;
  bitterness: number | null;
  featured: boolean;
  premium_only: boolean;
  published: boolean;
  created_at: string;
  updated_at: string;
  brewing_methods: { id: string; name: string } | null;
  devices: { id: string; name: string } | null;
  grinders: { id: string; name: string } | null;
  filter_types: { id: string; name: string } | null;
  water_profiles: { id: string; name: string } | null;
  coffees: CoffeeRow | null;
  recipe_pours: PourRow[];
  recipe_images: RecipeImageRow[];
  recipe_tags: { tags: TagRow | null }[];
  xbloom_profiles: { id: string }[];
};

/**
 * Unified shape the recipe listing/search/detail UI renders, so the same
 * `RecipeCard` and page templates work whether a recipe comes from the
 * static editorial catalog (`data/homepage.ts`) or the `recipes` table.
 * Kept intentionally lightweight (card-oriented); see `RecipeFullDetail`
 * for the fully expanded shape used by the detail page and edit form.
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
  tags?: string[];
  /** Extra searchable strings not otherwise surfaced on the card, joined in for the search box. */
  searchableExtras?: string[];
};

/** The full, richly-typed recipe shape used by the detail page and the create/edit form. */
export type RecipeFullDetail = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  videoUrl: string | null;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | null;
  estimatedBrewTime: string | null;
  authorId: string | null;
  published: boolean;
  featured: boolean;
  premiumOnly: boolean;
  coverImageUrl: string | null;
  images: RecipeImageRow[];

  brewingMethodId: string | null;
  brewingMethodName: string | null;
  deviceId: string | null;
  deviceName: string | null;
  grinderId: string | null;
  grinderName: string | null;
  filterTypeId: string | null;
  filterTypeName: string | null;
  waterProfileId: string | null;
  waterProfileName: string | null;
  grindSize: string | null;
  waterTemperature: number | null;
  coffeeDose: number | null;
  waterAmount: number | null;
  ratio: string | null;
  iceAmount: number | null;
  bloomAmount: number | null;
  bloomTime: string | null;

  coffeeId: string | null;
  coffeeName: string | null;
  roasterId: string | null;
  roasterName: string | null;
  originId: string | null;
  originLabel: string | null;
  farm: string | null;
  producer: string | null;
  variety: string | null;
  process: string | null;
  altitude: string | null;
  roastLevel: string | null;
  roastDate: string | null;

  pours: PourRow[];
  tags: TagRow[];

  totalBrewTime: string | null;
  beverageWeight: number | null;
  tds: number | null;
  extractionPercentage: number | null;
  tastingNotes: string | null;
  instructions: string | null;
  sweetness: number | null;
  acidity: number | null;
  body: number | null;
  bitterness: number | null;

  tagIds: string[];
};

export const RECIPE_IMAGE_PLACEHOLDER = "/images/coffee-placeholder.svg";

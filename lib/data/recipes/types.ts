import type { GulfDirectoryCountrySlug } from "@/lib/gulf-directory/countries";

export type RecipeStepRow = {
  id: string;
  recipe_id: string;
  step_key: string | null;
  pour_number: number;
  water_amount: string | null;
  time_label: string | null;
  notes: string;
  at_seconds: number;
  duration_seconds: number;
  sort_order: number;
};

export type RecipeEquipmentRow = {
  id: string;
  recipe_id: string;
  name: string;
  detail: string;
  sort_order: number;
};

export type RecipeFlavorNoteRow = {
  id: string;
  recipe_id: string;
  note: string;
  sort_order: number;
};

export type RecipeBrewVariableRow = {
  id: string;
  recipe_id: string;
  key: string;
  value: string;
  sort_order: number;
};

export type GulfRecipeRow = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  cover_image_url: string | null;
  difficulty: string | null;
  tasting_notes: string | null;
  featured: boolean;
  brew_method: string | null;
  is_iced: boolean;
  rating: number | null;
  coffee_beans: string | null;
  roast_level: string | null;
  bean_origin: string | null;
  process: string | null;
  roast_date_label: string | null;
  producer: string | null;
  variety: string | null;
  brewing_tips: string | null;
  sweetness: number | null;
  acidity: number | null;
  body: number | null;
  bitterness: number | null;
  flavor_sweetness: number | null;
  flavor_acidity: number | null;
  flavor_body: number | null;
  flavor_bitterness: number | null;
  flavor_finish: number | null;
  similar_slugs: string[] | null;
  estimated_brew_time: string | null;
  total_brew_time: string | null;
  grind_size: string | null;
  ratio: string | null;
  coffee_dose: number | null;
  water_amount: number | null;
  water_temperature: number | null;
  source_url: string | null;
  water_recommendation: string | null;
  equipment_notes: string | null;
  roaster_id: string | null;
  country_id: string | null;
  city_id: string | null;
  roasters: {
    id: string;
    name: string;
    slug: string | null;
    city: string | null;
  } | null;
  countries: {
    id: string;
    slug: string;
    name: string;
  } | null;
  cities: {
    id: string;
    name: string;
    slug: string;
  } | null;
  recipe_steps: RecipeStepRow[] | null;
  recipe_equipment: RecipeEquipmentRow[] | null;
  recipe_flavor_notes: RecipeFlavorNoteRow[] | null;
  recipe_brew_variables: RecipeBrewVariableRow[] | null;
};

export type GulfRecipeListFilters = {
  countrySlug?: GulfDirectoryCountrySlug;
  roasterSlug?: string;
  featuredOnly?: boolean;
};

export const GULF_RECIPE_SELECT = `
  id, title, slug, description, cover_image_url, difficulty, tasting_notes, featured,
  brew_method, is_iced, rating, coffee_beans, roast_level, bean_origin, process,
  roast_date_label, producer, variety, brewing_tips,
  sweetness, acidity, body, bitterness,
  flavor_sweetness, flavor_acidity, flavor_body, flavor_bitterness, flavor_finish,
  similar_slugs,
  estimated_brew_time, total_brew_time, grind_size, ratio,
  coffee_dose, water_amount, water_temperature, source_url,
  water_recommendation, equipment_notes,
  roaster_id, country_id, city_id,
  roasters:roaster_id ( id, name, slug, city ),
  countries:country_id ( id, slug, name ),
  cities:city_id ( id, name, slug ),
  recipe_steps ( id, recipe_id, step_key, pour_number, water_amount, time_label, notes, at_seconds, duration_seconds, sort_order ),
  recipe_equipment ( id, recipe_id, name, detail, sort_order ),
  recipe_flavor_notes ( id, recipe_id, note, sort_order ),
  recipe_brew_variables ( id, recipe_id, key, value, sort_order )
` as const;

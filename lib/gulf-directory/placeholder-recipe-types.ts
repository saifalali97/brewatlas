import type { GulfDirectoryCountrySlug } from "@/lib/gulf-directory/countries";
import type { Difficulty } from "@/types/homepage";

export type PlaceholderRecipeStep = {
  id: string;
  pourNumber: number;
  waterAmount: string;
  timeLabel: string;
  notes: string;
  /** Seconds from brew start — used by the timeline. */
  atSeconds: number;
  durationSeconds: number;
};

export type PlaceholderFlavorProfile = {
  sweetness: number;
  acidity: number;
  body: number;
  bitterness: number;
  finish: number;
};

export type PlaceholderRecipeDetail = {
  slug: string;
  name: string;
  lead: string;
  image: string;
  roasterName: string;
  roasterSlug: string;
  countrySlug: GulfDirectoryCountrySlug;
  city: string;
  brewMethod: string;
  difficulty: Difficulty;
  rating: number;
  brewTime: string;
  isIced: boolean;
  coffeeBeans: string;
  roastLevel: string;
  origin: string;
  process: string;
  roastDate: string;
  water: string;
  grinder: string;
  brewer: string;
  filter: string;
  dose: string;
  waterAmount: string;
  temperature: string;
  ratio: string;
  grindSize: string;
  bloom: string;
  totalBrewTime: string;
  steps: PlaceholderRecipeStep[];
  flavorProfile: PlaceholderFlavorProfile;
  tastingNotes: string;
  flavorTags: string[];
  equipment: Array<{ name: string; detail: string }>;
  similarSlugs: string[];
  /** Optional seed fields preserved for Supabase migration / future UI. */
  producer?: string | null;
  variety?: string | null;
  tds?: string | null;
  extractionYield?: string | null;
  brewingTips?: string | null;
  featured?: boolean;
};

import type { BrewMethodKey } from "@/lib/data/directory/seeds/recipe-methods";
import type { Difficulty } from "@/types/homepage";

/** Compact Gulf recipe seed — expanded via method templates + roaster lookup. */
export type GulfRecipeSeed = {
  slug: string;
  name: string;
  roasterSlug: string;
  methodKey: BrewMethodKey;
  difficulty: Difficulty;
  coffeeBeans: string;
  producer: string | null;
  variety: string | null;
  roastLevel: string;
  origin: string;
  process: string;
  tastingNotes: string;
  flavorTags: string[];
  lead: string;
  brewingTips: string;
  grindSetting: string | null;
  tds: string | null;
  extractionYield: string | null;
  rating: number;
  featured: boolean;
};

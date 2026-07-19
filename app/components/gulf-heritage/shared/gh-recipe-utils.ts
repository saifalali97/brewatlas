import type { GulfHeritageRecipeIngredient } from "@/types/gulf-heritage-recipe";
import {
  Coffee,
  CupSoda,
  Filter,
  Flame,
  GlassWater,
  CookingPot,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";

export type CategorizedIngredients = {
  main: readonly GulfHeritageRecipeIngredient[];
  optional: readonly GulfHeritageRecipeIngredient[];
  garnishes: readonly GulfHeritageRecipeIngredient[];
  notes: readonly string[];
};

export function categorizeRecipeIngredients(
  ingredients: readonly GulfHeritageRecipeIngredient[],
): CategorizedIngredients {
  const main: GulfHeritageRecipeIngredient[] = [];
  const optional: GulfHeritageRecipeIngredient[] = [];
  const garnishes: GulfHeritageRecipeIngredient[] = [];
  const notes: string[] = [];

  for (const item of ingredients) {
    const noteLower = item.notes?.toLowerCase() ?? "";
    if (noteLower.includes("optional")) {
      optional.push(item);
    } else if (noteLower.includes("garnish")) {
      garnishes.push(item);
    } else {
      main.push(item);
      if (item.notes && !noteLower.includes("optional")) {
        notes.push(`${item.name}: ${item.notes}`);
      }
    }
  }

  return { main, optional, garnishes, notes };
}

export function formatIngredientLine(item: GulfHeritageRecipeIngredient): string {
  const quantity = [item.amount, item.unit].filter(Boolean).join(" ");
  return [quantity, item.name].filter(Boolean).join(" ");
}

const EQUIPMENT_ICON_RULES: Array<{ pattern: RegExp; icon: LucideIcon }> = [
  { pattern: /saucepan|pot|kettle|dallah|kuwar/i, icon: CookingPot },
  { pattern: /strainer|filter|sieve/i, icon: Filter },
  { pattern: /carafe|teapot|server/i, icon: Coffee },
  { pattern: /cup|glass|finjan|mug/i, icon: CupSoda },
  { pattern: /fire|stove|burner|grill|tawa/i, icon: Flame },
  { pattern: /water|pitcher/i, icon: GlassWater },
];

export function getEquipmentIcon(name: string): LucideIcon {
  for (const rule of EQUIPMENT_ICON_RULES) {
    if (rule.pattern.test(name)) return rule.icon;
  }
  return UtensilsCrossed;
}

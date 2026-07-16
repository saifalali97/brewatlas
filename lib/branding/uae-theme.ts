/**
 * UAE Brand Theme — legacy module.
 * Color tokens now canonical in `lib/design-system/atlas-canon.ts`.
 * CSS variables `--color-uae-*` map to Atlas Canon in `app/globals.css`.
 */

import { acColorHex } from "@/lib/design-system/atlas-canon";

/** @deprecated Use acColorHex from `@/lib/design-system/atlas-canon` */
export const UAE_BRAND_COLORS = {
  sand: acColorHex.dune,
  sandDeep: acColorHex.copper,
  palm: acColorHex.palm,
  palmDeep: "#3a4a38",
  darkCoffee: acColorHex.charcoal,
  darkCoffeeDeep: acColorHex.espresso,
  warmGold: acColorHex.gold,
  warmGoldDeep: acColorHex.copper,
  pearl: acColorHex.pearl,
  pearlDeep: acColorHex.sand,
} as const;

export type UaeBrandColorToken = keyof typeof UAE_BRAND_COLORS;

/** Tailwind utility class names for each token. */
export const uaeBrandClass = {
  bg: (token: UaeBrandColorToken) => `bg-uae-${kebab(token)}`,
  text: (token: UaeBrandColorToken) => `text-uae-${kebab(token)}`,
  border: (token: UaeBrandColorToken) => `border-uae-${kebab(token)}`,
};

function kebab(token: string): string {
  return token.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

/** Brand copy for UAE heritage surfaces — content only, not design tokens. */
export const UAE_BRAND_STORY = {
  eyebrow: "Emirati Coffee Heritage",
  tagline: "Sand, hospitality, and a slow-poured cup of qahwa.",
  description:
    "A premium look at coffee's place in Emirati life — from the dunes and the majlis to the brass dallah and the finjan passed hand to hand.",
} as const;

export const HERITAGE_CATEGORY_ICON_NAMES: Record<string, string> = {
  history: "ScrollText",
  majlis: "Users",
  hospitality: "HeartHandshake",
  etiquette: "HandHeart",
  dallah: "Coffee",
  finjan: "CupSoda",
  serving: "Sparkles",
  unesco: "Landmark",
};

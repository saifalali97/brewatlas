/**
 * UAE Brand Theme -- a reusable design-token system for premium
 * UAE-inspired surfaces (heritage cards, featured roasters, the coffee
 * map, the Emirati Coffee Guide). Deliberately does not touch any
 * existing color, spacing, or typography token in
 * `lib/constants/styles.ts` -- this is an additive palette that new
 * components opt into, inspired by dunes, palm groves, dark-roasted
 * coffee, brass dallahs, and pearl-white Gulf architecture rather than
 * the UAE flag's colors.
 *
 * Matching CSS variables live in `app/globals.css` (`--uae-*`), bridged
 * into Tailwind v4 as `--color-uae-*` so any new component can use
 * `bg-uae-sand`, `text-uae-warm-gold`, `border-uae-palm-deep`, etc.
 * without a class list change here going stale.
 */

export const UAE_BRAND_COLORS = {
  sand: "#c9a876",
  sandDeep: "#a9835a",
  palm: "#3f5c3f",
  palmDeep: "#2b4030",
  darkCoffee: "#231710",
  darkCoffeeDeep: "#150e09",
  warmGold: "#c08a2e",
  warmGoldDeep: "#8f651c",
  pearl: "#f3ede3",
  pearlDeep: "#e4d9c4",
} as const;

export type UaeBrandColorToken = keyof typeof UAE_BRAND_COLORS;

/** Tailwind utility class names for each token, for components that prefer referencing a constant over hand-writing `bg-uae-sand` / `text-uae-warm-gold` strings. */
export const uaeBrandClass = {
  bg: (token: UaeBrandColorToken) => `bg-uae-${kebab(token)}`,
  text: (token: UaeBrandColorToken) => `text-uae-${kebab(token)}`,
  border: (token: UaeBrandColorToken) => `border-uae-${kebab(token)}`,
};

function kebab(token: string): string {
  return token.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
}

/** Short, reusable brand copy for surfaces that introduce the UAE identity (e.g. the "Featured UAE Coffee" homepage banner) -- kept separate from any specific page's copy so it can be reused consistently. */
export const UAE_BRAND_STORY = {
  eyebrow: "Emirati Coffee Heritage",
  tagline: "Sand, hospitality, and a slow-poured cup of qahwa.",
  description:
    "A premium look at coffee's place in Emirati life -- from the dunes and the majlis to the brass dallah and the finjan passed hand to hand.",
} as const;

/** Category -> Lucide icon name mapping for heritage highlights, kept as plain strings (not component references) so this module has zero React dependency; card components resolve the name to a `LucideIcon` themselves. */
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

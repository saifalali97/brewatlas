/**
 * Recipes Directory design tokens.
 * Pixel-locked values shared by Gulf hub, country, roaster, and placeholder recipe surfaces.
 * Do not fold into Atlas Canon — radii/surfaces differ (24px cards, #FDFCF8 page wash).
 */

import { acFocus } from "@/lib/design-system/atlas-canon";

export const rdColorHex = {
  page: "#FDFCF8",
  sandSoft: "#F5EFE4",
  sandWarm: "#F7F1E8",
  sandHover: "#E8DCC8",
  dune: "#D4C4A8",
  gold: "#C4A574",
  copper: "#A67B4A",
  copperDeep: "#8B6914",
  espresso: "#1A1410",
  white: "#FFFFFF",
} as const;

export const rdSurface = {
  page: "bg-[#FDFCF8]",
  card: "bg-white",
  cardMuted: "bg-white/80",
  sandSoft: "bg-[#F5EFE4]",
  sandWarm: "bg-[#F7F1E8]",
  sandHover: "bg-[#E8DCC8]",
} as const;

export const rdRadius = {
  card: "rounded-[24px]",
  filter: "rounded-[20px]",
  pill: "rounded-full",
} as const;

export const rdShadow = {
  card: "shadow-[0_4px_24px_rgba(26,20,16,0.045)]",
  cardHover: "hover:shadow-[0_14px_40px_rgba(26,20,16,0.10)]",
  hero: "shadow-[0_8px_40px_rgba(26,20,16,0.08)]",
  filter: "shadow-[0_4px_20px_rgba(26,20,16,0.03)]",
  logo: "shadow-[0_8px_24px_rgba(26,20,16,0.12)]",
} as const;

export const rdMotion = {
  card: "transition-[transform,box-shadow] duration-300 ease-out",
  countryHover: "hover:-translate-y-[6px]",
  roasterHover: "hover:-translate-y-[4px]",
  imageZoom: "transition-transform duration-300 ease-out group-hover:scale-[1.03]",
  imageZoomSlow: "transition-transform duration-500 group-hover:scale-[1.03]",
} as const;

export const rdBorder = {
  gold22: "border border-[#C4A574]/22",
  gold20: "border border-[#C4A574]/20",
  gold30: "border border-[#C4A574]/30",
  gold55: "border border-[#C4A574]/55",
  dune45: "border-[#D4C4A8]/45",
} as const;

export const rdLayout = {
  container: "mx-auto max-w-[1200px] px-6 sm:px-8 lg:px-10",
  sectionStack: "mt-8 space-y-14 sm:mt-10 sm:space-y-16",
  cardGrid: "grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3",
  recipeGrid: "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3",
  gridGap: "mt-8",
  recipeImage: "relative h-44 overflow-hidden sm:h-48",
  countryImage: "relative h-[235px] w-full overflow-hidden",
} as const;

export const rdTypography = {
  sectionTitle:
    "font-display text-[1.75rem] font-bold tracking-[-0.03em] text-[#1A1410] sm:text-[2rem]",
  sectionDescription: "mt-2.5 text-[0.9375rem] leading-[1.7] text-[#1A1410]/60",
  ctaDescription: "mt-3 text-[0.9375rem] leading-[1.7] text-[#1A1410]/60",
  cardTitleLg:
    "font-display text-[1.5rem] font-bold leading-[1.15] tracking-[-0.03em] text-[#1A1410]",
  cardTitleMd:
    "font-display text-[1.25rem] font-bold leading-snug tracking-[-0.03em] text-[#1A1410]",
  recipeTitle:
    "font-display text-lg leading-snug tracking-[-0.02em] text-ba-espresso transition-colors group-hover:text-ba-bronze",
  filterLabel:
    "block text-[0.75rem] font-medium uppercase tracking-[0.06em] text-[#1A1410]/45",
  meta: "text-[13px] text-[#1A1410]/55",
  metaMuted: "text-[0.8125rem] text-[#1A1410]/55",
  empty: "mt-10 text-[0.9375rem] leading-relaxed text-[#1A1410]/60",
  ink: "text-[#1A1410]",
  copper: "text-[#A67B4A]",
  gold: "text-[#C4A574]",
} as const;

export const rdButton = {
  explore: `inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-full border border-[#C4A574]/55 bg-[#F5EFE4] px-4 text-[13px] font-medium text-[#A67B4A] transition-colors duration-300 hover:border-[#C4A574]/90 hover:bg-[#E8DCC8] hover:text-[#8B6914] ${acFocus.ring}`,
  exploreNarrow: `inline-flex h-11 w-full max-w-[220px] items-center justify-center gap-1.5 rounded-full border border-[#C4A574]/55 bg-[#F5EFE4] px-4 text-[13px] font-medium text-[#A67B4A] transition-colors duration-300 hover:border-[#C4A574]/90 hover:bg-[#E8DCC8] hover:text-[#8B6914] ${acFocus.ring}`,
  pill: `inline-flex h-11 items-center justify-center gap-1.5 rounded-full border border-[#C4A574]/55 bg-[#F5EFE4] px-5 text-[13px] font-medium text-[#A67B4A] transition-colors duration-300 hover:border-[#C4A574]/90 hover:bg-[#E8DCC8] hover:text-[#8B6914] ${acFocus.ring}`,
  pillSolid: `inline-flex h-11 items-center justify-center gap-1.5 rounded-full bg-[#1A1410] px-5 text-[13px] font-medium text-[#FDFCF8] transition-colors duration-300 hover:bg-[#3D2E24] ${acFocus.ring}`,
  navLink: `inline-flex items-center gap-1.5 text-[0.875rem] font-medium text-[#A67B4A] transition-colors hover:text-[#8B6914] ${acFocus.ring}`,
} as const;

export const rdCard = {
  shell: `group flex h-full flex-col overflow-hidden ${rdRadius.card} ${rdBorder.gold22} ${rdSurface.card} ${rdShadow.card} ${rdMotion.card}`,
  country: `group flex h-full flex-col overflow-hidden ${rdRadius.card} ${rdBorder.gold22} ${rdSurface.card} ${rdShadow.card} ${rdMotion.card} ${rdMotion.countryHover} ${rdShadow.cardHover}`,
  roaster: `group flex h-full flex-col overflow-hidden ${rdRadius.card} ${rdBorder.gold22} ${rdSurface.card} p-6 ${rdShadow.card} ${rdMotion.card} ${rdMotion.roasterHover} ${rdShadow.cardHover}`,
  recipe: `group relative flex h-full flex-col overflow-hidden ${rdRadius.card} ${rdBorder.gold22} ${rdSurface.card} ${rdShadow.card} ${rdMotion.card} ${rdMotion.roasterHover} ${rdShadow.cardHover}`,
  panel: `overflow-hidden ${rdRadius.card} ${rdBorder.gold22} ${rdSurface.card} ${rdShadow.card}`,
  warmPanel: `relative overflow-hidden ${rdRadius.card} ${rdBorder.gold22} ${rdSurface.sandWarm}`,
  verified: `relative flex h-full flex-col overflow-hidden ${rdRadius.card} ${rdBorder.gold22} ${rdSurface.sandWarm} ${rdShadow.card}`,
  filter: `mt-6 grid grid-cols-1 gap-3 ${rdRadius.filter} ${rdBorder.gold20} ${rdSurface.cardMuted} p-4 ${rdShadow.filter} sm:grid-cols-2 lg:grid-cols-4`,
  iconWell: `flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${rdSurface.sandSoft}`,
  logoBadge:
    "relative flex h-[100px] w-[100px] items-center justify-center overflow-hidden rounded-full border-[3px] border-white bg-white shadow-[0_8px_24px_rgba(26,20,16,0.12)]",
  roasterLogo:
    "relative flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#C4A574]/30 bg-[#FDFCF8]",
  imageOverlay:
    "absolute inset-0 bg-gradient-to-t from-[#1A1410]/90 via-[#1A1410]/25 to-transparent",
  recipeBody: "flex flex-1 flex-col p-5 sm:p-6",
  recipeFooter: "mt-5 border-t border-[#1A1410]/[0.06] pt-4",
} as const;

export const rdIcon = {
  copper: "text-[#A67B4A]",
  gold: "text-[#C4A574]",
} as const;

function joinClasses(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export { joinClasses as rdJoin };

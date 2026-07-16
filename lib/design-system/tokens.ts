/**
 * BrewAtlas Design System — backward-compatible token layer.
 * Canonical source: `lib/design-system/atlas-canon.ts`
 * @deprecated Import from `@/lib/design-system/atlas-canon` for new code.
 */

import {
  acBorder,
  acElevation,
  acFocus,
  acGrid,
  acMotion,
  acPhotoGrade,
  acRadius,
  acSectionPadding,
  acSectionRhythm,
  acShadow,
  acSurface,
  acText,
  acTypography,
  type AcSectionRhythm,
} from "./atlas-canon";

export type { AcSectionRhythm };

/** @deprecated Use acSurface — kept for existing imports */
export const dsColors = {
  page: acSurface.page,
  pageHex: acSurface.pageHex,
  pageDark: acSurface.chapterDark,
  pageDarkHex: "#1a1410",
  footer: acSurface.chapterDark,
  footerHex: "#1a1410",
  surface: "bg-ac-espresso/[0.04]",
  surfaceRaised: "bg-ac-espresso/[0.06]",
  surfaceDark: "bg-white/[0.04]",
  surfaceDarkRaised: "bg-white/[0.07]",
  border: acBorder.subtle,
  borderStrong: acBorder.strong,
  borderDark: acBorder.onDark,
  borderAccent: acBorder.accent,
  textPrimary: acText.primary,
  textSecondary: acText.secondary,
  textMuted: acText.muted,
  textOnDark: acText.onDark,
  textSecondaryOnDark: acText.secondaryOnDark,
  textMutedOnDark: acText.mutedOnDark,
  textAccent: acText.accent,
  textAccentOnDark: acText.accentOnDark,
  accent: "text-ac-gold",
  accentBg: acSurface.chapterDark,
  accentBgHover: "hover:bg-ac-charcoal",
} as const;

/** @deprecated Use acSectionRhythm — class strings unchanged for compat */
export const dsSectionThemes = {
  light: "section-light pearl-texture",
  sand: "section-sand pearl-texture",
  pearl: "section-pearl",
  dark: "section-dark hero-grain",
  espresso: "section-espresso-gradient hero-grain",
} as const;

export type DsSectionTheme = keyof typeof dsSectionThemes;

export const dsSpace = {
  1: "2",
  2: "4",
  3: "6",
  4: "8",
  5: "12",
  6: "16",
  7: "24",
  8: "32",
  9: "40",
} as const;

export const dsRadius = {
  sm: acRadius.md,
  md: "rounded-xl",
  lg: acRadius.lg,
  xl: "rounded-3xl",
  card: acRadius.card,
  pill: acRadius.full,
  full: acRadius.full,
} as const;

export const dsShadow = {
  sm: acShadow.sm,
  md: acShadow.md,
  lg: acShadow.lg,
  header: acShadow.header,
  headerDark: acShadow.headerDark,
  goldGlow: "shadow-[0_0_36px_rgba(196,165,116,0.18)]",
  goldGlowStrong: "shadow-[0_0_36px_rgba(196,165,116,0.32)]",
  cardHover: "shadow-[0_24px_56px_-18px_rgba(26,20,16,0.14)]",
} as const;

export const dsElevation = {
  flat: acElevation.flat,
  raised: acElevation.raised,
  floating: acElevation.floating,
  floatingDark: acElevation.floatingDark,
  overlay: acElevation.overlay,
} as const;

export const dsMotion = {
  easing: acMotion.easing,
  durationFast: "duration-200",
  duration: "duration-300",
  durationSlow: "duration-500",
  durationReveal: acMotion.reveal,
  transition: acMotion.transition,
  transitionSlow: acMotion.transitionPassage,
  reduce: acMotion.reduce,
} as const;

export const dsFocus = {
  ring: acFocus.ring,
  ringDark: acFocus.ringDark,
  ringInset: acFocus.ringInset,
} as const;

export const dsTypography = {
  eyebrow: acTypography.eyebrow,
  eyebrowDark: acTypography.eyebrowDark,
  display: acTypography.displayLg,
  displayDark: acTypography.displayLgDark,
  h1: acTypography.h1,
  h1Dark: acTypography.h1Dark,
  h2: acTypography.h2,
  h2Dark: acTypography.h2Dark,
  h3: acTypography.h3,
  h3Dark: acTypography.h3Dark,
  body: acTypography.body,
  bodyDark: acTypography.bodyDark,
  bodyCentered: acTypography.bodyCentered,
  label: acTypography.label,
  caption: acTypography.caption,
  captionDark: acTypography.captionDark,
  nav: acTypography.nav,
} as const;

export const dsLayout = {
  container: acGrid.container,
  containerWide: acGrid.containerWide,
  containerNarrow: acGrid.containerNarrow,
  headerHeight: "h-[4.5rem]",
  pagePx: acGrid.pagePx,
} as const;

export {
  acBorder,
  acElevation,
  acFocus,
  acGrid,
  acMotion,
  acPhotoGrade,
  acRadius,
  acSectionPadding,
  acSectionRhythm,
  acShadow,
  acSurface,
  acText,
  acTypography,
};

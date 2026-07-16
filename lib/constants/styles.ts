/**
 * Design tokens — class strings for the BrewAtlas premium UI.
 */

import {
  dsColors,
  dsElevation,
  dsFocus,
  dsLayout,
  dsMotion,
  dsRadius,
  dsSectionThemes,
  dsShadow,
  dsTypography,
} from "@/lib/design-system/tokens";

export const colors = {
  pageBackground: dsColors.pageHex,
  footerBackground: dsColors.footerHex,
} as const;

export const easing = {
  premium: dsMotion.easing,
} as const;

export const sectionPadding = {
  standard: "px-6 py-32 sm:px-8 md:py-40 lg:px-12 lg:py-48 xl:px-16",
  compact: "px-6 py-28 sm:px-8 md:py-36 lg:px-12 lg:py-40 xl:px-16",
  hero: "px-6 pb-24 pt-28 sm:px-8 lg:px-12 lg:pb-32 lg:pt-36 xl:px-16",
} as const;

export const sectionThemes = dsSectionThemes;

export const typography = {
  eyebrow: dsTypography.eyebrow,
  eyebrowDark: dsTypography.eyebrowDark,
  sectionTitleModern: dsTypography.h1,
  sectionTitleDark: dsTypography.h1Dark,
  sectionTitleLegacy:
    "font-display mt-5 text-3xl leading-[1.08] tracking-[-0.03em] text-ba-espresso sm:text-4xl lg:text-[2.875rem]",
  sectionLead: `mt-7 max-w-xl ${dsTypography.body}`,
  sectionLeadCentered: `mx-auto mt-7 max-w-xl ${dsTypography.bodyCentered}`,
  sectionLeadDark: `mt-7 max-w-xl ${dsTypography.bodyDark}`,
} as const;

export const layout = {
  container: dsLayout.container,
  containerWide: dsLayout.containerWide,
  sectionDividerTop:
    "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ba-espresso/[0.08] to-transparent",
  sectionDividerTopDark:
    "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent",
  sectionFadeTop:
    "pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-ba-ivory via-ba-ivory/80 to-transparent",
  introBlock: "mb-16 max-w-2xl md:mb-20 lg:mb-24",
  introBlockCentered: "mb-20 text-center md:mb-24 lg:mb-28",
} as const;

export const cards = {
  testimonial: `${dsRadius.card} border border-ba-espresso/[0.06] bg-ba-pearl ${dsShadow.sm} ${dsMotion.transition} hover:-translate-y-1 hover:border-ba-gold/25 hover:shadow-[0_24px_48px_-16px_rgba(28,22,18,0.12)] ${dsMotion.reduce}`,
  testimonialDark: `${dsRadius.card} border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl ${dsShadow.md} ${dsMotion.transition} hover:-translate-y-1 hover:border-ba-gold/25 ${dsMotion.reduce}`,
  premiumShell: `group relative flex h-full flex-col overflow-hidden ${dsRadius.card} border border-ba-espresso/[0.08] bg-ba-pearl ${dsShadow.md} ${dsMotion.transition} hover:-translate-y-1 hover:border-ba-gold/30 hover:shadow-[0_24px_56px_-18px_rgba(28,22,18,0.12)] motion-reduce:transition-none motion-reduce:hover:translate-y-0`,
  premiumShellDark: `group relative flex h-full flex-col overflow-hidden ${dsRadius.card} border border-white/[0.1] bg-white/[0.04] backdrop-blur-2xl ${dsShadow.md} ${dsMotion.transition} hover:-translate-y-1 hover:border-ba-gold/30 motion-reduce:transition-none motion-reduce:hover:translate-y-0`,
  premiumSheen: `pointer-events-none absolute inset-0 ${dsRadius.card} bg-gradient-to-b from-ba-pearl via-transparent to-transparent`,
  premiumGlow:
    "pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-ba-gold/10 opacity-60 blur-3xl transition-opacity duration-300 group-hover:opacity-100",
  imageOverlay:
    "absolute inset-0 bg-gradient-to-t from-ba-espresso/90 via-ba-espresso/25 to-transparent",
  imageAmberWash:
    "absolute inset-0 bg-gradient-to-br from-ba-gold/10 via-transparent to-ba-espresso/30",
  imageRadial:
    "absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(184,149,107,0.1),transparent_55%)]",
} as const;

export const buttons = {
  focusRing: dsFocus.ring,
  focusRingDark: dsFocus.ringDark,
  primary: `inline-flex h-12 min-w-[180px] items-center justify-center ${dsRadius.full} bg-ba-espresso px-8 text-sm font-medium tracking-[-0.01em] text-ba-pearl ${dsMotion.transition} hover:bg-ba-charcoal hover:shadow-[0_12px_40px_-12px_rgba(28,22,18,0.35)] active:scale-[0.98] ${dsFocus.ring}`,
  primaryLight: `inline-flex h-12 min-w-[180px] items-center justify-center ${dsRadius.full} bg-ba-pearl px-8 text-sm font-medium tracking-[-0.01em] text-ba-espresso ${dsMotion.transition} hover:bg-ba-sand hover:shadow-[0_12px_40px_-12px_rgba(255,252,247,0.2)] active:scale-[0.98] ${dsFocus.ringDark}`,
  secondary: `inline-flex h-12 min-w-[180px] items-center justify-center ${dsRadius.full} border border-ba-espresso/15 bg-transparent px-8 text-sm font-medium tracking-[-0.01em] text-ba-espresso backdrop-blur-sm ${dsMotion.transition} hover:border-ba-bronze/40 hover:bg-ba-espresso/[0.04] active:scale-[0.98] ${dsFocus.ring}`,
  secondaryDark: `inline-flex h-12 min-w-[180px] items-center justify-center ${dsRadius.full} border border-white/[0.18] bg-white/[0.04] px-8 text-sm font-medium tracking-[-0.01em] text-ba-pearl backdrop-blur-sm ${dsMotion.transition} hover:border-ba-gold/40 hover:bg-white/[0.08] active:scale-[0.98] ${dsFocus.ringDark}`,
  ghostCta: `group/btn inline-flex h-10 w-full items-center justify-center gap-2 ${dsRadius.full} border border-ba-espresso/12 bg-ba-pearl px-5 text-sm font-medium text-ba-espresso ${dsMotion.transition} hover:-translate-y-0.5 hover:border-ba-bronze/35 hover:shadow-[0_8px_24px_-8px_rgba(28,22,18,0.1)] active:scale-[0.98] motion-reduce:hover:translate-y-0`,
  ghostCtaAutoWidth: " sm:w-auto",
  ghostArrow:
    "h-3.5 w-3.5 transition-transform duration-300 group-hover/btn:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover/btn:-translate-x-0.5 motion-reduce:transform-none",
} as const;

export const forms = {
  label: dsTypography.label,
  input: `mt-2 w-full ${dsRadius.md} border border-ba-espresso/12 bg-ba-pearl px-4 py-3 text-sm text-ba-espresso outline-none transition-colors duration-300 placeholder:text-ba-coffee/45 focus:border-ba-bronze/45 focus-visible:ring-2 focus-visible:ring-ba-bronze/25`,
  inputDark: `mt-2 w-full ${dsRadius.md} border border-white/[0.12] bg-white/[0.04] px-4 py-3 text-sm text-ba-pearl outline-none transition-colors duration-300 placeholder:text-ba-sand-deep/50 focus:border-ba-gold/45 focus-visible:ring-2 focus-visible:ring-ba-gold/25`,
  select: `mt-2 w-full appearance-none ${dsRadius.md} border border-ba-espresso/12 bg-ba-pearl px-4 py-3 text-sm text-ba-espresso outline-none transition-colors duration-300 focus:border-ba-bronze/45 ${dsFocus.ring}`,
  readOnlyField: `mt-2 w-full ${dsRadius.md} border border-ba-espresso/08 bg-ba-sand/30 px-4 py-3 text-sm text-ba-coffee`,
  checkboxRow: "flex items-center gap-2.5 text-sm text-ba-coffee",
  checkbox: "h-4 w-4 rounded border-ba-espresso/20 bg-ba-pearl text-ba-bronze focus:ring-ba-bronze/30",
} as const;

export const modal = {
  overlay: `fixed inset-0 z-[90] flex items-center justify-center bg-ba-espresso/80 p-4 backdrop-blur-sm sm:p-6`,
  panel: `relative flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-hidden ${dsRadius.card} border border-ba-espresso/10 bg-ba-pearl shadow-[0_32px_80px_-24px_rgba(28,22,18,0.2)]`,
  header: "flex items-start justify-between gap-4 border-b border-ba-espresso/08 px-6 py-5 sm:px-8 sm:py-6",
  body: "flex-1 overflow-y-auto px-6 py-6 sm:px-8 sm:py-7",
  footer: "flex flex-col gap-3 border-t border-ba-espresso/08 px-6 py-5 sm:flex-row sm:justify-end sm:px-8 sm:py-6",
  closeButton: `flex h-9 w-9 shrink-0 items-center justify-center ${dsRadius.full} border border-ba-espresso/10 bg-ba-sand/40 text-ba-coffee transition-colors duration-300 hover:border-ba-espresso/20 hover:text-ba-espresso ${dsFocus.ring}`,
} as const;

export const meta = {
  tile: `flex items-start gap-2.5 ${dsRadius.md} border border-ba-espresso/06 bg-ba-sand/25 px-3 py-2.5`,
  tileCompact: `flex items-start gap-2 ${dsRadius.md} border border-ba-espresso/06 bg-ba-sand/25 px-3 py-2`,
  label: "text-[9px] font-medium uppercase tracking-[0.14em] text-ba-coffee/55",
  value: "mt-0.5 text-[0.8125rem] font-medium leading-snug text-ba-espresso",
  icon: "mt-0.5 h-3.5 w-3.5 shrink-0 text-ba-bronze/85",
  iconInline: "h-3.5 w-3.5 shrink-0 text-ba-bronze/85",
} as const;

export const surfaces = {
  authCard: `${dsElevation.floating} mx-auto max-w-md p-6 sm:p-8`,
  emptyState: `${dsRadius.card} border border-ba-espresso/08 bg-ba-pearl px-6 py-16 text-center ${dsShadow.sm}`,
} as const;

export const badges = {
  premium: `rounded-full border border-ba-gold/35 bg-ba-gold/12 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-ba-bronze backdrop-blur-xl`,
  premiumCompact: `rounded-full border border-ba-gold/35 bg-ba-gold/12 px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-ba-bronze backdrop-blur-xl`,
  premiumDark: `rounded-full border border-ba-gold/35 bg-ba-gold/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-ba-gold backdrop-blur-xl`,
  tag: `rounded-full border border-ba-espresso/10 bg-ba-sand/50 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-ba-coffee backdrop-blur-xl`,
  accent: `rounded-full border border-ba-bronze/25 bg-ba-bronze/10 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-ba-bronze backdrop-blur-xl`,
  editorsChoice: `flex items-center gap-2 rounded-full border border-ba-gold/35 bg-ba-gold/10 px-4 py-1.5 text-[11px] font-medium text-ba-espresso shadow-[0_0_20px_rgba(184,149,107,0.12)] backdrop-blur-xl`,
} as const;

export const panels = {
  stat: `${dsRadius.lg} border border-ba-espresso/08 bg-ba-pearl px-5 py-4 ${dsShadow.sm}`,
  statIcon: `flex h-10 w-10 shrink-0 items-center justify-center ${dsRadius.md} border border-ba-gold/20 bg-ba-gold/10 text-ba-bronze`,
  link: `${dsRadius.lg} border border-ba-espresso/08 bg-ba-pearl px-5 py-4 ${dsShadow.sm} ${dsMotion.transition} hover:-translate-y-0.5 hover:border-ba-gold/25 hover:shadow-[0_16px_40px_-16px_rgba(28,22,18,0.1)] motion-reduce:hover:translate-y-0`,
  profile: `${dsRadius.lg} border border-ba-espresso/08 bg-ba-pearl p-6 ${dsShadow.sm}`,
} as const;

export const filterChips = {
  base: `min-h-11 rounded-full border px-4 py-2.5 text-sm font-medium ${dsMotion.transition} hover:-translate-y-0.5 active:scale-[0.98] motion-reduce:hover:translate-y-0 ${dsFocus.ring}`,
  active: "border-ba-bronze/35 bg-ba-bronze/10 text-ba-espresso shadow-[0_0_24px_rgba(154,115,72,0.1)]",
  inactive: "border-ba-espresso/10 bg-ba-pearl text-ba-coffee/70 hover:border-ba-bronze/25 hover:bg-ba-sand/50 hover:text-ba-espresso",
} as const;

export { dsColors, dsElevation, dsFocus, dsLayout, dsMotion, dsRadius, dsShadow, dsTypography, dsSectionThemes };

/** Atlas Canon — canonical design system (Phase 0+) */
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
  acColorHex,
} from "@/lib/design-system/atlas-canon";

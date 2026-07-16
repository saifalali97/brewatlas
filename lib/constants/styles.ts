/**
 * Design tokens — class strings for the BrewAtlas UI.
 * Built on DS v2 (`lib/design-system/tokens.ts`); existing exports preserved
 * for backward compatibility across the codebase.
 */

import {
  dsColors,
  dsElevation,
  dsFocus,
  dsLayout,
  dsMotion,
  dsRadius,
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
  standard:
    "px-6 py-40 sm:px-8 md:py-44 lg:px-12 lg:py-48",
  compact:
    "px-6 py-36 sm:px-8 md:py-40 lg:px-12 lg:py-44",
} as const;

export const typography = {
  eyebrow: dsTypography.eyebrow,
  sectionTitleModern: dsTypography.h1,
  sectionTitleLegacy:
    "font-display mt-5 text-3xl leading-[1.08] tracking-[-0.03em] text-uae-pearl sm:text-4xl lg:text-[2.875rem]",
  sectionLead: `mt-7 max-w-xl ${dsTypography.body}`,
  sectionLeadCentered: `mx-auto mt-7 max-w-xl ${dsTypography.bodyCentered}`,
} as const;

export const layout = {
  container: dsLayout.container,
  sectionDividerTop:
    "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent",
  sectionFadeTop:
    "pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-uae-dark-coffee-deep via-uae-dark-coffee-deep/80 to-transparent",
  introBlock: "mb-14 max-w-2xl md:mb-16 lg:mb-20",
  introBlockCentered: "mb-20 text-center md:mb-24",
} as const;

export const cards = {
  testimonial: `${dsRadius.card} border border-white/[0.05] bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-transparent ${dsShadow.sm} ${dsMotion.transition} hover:-translate-y-1.5 hover:border-uae-warm-gold/20 hover:from-white/[0.06] hover:shadow-[0_36px_72px_-24px_rgba(192,138,46,0.16)] ${dsMotion.reduce}`,
  premiumShell: `group relative flex h-full flex-col overflow-hidden ${dsRadius.card} border border-white/[0.11] bg-gradient-to-br from-white/[0.08] via-white/[0.035] to-white/[0.01] ${dsShadow.md} backdrop-blur-2xl ${dsMotion.transition} hover:-translate-y-1.5 hover:border-uae-warm-gold/32 hover:shadow-[0_24px_56px_-18px_rgba(192,138,46,0.24),0_0_0_1px_rgba(192,138,46,0.08)] motion-reduce:transition-none motion-reduce:hover:translate-y-0`,
  premiumSheen: `pointer-events-none absolute inset-0 ${dsRadius.card} bg-gradient-to-b from-white/[0.07] via-transparent to-transparent`,
  premiumGlow:
    "pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-uae-warm-gold/8 opacity-60 blur-3xl transition-opacity duration-300 group-hover:opacity-100",
  imageOverlay:
    "absolute inset-0 bg-gradient-to-t from-uae-dark-coffee-deep/95 via-uae-dark-coffee-deep/35 to-uae-dark-coffee-deep/12",
  imageAmberWash:
    "absolute inset-0 bg-gradient-to-br from-uae-warm-gold-deep/14 via-transparent to-uae-dark-coffee-deep/40",
  imageRadial:
    "absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(192,138,46,0.08),transparent_55%)]",
} as const;

export const buttons = {
  focusRing: dsFocus.ring,
  primary: `inline-flex h-12 min-w-[180px] items-center justify-center ${dsRadius.full} bg-uae-pearl px-8 text-sm font-medium tracking-[-0.01em] text-uae-dark-coffee-deep ${dsMotion.transition} hover:bg-uae-pearl-deep hover:shadow-[0_14px_44px_rgba(243,237,227,0.14)] active:scale-[0.98] ${dsFocus.ring}`,
  secondary: `inline-flex h-12 min-w-[180px] items-center justify-center ${dsRadius.full} border border-white/[0.12] bg-white/[0.04] px-8 text-sm font-medium tracking-[-0.01em] text-uae-pearl backdrop-blur-sm ${dsMotion.transition} hover:border-uae-warm-gold/40 hover:bg-white/[0.07] hover:shadow-[0_0_40px_rgba(192,138,46,0.12)] active:scale-[0.98] ${dsFocus.ring}`,
  ghostCta: `group/btn inline-flex h-10 w-full items-center justify-center gap-2 ${dsRadius.full} border border-white/[0.12] bg-white/[0.06] px-5 text-sm font-medium text-uae-pearl shadow-[inset_0_1px_0_rgba(255,255,255,0.09)] backdrop-blur-2xl ${dsMotion.transition} hover:-translate-y-1 hover:border-uae-warm-gold/45 hover:bg-white/[0.1] hover:shadow-[0_0_36px_rgba(192,138,46,0.22),0_10px_28px_-10px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.14)] active:scale-[0.98] motion-reduce:hover:translate-y-0`,
  ghostCtaAutoWidth: " sm:w-auto",
  ghostArrow:
    "h-3.5 w-3.5 transition-transform duration-300 group-hover/btn:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover/btn:-translate-x-0.5 motion-reduce:transform-none",
} as const;

export const forms = {
  label: dsTypography.label,
  input: `mt-2 w-full ${dsRadius.md} border border-white/[0.1] bg-white/[0.03] px-4 py-3 text-sm text-uae-pearl outline-none transition-colors duration-300 placeholder:text-stone-500 focus:border-uae-warm-gold/45 focus-visible:ring-2 focus-visible:ring-uae-warm-gold/35`,
  select: `mt-2 w-full appearance-none ${dsRadius.md} border border-white/[0.1] bg-white/[0.03] px-4 py-3 text-sm text-uae-pearl outline-none transition-colors duration-300 focus:border-uae-warm-gold/45 ${dsFocus.ring}`,
  readOnlyField: `mt-2 w-full ${dsRadius.md} border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-sm text-stone-300`,
  checkboxRow: "flex items-center gap-2.5 text-sm text-stone-300",
  checkbox: "h-4 w-4 rounded border-white/[0.2] bg-white/[0.03] text-uae-warm-gold focus:ring-uae-warm-gold/40",
} as const;

export const modal = {
  overlay: `fixed inset-0 z-[90] flex items-center justify-center bg-uae-dark-coffee-deep/80 p-4 backdrop-blur-sm sm:p-6`,
  panel: `relative flex max-h-[calc(100vh-2rem)] w-full max-w-2xl flex-col overflow-hidden ${dsRadius.card} border border-white/[0.11] bg-gradient-to-br from-white/[0.08] via-white/[0.035] to-white/[0.01] shadow-[0_32px_80px_-24px_rgba(0,0,0,0.6)] backdrop-blur-2xl`,
  header: "flex items-start justify-between gap-4 border-b border-white/[0.08] px-6 py-5 sm:px-8 sm:py-6",
  body: "flex-1 overflow-y-auto px-6 py-6 sm:px-8 sm:py-7",
  footer:
    "flex flex-col gap-3 border-t border-white/[0.08] px-6 py-5 sm:flex-row sm:justify-end sm:px-8 sm:py-6",
  closeButton: `flex h-9 w-9 shrink-0 items-center justify-center ${dsRadius.full} border border-white/[0.1] bg-white/[0.03] text-stone-400 transition-colors duration-300 hover:border-white/[0.16] hover:bg-white/[0.06] hover:text-uae-pearl ${dsFocus.ring}`,
} as const;

export const meta = {
  tile: `flex items-start gap-2.5 ${dsRadius.md} border border-white/[0.06] bg-white/[0.03] px-3 py-2.5`,
  tileCompact: `flex items-start gap-2 ${dsRadius.md} border border-white/[0.06] bg-white/[0.03] px-3 py-2`,
  label: "text-[9px] font-medium uppercase tracking-[0.14em] text-stone-500",
  value: "mt-0.5 text-[0.8125rem] font-medium leading-snug text-stone-200",
  icon: "mt-0.5 h-3.5 w-3.5 shrink-0 text-uae-warm-gold/80",
  iconInline: "h-3.5 w-3.5 shrink-0 text-uae-warm-gold/80",
} as const;

/** Elevated surface for auth forms and focused panels. */
export const surfaces = {
  authCard: `${dsElevation.floating} mx-auto max-w-md p-6 sm:p-8`,
  emptyState: `${dsRadius.card} border border-white/[0.08] bg-white/[0.02] px-6 py-16 text-center backdrop-blur-sm`,
} as const;

/** Premium chip and badge patterns for cards and detail pages. */
export const badges = {
  premium: `rounded-full border border-uae-warm-gold/35 bg-uae-warm-gold-deep/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-uae-warm-gold/95 backdrop-blur-xl`,
  premiumCompact: `rounded-full border border-uae-warm-gold/35 bg-uae-warm-gold-deep/40 px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] text-uae-warm-gold/95 backdrop-blur-xl`,
  tag: `rounded-full border border-white/[0.14] bg-uae-dark-coffee-deep/50 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-stone-200 backdrop-blur-xl`,
  accent: `rounded-full border border-uae-warm-gold/30 bg-uae-warm-gold-deep/50 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-uae-warm-gold/90 backdrop-blur-xl`,
  editorsChoice: `flex items-center gap-2 rounded-full border border-uae-warm-gold/40 bg-gradient-to-r from-uae-warm-gold-deep/70 to-uae-dark-coffee-deep/60 px-4 py-1.5 text-[11px] font-medium text-uae-pearl shadow-[0_0_28px_rgba(192,138,46,0.15)] backdrop-blur-xl`,
} as const;

/** Dashboard and account panel surfaces. */
export const panels = {
  stat: `${dsRadius.lg} border border-white/[0.09] bg-white/[0.035] px-5 py-4 shadow-[0_16px_40px_-20px_rgba(0,0,0,0.55)] backdrop-blur-2xl`,
  statIcon: `flex h-10 w-10 shrink-0 items-center justify-center ${dsRadius.md} border border-uae-warm-gold/20 bg-uae-warm-gold/8 text-uae-warm-gold/90`,
  link: `${dsRadius.lg} border border-white/[0.09] bg-white/[0.035] px-5 py-4 shadow-[0_16px_40px_-20px_rgba(0,0,0,0.55)] backdrop-blur-2xl ${dsMotion.transition} hover:-translate-y-0.5 hover:border-uae-warm-gold/30 hover:bg-white/[0.05] motion-reduce:hover:translate-y-0`,
  profile: `${dsRadius.lg} border border-white/[0.09] bg-white/[0.035] p-6 shadow-[0_16px_40px_-20px_rgba(0,0,0,0.55)] backdrop-blur-2xl`,
} as const;

/** Active/inactive filter chip styles for explorers. */
export const filterChips = {
  base: `min-h-11 rounded-full border px-4 py-2.5 text-sm font-medium backdrop-blur-xl ${dsMotion.transition} hover:-translate-y-0.5 active:scale-[0.98] motion-reduce:hover:translate-y-0 ${dsFocus.ring}`,
  active: "border-uae-warm-gold/40 bg-uae-warm-gold/10 text-uae-pearl shadow-[0_0_32px_rgba(192,138,46,0.12)]",
  inactive: "border-white/[0.1] bg-white/[0.04] text-stone-400 hover:border-uae-warm-gold/25 hover:bg-white/[0.06] hover:text-stone-200",
} as const;

/** Re-export DS v2 tokens for new components. */
export { dsColors, dsElevation, dsFocus, dsLayout, dsMotion, dsRadius, dsShadow, dsTypography };

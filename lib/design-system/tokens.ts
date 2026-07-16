/**
 * BrewAtlas Design System v3 — premium luxury palette.
 * CSS variables in `app/globals.css`; class helpers for components.
 */

/** Semantic color roles — light-first with dark section variants. */
export const dsColors = {
  page: "bg-ba-ivory",
  pageHex: "#faf7f2",
  pageDark: "bg-ba-espresso",
  pageDarkHex: "#1c1612",
  footer: "bg-ba-espresso",
  footerHex: "#1c1612",
  surface: "bg-ba-espresso/[0.04]",
  surfaceRaised: "bg-ba-espresso/[0.06]",
  surfaceDark: "bg-white/[0.04]",
  surfaceDarkRaised: "bg-white/[0.07]",
  border: "border-ba-espresso/[0.08]",
  borderStrong: "border-ba-espresso/[0.12]",
  borderDark: "border-white/[0.1]",
  borderAccent: "border-ba-gold/35",
  textPrimary: "text-ba-espresso",
  textSecondary: "text-ba-coffee/72",
  textMuted: "text-ba-coffee/52",
  textOnDark: "text-ba-pearl",
  textSecondaryOnDark: "text-ba-sand-deep/90",
  textMutedOnDark: "text-ba-sand-deep/65",
  textAccent: "text-ba-bronze",
  textAccentOnDark: "text-ba-gold",
  accent: "text-ba-gold",
  accentBg: "bg-ba-espresso",
  accentBgHover: "hover:bg-ba-charcoal",
} as const;

/** Section theme presets for alternating homepage rhythm. */
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
  sm: "rounded-lg",
  md: "rounded-xl",
  lg: "rounded-2xl",
  xl: "rounded-3xl",
  card: "rounded-[1.25rem]",
  pill: "rounded-full",
  full: "rounded-full",
} as const;

export const dsShadow = {
  sm: "shadow-[0_2px_16px_-4px_rgba(28,22,18,0.08)]",
  md: "shadow-[0_8px_32px_-12px_rgba(28,22,18,0.12)]",
  lg: "shadow-[0_20px_48px_-16px_rgba(28,22,18,0.16)]",
  header: "shadow-[0_4px_24px_-8px_rgba(28,22,18,0.1)]",
  headerDark: "shadow-[0_8px_32px_-8px_rgba(0,0,0,0.45)]",
  goldGlow: "shadow-[0_0_36px_rgba(184,149,107,0.18)]",
  goldGlowStrong: "shadow-[0_0_36px_rgba(184,149,107,0.32)]",
  cardHover: "shadow-[0_24px_56px_-18px_rgba(28,22,18,0.14)]",
} as const;

export const dsElevation = {
  flat: "",
  raised: `${dsRadius.card} border border-ba-espresso/[0.08] bg-ba-pearl ${dsShadow.sm}`,
  floating: `${dsRadius.card} border border-ba-espresso/[0.08] bg-ba-pearl ${dsShadow.md}`,
  floatingDark: `${dsRadius.card} border border-white/[0.1] bg-white/[0.04] backdrop-blur-2xl ${dsShadow.md}`,
  overlay: "backdrop-blur-2xl backdrop-saturate-150",
} as const;

export const dsMotion = {
  easing: "ease-[cubic-bezier(0.22,1,0.36,1)]",
  durationFast: "duration-200",
  duration: "duration-300",
  durationSlow: "duration-500",
  durationReveal: "duration-700",
  transition: "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
  transitionSlow: "transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
  reduce: "motion-reduce:transition-none motion-reduce:transform-none",
} as const;

export const dsFocus = {
  ring: "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ba-bronze/70",
  ringDark: "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ba-gold/70",
  ringInset: "focus-visible:ring-2 focus-visible:ring-ba-bronze/35 focus-visible:ring-offset-2 focus-visible:ring-offset-ba-ivory",
} as const;

export const dsTypography = {
  eyebrow: "text-[0.8125rem] font-medium uppercase tracking-[0.18em] text-ba-bronze",
  eyebrowDark: "text-[0.8125rem] font-medium uppercase tracking-[0.18em] text-ba-gold/90",
  display:
    "font-display text-[3rem] leading-[1.02] tracking-[-0.035em] text-ba-espresso sm:text-[3.5rem] lg:text-[5rem]",
  displayDark:
    "font-display text-[3rem] leading-[1.02] tracking-[-0.035em] text-ba-pearl sm:text-[3.5rem] lg:text-[5rem]",
  h1: "font-display text-3xl leading-[1.06] tracking-[-0.03em] text-ba-espresso sm:text-4xl lg:text-[3.5rem]",
  h1Dark: "font-display text-3xl leading-[1.06] tracking-[-0.03em] text-ba-pearl sm:text-4xl lg:text-[3.5rem]",
  h2: "font-display text-2xl leading-[1.12] tracking-[-0.025em] text-ba-espresso sm:text-3xl lg:text-[2.5rem]",
  h2Dark: "font-display text-2xl leading-[1.12] tracking-[-0.025em] text-ba-pearl sm:text-3xl lg:text-[2.5rem]",
  h3: "text-xl font-medium leading-[1.3] text-ba-espresso sm:text-2xl",
  h3Dark: "text-xl font-medium leading-[1.3] text-ba-pearl sm:text-2xl",
  body: "text-base leading-[1.75] text-ba-coffee/80 md:text-lg md:leading-[1.8]",
  bodyDark: "text-base leading-[1.75] text-ba-sand-deep/90 md:text-lg md:leading-[1.8]",
  bodyCentered: "mx-auto text-base leading-[1.75] text-ba-coffee/80 md:text-lg md:leading-[1.8]",
  label: "text-sm font-medium text-ba-coffee",
  caption: "text-xs leading-relaxed text-ba-coffee/55",
  captionDark: "text-xs leading-relaxed text-ba-sand-deep/60",
  nav: "text-sm font-medium tracking-[-0.01em]",
} as const;

export const dsLayout = {
  container: "relative mx-auto max-w-6xl",
  containerWide: "relative mx-auto max-w-7xl",
  containerNarrow: "relative mx-auto max-w-3xl",
  headerHeight: "h-[4.5rem]",
  pagePx: "px-6 sm:px-8 lg:px-12 xl:px-16",
} as const;

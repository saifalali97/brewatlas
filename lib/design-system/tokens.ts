/**
 * BrewAtlas Design System v2 — single source of truth for tokens.
 * CSS variables are defined in `app/globals.css` and bridged into Tailwind.
 * Class-string helpers here are consumed by primitives and `lib/constants/styles.ts`.
 */

/** Semantic color roles mapped to Tailwind utilities (uae palette + surfaces). */
export const dsColors = {
  page: "bg-uae-dark-coffee-deep",
  pageHex: "#150e09",
  footer: "bg-uae-dark-coffee",
  footerHex: "#231710",
  surface: "bg-white/[0.03]",
  surfaceRaised: "bg-white/[0.06]",
  surfaceOverlay: "bg-uae-dark-coffee-deep/80",
  border: "border-white/[0.08]",
  borderStrong: "border-white/[0.12]",
  borderAccent: "border-uae-warm-gold/35",
  textPrimary: "text-uae-pearl",
  textSecondary: "text-stone-400",
  textMuted: "text-stone-500",
  textAccent: "text-uae-warm-gold",
  accent: "text-uae-warm-gold",
  accentBg: "bg-uae-warm-gold",
  accentBgHover: "hover:bg-uae-sand",
} as const;

/** 8px base spacing scale — use Tailwind spacing where possible; named for docs. */
export const dsSpace = {
  1: "2", // 8px  → gap-2, p-2
  2: "4", // 16px
  3: "6", // 24px
  4: "8", // 32px
  5: "12", // 48px
  6: "16", // 64px
  7: "24", // 96px
  8: "32", // 128px
  9: "40", // 160px
} as const;

export const dsRadius = {
  sm: "rounded-lg", // 8px
  md: "rounded-xl", // 12px
  lg: "rounded-2xl", // 16px
  xl: "rounded-3xl", // 24px
  card: "rounded-[1.5rem]",
  full: "rounded-full",
} as const;

export const dsShadow = {
  sm: "shadow-[0_4px_24px_-8px_rgba(0,0,0,0.25)]",
  md: "shadow-[0_12px_40px_-16px_rgba(0,0,0,0.48)]",
  lg: "shadow-[0_24px_56px_-18px_rgba(0,0,0,0.55)]",
  header: "shadow-[0_8px_32px_-8px_rgba(0,0,0,0.45)]",
  goldGlow: "shadow-[0_0_36px_rgba(192,138,46,0.22)]",
  goldGlowStrong: "shadow-[0_0_36px_rgba(192,138,46,0.42)]",
} as const;

export const dsElevation = {
  flat: "",
  raised: `${dsRadius.card} border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl`,
  floating: `${dsRadius.card} border border-white/[0.11] bg-gradient-to-br from-white/[0.08] via-white/[0.035] to-white/[0.01] backdrop-blur-2xl ${dsShadow.md}`,
  overlay: "backdrop-blur-2xl backdrop-saturate-150",
} as const;

export const dsMotion = {
  easing: "ease-[cubic-bezier(0.22,1,0.36,1)]",
  durationFast: "duration-200",
  duration: "duration-300",
  durationSlow: "duration-500",
  transition: "transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
  transitionSlow: "transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
  reduce: "motion-reduce:transition-none motion-reduce:transform-none",
} as const;

export const dsFocus = {
  ring: "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-uae-warm-gold/70",
  ringInset: "focus-visible:ring-2 focus-visible:ring-uae-warm-gold/35 focus-visible:ring-offset-2 focus-visible:ring-offset-uae-dark-coffee-deep",
} as const;

export const dsTypography = {
  eyebrow:
    "text-[0.8125rem] font-medium uppercase tracking-[0.14em] text-uae-warm-gold/90",
  display:
    "text-[2.5rem] font-semibold leading-[1.05] tracking-[-0.03em] text-uae-pearl sm:text-5xl lg:text-[4rem]",
  h1: "text-3xl font-semibold leading-[1.08] tracking-[-0.03em] text-uae-pearl sm:text-4xl lg:text-[3.25rem]",
  h2: "text-2xl font-semibold leading-[1.15] tracking-[-0.02em] text-uae-pearl sm:text-3xl",
  h3: "text-xl font-medium leading-[1.3] text-uae-pearl sm:text-2xl",
  body: "text-base leading-[1.65] text-stone-400 md:text-lg md:leading-[1.72]",
  bodyCentered: "mx-auto text-base leading-[1.65] text-stone-400 md:text-lg md:leading-[1.72]",
  label: "text-sm font-medium text-stone-300",
  caption: "text-xs text-stone-500",
  nav: "text-sm font-medium",
} as const;

export const dsLayout = {
  container: "relative mx-auto max-w-6xl",
  containerWide: "relative mx-auto max-w-7xl",
  headerHeight: "h-[4.5rem]",
  pagePx: "px-6 sm:px-8 lg:px-12",
} as const;

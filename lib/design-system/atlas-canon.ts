/**
 * Atlas Canon — BrewAtlas design system foundation (Phase 0).
 * Canonical tokens for color, typography, spacing, grid, motion, elevation.
 * CSS variables live in `app/globals.css` as `--ac-*`.
 * Legacy `--ba-*` and `--uae-*` aliases map here for backward compatibility.
 */

// ---------------------------------------------------------------------------
// Color — raw values
// ---------------------------------------------------------------------------

export const acColorHex = {
  limestone: "#F3EEE6",
  pearl: "#F6F2EB",
  secondary: "#6E675E",
  muted: "#787068",
  sand: "#E8DCC8",
  dune: "#D4C4A8",
  espresso: "#1A1410",
  walnut: "#3D2E24",
  copper: "#A67B4A",
  gold: "#C4A574",
  palm: "#4A5D52",
  mist: "#E5E0D8",
  charcoal: "#2A2520",
} as const;

export type AcColorToken = keyof typeof acColorHex;

/** Tailwind background / text / border utility prefixes for Atlas Canon colors. */
export const acColor = {
  limestone: "ac-limestone",
  pearl: "ac-pearl",
  secondary: "ac-secondary",
  muted: "ac-muted",
  sand: "ac-sand",
  dune: "ac-dune",
  espresso: "ac-espresso",
  walnut: "ac-walnut",
  copper: "ac-copper",
  gold: "ac-gold",
  palm: "ac-palm",
  mist: "ac-mist",
  charcoal: "ac-charcoal",
} as const;

/** Semantic surface roles — prefer these in new composition primitives. */
export const acSurface = {
  page: "bg-ac-limestone",
  pageHex: acColorHex.limestone,
  chapterLight: "bg-ac-pearl",
  chapterSand: "bg-ac-sand",
  chapterDark: "bg-ac-espresso",
  elevated: "bg-ac-pearl",
  plate: "bg-ac-pearl border border-ac-espresso/[0.08]",
  plateDark: "bg-white/[0.04] border border-white/[0.1]",
} as const;

/** Semantic text roles. */
export const acText = {
  primary: "text-ac-espresso",
  secondary: "text-ac-secondary",
  muted: "text-ac-muted",
  onDark: "text-ac-pearl",
  secondaryOnDark: "text-ac-sand/90",
  mutedOnDark: "text-ac-sand/65",
  accent: "text-ac-copper",
  accentOnDark: "text-ac-gold",
  origin: "text-ac-palm",
} as const;

/** Semantic border roles. */
export const acBorder = {
  subtle: "border-ac-espresso/[0.08]",
  strong: "border-ac-espresso/[0.12]",
  emphasis: "border-ac-copper/25",
  onDark: "border-white/[0.1]",
  accent: "border-ac-gold/35",
} as const;

// ---------------------------------------------------------------------------
// Section rhythm — five tonal chapter modes
// ---------------------------------------------------------------------------

export const acSectionRhythm = {
  night: "ac-section-night hero-grain",
  dawn: "ac-section-dawn pearl-texture",
  sand: "ac-section-sand pearl-texture",
  day: "ac-section-day",
  dusk: "ac-section-dusk",
} as const;

export type AcSectionRhythm = keyof typeof acSectionRhythm;

/** Legacy dsSectionThemes → Atlas Canon rhythm mapping. */
export const acLegacySectionThemeMap = {
  light: "dawn",
  sand: "sand",
  pearl: "day",
  dark: "night",
  espresso: "night",
} as const satisfies Record<string, AcSectionRhythm>;

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------

export const acTypography = {
  eyebrow:
    "text-[0.6875rem] font-medium uppercase tracking-[0.20em] text-ac-copper",
  eyebrowDark:
    "text-[0.6875rem] font-medium uppercase tracking-[0.20em] text-ac-gold/90",
  displayXl:
    "font-display text-[5rem] leading-[0.98] tracking-[-0.04em] text-ac-espresso sm:text-[6rem] lg:text-[7rem]",
  displayXlDark:
    "font-display text-[5rem] leading-[0.98] tracking-[-0.04em] text-ac-pearl sm:text-[6rem] lg:text-[7rem]",
  displayLg:
    "font-display text-[3.5rem] leading-[1.02] tracking-[-0.035em] text-ac-espresso sm:text-[4rem] lg:text-[4.5rem]",
  displayLgDark:
    "font-display text-[3.5rem] leading-[1.02] tracking-[-0.035em] text-ac-pearl sm:text-[4rem] lg:text-[4.5rem]",
  h1: "font-display text-3xl leading-[1.06] tracking-[-0.03em] text-ac-espresso sm:text-4xl lg:text-[3rem]",
  h1Dark: "font-display text-3xl leading-[1.06] tracking-[-0.03em] text-ac-pearl sm:text-4xl lg:text-[3rem]",
  h2: "font-display text-2xl leading-[1.10] tracking-[-0.025em] text-ac-espresso sm:text-3xl lg:text-[2.25rem]",
  h2Dark: "font-display text-2xl leading-[1.10] tracking-[-0.025em] text-ac-pearl sm:text-3xl lg:text-[2.25rem]",
  h3: "text-xl font-medium leading-[1.20] text-ac-espresso sm:text-2xl",
  h3Dark: "text-xl font-medium leading-[1.20] text-ac-pearl sm:text-2xl",
  bodyLg: "text-lg leading-[1.75] text-ac-secondary md:text-xl md:leading-[1.75]",
  body: "text-base leading-[1.70] text-ac-secondary md:text-[1.0625rem] md:leading-[1.70]",
  bodyDark: "text-base leading-[1.70] text-ac-sand/90 md:text-[1.0625rem] md:leading-[1.70]",
  bodyCentered: "mx-auto text-base leading-[1.70] text-ac-secondary md:text-[1.0625rem]",
  label: "text-sm font-medium text-ac-walnut",
  caption: "text-[0.8125rem] leading-[1.50] text-ac-muted",
  captionDark: "text-[0.8125rem] leading-[1.50] text-ac-sand/60",
  nav: "text-sm font-medium tracking-[-0.01em]",
  folioTitle: "font-display text-xl leading-[1.15] tracking-[-0.02em] text-ac-espresso sm:text-2xl",
  folioMeta: "text-[0.8125rem] leading-[1.50] text-ac-muted",
} as const;

// ---------------------------------------------------------------------------
// Spacing (8px base)
// ---------------------------------------------------------------------------

export const acSpace = {
  xs: "2", // 8px
  sm: "4", // 16px
  md: "6", // 24px
  lg: "12", // 48px
  xl: "20", // 80px
  "2xl": "32", // 128px
  "3xl": "48", // 192px
} as const;

export const acSpacePx = {
  xs: 8,
  sm: 16,
  md: 24,
  lg: 48,
  xl: 80,
  "2xl": 128,
  "3xl": 192,
} as const;

export const acSectionPadding = {
  standard: "px-6 py-28 sm:px-8 md:py-32 lg:px-12 lg:py-40 xl:px-16",
  compact: "px-6 py-24 sm:px-8 md:py-28 lg:px-12 lg:py-32 xl:px-16",
  hero: "px-6 pb-20 pt-28 sm:px-8 lg:px-12 lg:pb-28 lg:pt-32 xl:px-16",
  chapter: "px-6 py-28 sm:px-8 md:py-32 lg:px-12 lg:py-40 xl:px-16",
} as const;

// ---------------------------------------------------------------------------
// Grid — Editorial 12
// ---------------------------------------------------------------------------

export const acGrid = {
  container: "relative mx-auto max-w-6xl",
  containerWide: "relative mx-auto max-w-7xl",
  containerNarrow: "relative mx-auto max-w-3xl",
  containerProse: "relative mx-auto max-w-[28em]",
  pagePx: "px-6 sm:px-8 lg:px-12 xl:px-16",
  monument: "grid grid-cols-1 lg:grid-cols-12 lg:gap-x-8",
  monumentMain: "lg:col-span-8 xl:col-span-10",
  monumentMargin: "lg:col-span-4 xl:col-span-2",
  split: "grid grid-cols-1 lg:grid-cols-2 lg:gap-x-12 xl:gap-x-16",
  splitAsymmetric: "grid grid-cols-1 lg:grid-cols-12 lg:gap-x-8",
  splitMain: "lg:col-span-7",
  splitAside: "lg:col-span-5",
  rail: "grid grid-cols-1 lg:grid-cols-12 lg:gap-x-8",
  railSticky: "lg:col-span-4 lg:sticky lg:top-28 lg:self-start",
  railContent: "lg:col-span-8",
} as const;

// ---------------------------------------------------------------------------
// Radius
// ---------------------------------------------------------------------------

export const acRadius = {
  none: "rounded-none",
  sm: "rounded-sm", // 4px via CSS var
  arch: "rounded-t-sm rounded-b-[1.5rem]",
  md: "rounded-md",
  lg: "rounded-lg",
  full: "rounded-full",
  /** @deprecated Use acRadius.none or acRadius.arch — kept for legacy compat */
  card: "rounded-[1.25rem]",
} as const;

// ---------------------------------------------------------------------------
// Shadows & elevation
// ---------------------------------------------------------------------------

export const acShadow = {
  none: "",
  plate: "shadow-[0_8px_40px_-12px_rgba(26,20,16,0.08)]",
  sm: "shadow-[0_2px_16px_-4px_rgba(26,20,16,0.08)]",
  md: "shadow-[0_8px_32px_-12px_rgba(26,20,16,0.12)]",
  lg: "shadow-[0_20px_48px_-16px_rgba(26,20,16,0.16)]",
  header: "shadow-[0_4px_24px_-8px_rgba(26,20,16,0.10)]",
  headerDark: "shadow-[0_8px_32px_-8px_rgba(0,0,0,0.45)]",
} as const;

export const acElevation = {
  flat: "",
  plate: `${acRadius.sm} border border-ac-espresso/[0.08] bg-ac-pearl ${acShadow.plate}`,
  raised: `${acRadius.sm} border border-ac-espresso/[0.08] bg-ac-pearl ${acShadow.sm}`,
  floating: `${acRadius.sm} border border-ac-espresso/[0.08] bg-ac-pearl ${acShadow.md}`,
  floatingDark: `${acRadius.sm} border border-white/[0.1] bg-white/[0.04] backdrop-blur-2xl ${acShadow.md}`,
  overlay: "backdrop-blur-2xl backdrop-saturate-150",
} as const;

// ---------------------------------------------------------------------------
// Motion
// ---------------------------------------------------------------------------

export const acMotionEasing = "cubic-bezier(0.22, 1, 0.36, 1)";

export const acMotion = {
  easing: `ease-[${acMotionEasing}]`,
  easingVar: acMotionEasing,
  instant: "duration-[120ms]",
  calm: "duration-[400ms]",
  reveal: "duration-[900ms]",
  passage: "duration-[1200ms]",
  atlas: "duration-[1600ms]",
  transition: `transition-all duration-[400ms] ease-[${acMotionEasing}]`,
  transitionReveal: `transition-all duration-[900ms] ease-[${acMotionEasing}]`,
  transitionPassage: `transition-all duration-[1200ms] ease-[${acMotionEasing}]`,
  reduce: "motion-reduce:transition-none motion-reduce:transform-none motion-reduce:opacity-100",
} as const;

/** Class bundles for storytelling motion primitives. */
export const acMotionStory = {
  revealEnter:
    "motion-safe:animate-[ac-reveal-up_900ms_cubic-bezier(0.22,1,0.36,1)_both] motion-reduce:animate-none",
  passageCrossfade: `motion-safe:transition-opacity duration-[1200ms] ease-[${acMotionEasing}]`,
  linkUnderline:
    "relative after:absolute after:bottom-0 after:left-1/2 after:h-px after:w-0 after:bg-ac-copper after:transition-all after:duration-[400ms] after:ease-[cubic-bezier(0.22,1,0.36,1)] hover:after:left-0 hover:after:w-full",
} as const;

// ---------------------------------------------------------------------------
// Focus
// ---------------------------------------------------------------------------

export const acFocus = {
  ring: "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ac-copper/85",
  ringDark:
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ac-gold/70",
  ringInset:
    "focus-visible:ring-2 focus-visible:ring-ac-copper/35 focus-visible:ring-offset-2 focus-visible:ring-offset-ac-limestone",
} as const;

// ---------------------------------------------------------------------------
// Photography grade profiles (CSS utility class names)
// ---------------------------------------------------------------------------

export const acPhotoGrade = {
  night: "photo-grade-night",
  dawn: "photo-grade-dawn",
  library: "photo-grade-library",
  earth: "photo-grade-earth",
  workshop: "photo-grade-workshop",
  directory: "photo-grade-directory",
  gallery: "photo-grade-gallery",
} as const;

export type AcPhotoGrade = keyof typeof acPhotoGrade;

// ---------------------------------------------------------------------------
// Layout misc
// ---------------------------------------------------------------------------

export const acLayout = {
  headerHeight: "h-[4.5rem]",
  headerHeightVar: "--ac-header-height",
} as const;

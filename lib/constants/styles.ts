/** Design tokens — class strings must remain pixel-identical to preserved UI. */

export const colors = {
  pageBackground: "#0a0705",
  footerBackground: "#080504",
} as const;

export const easing = {
  premium: "ease-[cubic-bezier(0.22,1,0.36,1)]",
} as const;

export const sectionPadding = {
  standard:
    "px-5 py-40 sm:px-6 md:px-7 md:py-44 lg:px-8 lg:py-48",
  compact:
    "px-5 py-36 sm:px-6 md:px-7 md:py-40 lg:px-8 lg:py-44",
} as const;

export const typography = {
  eyebrow:
    "text-[0.8125rem] font-medium uppercase tracking-[0.24em] text-amber-500/90",
  sectionTitleModern:
    "mt-5 text-3xl font-semibold leading-[1.08] tracking-[-0.03em] text-stone-50 sm:text-4xl lg:text-[3.25rem]",
  sectionTitleLegacy:
    "mt-5 text-3xl font-semibold leading-[1.1] tracking-[-0.02em] text-stone-50 sm:text-4xl lg:text-[2.875rem]",
  sectionLead:
    "mt-7 max-w-xl text-lg leading-[1.78] text-stone-400 md:text-xl md:leading-[1.72]",
  sectionLeadCentered:
    "mx-auto mt-7 max-w-xl text-lg leading-[1.78] text-stone-400 md:text-xl md:leading-[1.72]",
} as const;

export const layout = {
  container: "relative mx-auto max-w-6xl",
  sectionDividerTop:
    "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent",
  sectionFadeTop:
    "pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#0a0705] via-[#0a0705]/80 to-transparent",
  introBlock: "mb-14 max-w-2xl md:mb-16 lg:mb-20",
  introBlockCentered: "mb-20 text-center md:mb-24",
} as const;

export const cards = {
  testimonial:
    "rounded-[1.5rem] border border-white/[0.05] bg-gradient-to-br from-white/[0.05] via-white/[0.02] to-transparent shadow-[0_4px_24px_-8px_rgba(0,0,0,0.25)] transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:border-amber-700/20 hover:from-white/[0.06] hover:shadow-[0_36px_72px_-24px_rgba(180,120,60,0.16)]",
  premiumShell:
    "group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-white/[0.11] bg-gradient-to-br from-white/[0.08] via-white/[0.035] to-white/[0.01] shadow-[0_12px_40px_-16px_rgba(0,0,0,0.48)] backdrop-blur-2xl transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:border-amber-500/32 hover:shadow-[0_24px_56px_-18px_rgba(180,120,60,0.24),0_0_0_1px_rgba(217,119,6,0.08)] motion-reduce:transition-none motion-reduce:hover:translate-y-0",
  premiumSheen:
    "pointer-events-none absolute inset-0 rounded-[1.5rem] bg-gradient-to-b from-white/[0.07] via-transparent to-transparent",
  premiumGlow:
    "pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-amber-600/8 opacity-60 blur-3xl transition-opacity duration-300 group-hover:opacity-100",
  imageOverlay:
    "absolute inset-0 bg-gradient-to-t from-[#0a0705]/95 via-[#0a0705]/35 to-[#0a0705]/12",
  imageAmberWash:
    "absolute inset-0 bg-gradient-to-br from-amber-950/14 via-transparent to-[#0a0705]/40",
  imageRadial:
    "absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(217,119,6,0.08),transparent_55%)]",
} as const;

export const buttons = {
  primary:
    "inline-flex h-12 min-w-[180px] items-center justify-center rounded-full bg-stone-50 px-8 text-sm font-medium text-stone-900 transition-all duration-300 ease-out hover:scale-[1.04] hover:bg-stone-200 hover:shadow-[0_14px_44px_rgba(255,255,255,0.16)] active:scale-[0.97]",
  secondary:
    "inline-flex h-12 min-w-[180px] items-center justify-center rounded-full border border-stone-600/45 bg-white/[0.04] px-8 text-sm font-medium text-stone-100 backdrop-blur-sm transition-all duration-300 ease-out hover:scale-[1.04] hover:border-amber-600/40 hover:bg-white/[0.08] hover:shadow-[0_0_40px_rgba(217,119,6,0.16)] active:scale-[0.97]",
  ghostCta:
    "group/btn inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.06] px-5 text-sm font-medium text-stone-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.09)] backdrop-blur-2xl transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-amber-500/45 hover:bg-white/[0.1] hover:shadow-[0_0_36px_rgba(217,119,6,0.22),0_10px_28px_-10px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.14)] active:scale-[0.98] motion-reduce:hover:translate-y-0",
  ghostCtaAutoWidth: " sm:w-auto",
  ghostArrow:
    "h-3.5 w-3.5 transition-transform duration-300 group-hover/btn:translate-x-0.5 motion-reduce:transform-none",
} as const;

export const meta = {
  tile:
    "flex items-start gap-2.5 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5",
  tileCompact:
    "flex items-start gap-2 rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2",
  label:
    "text-[9px] font-medium uppercase tracking-[0.14em] text-stone-500",
  value:
    "mt-0.5 text-[0.8125rem] font-medium leading-snug text-stone-200",
  icon: "mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500/80",
  iconInline: "h-3.5 w-3.5 shrink-0 text-amber-500/80",
} as const;

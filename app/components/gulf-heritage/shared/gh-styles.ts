/** Shared presentation tokens for Gulf Heritage — presentation layer only. */

export const ghMotion = {
  fadeIn: "motion-safe:animate-in motion-safe:fade-in motion-safe:duration-500 motion-reduce:animate-none",
  slideUp: "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-2 motion-safe:duration-500 motion-reduce:animate-none",
  cardHover:
    "transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_48px_-20px_rgba(28,22,18,0.14)] motion-reduce:transition-none motion-reduce:hover:translate-y-0",
} as const;

export const ghSurfaces = {
  articlePanel:
    "rounded-2xl border border-ba-espresso/[0.07] bg-gradient-to-b from-ba-pearl to-ba-sand/30 shadow-[0_8px_32px_-12px_rgba(28,22,18,0.08)]",
  articlePanelInset: "rounded-xl border border-ba-espresso/[0.06] bg-ba-pearl/80",
  card:
    "rounded-2xl border border-ba-espresso/[0.08] bg-ba-pearl shadow-[0_4px_20px_-8px_rgba(28,22,18,0.1)]",
  cardElevated:
    "rounded-2xl border border-ba-espresso/[0.08] bg-ba-pearl shadow-[0_12px_40px_-16px_rgba(28,22,18,0.12)]",
  placeholder:
    "rounded-2xl border border-dashed border-ba-espresso/15 bg-gradient-to-br from-ba-sand/40 via-ba-pearl to-ba-sand/20",
  divider: "h-px bg-gradient-to-r from-transparent via-ba-espresso/12 to-transparent",
} as const;

export const ghTypography = {
  prose:
    "text-[1.0625rem] leading-[1.78] tracking-[-0.01em] text-ac-espresso/92 [&_p+p]:mt-5",
  proseWide: "max-w-[42rem]",
  sectionTitle:
    "font-display text-2xl font-semibold leading-[1.12] tracking-[-0.03em] text-ac-espresso sm:text-[1.75rem]",
  sectionEyebrow: "text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-ba-bronze",
  metaLabel: "text-xs font-medium uppercase tracking-[0.14em] text-ac-espresso/55",
} as const;

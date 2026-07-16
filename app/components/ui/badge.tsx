import type { HTMLAttributes } from "react";
import { dsRadius } from "@/lib/constants/styles";

const variantClasses = {
  default: `${dsRadius.full} border border-white/[0.1] bg-white/[0.04] px-2.5 py-0.5 text-xs font-medium text-stone-300`,
  gold: `${dsRadius.full} border border-uae-warm-gold/30 bg-uae-warm-gold/10 px-2.5 py-0.5 text-xs font-medium text-uae-warm-gold`,
  palm: `${dsRadius.full} border border-uae-palm/40 bg-uae-palm/15 px-2.5 py-0.5 text-xs font-medium text-uae-pearl-deep`,
  success: `${dsRadius.full} border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-300`,
  warning: `${dsRadius.full} border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-300`,
  muted: `${dsRadius.full} bg-white/[0.06] px-2.5 py-0.5 text-xs font-medium text-stone-500`,
} as const;

export type BadgeVariant = keyof typeof variantClasses;

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

function joinClasses(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/** Inline status or category label. */
export function Badge({ variant = "default", className = "", children, ...props }: BadgeProps) {
  return (
    <span className={joinClasses("inline-flex items-center", variantClasses[variant], className)} {...props}>
      {children}
    </span>
  );
}

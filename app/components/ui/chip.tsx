import type { ButtonHTMLAttributes } from "react";
import { dsFocus, dsMotion, dsRadius } from "@/lib/constants/styles";

const variantClasses = {
  default: `border border-white/[0.12] bg-white/[0.04] text-stone-300 hover:border-uae-warm-gold/35 hover:bg-white/[0.08] hover:text-uae-pearl`,
  active: `border border-uae-warm-gold/40 bg-uae-warm-gold/10 text-uae-pearl`,
  ghost: `border border-transparent bg-transparent text-stone-400 hover:text-uae-pearl`,
} as const;

export type ChipVariant = keyof typeof variantClasses;

export type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ChipVariant;
  selected?: boolean;
};

function joinClasses(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/** Toggleable filter pill — min 44px touch target. */
export function Chip({
  variant = "default",
  selected = false,
  className = "",
  type = "button",
  ...props
}: ChipProps) {
  const resolvedVariant = selected ? "active" : variant;

  return (
    <button
      type={type}
      className={joinClasses(
        "inline-flex h-11 min-w-[2.75rem] items-center justify-center",
        dsRadius.full,
        "px-4 text-sm font-medium",
        dsMotion.transition,
        variantClasses[resolvedVariant],
        dsFocus.ring,
        className,
      )}
      aria-pressed={selected}
      {...props}
    />
  );
}

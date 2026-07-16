import { type ButtonHTMLAttributes, forwardRef } from "react";
import { buttons, dsFocus, dsMotion, dsRadius } from "@/lib/constants/styles";

const variantClasses = {
  primary: buttons.primary,
  secondary: buttons.secondary,
  ghost:
    `inline-flex h-10 items-center justify-center gap-2 ${dsRadius.full} border border-white/[0.12] bg-white/[0.04] px-5 text-sm font-medium text-uae-pearl ${dsMotion.transition} hover:border-uae-warm-gold/40 hover:bg-white/[0.08] active:scale-[0.98] ${dsFocus.ring}`,
  gold:
    `inline-flex h-10 items-center justify-center ${dsRadius.full} bg-uae-warm-gold/90 px-5 text-sm font-medium text-uae-dark-coffee-deep ${dsMotion.transition} hover:bg-uae-warm-gold hover:shadow-[0_0_36px_rgba(192,138,46,0.42)] active:scale-[0.97] ${dsFocus.ring}`,
  text:
    `inline-flex items-center text-sm font-medium text-stone-400 ${dsMotion.transition} hover:text-uae-pearl ${dsFocus.ring}`,
} as const;

const sizeClasses = {
  sm: "h-9 min-w-0 px-4 text-xs",
  md: "h-10 min-w-0 px-5 text-sm",
  lg: "h-12 min-w-[180px] px-8 text-sm",
} as const;

export type ButtonVariant = keyof typeof variantClasses;
export type ButtonSize = keyof typeof sizeClasses;

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

function joinClasses(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/** Token-driven button primitive — use for forms and actions. Links use `TextLink` or `RippleLink`. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "lg", className = "", type = "button", disabled, ...props },
  ref,
) {
  const sizeOverride = variant === "primary" || variant === "secondary" ? sizeClasses[size] : "";
  const minWidthReset = size !== "lg" ? "min-w-0" : "";

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled}
      className={joinClasses(
        variantClasses[variant],
        sizeOverride,
        minWidthReset,
        disabled && "pointer-events-none opacity-50",
        className,
      )}
      {...props}
    />
  );
});

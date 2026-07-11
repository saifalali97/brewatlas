import * as React from "react";
import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-12 w-full rounded-2xl border border-white/[0.1] bg-white/[0.04] px-4 py-2 text-sm text-stone-100 shadow-sm backdrop-blur-xl transition-colors placeholder:text-stone-500 focus-visible:border-amber-600/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/25 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };

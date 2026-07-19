import type { HTMLAttributes, ReactNode } from "react";
import { cards, dsElevation, dsRadius } from "@/lib/constants/styles";

const variantClasses = {
  default: dsElevation.raised,
  premium: cards.premiumShell,
  flat: `${dsRadius.card} border border-ba-espresso/08 bg-ba-pearl`,
  testimonial: cards.testimonial,
} as const;

export type CardVariant = keyof typeof variantClasses;

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;
  children: ReactNode;
};

function joinClasses(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function Card({ variant = "default", className = "", children, ...props }: CardProps) {
  return (
    <div className={joinClasses(variantClasses[variant], className)} {...props}>
      {variant === "premium" ? (
        <>
          <div aria-hidden className={cards.premiumSheen} />
          <div aria-hidden className={cards.premiumGlow} />
          <div className="relative flex h-full flex-col">{children}</div>
        </>
      ) : (
        children
      )}
    </div>
  );
}

export function CardHeader({ className = "", children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={joinClasses("border-b border-ba-espresso/08 px-6 py-5", className)} {...props}>
      {children}
    </div>
  );
}

export function CardBody({ className = "", children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={joinClasses("px-6 py-5", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className = "", children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={joinClasses(
        "flex flex-col gap-3 border-t border-ba-espresso/08 px-6 py-5 sm:flex-row sm:items-center",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { dsFocus, dsMotion } from "@/lib/constants/styles";

const variantClasses = {
  default: `text-stone-400 ${dsMotion.transition} hover:text-uae-pearl underline-offset-4 hover:underline`,
  accent: `text-uae-warm-gold/90 ${dsMotion.transition} hover:text-uae-warm-gold underline-offset-4 hover:underline`,
  nav: `text-sm text-stone-400 ${dsMotion.transition} hover:text-uae-pearl`,
  navActive: `text-sm text-uae-pearl`,
  footer: `text-sm text-stone-500 ${dsMotion.transition} hover:text-uae-sand underline-offset-4 hover:underline`,
} as const;

export type TextLinkVariant = keyof typeof variantClasses;

export type TextLinkProps = {
  href: string;
  variant?: TextLinkVariant;
  children: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<typeof Link>, "href" | "className" | "children">;

function joinClasses(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/** Token-driven inline link for navigation and footer. */
export function TextLink({
  href,
  variant = "default",
  className = "",
  children,
  ...props
}: TextLinkProps) {
  return (
    <Link
      href={href}
      className={joinClasses("inline-flex items-center", variantClasses[variant], dsFocus.ring, className)}
      {...props}
    >
      {children}
    </Link>
  );
}

import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { dsFocus, dsMotion } from "@/lib/constants/styles";

const variantClasses = {
  default: `text-ac-espresso ${dsMotion.transition} hover:text-ba-bronze underline-offset-4 hover:underline`,
  accent: `text-ac-espresso ${dsMotion.transition} hover:text-ba-bronze underline-offset-4 hover:underline`,
  nav: `text-sm text-ac-espresso ${dsMotion.transition} hover:text-ba-bronze`,
  navActive: `text-sm text-ba-espresso`,
  navOnDark: `text-sm text-ba-sand-deep/80 ${dsMotion.transition} hover:text-ba-pearl`,
  navActiveOnDark: `text-sm text-ba-pearl`,
  footer: `text-sm text-ba-sand-deep/70 ${dsMotion.transition} hover:text-ba-pearl underline-offset-4 hover:underline`,
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

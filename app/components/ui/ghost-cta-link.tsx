import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { buttons } from "@/lib/constants/styles";
import { RippleLink } from "@/app/components/ui/ripple-link";

type GhostCtaLinkProps = {
  href: string;
  children: ReactNode;
  autoWidth?: boolean;
};

export function GhostCtaLink({ href, children, autoWidth = false }: GhostCtaLinkProps) {
  return (
    <RippleLink
      href={href}
      className={`${buttons.ghostCta}${autoWidth ? buttons.ghostCtaAutoWidth : ""}`}
    >
      {children}
      <ArrowRight className={buttons.ghostArrow} aria-hidden />
    </RippleLink>
  );
}

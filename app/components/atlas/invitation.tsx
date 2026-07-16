import type { ReactNode } from "react";
import Link from "next/link";
import {
  acFocus,
  acMotion,
  acTypography,
} from "@/lib/design-system/atlas-canon";

export type InvitationProps = {
  eyebrow?: string;
  title: string;
  prose: ReactNode;
  ctaHref: string;
  ctaLabel: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  signature?: string;
  className?: string;
  dark?: boolean;
};

function joinClasses(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/**
 * Members-club invitation — letter prose, ceremony tone, no pricing grid.
 */
export function Invitation({
  eyebrow = "An invitation",
  title,
  prose,
  ctaHref,
  ctaLabel,
  secondaryHref,
  secondaryLabel,
  signature,
  className = "",
  dark = true,
}: InvitationProps) {
  return (
    <div
      className={joinClasses(
        "ac-prose-width mx-auto",
        dark ? "text-ac-pearl" : "text-ac-espresso",
        className,
      )}
    >
      <p className={dark ? acTypography.eyebrowDark : acTypography.eyebrow}>{eyebrow}</p>
      <h2 className={joinClasses(dark ? acTypography.displayLgDark : acTypography.displayLg, "mt-6")}>
        {title}
      </h2>

      <div className="ac-brass-rule my-10" aria-hidden />

      <div className={joinClasses(dark ? acTypography.bodyDark : acTypography.body, "space-y-6")}>
        {prose}
      </div>

      {signature ? (
        <p className={joinClasses(acTypography.caption, "mt-10", dark && acTypography.captionDark)}>
          {signature}
        </p>
      ) : null}

      <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center">
        <Link
          href={ctaHref}
          className={joinClasses(
            "inline-flex h-12 items-center justify-center rounded-full border px-10 text-sm font-medium tracking-[0.08em] uppercase",
            dark
              ? "border-ac-gold/40 text-ac-pearl hover:border-ac-gold/60 hover:bg-white/[0.04]"
              : "border-ac-copper/40 text-ac-espresso hover:border-ac-copper/60 hover:bg-ac-espresso/[0.04]",
            acMotion.transition,
            dark ? acFocus.ringDark : acFocus.ring,
          )}
        >
          {ctaLabel}
        </Link>
        {secondaryHref && secondaryLabel ? (
          <Link
            href={secondaryHref}
            className={joinClasses(
              acTypography.nav,
              "inline-flex items-center gap-2 px-4",
              dark ? "text-ac-sand/80 hover:text-ac-pearl" : "text-ac-walnut/70 hover:text-ac-espresso",
              acFocus.ring,
            )}
          >
            {secondaryLabel}
          </Link>
        ) : null}
      </div>
    </div>
  );
}

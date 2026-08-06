import Image from "next/image";
import Link from "next/link";
import {
  acFocus,
  acMotion,
  acPhotoGrade,
  acTypography,
  type AcPhotoGrade,
} from "@/lib/design-system/atlas-canon";
import { badges } from "@/lib/constants/styles";

export type PortalTone = "warm" | "neutral" | "earth" | "sand" | "night";

const toneOverlays: Record<PortalTone, string> = {
  warm: "from-ac-espresso/92 via-ac-espresso/35 to-ac-gold/12",
  neutral: "from-ac-espresso/94 via-ac-espresso/40 to-transparent",
  earth: "from-ac-espresso/90 via-ac-walnut/50 to-ac-palm/10",
  sand: "from-ac-espresso/88 via-ac-walnut/40 to-ac-sand/15",
  night: "from-ac-espresso/94 via-ac-copper/25 to-ac-gold/15",
};

const toneGrade: Record<PortalTone, AcPhotoGrade> = {
  warm: "dawn",
  neutral: "directory",
  earth: "earth",
  sand: "dawn",
  night: "night",
};

export type PortalProps = {
  href: string;
  eyebrow: string;
  title: string;
  tagline?: string;
  enterLabel: string;
  imageSrc: string;
  imageAlt: string;
  tone?: PortalTone;
  size?: "large" | "small" | "tall" | "gateway";
  priority?: boolean;
  className?: string;
  /** Hide tagline for minimal gateway layouts */
  minimal?: boolean;
  /** Optional overlay badge (e.g. Coming Soon) */
  badge?: string;
  /** Pill-style enter action for primary destinations (e.g. homepage hero) */
  emphasizeEnter?: boolean;
};

function joinClasses(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/**
 * Immersive portal — full-bleed linked photograph with type in lower third.
 * Subtle arch proportion; no card chrome.
 */
export function Portal({
  href,
  eyebrow,
  title,
  tagline,
  enterLabel,
  imageSrc,
  imageAlt,
  tone = "warm",
  size = "large",
  priority = false,
  className = "",
  minimal = false,
  badge,
  emphasizeEnter = false,
}: PortalProps) {
  const isGateway = size === "gateway";

  const titleClass = isGateway
    ? "font-display text-[1.375rem] leading-[1.12] tracking-[-0.025em] text-ac-pearl sm:text-2xl md:text-[1.625rem] lg:text-[1.75rem]"
    : minimal
      ? acTypography.h2Dark
      : acTypography.h2Dark;

  const heightClass = isGateway
    ? "min-h-[16rem] sm:min-h-[18rem] md:min-h-full"
    : size === "large" || size === "tall"
      ? "min-h-[32rem] lg:min-h-[36rem]"
      : "min-h-[18rem] lg:min-h-[17rem]";

  const contentPadding = isGateway ? "p-6 sm:p-8 md:p-9 lg:p-10" : "p-8 sm:p-10 lg:p-12";

  return (
    <Link
      href={href}
      className={joinClasses(
        "group relative block overflow-hidden ac-portal-arch",
        acMotion.transitionPassage,
        acFocus.ring,
        heightClass,
        className,
      )}
    >
      <Image
        src={imageSrc}
        alt={imageAlt}
        fill
        priority={priority}
        sizes={
          size === "gateway"
            ? "(min-width: 768px) 33vw, 100vw"
            : size === "large"
              ? "(min-width: 1024px) 66vw, 100vw"
              : "(min-width: 1024px) 33vw, 100vw"
        }
        className={joinClasses(
          "object-cover object-center",
          acPhotoGrade[toneGrade[tone]],
          acMotion.transitionPassage,
          "motion-safe:group-hover:brightness-[1.03]",
        )}
      />
      <div
        aria-hidden
        className={joinClasses(
          "absolute inset-0 bg-gradient-to-t",
          toneOverlays[tone],
        )}
      />
      {badge ? (
        <div className="absolute end-5 top-5 sm:end-6 sm:top-6 md:end-8 md:top-8">
          <span className={badges.premiumDark}>{badge}</span>
        </div>
      ) : null}
      <div className={joinClasses("absolute inset-x-0 bottom-0", contentPadding)}>
        <p className={joinClasses(acTypography.eyebrowDark, isGateway && "text-ac-gold/80")}>{eyebrow}</p>
        <h3 className={joinClasses(titleClass, "mt-2.5 max-w-lg sm:mt-3")}>{title}</h3>
        {tagline ? (
          <p
            className={joinClasses(
              isGateway ? "mt-2 text-sm leading-relaxed text-ac-sand/75 sm:mt-2.5 sm:text-[0.9375rem]" : acTypography.bodyDark,
              "max-w-md",
            )}
          >
            {tagline}
          </p>
        ) : null}
        <span
          className={joinClasses(
            emphasizeEnter
              ? "mt-5 inline-flex min-h-11 touch-manipulation items-center justify-center gap-2 rounded-full border border-ba-gold/45 bg-ba-pearl/95 px-6 py-2.5 text-sm font-medium tracking-[0.04em] text-ac-espresso shadow-[0_8px_28px_-10px_rgba(28,22,18,0.35)] backdrop-blur-md transition-[transform,background-color,border-color,box-shadow] duration-200 ease-out motion-safe:group-hover:border-ba-gold/65 motion-safe:group-hover:bg-ba-pearl motion-safe:group-active:scale-[0.98] motion-reduce:transform-none sm:mt-6"
              : joinClasses(
                  acTypography.nav,
                  "mt-5 inline-flex min-h-11 touch-manipulation items-center gap-2 text-ac-gold sm:mt-6",
                ),
          )}
        >
          {enterLabel}
          <span
            aria-hidden
            className="inline-block transition-transform duration-200 ease-out motion-safe:group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1 motion-reduce:transform-none"
          >
            →
          </span>
        </span>
      </div>
    </Link>
  );
}

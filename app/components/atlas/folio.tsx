import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  acFocus,
  acMotion,
  acTypography,
} from "@/lib/design-system/atlas-canon";

const imageGradeClass = {
  library: "photo-grade-library",
  workshop: "photo-grade-workshop",
  directory: "photo-grade-directory",
  earth: "photo-grade-earth",
} as const;

export type FolioImageGrade = keyof typeof imageGradeClass;

export type FolioItemProps = {
  href: string;
  title: string;
  meta?: ReactNode;
  description?: string;
  imageSrc?: string;
  imageAlt?: string;
  index?: string | number;
  trailing?: ReactNode;
  imageGrade?: FolioImageGrade;
  className?: string;
};

function joinClasses(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/** Single row in an editorial folio index — hairline divider, no card box. */
export function FolioItem({
  href,
  title,
  meta,
  description,
  imageSrc,
  imageAlt = "",
  index,
  trailing,
  imageGrade = "library",
  className = "",
}: FolioItemProps) {
  return (
    <li className={joinClasses("ac-folio-divider", className)}>
      <div className="group flex items-center gap-6 py-6 sm:gap-8 sm:py-7">
        <Link
          href={href}
          className={joinClasses(
            "flex min-w-0 flex-1 items-center gap-6 sm:gap-8",
            acFocus.ring,
            acMotion.transition,
          )}
        >
          {index !== undefined ? (
            <span className={joinClasses(acTypography.caption, "w-8 shrink-0 tabular-nums")}>
              {index}
            </span>
          ) : null}

          {imageSrc ? (
            <div className="relative h-16 w-16 shrink-0 overflow-hidden sm:h-20 sm:w-20">
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                sizes="80px"
                className={joinClasses(
                  "object-cover object-center",
                  imageGradeClass[imageGrade],
                  "motion-safe:group-hover:brightness-[1.03]",
                )}
              />
            </div>
          ) : null}

          <div className="min-w-0 flex-1">
            <h3 className={acTypography.folioTitle}>{title}</h3>
            {meta ? <div className="mt-2">{meta}</div> : null}
            {description ? (
              <p className={joinClasses(acTypography.folioMeta, "mt-2 line-clamp-2")}>{description}</p>
            ) : null}
          </div>

          <span
            aria-hidden
            className="shrink-0 text-ac-copper opacity-0 transition-opacity duration-[400ms] group-hover:opacity-100 motion-reduce:opacity-100"
          >
            →
          </span>
        </Link>
        {trailing ? <div className="shrink-0">{trailing}</div> : null}
      </div>
    </li>
  );
}

export type FolioProps = {
  children: ReactNode;
  className?: string;
  /** Optional list label for screen readers */
  ariaLabel?: string;
};

/** Editorial folio list — typographic index with hairline dividers. */
export function Folio({ children, className = "", ariaLabel }: FolioProps) {
  return (
    <ul aria-label={ariaLabel} className={joinClasses("list-none p-0 m-0", className)}>
      {children}
    </ul>
  );
}

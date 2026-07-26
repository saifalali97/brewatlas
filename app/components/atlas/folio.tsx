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

export type FolioImageSize = "standard" | "large";

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
  imageSize?: FolioImageSize;
  className?: string;
  /** Premium recipes-archive row: full-width hover, notes-before-meta, larger index. */
  editorialInteractive?: boolean;
};

function joinClasses(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

const editorialRowMotion =
  "transition-[background-color,transform] duration-200 ease-out motion-safe:hover:-translate-y-0.5 motion-safe:hover:bg-ac-espresso/[0.028] motion-reduce:transform-none";

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
  imageSize = "standard",
  className = "",
  editorialInteractive = false,
}: FolioItemProps) {
  const imageBoxClass =
    imageSize === "large"
      ? "relative h-20 w-20 shrink-0 overflow-hidden sm:h-24 sm:w-24"
      : "relative h-16 w-16 shrink-0 overflow-hidden sm:h-20 sm:w-20";
  const imageSizes = imageSize === "large" ? "96px" : "80px";
  const hasImage = Boolean(imageSrc);

  const indexNode =
    index !== undefined ? (
      <span
        className={joinClasses(
          "shrink-0 tabular-nums tracking-tight",
          editorialInteractive
            ? "font-display w-10 pt-0.5 text-lg text-ac-espresso/32 sm:w-11 sm:text-xl"
            : joinClasses(acTypography.caption, "w-9", !hasImage && "pt-1 text-ac-espresso/45"),
        )}
      >
        {index}
      </span>
    ) : null;

  const titleNode = (
    <h3
      className={joinClasses(
        acTypography.folioTitle,
        editorialInteractive
          ? "text-[1.3125rem] leading-[1.2] sm:text-[1.375rem]"
          : hasImage
            ? "text-[1.125rem] leading-snug sm:text-xl"
            : "text-[1.25rem] sm:text-[1.375rem]",
      )}
    >
      {title}
    </h3>
  );

  const descriptionNode = description ? (
    <p
      className={joinClasses(
        editorialInteractive
          ? "mt-2.5 text-sm leading-[1.65] text-ac-espresso/78 line-clamp-3 sm:line-clamp-2"
          : hasImage
            ? joinClasses(acTypography.folioMeta, "mt-2 line-clamp-2")
            : "mt-3 line-clamp-3 text-sm leading-[1.65] text-ac-espresso/80 sm:line-clamp-2",
      )}
    >
      {description}
    </p>
  ) : null;

  const metaNode = meta ? (
    <div className={joinClasses(editorialInteractive ? "mt-3 space-y-2" : hasImage ? "mt-2" : "mt-2.5 space-y-1")}>
      {meta}
    </div>
  ) : null;

  const contentBlock = editorialInteractive ? (
    <>
      {titleNode}
      {descriptionNode}
      {metaNode}
    </>
  ) : (
    <>
      {titleNode}
      {metaNode}
      {descriptionNode}
    </>
  );

  const arrowNode = (
    <span
      aria-hidden
      className={joinClasses(
        "shrink-0 text-ac-copper motion-reduce:transform-none",
        editorialInteractive
          ? "hidden pt-1 text-base opacity-50 transition-[transform,opacity] duration-200 ease-out motion-safe:group-hover/row:translate-x-1 motion-safe:group-hover/row:opacity-90 sm:inline"
          : joinClasses(
              "transition-opacity duration-[400ms] motion-reduce:opacity-100",
              hasImage
                ? "opacity-0 group-hover:opacity-100"
                : "pt-1 opacity-60 group-hover:opacity-100 sm:opacity-40",
            ),
      )}
    >
      →
    </span>
  );

  if (editorialInteractive) {
    return (
      <li className={joinClasses("ac-folio-divider", className)}>
        <div
          className={joinClasses(
            "group/row relative flex w-full items-start rounded-sm px-2 sm:px-3",
            "py-7 sm:py-9 md:py-10",
            editorialRowMotion,
            "-mx-2 sm:-mx-3",
          )}
        >
          <Link
            href={href}
            className={joinClasses(
              "flex min-w-0 flex-1 items-start gap-5 touch-manipulation sm:gap-8",
              trailing ? "pe-12 sm:pe-14" : "pe-1",
              acFocus.ring,
              acMotion.transition,
            )}
          >
            {indexNode}
            <div className="min-w-0 flex-1">{contentBlock}</div>
            {arrowNode}
          </Link>
          {trailing ? (
            <div className="absolute end-2 top-7 z-10 shrink-0 sm:end-3 sm:top-9 md:top-10">{trailing}</div>
          ) : null}
        </div>
      </li>
    );
  }

  return (
    <li className={joinClasses("ac-folio-divider", className)}>
      <div
        className={joinClasses(
          "group flex gap-4 sm:gap-6",
          hasImage ? "items-center py-5 sm:gap-8 sm:py-7 md:py-8" : "items-start py-6 sm:py-8 md:py-9",
        )}
      >
        <Link
          href={href}
          className={joinClasses(
            "flex min-w-0 flex-1 touch-manipulation",
            hasImage ? "items-center gap-4 sm:gap-8" : "items-start gap-5 sm:gap-8",
            acFocus.ring,
            acMotion.transition,
          )}
        >
          {indexNode}

          {imageSrc ? (
            <div className={imageBoxClass}>
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                sizes={imageSizes}
                className={joinClasses(
                  "object-cover object-center",
                  imageGradeClass[imageGrade],
                  "motion-safe:group-hover:brightness-[1.03]",
                )}
              />
            </div>
          ) : null}

          <div className="min-w-0 flex-1">{contentBlock}</div>

          {arrowNode}
        </Link>
        {trailing ? <div className="shrink-0 self-start pt-1">{trailing}</div> : null}
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

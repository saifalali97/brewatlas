import Link from "next/link";
import type { ReactNode } from "react";
import { Chapter } from "@/app/components/atlas/chapter";
import { PageHeader } from "@/app/components/ui/page-header";
import { TextLink } from "@/app/components/ui/text-link";

type Crumb = {
  href: string;
  label: string;
};

type GulfDirectoryPlaceholderProps = {
  headingId: string;
  eyebrow: string;
  title: string;
  description: string;
  crumbs: Crumb[];
  children?: ReactNode;
};

/** Temporary directory destination using existing Atlas layout (no redesign). */
export function GulfDirectoryPlaceholder({
  headingId,
  eyebrow,
  title,
  description,
  crumbs,
  children,
}: GulfDirectoryPlaceholderProps) {
  return (
    <Chapter
      id={`${headingId}-chapter`}
      rhythm="dawn"
      padding="compact"
      wide
      ariaLabelledBy={headingId}
    >
      <div className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        {crumbs.map((crumb, index) => (
          <span key={`${crumb.href}-${crumb.label}`} className="inline-flex items-center gap-x-4">
            {index > 0 ? (
              <span className="text-ac-espresso/40" aria-hidden>
                /
              </span>
            ) : null}
            <TextLink href={crumb.href} variant="nav">
              {crumb.label}
            </TextLink>
          </span>
        ))}
      </div>

      <PageHeader headingId={headingId} eyebrow={eyebrow} title={title} description={description} />

      {children ? <div className="mt-10">{children}</div> : null}
    </Chapter>
  );
}

type PlaceholderRecipeLinkProps = {
  href: string;
  name: string;
  meta: string;
};

export function PlaceholderRecipeLink({ href, name, meta }: PlaceholderRecipeLinkProps) {
  return (
    <Link
      href={href}
      className="block rounded-[16px] border border-ba-espresso/[0.08] bg-ba-pearl px-5 py-4 transition-colors hover:border-ba-gold/30"
    >
      <span className="font-display text-lg tracking-[-0.02em] text-ba-espresso">{name}</span>
      <span className="mt-1 block text-sm text-ac-espresso/65">{meta}</span>
    </Link>
  );
}

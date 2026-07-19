import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { acFocus } from "@/lib/design-system/atlas-canon";
import { ghSurfaces } from "@/app/components/gulf-heritage/shared/gh-styles";
import type { GulfHeritageBreadcrumb } from "@/types/gulf-heritage";

type GulfHeritageBreadcrumbsProps = {
  items: readonly GulfHeritageBreadcrumb[];
};

/** Accessible breadcrumb trail for Gulf Heritage pages. */
export function GulfHeritageBreadcrumbs({ items }: GulfHeritageBreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-8">
      <ol className={`${ghSurfaces.articlePanelInset} flex flex-wrap items-center gap-1 px-3 py-2.5 text-sm text-ac-espresso/75`}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={`${item.href}-${item.label}`} className="inline-flex items-center gap-1">
              {index > 0 ? (
                <ChevronRight aria-hidden className="h-3.5 w-3.5 text-ac-espresso/30" strokeWidth={2} />
              ) : null}
              {isLast ? (
                <span aria-current="page" className="font-medium text-ac-espresso">
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className={`transition-colors hover:text-ba-bronze ${acFocus.ring}`}>
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

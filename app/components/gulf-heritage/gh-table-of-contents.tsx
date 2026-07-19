"use client";

import { useEffect, useState } from "react";
import { acFocus } from "@/lib/design-system/atlas-canon";
import { ghSurfaces, ghTypography } from "@/app/components/gulf-heritage/shared/gh-styles";

export type GhTocItem = {
  id: string;
  label: string;
};

type GhTableOfContentsProps = {
  title: string;
  items: readonly GhTocItem[];
};

/** Sticky table of contents with active section highlighting (desktop). */
export function GhTableOfContents({ title, items }: GhTableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null);

  useEffect(() => {
    if (items.length === 0) return;

    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => element !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    for (const section of sections) observer.observe(section);
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav aria-label={title} className="sticky top-28 hidden lg:block">
      <p className={ghTypography.metaLabel}>{title}</p>
      <ul className={`${ghSurfaces.articlePanelInset} mt-3 space-y-0.5 p-2`}>
        {items.map((item) => {
          const isActive = activeId === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={`block rounded-lg px-3 py-2 text-sm transition-colors ${acFocus.ring} ${
                  isActive
                    ? "bg-ba-sand/60 font-medium text-ac-espresso"
                    : "text-ac-espresso/65 hover:bg-ba-sand/35 hover:text-ac-espresso"
                }`}
                aria-current={isActive ? "location" : undefined}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

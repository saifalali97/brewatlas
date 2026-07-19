import { UAE_GULF_HERITAGE_CATEGORIES } from "@/lib/content/gulf-heritage/uae/categories";
import type { GulfHeritageCategorySlug, GulfHeritageCountrySlug, GulfHeritagePageCopy, GulfHeritagePageSlug } from "@/types/gulf-heritage";
import { gulfHeritagePagePath } from "@/types/gulf-heritage";

export type GhNavLink = {
  slug: GulfHeritagePageSlug;
  href: string;
  title: string;
};

export function getCategoryPageNavigation(
  countrySlug: GulfHeritageCountrySlug,
  categorySlug: GulfHeritageCategorySlug,
  currentSlug: GulfHeritagePageSlug,
  pageCopyBySlug: Record<GulfHeritagePageSlug, GulfHeritagePageCopy>,
): { previous: GhNavLink | null; next: GhNavLink | null } {
  const category = UAE_GULF_HERITAGE_CATEGORIES.find((item) => item.slug === categorySlug);
  if (!category) return { previous: null, next: null };

  const pageSlugs = category.pageSlugs as readonly GulfHeritagePageSlug[];
  const index = pageSlugs.indexOf(currentSlug);
  if (index === -1) return { previous: null, next: null };

  const toLink = (slug: GulfHeritagePageSlug): GhNavLink => ({
    slug,
    href: gulfHeritagePagePath(countrySlug, categorySlug, slug),
    title: pageCopyBySlug[slug]?.title ?? slug,
  });

  return {
    previous: index > 0 ? toLink(pageSlugs[index - 1]) : null,
    next: index < pageSlugs.length - 1 ? toLink(pageSlugs[index + 1]) : null,
  };
}

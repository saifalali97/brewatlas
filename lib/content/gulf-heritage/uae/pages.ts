import type {
  GulfHeritagePageDefinition,
  GulfHeritagePageSlug,
  GulfHeritageRoasterPageSlug,
} from "@/types/gulf-heritage";
import { UAE_GULF_HERITAGE_CATEGORIES } from "@/lib/content/gulf-heritage/uae/categories";

function relatedInCategory(
  categorySlug: GulfHeritagePageDefinition["categorySlug"],
  slug: GulfHeritagePageSlug,
  max = 4,
): readonly GulfHeritagePageSlug[] {
  const category = UAE_GULF_HERITAGE_CATEGORIES.find((item) => item.slug === categorySlug);
  if (!category) return [];
  return category.pageSlugs.filter((item) => item !== slug).slice(0, max);
}

const ROASTER_DEFAULTS: Pick<GulfHeritagePageDefinition, "kind" | "relatedRecipeSlugs" | "editorialStatus"> = {
  kind: "roaster",
  relatedRecipeSlugs: [],
  editorialStatus: "pending-review",
};

const ARTICLE_DEFAULTS: Pick<GulfHeritagePageDefinition, "kind" | "relatedRecipeSlugs" | "editorialStatus"> = {
  kind: "article",
  relatedRecipeSlugs: [],
  editorialStatus: "pending-review",
};

/** Flat registry of every UAE Gulf Heritage page. */
export const UAE_GULF_HERITAGE_PAGES: readonly GulfHeritagePageDefinition[] = [
  // Arabic Coffee
  {
    slug: "emirati-arabic-coffee",
    categorySlug: "arabic-coffee",
    ...ARTICLE_DEFAULTS,
    editorialStatus: "verified",
    relatedPageSlugs: relatedInCategory("arabic-coffee", "emirati-arabic-coffee"),
    relatedRecipeSlugs: ["dct-al-gahwa-activity-guide", "dct-gahwa-arabic-coffee-publication"],
  },
  {
    slug: "dallah",
    categorySlug: "arabic-coffee",
    ...ARTICLE_DEFAULTS,
    editorialStatus: "verified",
    relatedPageSlugs: relatedInCategory("arabic-coffee", "dallah"),
  },
  {
    slug: "finjan",
    categorySlug: "arabic-coffee",
    ...ARTICLE_DEFAULTS,
    editorialStatus: "verified",
    relatedPageSlugs: relatedInCategory("arabic-coffee", "finjan"),
  },
  {
    slug: "mihmas",
    categorySlug: "arabic-coffee",
    ...ARTICLE_DEFAULTS,
    editorialStatus: "verified",
    relatedPageSlugs: relatedInCategory("arabic-coffee", "mihmas"),
  },
  {
    slug: "cardamom",
    categorySlug: "arabic-coffee",
    ...ARTICLE_DEFAULTS,
    relatedPageSlugs: relatedInCategory("arabic-coffee", "cardamom"),
  },
  {
    slug: "saffron",
    categorySlug: "arabic-coffee",
    ...ARTICLE_DEFAULTS,
    relatedPageSlugs: relatedInCategory("arabic-coffee", "saffron"),
  },
  {
    slug: "coffee-hospitality",
    categorySlug: "arabic-coffee",
    ...ARTICLE_DEFAULTS,
    editorialStatus: "verified",
    relatedPageSlugs: relatedInCategory("arabic-coffee", "coffee-hospitality"),
  },
  {
    slug: "coffee-etiquette",
    categorySlug: "arabic-coffee",
    ...ARTICLE_DEFAULTS,
    editorialStatus: "verified",
    relatedPageSlugs: relatedInCategory("arabic-coffee", "coffee-etiquette"),
  },
  {
    slug: "coffee-serving-traditions",
    categorySlug: "arabic-coffee",
    ...ARTICLE_DEFAULTS,
    editorialStatus: "verified",
    relatedPageSlugs: relatedInCategory("arabic-coffee", "coffee-serving-traditions"),
  },
  // Tea & Karak
  {
    slug: "karak-chai",
    categorySlug: "tea-karak",
    ...ARTICLE_DEFAULTS,
    editorialStatus: "verified",
    relatedPageSlugs: relatedInCategory("tea-karak", "karak-chai"),
    relatedRecipeSlugs: ["smithsonian-karak-chai", "table-tales-karak-chai"],
  },
  {
    slug: "black-tea",
    categorySlug: "tea-karak",
    ...ARTICLE_DEFAULTS,
    relatedPageSlugs: relatedInCategory("tea-karak", "black-tea"),
  },
  {
    slug: "milk-tea",
    categorySlug: "tea-karak",
    ...ARTICLE_DEFAULTS,
    relatedPageSlugs: relatedInCategory("tea-karak", "milk-tea"),
  },
  {
    slug: "saffron-tea",
    categorySlug: "tea-karak",
    ...ARTICLE_DEFAULTS,
    relatedPageSlugs: relatedInCategory("tea-karak", "saffron-tea"),
  },
  {
    slug: "mint-tea",
    categorySlug: "tea-karak",
    ...ARTICLE_DEFAULTS,
    relatedPageSlugs: relatedInCategory("tea-karak", "mint-tea"),
  },
  {
    slug: "adani-tea",
    categorySlug: "tea-karak",
    ...ARTICLE_DEFAULTS,
    relatedPageSlugs: relatedInCategory("tea-karak", "adani-tea"),
  },
  // Roasters — no invented URLs or details until verified
  ...(
    [
      "raw-coffee-company",
      "the-espresso-lab",
      "seven-fortunes",
      "cypher-roastery",
      "boom-coffee",
      "gold-box-roastery",
      "nightjar-coffee",
    ] as const satisfies readonly GulfHeritageRoasterPageSlug[]
  ).map(
    (slug): GulfHeritagePageDefinition => ({
      slug,
      categorySlug: "uae-roasters",
      ...ROASTER_DEFAULTS,
      editorialStatus:
        slug === "boom-coffee"
          ? "blocked"
          : "verified",
      relatedPageSlugs: relatedInCategory("uae-roasters", slug),
      relatedRecipeSlugs:
        slug === "raw-coffee-company"
          ? ["raw-6-simple-brewing", "raw-cold-brew-recipes", "raw-espresso-martini"]
          : [],
    }),
  ),
];

export function getUaePageDefinition(slug: string): GulfHeritagePageDefinition | undefined {
  return UAE_GULF_HERITAGE_PAGES.find((page) => page.slug === slug);
}

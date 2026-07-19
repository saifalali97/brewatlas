import { getUaePageReferences } from "@/lib/content/gulf-heritage/uae/references";
import { createStaticCmsBase } from "@/lib/content/gulf-heritage/cms/repositories/static/cms-base";
import type { GulfHeritageReferencesRepository } from "@/lib/content/gulf-heritage/cms/repositories/types";

function referenceSlug(title: string, index: number): string {
  const normalized = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${normalized || "reference"}-${index}`;
}

export const staticGulfHeritageReferencesRepository: GulfHeritageReferencesRepository = {
  async listByPage(pageSlug, locale) {
    const references = getUaePageReferences(pageSlug);

    return references.map((reference, index) => ({
      ...createStaticCmsBase("reference", `${pageSlug}:${referenceSlug(reference.title, index)}`, locale),
      countrySlug: "united-arab-emirates",
      pageSlug,
      reference,
      sortOrder: index,
      slug: referenceSlug(reference.title, index),
      id: `gh:reference:${pageSlug}:${index}:${locale}`,
    }));
  },
};

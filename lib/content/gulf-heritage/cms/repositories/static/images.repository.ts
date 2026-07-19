import { getUaePageImages } from "@/lib/content/gulf-heritage/uae/images";
import { createStaticCmsBase } from "@/lib/content/gulf-heritage/cms/repositories/static/cms-base";
import type { GulfHeritageImagesRepository } from "@/lib/content/gulf-heritage/cms/repositories/types";

export const staticGulfHeritageImagesRepository: GulfHeritageImagesRepository = {
  async getByPage(countrySlug, pageSlug, locale) {
    if (countrySlug !== "united-arab-emirates") return null;

    return {
      ...createStaticCmsBase("images", `${countrySlug}:${pageSlug}`, locale),
      countrySlug,
      pageSlug,
      images: getUaePageImages(pageSlug),
    };
  },
};

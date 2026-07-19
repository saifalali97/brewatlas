import { GULF_HERITAGE_COUNTRIES } from "@/lib/content/gulf-heritage/config";
import { createStaticCmsBase } from "@/lib/content/gulf-heritage/cms/repositories/static/cms-base";
import type { GulfHeritageCountriesRepository } from "@/lib/content/gulf-heritage/cms/repositories/types";
import type { GulfHeritageCountryRecord } from "@/types/gulf-heritage-cms";
import type { GulfHeritageCountrySlug } from "@/types/gulf-heritage";
import type { Locale } from "@/types/i18n";

function toCountryRecord(slug: GulfHeritageCountrySlug, locale: Locale): GulfHeritageCountryRecord {
  const config = GULF_HERITAGE_COUNTRIES.find((country) => country.slug === slug);
  return {
    ...createStaticCmsBase("country", slug, locale),
    heroImageUrl: config && "heroImageUrl" in config ? (config.heroImageUrl ?? null) : null,
    name: null,
    description: null,
    seoTitle: null,
    seoDescription: null,
  };
}

export const staticGulfHeritageCountriesRepository: GulfHeritageCountriesRepository = {
  async list(locale) {
    return GULF_HERITAGE_COUNTRIES.map((country) => toCountryRecord(country.slug, locale));
  },

  async getBySlug(slug, locale) {
    const exists = GULF_HERITAGE_COUNTRIES.some((country) => country.slug === slug);
    return exists ? toCountryRecord(slug, locale) : null;
  },
};

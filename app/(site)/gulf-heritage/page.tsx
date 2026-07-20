import type { Metadata } from "next";
import { PageHeader } from "@/app/components/ui/page-header";
import { PageEditorialPhoto } from "@/app/components/ui/page-editorial-photo";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { GulfHeritageCountryCard } from "@/app/components/gulf-heritage/gulf-heritage-country-card";
import { PAGE_EDITORIAL_IMAGES } from "@/lib/media/page-images";
import {
  GULF_HERITAGE_COUNTRIES,
  getGulfHeritageCountryCopy,
  getGulfHeritageGuideCount,
} from "@/lib/content/gulf-heritage";
import { interpolate } from "@/lib/i18n/format";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";
import type { GulfHeritageCountrySlug } from "@/types/gulf-heritage";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const gh = dictionary.gulfHeritagePage;

  return buildLocalizedMetadata({
    pathname: "/gulf-heritage",
    locale,
    title: gh.metaTitle,
    description: gh.metaDescription,
  });
}

export default async function GulfHeritageHubPage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const gh = dictionary.gulfHeritagePage;

  return (
    <SectionFrame id="gulf-heritage-hub" ariaLabelledBy="gulf-heritage-hub-heading" padding="compact">
      <PageEditorialPhoto src={PAGE_EDITORIAL_IMAGES.emptyGulfHeritage} alt={gh.title} priority />
      <PageHeader
        headingId="gulf-heritage-hub-heading"
        eyebrow={gh.eyebrow}
        title={gh.title}
        description={gh.description}
      />

      <div className="grid gap-6 sm:gap-7 lg:grid-cols-3 lg:gap-8">
        {GULF_HERITAGE_COUNTRIES.map((country) => {
          const copy = getGulfHeritageCountryCopy(dictionary, country.slug as GulfHeritageCountrySlug);
          const guideCount = getGulfHeritageGuideCount(country.slug) as number;
          const topicCountLabel =
            guideCount === 0
              ? gh.comingSoon
              : interpolate(gh.guideCountTemplate, {
                  count: guideCount,
                  label: guideCount === 1 ? gh.guideSingular : gh.guidePlural,
                });

          return (
            <GulfHeritageCountryCard
              key={country.slug}
              slug={country.slug as GulfHeritageCountrySlug}
              copy={copy}
              topicCountLabel={topicCountLabel}
              exploreLabel={gh.exploreCountry}
              heroImageUrl={"heroImageUrl" in country ? country.heroImageUrl : undefined}
            />
          );
        })}
      </div>
    </SectionFrame>
  );
}

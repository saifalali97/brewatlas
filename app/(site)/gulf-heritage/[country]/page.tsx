import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { EmptyState } from "@/app/components/ui/empty-state";
import { PageEditorialPhoto } from "@/app/components/ui/page-editorial-photo";
import { GulfHeritageBackLink } from "@/app/components/gulf-heritage/gulf-heritage-back-link";
import { PAGE_EDITORIAL_IMAGES } from "@/lib/media/page-images";
import { GulfHeritageCategoryCard } from "@/app/components/gulf-heritage/gulf-heritage-category-card";
import {
  GULF_HERITAGE_COUNTRIES,
  GULF_HERITAGE_HUB_PATH,
  getGulfHeritageCategoryCopy,
  getGulfHeritageCountryConfig,
  getGulfHeritageCountryCopy,
  getGulfHeritageCountryCategories,
  getGulfHeritageGuideCount,
} from "@/lib/content/gulf-heritage";
import { interpolate } from "@/lib/i18n/format";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";
import type { GulfHeritageCategorySlug, GulfHeritageCountrySlug } from "@/types/gulf-heritage";

type GulfHeritageCountryPageProps = {
  params: Promise<{ country: string }>;
};

export function generateStaticParams() {
  return GULF_HERITAGE_COUNTRIES.map((country) => ({ country: country.slug }));
}

export async function generateMetadata({ params }: GulfHeritageCountryPageProps): Promise<Metadata> {
  const { country: countrySlug } = await params;
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const gh = dictionary.gulfHeritagePage;
  const country = getGulfHeritageCountryConfig(countrySlug);

  if (!country) {
    return buildLocalizedMetadata({
      pathname: `/gulf-heritage/${countrySlug}`,
      locale,
      title: gh.countryNotFoundTitle,
      description: dictionary.metadata.notFoundDescription,
      noIndex: true,
    });
  }

  const copy = getGulfHeritageCountryCopy(dictionary, country.slug as GulfHeritageCountrySlug);

  return buildLocalizedMetadata({
    pathname: `/gulf-heritage/${country.slug}`,
    locale,
    title: copy.seoTitle,
    description: copy.seoDescription,
    ogImage: "heroImageUrl" in country && country.heroImageUrl ? { url: country.heroImageUrl } : undefined,
  });
}

export default async function GulfHeritageCountryPage({ params }: GulfHeritageCountryPageProps) {
  const { country: countrySlug } = await params;
  const dictionary = await getDictionary(await getLocale());
  const gh = dictionary.gulfHeritagePage;
  const country = getGulfHeritageCountryConfig(countrySlug);

  if (!country) {
    notFound();
  }

  const copy = getGulfHeritageCountryCopy(dictionary, country.slug as GulfHeritageCountrySlug);
  const categories = getGulfHeritageCountryCategories(country.slug);
  const countryHero =
    "heroImageUrl" in country && country.heroImageUrl ? country.heroImageUrl : PAGE_EDITORIAL_IMAGES.emptyGulfHeritage;

  return (
    <SectionFrame id="gulf-heritage-country" ariaLabelledBy="gulf-heritage-country-heading" padding="compact">
      <GulfHeritageBackLink href={GULF_HERITAGE_HUB_PATH} label={gh.backToHub} />

      <PageEditorialPhoto src={countryHero} alt={copy.name} priority />

      <PageHeader
        headingId="gulf-heritage-country-heading"
        eyebrow={gh.defaultCountryEyebrow}
        title={copy.name}
        description={copy.description}
      />

      {categories.length === 0 ? (
        <EmptyState
          title={gh.comingSoonTitle}
          description={interpolate(gh.comingSoonCountryDescription, { name: copy.name })}
          imageSrc={countryHero}
          imageAlt={copy.name}
        />
      ) : (
        <div className="grid gap-6 sm:gap-7 lg:grid-cols-3 lg:gap-8">
          {categories.map((category) => {
            const categoryCopy = getGulfHeritageCategoryCopy(
              dictionary,
              category.slug as GulfHeritageCategorySlug,
            );
            const guideCount = category.pageSlugs.length;
            const guideCountLabel = interpolate(gh.guideCountTemplate, {
              count: guideCount,
              label: guideCount === 1 ? gh.guideSingular : gh.guidePlural,
            });

            return (
              <GulfHeritageCategoryCard
                key={category.slug}
                countrySlug={country.slug as GulfHeritageCountrySlug}
                categorySlug={category.slug as GulfHeritageCategorySlug}
                copy={categoryCopy}
                readLabel={gh.readCategory}
                guideCountLabel={guideCountLabel}
                heroImageUrl={"heroImageUrl" in country ? country.heroImageUrl : undefined}
              />
            );
          })}
        </div>
      )}

      {categories.length > 0 ? (
        <p className="sr-only">
          {interpolate(gh.guideCountTemplate, {
            count: getGulfHeritageGuideCount(country.slug),
            label: getGulfHeritageGuideCount(country.slug) === 1 ? gh.guideSingular : gh.guidePlural,
          })}
        </p>
      ) : null}
    </SectionFrame>
  );
}

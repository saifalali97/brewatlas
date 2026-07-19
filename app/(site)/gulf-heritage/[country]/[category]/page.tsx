import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { GulfHeritageBackLink } from "@/app/components/gulf-heritage/gulf-heritage-back-link";
import { GulfHeritagePageCard } from "@/app/components/gulf-heritage/gulf-heritage-page-card";
import {
  getGulfHeritageCategoryConfig,
  getGulfHeritageCategoryCopy,
  getGulfHeritageCountryCopy,
  getGulfHeritagePageCopy,
  listGulfHeritageStaticCategoryParams,
} from "@/lib/content/gulf-heritage";
import { interpolate } from "@/lib/i18n/format";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";
import type {
  GulfHeritageCategorySlug,
  GulfHeritageCountrySlug,
  GulfHeritagePageSlug,
} from "@/types/gulf-heritage";

type GulfHeritageCategoryPageProps = {
  params: Promise<{ country: string; category: string }>;
};

export function generateStaticParams() {
  return listGulfHeritageStaticCategoryParams();
}

export async function generateMetadata({ params }: GulfHeritageCategoryPageProps): Promise<Metadata> {
  const { country: countrySlug, category: categorySlug } = await params;
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const gh = dictionary.gulfHeritagePage;
  const category = getGulfHeritageCategoryConfig(countrySlug, categorySlug);

  if (!category) {
    return buildLocalizedMetadata({
      pathname: `/gulf-heritage/${countrySlug}/${categorySlug}`,
      locale,
      title: gh.categoryNotFoundTitle,
      description: dictionary.metadata.notFoundDescription,
      noIndex: true,
    });
  }

  const copy = getGulfHeritageCategoryCopy(dictionary, category.slug as GulfHeritageCategorySlug);

  return buildLocalizedMetadata({
    pathname: `/gulf-heritage/${countrySlug}/${categorySlug}`,
    locale,
    title: copy.seoTitle,
    description: copy.seoDescription,
  });
}

export default async function GulfHeritageCategoryPage({ params }: GulfHeritageCategoryPageProps) {
  const { country: countrySlug, category: categorySlug } = await params;
  const dictionary = await getDictionary(await getLocale());
  const gh = dictionary.gulfHeritagePage;
  const category = getGulfHeritageCategoryConfig(countrySlug, categorySlug);

  if (!category) {
    notFound();
  }

  const countryCopy = getGulfHeritageCountryCopy(dictionary, countrySlug as GulfHeritageCountrySlug);
  const categoryCopy = getGulfHeritageCategoryCopy(dictionary, category.slug as GulfHeritageCategorySlug);

  return (
    <SectionFrame id="gulf-heritage-category" ariaLabelledBy="gulf-heritage-category-heading" padding="compact">
      <GulfHeritageBackLink
        href={`/gulf-heritage/${countrySlug}`}
        label={interpolate(gh.backToCountryTemplate, { name: countryCopy.name })}
      />

      <PageHeader
        headingId="gulf-heritage-category-heading"
        eyebrow={countryCopy.name}
        title={categoryCopy.title}
        description={categoryCopy.description}
      />

      <div className="grid gap-6 sm:gap-7 lg:grid-cols-3 lg:gap-8">
        {category.pageSlugs.map((pageSlug) => (
          <GulfHeritagePageCard
            key={pageSlug}
            countrySlug={countrySlug as GulfHeritageCountrySlug}
            categorySlug={category.slug as GulfHeritageCategorySlug}
            pageSlug={pageSlug as GulfHeritagePageSlug}
            copy={getGulfHeritagePageCopy(dictionary, pageSlug as GulfHeritagePageSlug)}
            readLabel={gh.readPage}
          />
        ))}
      </div>
    </SectionFrame>
  );
}

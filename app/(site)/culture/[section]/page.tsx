import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { CultureTopicCard } from "@/app/components/cards/culture-topic-card";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { getCachedCultureSectionBySlug } from "@/lib/data/cached-public-data";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";

type CultureSectionPageProps = {
  params: Promise<{ section: string }>;
};

export async function generateMetadata({ params }: CultureSectionPageProps): Promise<Metadata> {
  const { section: sectionSlug } = await params;
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const section = await getCachedCultureSectionBySlug(sectionSlug, locale);

  if (!section) {
    return buildLocalizedMetadata({
      pathname: `/culture/${sectionSlug}`,
      locale,
      title: dictionary.culturePage.sectionNotFoundTitle,
      description: dictionary.metadata.notFoundDescription,
      noIndex: true,
    });
  }

  return buildLocalizedMetadata({
    pathname: `/culture/${section.slug}`,
    locale,
    title: section.seoTitle ?? section.name,
    description: section.seoDescription ?? section.description,
    ogImage: section.heroImageUrl ? { url: section.heroImageUrl } : undefined,
  });
}

export default async function CultureSectionPage({ params }: CultureSectionPageProps) {
  const { section: sectionSlug } = await params;
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const c = dictionary.culturePage;
  const section = await getCachedCultureSectionBySlug(sectionSlug, locale);

  if (!section) {
    notFound();
  }

  return (
    <SectionFrame id="culture-section" ariaLabelledBy="culture-section-heading" padding="compact">
      
<Link
        href="/culture"
        className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-ac-espresso transition-colors duration-300 hover:text-ba-bronze rtl:flex-row-reverse"
      >
        <ArrowLeft className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
        {c.backToHub}
      </Link>

      <PageHeader headingId="culture-section-heading" eyebrow={section.eyebrow ?? c.defaultSectionEyebrow} title={section.name} description={section.description} />

      <div className="grid gap-6 sm:gap-7 lg:grid-cols-3 lg:gap-8">
        {section.topics.map((topic) => (
          <CultureTopicCard key={topic.id} topic={topic} sectionSlug={section.slug} />
        ))}
      </div>
    </SectionFrame>
  );
}

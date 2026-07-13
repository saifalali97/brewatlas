import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { CultureTopicCard } from "@/app/components/cards/culture-topic-card";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { getCultureSectionBySlug } from "@/lib/data/culture";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";
import { createClient } from "@/lib/supabase/server";

type CultureSectionPageProps = {
  params: Promise<{ section: string }>;
};

export async function generateMetadata({ params }: CultureSectionPageProps): Promise<Metadata> {
  const { section: sectionSlug } = await params;
  const locale = await getLocale();
  const supabase = await createClient();
  const section = await getCultureSectionBySlug(supabase, sectionSlug, locale);

  if (!section) {
    return { title: "Section Not Found" };
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
  const supabase = await createClient();
  const section = await getCultureSectionBySlug(supabase, sectionSlug, locale);

  if (!section) {
    notFound();
  }

  return (
    <SectionFrame id="culture-section" ariaLabelledBy="culture-section-heading" padding="compact">
      <Link
        href="/culture"
        className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-stone-400 transition-colors duration-300 hover:text-amber-400/90"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to Coffee & Tea Culture
      </Link>

      <PageHeader eyebrow={section.eyebrow ?? "Culture"} title={section.name} description={section.description} />

      <div className="grid gap-6 sm:gap-7 lg:grid-cols-3 lg:gap-8">
        {section.topics.map((topic) => (
          <CultureTopicCard key={topic.id} topic={topic} sectionSlug={section.slug} />
        ))}
      </div>
    </SectionFrame>
  );
}

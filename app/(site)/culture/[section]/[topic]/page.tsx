import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { notFound } from "next/navigation";
import { RippleLink } from "@/app/components/ui/ripple-link";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { buttons, cards } from "@/lib/constants/styles";
import { getCachedCultureTopicBySlug } from "@/lib/data/cached-public-data";
import { translate } from "@/lib/i18n/format";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";
import { CULTURE_IMAGE_PLACEHOLDER } from "@/types/culture";

type CultureTopicPageProps = {
  params: Promise<{ section: string; topic: string }>;
};

export async function generateMetadata({ params }: CultureTopicPageProps): Promise<Metadata> {
  const { section: sectionSlug, topic: topicSlug } = await params;
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const topic = await getCachedCultureTopicBySlug(sectionSlug, topicSlug, locale);

  if (!topic) {
    return buildLocalizedMetadata({
      pathname: `/culture/${sectionSlug}/${topicSlug}`,
      locale,
      title: dictionary.culturePage.articleNotFoundTitle,
      description: dictionary.metadata.notFoundDescription,
      noIndex: true,
    });
  }

  return buildLocalizedMetadata({
    pathname: `/culture/${sectionSlug}/${topic.slug}`,
    locale,
    title: topic.seoTitle ?? topic.title,
    description: topic.seoDescription ?? topic.excerpt,
    ogImage: topic.heroImageUrl ? { url: topic.heroImageUrl, alt: topic.title } : undefined,
    openGraphType: "article",
  });
}

export default async function CultureTopicPage({ params }: CultureTopicPageProps) {
  const { section: sectionSlug, topic: topicSlug } = await params;
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const topic = await getCachedCultureTopicBySlug(sectionSlug, topicSlug, locale);

  if (!topic) {
    notFound();
  }

  const heroImage = topic.heroImageUrl ?? CULTURE_IMAGE_PLACEHOLDER;

  return (
    <SectionFrame id="culture-topic" ariaLabelledBy="culture-topic-heading" padding="compact">
      <Link
        href={`/culture/${sectionSlug}`}
        className="mb-10 inline-flex items-center gap-2 text-sm font-medium text-stone-400 transition-colors duration-300 hover:text-amber-400/90 rtl:flex-row-reverse"
      >
        <ArrowLeft className="h-4 w-4 rtl:-scale-x-100" aria-hidden />
        {translate(dictionary, "culturePage.backToSectionTemplate", { name: topic.section.name })}
      </Link>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="relative h-72 overflow-hidden rounded-[1.5rem] border border-white/[0.11] sm:h-96 lg:h-full lg:min-h-[26rem]">
          <Image
            src={heroImage}
            alt={`${topic.title} — BrewAtlas culture guide`}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority
            unoptimized={heroImage.endsWith(".svg")}
            className={`${cards.cardPhoto} saturate-[0.94]`}
          />
          <div className={cards.imageOverlay} />
          <div className={cards.imageAmberWash} />

          <div className="absolute bottom-5 start-5 flex items-center gap-1.5 rounded-full border border-white/[0.12] bg-[#0a0705]/55 px-3 py-1 text-[10px] font-medium text-stone-200 backdrop-blur-xl">
            <BookOpen className="h-3 w-3 text-amber-500/80" aria-hidden />
            {topic.section.name}
          </div>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-amber-600/70">{topic.section.name}</p>
          <h1
            id="culture-topic-heading"
            className="mt-3 text-3xl font-semibold leading-[1.08] tracking-[-0.03em] text-stone-50 sm:text-4xl"
          >
            {topic.title}
          </h1>
          <p className="mt-5 text-lg leading-[1.75] text-stone-400">{topic.excerpt}</p>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <RippleLink href={`/culture/${sectionSlug}`} className={`${buttons.secondary} w-full sm:w-auto`}>
              {translate(dictionary, "culturePage.moreInSectionTemplate", { name: topic.section.name })}
            </RippleLink>
            <RippleLink href="/culture" className={`${buttons.secondary} w-full sm:w-auto`}>
              {dictionary.culturePage.allCultureGuides}
            </RippleLink>
          </div>
        </div>
      </div>

      <div className="mt-14 max-w-3xl">
        <p className="whitespace-pre-line text-base leading-[1.85] text-stone-300">{topic.body}</p>
      </div>
    </SectionFrame>
  );
}

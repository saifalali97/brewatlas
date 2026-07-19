import type { Metadata } from "next";
import Link from "next/link";
import { Folio, FolioItem } from "@/app/components/atlas/folio";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { acFocus, acTypography } from "@/lib/design-system/atlas-canon";
import { getCachedCultureSections } from "@/lib/data/cached-public-data";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";
import { CULTURE_IMAGE_PLACEHOLDER } from "@/types/culture";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    pathname: "/culture",
    locale,
    title: dictionary.culturePage.metaTitle,
    description: dictionary.culturePage.metaDescription,
  });
}

export default async function CulturePage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const c = dictionary.culturePage;
  const sections = await getCachedCultureSections(locale);

  return (
    <SectionFrame id="culture-hub" ariaLabelledBy="culture-hub-heading" padding="compact">
      <PageHeader
        headingId="culture-hub-heading"
        eyebrow={c.eyebrow}
        title={c.title}
        description={c.description}
      />

      <Folio ariaLabel={c.title}>
        {sections.map((section, index) => (
          <FolioItem
            key={section.id}
            href={`/culture/${section.slug}`}
            index={String(index + 1).padStart(2, "0")}
            title={section.name}
            imageSrc={section.heroImageUrl ?? CULTURE_IMAGE_PLACEHOLDER}
            imageAlt={`${section.name} — BrewAtlas culture guide`}
            imageGrade="library"
            description={section.description}
            meta={
              <p className={acTypography.folioMeta}>
                {section.topicCount}{" "}
                {section.topicCount === 1 ? c.articleSingular : c.articlePlural}
                {section.eyebrow ? ` · ${section.eyebrow}` : ""}
              </p>
            }
          />
        ))}
      </Folio>

      <div className="ac-folio-divider mt-14 pt-10">
        <Link
          href="/culture/guide"
          className={`${acTypography.nav} text-ac-espresso hover:text-ba-bronze ${acFocus.ring}`}
        >
          {c.guideCta} →
        </Link>
      </div>
    </SectionFrame>
  );
}

import type { Metadata } from "next";
import { LegalDocument, type LegalDocumentSection } from "@/app/components/legal/legal-document";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";
import { LOCALE_METADATA } from "@/types/i18n";

const LAST_UPDATED = new Date("2026-07-01T00:00:00Z");

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    pathname: "/cookies",
    locale,
    title: dictionary.metadata.cookiesTitle,
    description: dictionary.metadata.cookiesDescription,
  });
}

export default async function CookiesPage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const c = dictionary.cookiesPage;
  const legal = dictionary.legalPage;

  const sections: LegalDocumentSection[] = [
    { heading: c.section1Heading, body: c.section1Body },
    { heading: c.section2Heading, body: c.section2Body },
    { heading: c.section3Heading, body: c.section3Body },
    { heading: c.section4Heading, body: c.section4Body },
    { heading: c.section5Heading, body: c.section5Body },
    { heading: c.section6Heading, body: c.section6Body },
  ];

  const lastUpdatedDate = LAST_UPDATED.toLocaleDateString(LOCALE_METADATA[locale].bcp47, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <SectionFrame id="cookies-page" ariaLabelledBy="cookies-page-heading" padding="compact">
      
<LegalDocument
        eyebrow={c.eyebrow}
        title={c.title}
        description={c.description}
        lastUpdatedLabel={legal.lastUpdatedLabel}
        lastUpdatedDate={lastUpdatedDate}
        sections={sections}
        contactPrefix={legal.contactPrefix}
        contactLinkLabel={legal.contactLinkLabel}
        contactSuffix={legal.contactSuffix}
        headingId="cookies-page-heading"
      />
    </SectionFrame>
  );
}

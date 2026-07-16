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
    pathname: "/terms",
    locale,
    title: dictionary.metadata.termsTitle,
    description: dictionary.metadata.termsDescription,
  });
}

export default async function TermsPage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const t = dictionary.termsPage;
  const legal = dictionary.legalPage;

  const sections: LegalDocumentSection[] = [
    { heading: t.section1Heading, body: t.section1Body },
    { heading: t.section2Heading, body: t.section2Body },
    { heading: t.section3Heading, body: t.section3Body },
    { heading: t.section4Heading, body: t.section4Body },
    { heading: t.section5Heading, body: t.section5Body },
    { heading: t.section6Heading, body: t.section6Body },
    { heading: t.section7Heading, body: t.section7Body },
    { heading: t.section8Heading, body: t.section8Body },
    { heading: t.section9Heading, body: t.section9Body },
  ];

  const lastUpdatedDate = LAST_UPDATED.toLocaleDateString(LOCALE_METADATA[locale].bcp47, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <SectionFrame id="terms-page" ariaLabelledBy="terms-page-heading" padding="compact">
      
<LegalDocument
        eyebrow={t.eyebrow}
        title={t.title}
        description={t.description}
        lastUpdatedLabel={legal.lastUpdatedLabel}
        lastUpdatedDate={lastUpdatedDate}
        sections={sections}
        contactPrefix={legal.contactPrefix}
        contactLinkLabel={legal.contactLinkLabel}
        contactSuffix={legal.contactSuffix}
        headingId="terms-page-heading"
      />
    </SectionFrame>
  );
}

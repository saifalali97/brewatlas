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
    pathname: "/privacy",
    locale,
    title: dictionary.metadata.privacyTitle,
    description: dictionary.metadata.privacyDescription,
  });
}

export default async function PrivacyPage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const p = dictionary.privacyPage;
  const legal = dictionary.legalPage;

  const sections: LegalDocumentSection[] = [
    { heading: p.section1Heading, body: p.section1Body },
    { heading: p.section2Heading, body: p.section2Body },
    { heading: p.section3Heading, body: p.section3Body },
    { heading: p.section4Heading, body: p.section4Body },
    { heading: p.section5Heading, body: p.section5Body },
    { heading: p.section6Heading, body: p.section6Body },
    { heading: p.section7Heading, body: p.section7Body },
    { heading: p.section8Heading, body: p.section8Body },
  ];

  const lastUpdatedDate = LAST_UPDATED.toLocaleDateString(LOCALE_METADATA[locale].bcp47, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <SectionFrame id="privacy-page" ariaLabelledBy="privacy-page-heading" padding="compact">
      <LegalDocument
        eyebrow={p.eyebrow}
        title={p.title}
        description={p.description}
        lastUpdatedLabel={legal.lastUpdatedLabel}
        lastUpdatedDate={lastUpdatedDate}
        sections={sections}
        contactPrefix={legal.contactPrefix}
        contactLinkLabel={legal.contactLinkLabel}
        contactSuffix={legal.contactSuffix}
      />
    </SectionFrame>
  );
}

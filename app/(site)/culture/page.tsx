import type { Metadata } from "next";
import { CultureSectionCard } from "@/app/components/cards/culture-section-card";
import { GhostCtaLink } from "@/app/components/ui/ghost-cta-link";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { getCachedCultureSections } from "@/lib/data/cached-public-data";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";

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
<PageHeader headingId="culture-hub-heading" eyebrow={c.eyebrow} title={c.title} description={c.description} />

      <div className="grid gap-6 sm:gap-7 lg:grid-cols-3 lg:gap-8">
        {sections.map((section) => (
          <CultureSectionCard key={section.id} section={section} />
        ))}
      </div>

      <div className="mt-14 border-t border-white/[0.06] pt-10">
        <GhostCtaLink href="/culture/guide" autoWidth>
          {c.guideCta}
        </GhostCtaLink>
      </div>
    </SectionFrame>
  );
}

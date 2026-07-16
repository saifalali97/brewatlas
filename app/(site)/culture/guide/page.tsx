import type { Metadata } from "next";
import { UaeCoffeeGuideEntryCard } from "@/app/components/cards/uae-coffee-guide-entry-card";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { UaePatternDivider } from "@/app/components/ui/uae-pattern-divider";
import { getUaeCoffeeGuide } from "@/lib/data/uae-brand";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    pathname: "/culture/guide",
    locale,
    title: dictionary.emiratiGuidePage.metaTitle,
    description: dictionary.emiratiGuidePage.metaDescription,
  });
}

/**
 * "Emirati Coffee Guide" hub (requirement 3). Deliberately curates and
 * links into the existing `culture_topics` articles (via
 * `getUaeCoffeeGuide()`) rather than duplicating their content in a
 * second set of pages -- Arabic Coffee, Karak, Saffron Tea, Black Tea,
 * and Adani Tea are already full articles under `/culture/tea` and
 * `/culture/arabic-coffee`; this page is the curated index over them.
 */
export default async function EmiratiCoffeeGuidePage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const g = dictionary.emiratiGuidePage;
  const supabase = await createClient();
  const entries = await getUaeCoffeeGuide(supabase, locale);

  return (
    <SectionFrame id="emirati-coffee-guide" ariaLabelledBy="emirati-coffee-guide-heading" padding="compact">
<PageHeader headingId="emirati-coffee-guide-heading" eyebrow={g.eyebrow} title={g.title} description={g.description} />

      <UaePatternDivider className="mx-auto mb-10 max-w-xs opacity-60" />

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {entries.map((entry) => (
          <UaeCoffeeGuideEntryCard key={entry.slug} entry={entry} />
        ))}
      </div>
    </SectionFrame>
  );
}

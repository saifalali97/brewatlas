import type { Metadata } from "next";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { acTypography } from "@/lib/design-system/atlas-canon";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const p = dictionary.aiCoachComingSoonPage;

  return buildLocalizedMetadata({
    pathname: "/ai-coach",
    locale,
    title: p.metaTitle,
    description: p.metaDescription,
  });
}

export default async function AiCoachComingSoonPage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const p = dictionary.aiCoachComingSoonPage;

  return (
    <SectionFrame id="ai-coach-coming-soon" ariaLabelledBy="ai-coach-coming-soon-heading" padding="compact">
      <PageHeader
        headingId="ai-coach-coming-soon-heading"
        eyebrow={p.comingSoonEyebrow}
        title={p.title}
        description={p.subtitle}
      />

      <div className="mx-auto max-w-2xl text-center">
        <p className={acTypography.body}>{p.body}</p>
      </div>
    </SectionFrame>
  );
}

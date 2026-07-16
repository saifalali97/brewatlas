import type { Metadata } from "next";
import { Gauge, MessageSquareText, Sparkles } from "lucide-react";
import { AiCoachTools } from "@/app/components/coach/ai-coach-tools";
import { MetaTile } from "@/app/components/ui/meta-tile";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { acTypography } from "@/lib/design-system/atlas-canon";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    pathname: "/coach",
    locale,
    title: dictionary.metadata.coachTitle,
    description: dictionary.metadata.coachDescription,
  });
}

export default async function CoachPage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const p = dictionary.coachPage;

  return (
    <SectionFrame id="ai-coach" ariaLabelledBy="ai-coach-heading" padding="compact">
      <PageHeader headingId="ai-coach-heading" eyebrow={p.eyebrow} title={p.title} description={p.description} />

      <div className="mb-10 grid gap-4 sm:grid-cols-3">
        <MetaTile icon={Gauge} label={p.brewScoreLabel} value={p.brewScoreValue} />
        <MetaTile icon={Sparkles} label={p.metricsLabel} value={p.metricsValue} />
        <MetaTile icon={MessageSquareText} label={p.coachingTipsLabel} value={p.coachingTipsValue} />
      </div>

      <p className={`${acTypography.eyebrow} mb-8`}>{p.tryItLabel}</p>
      <AiCoachTools />
    </SectionFrame>
  );
}

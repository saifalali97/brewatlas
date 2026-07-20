import type { Metadata } from "next";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { AiCoachShell } from "@/app/components/ai-coach/ai-coach-shell";
import { GuidedBrewTool } from "@/app/components/ai-coach/ai-coach-tools-panel";
import { getAiCoachPageContext } from "@/lib/ai-coach/page-context";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const p = dictionary.aiCoachModule;
  return buildLocalizedMetadata({ pathname: "/ai-coach/guided-brew", locale, title: p.guidedBrewTitle, description: p.guidedBrewDescription, noIndex: true });
}

export default async function GuidedBrewPage() {
  const dictionary = await getDictionary(await getLocale());
  const p = dictionary.aiCoachModule;
  const ctx = await getAiCoachPageContext();

  return (
    <SectionFrame id="guided-brew" ariaLabelledBy="guided-brew-heading" padding="compact">
      <PageHeader headingId="guided-brew-heading" eyebrow={p.eyebrow} title={p.guidedBrewTitle} description={p.guidedBrewDescription} />
      <AiCoachShell usage={ctx.usage}>
        <GuidedBrewTool isAuthenticated={ctx.isAuthenticated} canUseAi={ctx.canUseAi} paywallReason={ctx.paywallReason} />
      </AiCoachShell>
    </SectionFrame>
  );
}

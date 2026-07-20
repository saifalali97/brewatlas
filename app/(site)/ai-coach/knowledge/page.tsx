import type { Metadata } from "next";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { AiCoachShell } from "@/app/components/ai-coach/ai-coach-shell";
import { AiCoachChat } from "@/app/components/ai-coach/ai-coach-chat";
import { QuickQuestions } from "@/app/components/ai-coach/quick-questions";
import { getAiCoachPageContext } from "@/lib/ai-coach/page-context";
import { acTypography } from "@/lib/design-system/atlas-canon";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const p = dictionary.aiCoachModule;
  return buildLocalizedMetadata({ pathname: "/ai-coach/knowledge", locale, title: p.knowledgeTitle, description: p.knowledgeDescription, noIndex: true });
}

export default async function KnowledgePage() {
  const dictionary = await getDictionary(await getLocale());
  const p = dictionary.aiCoachModule;
  const ctx = await getAiCoachPageContext();

  return (
    <SectionFrame id="coffee-knowledge" ariaLabelledBy="coffee-knowledge-heading" padding="compact">
      <PageHeader headingId="coffee-knowledge-heading" eyebrow={p.eyebrow} title={p.knowledgeTitle} description={p.knowledgeDescription} />
      <AiCoachShell usage={ctx.usage}>
        <section className="mb-10">
          <h2 className={`${acTypography.eyebrow} mb-6`}>{p.quickQuestionsTitle}</h2>
          <QuickQuestions />
        </section>
        <AiCoachChat
          isAuthenticated={ctx.isAuthenticated}
          canUseAi={ctx.canUseAi}
          paywallReason={ctx.paywallReason}
          streamingEnabled={ctx.streamingEnabled}
        />
      </AiCoachShell>
    </SectionFrame>
  );
}

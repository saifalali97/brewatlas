import type { Metadata } from "next";
import { PageHeader } from "@/app/components/ui/page-header";
import { PageEditorialPhoto } from "@/app/components/ui/page-editorial-photo";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { AiCoachShell } from "@/app/components/ai-coach/ai-coach-shell";
import { QuickActions, QuickQuestions } from "@/app/components/ai-coach/quick-questions";
import { ConversationHistory } from "@/app/components/ai-coach/conversation-history";
import { getAiCoachPageContext, getRecentConversations } from "@/lib/ai-coach/page-context";
import { acTypography } from "@/lib/design-system/atlas-canon";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { PAGE_EDITORIAL_IMAGES } from "@/lib/media/page-images";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";
import Link from "next/link";
import { buttons } from "@/lib/constants/styles";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    pathname: "/ai-coach",
    locale,
    title: dictionary.aiCoachModule.metaTitle,
    description: dictionary.aiCoachModule.metaDescription,
  });
}

export default async function AiCoachHomePage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const p = dictionary.aiCoachModule;
  const ctx = await getAiCoachPageContext();
  const conversations = ctx.userId ? await getRecentConversations(ctx.userId) : [];

  return (
    <SectionFrame id="ai-coach" ariaLabelledBy="ai-coach-heading" padding="compact">
      <PageEditorialPhoto src={PAGE_EDITORIAL_IMAGES.aiCoach} alt={p.title} />
      <PageHeader headingId="ai-coach-heading" eyebrow={p.eyebrow} title={p.title} description={p.description} />

      <AiCoachShell usage={ctx.usage}>
        {!ctx.isEnabled && (
          <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {p.disabledMessage}
          </div>
        )}

        <section className="mb-12">
          <h2 className={`${acTypography.eyebrow} mb-6`}>{p.quickActionsTitle}</h2>
          <QuickActions />
        </section>

        {ctx.isAuthenticated && conversations.length > 0 && (
          <section className="mb-12">
            <div className="mb-6 flex items-center justify-between">
              <h2 className={acTypography.eyebrow}>{p.recentConversationsTitle}</h2>
              <Link href="/ai-coach/chat" className="text-sm text-ba-bronze hover:underline">
                {p.viewAll}
              </Link>
            </div>
            <ConversationHistory conversations={conversations} isAuthenticated={ctx.isAuthenticated} />
          </section>
        )}

        <section className="mb-12">
          <h2 className={`${acTypography.eyebrow} mb-6`}>{p.quickQuestionsTitle}</h2>
          <QuickQuestions />
        </section>

        <section className="mb-12">
          <h2 className={`${acTypography.eyebrow} mb-4`}>{p.learningProgressTitle}</h2>
          <p className="text-sm text-stone-500">{p.learningProgressDescription}</p>
          {!ctx.isPremium && ctx.isAuthenticated && (
            <div className="mt-6">
              <Link href="/premium" className={buttons.secondary}>
                {p.upgradeCta}
              </Link>
            </div>
          )}
        </section>
      </AiCoachShell>
    </SectionFrame>
  );
}

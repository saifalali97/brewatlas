import type { Metadata } from "next";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { AiCoachShell } from "@/app/components/ai-coach/ai-coach-shell";
import { AiCoachChat } from "@/app/components/ai-coach/ai-coach-chat";
import { ConversationHistory } from "@/app/components/ai-coach/conversation-history";
import { getAiCoachPageContext } from "@/lib/ai-coach/page-context";
import { listConversations } from "@/lib/data/ai-coach-module";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";
import { createClient } from "@/lib/supabase/server";
import { acTypography } from "@/lib/design-system/atlas-canon";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    pathname: "/ai-coach/chat",
    locale,
    title: dictionary.aiCoachModule.chatTitle,
    description: dictionary.aiCoachModule.chatDescription,
    noIndex: true,
  });
}

type Props = {
  searchParams: Promise<{ q?: string }>;
};

export default async function AiCoachChatPage({ searchParams }: Props) {
  const { q } = await searchParams;
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const p = dictionary.aiCoachModule;
  const ctx = await getAiCoachPageContext();
  const supabase = await createClient();
  const conversations = ctx.userId ? await listConversations(supabase, ctx.userId, { limit: 20 }) : [];

  return (
    <SectionFrame id="ai-coach-chat" ariaLabelledBy="ai-coach-chat-heading" padding="compact">
      <PageHeader headingId="ai-coach-chat-heading" eyebrow={p.eyebrow} title={p.chatTitle} description={p.chatDescription} />
      <AiCoachShell usage={ctx.usage}>
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          {ctx.isAuthenticated && (
            <aside>
              <h2 className={`${acTypography.eyebrow} mb-4`}>{p.historyTitle}</h2>
              <ConversationHistory conversations={conversations} isAuthenticated={ctx.isAuthenticated} />
            </aside>
          )}
          <AiCoachChat
            isAuthenticated={ctx.isAuthenticated}
            canUseAi={ctx.canUseAi}
            paywallReason={ctx.paywallReason}
            quickStart={q}
            streamingEnabled={ctx.streamingEnabled}
          />
        </div>
      </AiCoachShell>
    </SectionFrame>
  );
}

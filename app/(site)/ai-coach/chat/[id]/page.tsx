import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { AiCoachShell } from "@/app/components/ai-coach/ai-coach-shell";
import { AiCoachChat } from "@/app/components/ai-coach/ai-coach-chat";
import { getAiCoachPageContext } from "@/lib/ai-coach/page-context";
import { getConversation, getMessages } from "@/lib/data/ai-coach-module";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";
import { createClient } from "@/lib/supabase/server";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    pathname: `/ai-coach/chat/${id}`,
    locale,
    title: dictionary.aiCoachModule.chatTitle,
    description: dictionary.aiCoachModule.chatDescription,
    noIndex: true,
  });
}

export default async function AiCoachChatThreadPage({ params }: Props) {
  const { id } = await params;
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const p = dictionary.aiCoachModule;
  const ctx = await getAiCoachPageContext();

  if (!ctx.userId) {
    return (
      <SectionFrame id="ai-coach-chat" padding="compact">
        <AiCoachShell usage={ctx.usage}>
          <AiCoachChat isAuthenticated={false} canUseAi={false} />
        </AiCoachShell>
      </SectionFrame>
    );
  }

  const supabase = await createClient();
  const conversation = await getConversation(supabase, id, ctx.userId);
  if (!conversation) notFound();

  const messages = await getMessages(supabase, id, ctx.userId);

  return (
    <SectionFrame id="ai-coach-chat" ariaLabelledBy="ai-coach-chat-heading" padding="compact">
      <PageHeader headingId="ai-coach-chat-heading" eyebrow={p.eyebrow} title={conversation.title} description={p.chatDescription} />
      <AiCoachShell usage={ctx.usage}>
        <AiCoachChat
          conversationId={id}
          initialMessages={messages}
          isAuthenticated={ctx.isAuthenticated}
          canUseAi={ctx.canUseAi}
          paywallReason={ctx.paywallReason}
        />
      </AiCoachShell>
    </SectionFrame>
  );
}

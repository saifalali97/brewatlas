import type { Metadata } from "next";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { AiCoachShell } from "@/app/components/ai-coach/ai-coach-shell";
import { BrewMemoryList } from "@/app/components/ai-coach/conversation-history";
import { getAiCoachPageContext } from "@/lib/ai-coach/page-context";
import { listBrewSessions } from "@/lib/data/ai-coach-module";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const p = dictionary.aiCoachModule;
  return buildLocalizedMetadata({ pathname: "/ai-coach/brew-memory", locale, title: p.brewMemoryTitle, description: p.brewMemoryDescription, noIndex: true });
}

export default async function BrewMemoryPage() {
  const dictionary = await getDictionary(await getLocale());
  const p = dictionary.aiCoachModule;
  const ctx = await getAiCoachPageContext();
  const supabase = await createClient();
  const sessions = ctx.userId ? await listBrewSessions(supabase, ctx.userId) : [];

  return (
    <SectionFrame id="brew-memory" ariaLabelledBy="brew-memory-heading" padding="compact">
      <PageHeader headingId="brew-memory-heading" eyebrow={p.eyebrow} title={p.brewMemoryTitle} description={p.brewMemoryDescription} />
      <AiCoachShell usage={ctx.usage}>
        <BrewMemoryList initialSessions={sessions} isAuthenticated={ctx.isAuthenticated} />
      </AiCoachShell>
    </SectionFrame>
  );
}

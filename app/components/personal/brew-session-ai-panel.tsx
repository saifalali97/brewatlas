"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { FormMessage } from "@/app/components/auth/form-message";
import { buttons } from "@/lib/constants/styles";
import { useTranslations } from "@/lib/i18n/translation-context";
import { analyzeBrewSessionAction } from "@/lib/supabase/brew-session-actions";
import type { BrewSessionAiAnalysis } from "@/types/brew-sessions";

type BrewSessionAiPanelProps = {
  sessionId: string;
  initialAnalysis: BrewSessionAiAnalysis | null;
};

export function BrewSessionAiPanel({ sessionId, initialAnalysis }: BrewSessionAiPanelProps) {
  const router = useRouter();
  const { t } = useTranslations();
  const l = (key: string) => t(`brewSessionsPage.${key}` as never);
  const [analysis, setAnalysis] = useState(initialAnalysis);
  const [message, setMessage] = useState<{ error?: string; success?: string }>({});
  const [pending, startTransition] = useTransition();

  function runAnalysis() {
    startTransition(async () => {
      const result = await analyzeBrewSessionAction(sessionId);
      setMessage({ error: result.error, success: result.success });
      if (result.analysis) {
        setAnalysis({
          id: "latest",
          sessionId,
          ...result.analysis,
          createdAt: new Date().toISOString(),
        });
        router.refresh();
      }
    });
  }

  return (
    <section className="rounded-[1.5rem] border border-ba-espresso/10 bg-ba-pearl p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-ac-espresso">{l("aiAnalysisTitle")}</h2>
        <button type="button" onClick={runAnalysis} disabled={pending} className={`${buttons.secondary} disabled:opacity-70`}>
          {pending ? l("analyzingCta") : l("analyzeCta")}
        </button>
      </div>
      <FormMessage error={message.error} success={message.success} />
      {analysis ? (
        <dl className="mt-6 space-y-4 text-sm text-ac-espresso">
          {analysis.summary ? <div><dt className="font-medium">{l("aiAnalysisTitle")}</dt><dd className="mt-1">{analysis.summary}</dd></div> : null}
          {analysis.strengths ? <div><dt className="font-medium">{l("strengthsLabel")}</dt><dd className="mt-1">{analysis.strengths}</dd></div> : null}
          {analysis.weaknesses ? <div><dt className="font-medium">{l("weaknessesLabel")}</dt><dd className="mt-1">{analysis.weaknesses}</dd></div> : null}
          {analysis.recommendations ? <div><dt className="font-medium">{l("recommendationsLabel")}</dt><dd className="mt-1">{analysis.recommendations}</dd></div> : null}
        </dl>
      ) : null}
    </section>
  );
}

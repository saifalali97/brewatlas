"use client";

import Link from "next/link";
import { trackAiCoachEvent } from "@/lib/analytics/ai-coach";
import { cards } from "@/lib/constants/styles";
import { useTranslations } from "@/lib/i18n/translation-context";
import { QUICK_QUESTIONS } from "@/types/ai-coach-module";

export function QuickQuestions() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {QUICK_QUESTIONS.map((question) => (
        <Link
          key={question}
          href={`/ai-coach/chat?q=${encodeURIComponent(question)}`}
          onClick={() => trackAiCoachEvent("quick_action_clicked", { question })}
          className={`${cards.premiumShell} group p-4 text-sm text-ba-charcoal transition-colors hover:border-ba-gold/30`}
        >
          <div aria-hidden className={cards.premiumSheen} />
          <span className="relative">{question}</span>
        </Link>
      ))}
    </div>
  );
}

export function QuickActions() {
  const { t } = useTranslations();

  const actions = [
    { href: "/ai-coach/chat", labelKey: "aiCoachModule.actionStartChat" as const, event: "chat_started" },
    { href: "/ai-coach/analyze", labelKey: "aiCoachModule.actionAnalyzeBrew" as const, event: "brew_analyzed" },
    { href: "/ai-coach/recipe-generator", labelKey: "aiCoachModule.actionGenerateRecipe" as const, event: "recipe_generated" },
    { href: "/ai-coach/knowledge", labelKey: "aiCoachModule.actionEncyclopedia" as const, event: "quick_action_clicked" },
    { href: "/ai-coach/brew-memory", labelKey: "aiCoachModule.actionSavedSessions" as const, event: "session_saved" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {actions.map(({ href, labelKey, event }) => (
        <Link
          key={href}
          href={href}
          onClick={() => trackAiCoachEvent(event as "chat_started")}
          className={`${cards.premiumShell} flex h-full flex-col justify-center p-6 text-center`}
        >
          <div aria-hidden className={cards.premiumSheen} />
          <span className="relative text-sm font-medium text-ba-espresso">{t(labelKey)}</span>
        </Link>
      ))}
    </div>
  );
}

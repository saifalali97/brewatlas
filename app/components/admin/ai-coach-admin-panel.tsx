"use client";

import { useState, useTransition } from "react";
import { MetaTile } from "@/app/components/ui/meta-tile";
import { BarChart3, MessageSquare, Sparkles, Stethoscope } from "lucide-react";
import { adminCopy } from "@/lib/admin/copy";
import { updateAiCoachSettingsAction } from "@/lib/supabase/ai-coach-admin-actions";
import type { AiCoachSettings } from "@/types/ai-coach-module";

type Props = {
  initialSettings: AiCoachSettings;
  stats: {
    totalEvents: number;
    chatStarted: number;
    recipesGenerated: number;
    brewsAnalyzed: number;
    sessionsSaved: number;
  };
};

export function AiCoachAdminPanel({ initialSettings, stats }: Props) {
  const labels = adminCopy.aiCoach;
  const [isEnabled, setIsEnabled] = useState(initialSettings.isEnabled);
  const [freeDailyLimit, setFreeDailyLimit] = useState(String(initialSettings.freeDailyLimit));
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateAiCoachSettingsAction({
        isEnabled,
        freeDailyLimit: parseInt(freeDailyLimit, 10) || 5,
      });
      setMessage(result.error ?? result.success ?? null);
    });
  };

  return (
    <div className="space-y-10">
      <section className="rounded-xl border border-stone-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-stone-900">{labels.settingsTitle}</h2>
        <p className="mt-1 text-sm text-stone-500">{labels.settingsDescription}</p>
        <div className="mt-6 space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => setIsEnabled(e.target.checked)}
              className="h-4 w-4 rounded border-stone-300"
            />
            <span className="text-sm text-stone-700">{labels.enabledLabel}</span>
          </label>
          <div>
            <label htmlFor="free-limit" className="block text-sm font-medium text-stone-700">
              {labels.freeDailyLimitLabel}
            </label>
            <input
              id="free-limit"
              type="number"
              min={1}
              max={100}
              value={freeDailyLimit}
              onChange={(e) => setFreeDailyLimit(e.target.value)}
              className="mt-1 w-32 rounded-lg border border-stone-200 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            {labels.saveButton}
          </button>
          {message && <p className="text-sm text-stone-600">{message}</p>}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-stone-900">{labels.statsTitle}</h2>
        <p className="mt-1 text-sm text-stone-500">{labels.statsDescription}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetaTile icon={MessageSquare} label={labels.statChatStarted} value={String(stats.chatStarted)} />
          <MetaTile icon={Sparkles} label={labels.statRecipesGenerated} value={String(stats.recipesGenerated)} />
          <MetaTile icon={Stethoscope} label={labels.statBrewsAnalyzed} value={String(stats.brewsAnalyzed)} />
          <MetaTile icon={BarChart3} label={labels.statTotalEvents} value={String(stats.totalEvents)} />
        </div>
      </section>
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { MarkdownRenderer } from "@/app/components/ai-coach/markdown-renderer";
import { AiCoachPaywall } from "@/app/components/ai-coach/ai-coach-paywall";
import { cards, forms } from "@/lib/constants/styles";
import { useTranslations } from "@/lib/i18n/translation-context";
import { runBrewDoctorAction } from "@/lib/supabase/ai-coach-module-actions";
import { BREW_DOCTOR_SYMPTOMS, type BrewDoctorSymptom } from "@/types/ai-coach-module";

const SYMPTOM_LABELS: Record<BrewDoctorSymptom, string> = {
  sour: "Sour",
  bitter: "Bitter",
  weak: "Weak",
  strong: "Strong",
  dry: "Dry",
  astringent: "Astringent",
  hollow: "Hollow",
  salty: "Salty",
  fastDrawdown: "Fast drawdown",
  slowDrawdown: "Slow drawdown",
  overExtraction: "Over extraction",
  underExtraction: "Under extraction",
};

type BrewDoctorToolProps = {
  isAuthenticated: boolean;
  canUseAi: boolean;
  paywallReason?: string;
};

export function BrewDoctorTool({ isAuthenticated, canUseAi, paywallReason }: BrewDoctorToolProps) {
  const { t } = useTranslations();
  const [symptom, setSymptom] = useState<BrewDoctorSymptom>("sour");
  const [method, setMethod] = useState("");
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isAuthenticated || !canUseAi) {
    return <AiCoachPaywall isAuthenticated={isAuthenticated} reason={paywallReason} />;
  }

  const handleSubmit = () => {
    startTransition(async () => {
      const response = await runBrewDoctorAction({ symptom, method: method || null, notes: notes || null });
      if (response.data?.markdown) setResult(response.data.markdown);
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className={`${cards.premiumShell} p-6`}>
        <div aria-hidden className={cards.premiumSheen} />
        <div className="relative space-y-4">
          <div>
            <label className={forms.label}>{t("aiCoachModule.symptomLabel")}</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {BREW_DOCTOR_SYMPTOMS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSymptom(s)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    symptom === s ? "bg-ba-espresso text-ba-pearl" : "border border-ba-espresso/15 text-ba-charcoal hover:border-ba-gold/30"
                  }`}
                >
                  {SYMPTOM_LABELS[s]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="brew-method" className={forms.label}>{t("aiCoachModule.methodLabel")}</label>
            <input id="brew-method" type="text" value={method} onChange={(e) => setMethod(e.target.value)} className={`${forms.input} mt-1 w-full`} placeholder="V60, Espresso, AeroPress…" />
          </div>
          <div>
            <label htmlFor="brew-notes" className={forms.label}>{t("aiCoachModule.notesLabel")}</label>
            <textarea id="brew-notes" value={notes} onChange={(e) => setNotes(e.target.value)} className={`${forms.input} mt-1 w-full`} rows={3} />
          </div>
          <button type="button" onClick={handleSubmit} disabled={isPending} className="inline-flex h-11 items-center gap-2 rounded-full bg-ba-espresso px-6 text-sm font-medium text-ba-pearl disabled:opacity-50">
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("aiCoachModule.diagnoseButton")}
          </button>
        </div>
      </div>
      {result ? (
        <div className={`${cards.premiumShell} p-6`}>
          <MarkdownRenderer content={result} />
        </div>
      ) : (
        <div className="flex items-center justify-center rounded-[1.5rem] border border-dashed border-ba-espresso/15 p-10 text-center text-sm text-stone-500">
          {t("aiCoachModule.brewDoctorEmpty")}
        </div>
      )}
    </div>
  );
}

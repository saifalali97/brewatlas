"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { MarkdownRenderer } from "@/app/components/ai-coach/markdown-renderer";
import { AiCoachPaywall } from "@/app/components/ai-coach/ai-coach-paywall";
import { cards, forms } from "@/lib/constants/styles";
import { useTranslations } from "@/lib/i18n/translation-context";
import { runGuidedBrewAction, generateRecipeAction } from "@/lib/supabase/ai-coach-module-actions";

type ToolAccessProps = {
  isAuthenticated: boolean;
  canUseAi: boolean;
  paywallReason?: string;
};

export function GuidedBrewTool({ isAuthenticated, canUseAi, paywallReason }: ToolAccessProps) {
  const { t } = useTranslations();
  const [method, setMethod] = useState("V60");
  const [origin, setOrigin] = useState("");
  const [roastLevel, setRoastLevel] = useState("");
  const [processing, setProcessing] = useState("");
  const [desiredFlavor, setDesiredFlavor] = useState("");
  const [currentIssue, setCurrentIssue] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isAuthenticated || !canUseAi) {
    return <AiCoachPaywall isAuthenticated={isAuthenticated} reason={paywallReason} />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className={`${cards.premiumShell} p-6`}>
        <div className="relative grid gap-4 sm:grid-cols-2">
          <Field label={t("aiCoachModule.methodLabel")} value={method} onChange={setMethod} />
          <Field label={t("aiCoachModule.originLabel")} value={origin} onChange={setOrigin} />
          <Field label={t("aiCoachModule.roastLabel")} value={roastLevel} onChange={setRoastLevel} />
          <Field label={t("aiCoachModule.processingLabel")} value={processing} onChange={setProcessing} />
          <Field label={t("aiCoachModule.flavorLabel")} value={desiredFlavor} onChange={setDesiredFlavor} className="sm:col-span-2" />
          <Field label={t("aiCoachModule.issueLabel")} value={currentIssue} onChange={setCurrentIssue} className="sm:col-span-2" />
          <button
            type="button"
            disabled={isPending}
            onClick={() => startTransition(async () => {
              const res = await runGuidedBrewAction({ method, origin, roastLevel, processing, desiredFlavor, currentIssue });
              if (res.data?.markdown) setResult(res.data.markdown);
            })}
            className="sm:col-span-2 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-ba-espresso px-6 text-sm font-medium text-ba-pearl disabled:opacity-50"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("aiCoachModule.generateRecommendations")}
          </button>
        </div>
      </div>
      {result ? (
        <div className={`${cards.premiumShell} p-6`}><MarkdownRenderer content={result} /></div>
      ) : (
        <EmptyPanel text={t("aiCoachModule.guidedBrewEmpty")} />
      )}
    </div>
  );
}

export function RecipeGeneratorTool({ isAuthenticated, canUseAi, paywallReason }: ToolAccessProps) {
  const { t } = useTranslations();
  const [method, setMethod] = useState("V60");
  const [coffee, setCoffee] = useState("");
  const [roast, setRoast] = useState("");
  const [flavorPreference, setFlavorPreference] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isAuthenticated || !canUseAi) {
    return <AiCoachPaywall isAuthenticated={isAuthenticated} reason={paywallReason} />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className={`${cards.premiumShell} p-6`}>
        <div className="relative grid gap-4 sm:grid-cols-2">
          <Field label={t("aiCoachModule.methodLabel")} value={method} onChange={setMethod} />
          <Field label={t("aiCoachModule.coffeeLabel")} value={coffee} onChange={setCoffee} />
          <Field label={t("aiCoachModule.roastLabel")} value={roast} onChange={setRoast} />
          <Field label={t("aiCoachModule.flavorLabel")} value={flavorPreference} onChange={setFlavorPreference} />
          <button
            type="button"
            disabled={isPending}
            onClick={() => startTransition(async () => {
              const res = await generateRecipeAction({ method, coffee, roast, flavorPreference });
              if (res.data?.markdown) setResult(res.data.markdown);
            })}
            className="sm:col-span-2 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-ba-espresso px-6 text-sm font-medium text-ba-pearl disabled:opacity-50"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("aiCoachModule.generateRecipe")}
          </button>
        </div>
      </div>
      {result ? (
        <div className={`${cards.premiumShell} p-6`}><MarkdownRenderer content={result} /></div>
      ) : (
        <EmptyPanel text={t("aiCoachModule.recipeGeneratorEmpty")} />
      )}
    </div>
  );
}

export function SessionAnalyzerTool({ isAuthenticated, canUseAi, paywallReason }: ToolAccessProps) {
  const { t } = useTranslations();
  const [doseG, setDoseG] = useState("15");
  const [yieldG, setYieldG] = useState("250");
  const [timeSeconds, setTimeSeconds] = useState("180");
  const [flavorNotes, setFlavorNotes] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isAuthenticated || !canUseAi) {
    return <AiCoachPaywall isAuthenticated={isAuthenticated} reason={paywallReason} />;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className={`${cards.premiumShell} p-6`}>
        <div className="relative grid gap-4 sm:grid-cols-2">
          <Field label={t("aiCoachModule.doseLabel")} value={doseG} onChange={setDoseG} type="number" />
          <Field label={t("aiCoachModule.yieldLabel")} value={yieldG} onChange={setYieldG} type="number" />
          <Field label={t("aiCoachModule.timeLabel")} value={timeSeconds} onChange={setTimeSeconds} type="number" />
          <Field label={t("aiCoachModule.flavorNotesLabel")} value={flavorNotes} onChange={setFlavorNotes} className="sm:col-span-2" />
          <button
            type="button"
            disabled={isPending}
            onClick={() => startTransition(async () => {
              const { analyzeSessionAction } = await import("@/lib/supabase/ai-coach-module-actions");
              const res = await analyzeSessionAction({
                doseG: parseFloat(doseG) || 15,
                yieldG: parseFloat(yieldG) || null,
                timeSeconds: parseFloat(timeSeconds) || null,
                flavorNotes: flavorNotes || null,
              });
              if (res.data?.markdown) setResult(res.data.markdown);
            })}
            className="sm:col-span-2 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-ba-espresso px-6 text-sm font-medium text-ba-pearl disabled:opacity-50"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            {t("aiCoachModule.analyzeButton")}
          </button>
        </div>
      </div>
      {result ? (
        <div className={`${cards.premiumShell} p-6`}><MarkdownRenderer content={result} /></div>
      ) : (
        <EmptyPanel text={t("aiCoachModule.analyzerEmpty")} />
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className={forms.label}>{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className={`${forms.input} mt-1 w-full`} />
    </div>
  );
}

function EmptyPanel({ text }: { text: string }) {
  return (
    <div className="flex items-center justify-center rounded-[1.5rem] border border-dashed border-ba-espresso/15 p-10 text-center text-sm text-stone-500">
      {text}
    </div>
  );
}

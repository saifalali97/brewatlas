"use client";

import { useState } from "react";
import { MessageSquareText } from "lucide-react";
import { CoachResponseCard } from "@/app/components/coach/coach-response-card";
import { CoachToolForm } from "@/app/components/coach/coach-tool-form";
import { CoachToolTabs } from "@/app/components/coach/coach-tool-tabs";
import { runCoachTool } from "@/lib/ai/coach-tools-engine";
import { cards } from "@/lib/constants/styles";
import { useTranslations } from "@/lib/i18n/translation-context";
import type { DictionaryKey } from "@/lib/i18n/types";
import type { CoachToolFormValues, CoachToolId, CoachToolInput, CoachToolResult } from "@/types/coach-tools";
import { COACH_TOOL_IDS } from "@/types/coach-tools";

const EMPTY_VALUES: CoachToolFormValues = {
  device: "",
  brewMethod: "",
  origin: "",
  roastLevel: "",
  process: "",
  doseG: "",
  waterG: "",
  temperatureC: "",
  grindSize: "",
  brewTime: "",
  notes: "",
};

const TAB_LABEL_KEYS: Record<CoachToolId, DictionaryKey> = {
  diagnose: "coachTools.tabDiagnose",
  generate: "coachTools.tabGenerate",
  improve: "coachTools.tabImprove",
};

const TAB_DESCRIPTION_KEYS: Record<CoachToolId, DictionaryKey> = {
  diagnose: "coachTools.tabDiagnoseDescription",
  generate: "coachTools.tabGenerateDescription",
  improve: "coachTools.tabImproveDescription",
};

const SUBMIT_KEYS: Record<CoachToolId, DictionaryKey> = {
  diagnose: "coachTools.submitDiagnose",
  generate: "coachTools.submitGenerate",
  improve: "coachTools.submitImprove",
};

function toCoachToolInput(values: CoachToolFormValues): CoachToolInput {
  const num = (value: string) => (value.trim() === "" ? null : Number(value));
  const text = (value: string) => (value.trim() === "" ? null : value.trim());

  return {
    device: text(values.device),
    brewMethod: text(values.brewMethod),
    origin: text(values.origin),
    roastLevel: values.roastLevel || null,
    process: values.process || null,
    doseG: num(values.doseG),
    waterG: num(values.waterG),
    temperatureC: num(values.temperatureC),
    grindSize: text(values.grindSize),
    brewTime: text(values.brewTime),
    notes: text(values.notes),
  };
}

/**
 * The AI Coach Foundation (Phase 19): three guided tools sharing one
 * form/response layout. Everything runs client-side and synchronously
 * -- `runCoachTool` (`lib/ai/coach-tools-engine.ts`) is pure and
 * side-effect free, the same "no Server Action needed" approach the
 * public Coach demo already used before this replaced it.
 */
export function AiCoachTools() {
  const { t } = useTranslations();
  const [tool, setTool] = useState<CoachToolId>("diagnose");
  const [formsByTool, setFormsByTool] = useState<Record<CoachToolId, CoachToolFormValues>>(() => {
    const initial = {} as Record<CoachToolId, CoachToolFormValues>;
    for (const id of COACH_TOOL_IDS) initial[id] = EMPTY_VALUES;
    return initial;
  });
  const [resultsByTool, setResultsByTool] = useState<Partial<Record<CoachToolId, CoachToolResult>>>({});

  const values = formsByTool[tool];
  const result = resultsByTool[tool];
  const canSubmit = values.brewMethod.trim() !== "" || values.device.trim() !== "";

  const handleChange = (next: CoachToolFormValues) => {
    setFormsByTool((prev) => ({ ...prev, [tool]: next }));
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    const input = toCoachToolInput(values);
    const next = runCoachTool(tool, input);
    setResultsByTool((prev) => ({ ...prev, [tool]: next }));
  };

  const handleReset = () => {
    setFormsByTool((prev) => ({ ...prev, [tool]: EMPTY_VALUES }));
    setResultsByTool((prev) => ({ ...prev, [tool]: undefined }));
  };

  const labels = {} as Record<CoachToolId, string>;
  const descriptions = {} as Record<CoachToolId, string>;
  for (const id of COACH_TOOL_IDS) {
    labels[id] = t(TAB_LABEL_KEYS[id]);
    descriptions[id] = t(TAB_DESCRIPTION_KEYS[id]);
  }

  return (
    <div>
      <CoachToolTabs active={tool} onChange={setTool} labels={labels} descriptions={descriptions} />

      <div className="mt-6 grid gap-6 lg:grid-cols-2 lg:items-start">
        <div className={`${cards.premiumShell} p-6 lg:p-7`}>
          <div aria-hidden className={cards.premiumSheen} />
          <div aria-hidden className={cards.premiumGlow} />
          <div className="relative">
            <CoachToolForm
              tool={tool}
              values={values}
              onChange={handleChange}
              onSubmit={handleSubmit}
              onReset={handleReset}
              submitLabel={t(SUBMIT_KEYS[tool])}
              resetLabel={t("coachTools.resetButton")}
              disabled={!canSubmit}
            />
            {!canSubmit && <p className="mt-3 text-xs text-stone-500">{t("coachTools.missingRequiredFields")}</p>}
          </div>
        </div>

        {result ? (
          <CoachResponseCard result={result} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 rounded-[1.5rem] border border-dashed border-white/[0.1] bg-white/[0.02] p-10 text-center">
            <MessageSquareText className="h-6 w-6 text-stone-600" aria-hidden />
            <p className="text-sm font-medium text-stone-300">{t("coachTools.emptyStateTitle")}</p>
            <p className="max-w-sm text-sm leading-relaxed text-stone-500">{t("coachTools.emptyStateDescription")}</p>
          </div>
        )}
      </div>
    </div>
  );
}

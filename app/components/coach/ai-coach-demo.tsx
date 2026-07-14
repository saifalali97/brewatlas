"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Gauge, Lightbulb, Sparkles } from "lucide-react";
import { RippleLink } from "@/app/components/ui/ripple-link";
import { analyzeRecipeForCoaching } from "@/lib/ai/coach-engine";
import { cards, buttons } from "@/lib/constants/styles";
import { useTranslations } from "@/lib/i18n/translation-context";
import type { CoachAnalysisInput } from "@/types/coach";
import type { DictionaryKey } from "@/lib/i18n/types";

/**
 * Three representative recipes covering a well-dialed pour over, an
 * espresso with real flaws (to show the Coach's corrective feedback),
 * and a well-dialed cold brew -- enough variety to demonstrate the
 * engine on a public page without requiring a signed-in user's own
 * recipes. Fields mirror `CoachAnalysisInput` exactly; see
 * `lib/ai/coach-engine.ts` for how each is scored.
 *
 * `labelKey` looks up the translated tab label; the underlying analysis
 * feedback (strengths/weaknesses/suggestions/metric labels) is generated
 * by `coach-engine.ts` in English regardless of locale -- see the
 * localization completion report for details.
 */
const sampleRecipes: { id: string; labelKey: DictionaryKey; input: CoachAnalysisInput }[] = [
  {
    id: "v60",
    labelKey: "coachPage.sampleV60Label",
    input: {
      brewingMethodName: "Pour Over",
      coffeeDose: 20,
      waterAmount: 320,
      waterTemperature: 93,
      grindSize: "medium-fine",
      bloomTime: "0:35",
      bloomAmount: 40,
      totalBrewTime: "3:00",
      agitation: "Gentle",
      roastLevel: "Light Roast",
      process: "Washed",
      pourCount: 3,
      originCountry: "Ethiopia",
      coffeeName: "Ethiopian Yirgacheffe",
    },
  },
  {
    id: "espresso",
    labelKey: "coachPage.sampleEspressoLabel",
    input: {
      brewingMethodName: "Espresso",
      coffeeDose: 18,
      waterAmount: 54,
      waterTemperature: 98,
      grindSize: "medium",
      bloomTime: null,
      bloomAmount: null,
      totalBrewTime: "0:35",
      agitation: null,
      roastLevel: "Dark Roast",
      process: "Natural",
      pourCount: null,
      coffeeName: "House Espresso Blend",
    },
  },
  {
    id: "cold-brew",
    labelKey: "coachPage.sampleColdBrewLabel",
    input: {
      brewingMethodName: "Cold Brew",
      coffeeDose: 100,
      waterAmount: 1000,
      waterTemperature: 4,
      grindSize: "coarse",
      bloomTime: null,
      bloomAmount: null,
      totalBrewTime: "18 hours",
      agitation: "None",
      roastLevel: "Medium Roast",
      process: "Washed",
      pourCount: null,
      coffeeName: "Colombian Cold Brew",
    },
  },
];

const statusColor: Record<string, string> = {
  excellent: "text-emerald-400",
  good: "text-amber-400",
  needs_attention: "text-orange-400",
  poor: "text-red-400",
  unknown: "text-stone-500",
};

export function AiCoachDemo() {
  const { t } = useTranslations();
  const [activeId, setActiveId] = useState(sampleRecipes[0].id);
  const active = sampleRecipes.find((recipe) => recipe.id === activeId) ?? sampleRecipes[0];
  const analysis = useMemo(() => analyzeRecipeForCoaching(active.input), [active]);

  const confidenceLabel =
    analysis.confidence.level === "high"
      ? t("coachPage.highConfidence")
      : analysis.confidence.level === "medium"
        ? t("coachPage.mediumConfidence")
        : t("coachPage.lowConfidence");

  return (
    <div>
      <div className="flex flex-wrap gap-2.5">
        {sampleRecipes.map((recipe) => {
          const isActive = recipe.id === activeId;
          return (
            <button
              key={recipe.id}
              type="button"
              onClick={() => setActiveId(recipe.id)}
              aria-pressed={isActive}
              className={`rounded-full border px-4 py-2.5 text-sm font-medium backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 active:scale-[0.98] ${
                isActive
                  ? "border-amber-600/45 bg-amber-950/50 text-amber-100 shadow-[0_0_32px_rgba(217,119,6,0.14)]"
                  : "border-white/[0.1] bg-white/[0.04] text-stone-400 hover:border-amber-600/25 hover:bg-white/[0.06] hover:text-stone-200"
              }`}
            >
              {t(recipe.labelKey)}
            </button>
          );
        })}
      </div>

      <div className={`mt-8 ${cards.premiumShell} p-6 lg:p-8`}>
        <div aria-hidden className={cards.premiumSheen} />
        <div aria-hidden className={cards.premiumGlow} />

        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-start">
          <div className="flex shrink-0 flex-col items-center gap-3 lg:w-40">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border border-amber-600/30 bg-amber-950/40">
              <div className="text-center">
                <p className="text-3xl font-semibold tabular-nums text-stone-50">{analysis.brewScore}</p>
                <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-amber-400/80">
                  {t("coachPage.brewScoreLabel")}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-stone-500">
              <Gauge className="h-3.5 w-3.5 text-amber-500/70" aria-hidden />
              {confidenceLabel}
            </div>
          </div>

          <div className="flex-1 space-y-6">
            {analysis.strengths.length > 0 && (
              <div>
                <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-emerald-400/90">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                  {t("coachPage.strengthsLabel")}
                </p>
                <ul className="mt-2.5 space-y-1.5">
                  {analysis.strengths.map((strength) => (
                    <li key={strength} className="text-sm leading-relaxed text-stone-300">
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.weaknesses.length > 0 && (
              <div>
                <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-orange-400/90">
                  <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
                  {t("coachPage.needsAttentionLabel")}
                </p>
                <ul className="mt-2.5 space-y-1.5">
                  {analysis.weaknesses.map((weakness) => (
                    <li key={weakness} className="text-sm leading-relaxed text-stone-300">
                      {weakness}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.suggestions.length > 0 && (
              <div>
                <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.14em] text-amber-400/90">
                  <Lightbulb className="h-3.5 w-3.5" aria-hidden />
                  {t("coachPage.suggestionsLabel")}
                </p>
                <ul className="mt-2.5 space-y-1.5">
                  {analysis.suggestions.map((suggestion) => (
                    <li key={suggestion} className="text-sm leading-relaxed text-stone-300">
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="relative mt-8 grid gap-2.5 border-t border-white/[0.06] pt-6 sm:grid-cols-3 lg:grid-cols-5">
          {analysis.metrics.slice(0, 5).map((metric) => (
            <div key={metric.key} className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2.5">
              <p className="text-[9px] font-medium uppercase tracking-[0.14em] text-stone-500">{metric.label}</p>
              <p className={`mt-0.5 text-[0.8125rem] font-medium leading-snug ${statusColor[metric.status]}`}>
                {metric.value ?? "—"}
              </p>
            </div>
          ))}
        </div>
      </div>

      <RippleLink
        href="/signup"
        className={`${buttons.secondary} mt-8 gap-2 motion-reduce:hover:scale-100`}
      >
        <Sparkles className="h-4 w-4 text-amber-500/80" aria-hidden />
        {t("coachPage.analyzeOwnRecipes")}
      </RippleLink>
    </div>
  );
}

"use client";

import { CheckCircle2, AlertTriangle } from "lucide-react";
import { useTranslations } from "@/lib/i18n/translation-context";
import type { RecipeSetupCompatibility } from "@/types/brewing-setup";

type RecipeSetupCompatibilityPanelProps = {
  compatibility: RecipeSetupCompatibility;
};

export function RecipeSetupCompatibilityPanel({ compatibility }: RecipeSetupCompatibilityPanelProps) {
  const { t } = useTranslations();

  return (
    <section className="mt-8 rounded-[1.25rem] border border-ba-espresso/10 bg-ba-pearl/80 p-5">
      <div className="flex items-start gap-3">
        {compatibility.compatible ? (
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-700" aria-hidden />
        ) : (
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden />
        )}
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-semibold text-ac-espresso">{t("brewingSetupPage.compatibilityTitle")}</h2>
          <p className="mt-1 text-sm text-ac-espresso">{compatibility.summary}</p>
          {(compatibility.recommendedBrewer || compatibility.recommendedGrinder) && (
            <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              {compatibility.recommendedBrewer ? (
                <div>
                  <dt className="text-ac-espresso/70">{t("brewingSetupPage.recommendedBrewer")}</dt>
                  <dd className="font-medium text-ac-espresso">{compatibility.recommendedBrewer}</dd>
                </div>
              ) : null}
              {compatibility.recommendedGrinder ? (
                <div>
                  <dt className="text-ac-espresso/70">{t("brewingSetupPage.recommendedGrinder")}</dt>
                  <dd className="font-medium text-ac-espresso">{compatibility.recommendedGrinder}</dd>
                </div>
              ) : null}
            </dl>
          )}
          {compatibility.matches.length > 0 ? (
            <ul className="mt-3 space-y-1 text-sm text-emerald-800">
              {compatibility.matches.map((match) => (
                <li key={match}>✓ {match}</li>
              ))}
            </ul>
          ) : null}
          {compatibility.warnings.length > 0 ? (
            <ul className="mt-3 space-y-1 text-sm text-amber-900">
              {compatibility.warnings.map((warning) => (
                <li key={warning}>• {warning}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </section>
  );
}

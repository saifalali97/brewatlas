"use client";

import { acTypography } from "@/lib/design-system/atlas-canon";
import type { TasteDirectionResult } from "@/lib/recipes/personalization";

type TasteDirectionPanelProps = {
  title: string;
  guidanceNote: string;
  result: TasteDirectionResult;
};

function MetricBar({ label, value }: { label: string; value: number }) {
  const filled = Math.max(0, Math.min(10, Math.round(value / 10)));
  return (
    <div className="grid grid-cols-[6.5rem_1fr_auto] items-center gap-2 text-xs tracking-[-0.01em]">
      <span className="text-ac-espresso/65">{label}</span>
      <div
        className="flex h-2.5 items-center gap-0.5"
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={value}
      >
        {Array.from({ length: 10 }, (_, index) => (
          <span
            key={index}
            className={`h-full flex-1 rounded-[1px] ${
              index < filled ? "bg-ba-bronze/80" : "bg-ac-espresso/10"
            }`}
          />
        ))}
      </div>
      <span className="w-6 text-end tabular-nums text-ac-espresso/45">{value}</span>
    </div>
  );
}

/** Compact relative taste-direction guidance vs the official recipe. */
export function TasteDirectionPanel({ title, guidanceNote, result }: TasteDirectionPanelProps) {
  return (
    <div className="space-y-3 border-t border-ba-espresso/10 pt-5">
      <div className="space-y-1">
        <p className={acTypography.eyebrow}>{title}</p>
        <p className="text-sm tracking-[-0.01em] text-ac-espresso/80">{result.summary}</p>
        <p className="text-[11px] tracking-[-0.01em] text-ac-espresso/45">{guidanceNote}</p>
      </div>

      <div className="space-y-2 rounded-xl border border-ba-espresso/8 bg-white/70 px-3 py-3">
        {result.metrics.map((metric) => (
          <MetricBar key={metric.key} label={metric.label} value={metric.value} />
        ))}
      </div>

      {result.bullets.length > 0 ? (
        <ul className="space-y-1.5 text-xs tracking-[-0.01em] text-ac-espresso/70">
          {result.bullets.map((bullet) => (
            <li key={bullet.id} className="flex gap-2">
              <span className="text-ba-bronze" aria-hidden>
                ·
              </span>
              <span>{bullet.text}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

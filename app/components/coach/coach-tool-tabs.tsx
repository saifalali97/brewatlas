"use client";

import { COACH_TOOL_IDS } from "@/types/coach-tools";
import type { CoachToolId } from "@/types/coach-tools";

type CoachToolTabsProps = {
  active: CoachToolId;
  onChange: (tool: CoachToolId) => void;
  labels: Record<CoachToolId, string>;
  descriptions: Record<CoachToolId, string>;
};

/** Switches between the three AI Coach tools -- same pill-tab visual language already used for the sample-recipe switcher on `/coach` (see the former `AiCoachDemo`). */
export function CoachToolTabs({ active, onChange, labels, descriptions }: CoachToolTabsProps) {
  return (
    <div>
      <div className="flex flex-wrap gap-2.5" role="tablist">
        {COACH_TOOL_IDS.map((tool) => {
          const isActive = tool === active;
          return (
            <button
              key={tool}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tool)}
              className={`rounded-full border px-4 py-2.5 text-sm font-medium backdrop-blur-xl transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 active:scale-[0.98] ${
                isActive
                  ? "border-amber-600/45 bg-amber-950/50 text-amber-100 shadow-[0_0_32px_rgba(217,119,6,0.14)]"
                  : "border-white/[0.1] bg-white/[0.04] text-stone-400 hover:border-amber-600/25 hover:bg-white/[0.06] hover:text-stone-200"
              }`}
            >
              {labels[tool]}
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-sm leading-relaxed text-stone-400">{descriptions[active]}</p>
    </div>
  );
}

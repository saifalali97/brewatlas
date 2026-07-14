"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Faq } from "@/types/homepage";

type FaqAccordionProps = {
  faqs: Faq[];
  headingId?: string;
};

export function FaqAccordion({ faqs, headingId }: FaqAccordionProps) {
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-3" role="region" aria-labelledby={headingId}>
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;
        const panelId = `${baseId}-panel-${index}`;
        const buttonId = `${baseId}-button-${index}`;

        return (
          <div
            key={faq.question}
            className={`group relative overflow-hidden rounded-[1.5rem] border bg-gradient-to-br from-white/[0.08] via-white/[0.035] to-white/[0.01] shadow-[0_8px_32px_-14px_rgba(0,0,0,0.45)] backdrop-blur-2xl transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
              isOpen
                ? "border-amber-500/32 shadow-[0_20px_48px_-16px_rgba(180,120,60,0.22),0_0_0_1px_rgba(217,119,6,0.1)]"
                : "border-white/[0.11] hover:-translate-y-0.5 hover:border-amber-600/28 hover:shadow-[0_16px_40px_-14px_rgba(180,120,60,0.14)] motion-reduce:hover:translate-y-0"
            }`}
          >
            <div
              aria-hidden
              className={`pointer-events-none absolute inset-0 rounded-[1.5rem] bg-gradient-to-b from-amber-950/10 via-transparent to-transparent transition-opacity duration-300 ${
                isOpen ? "opacity-100" : "opacity-0"
              }`}
            />

            <button
              id={buttonId}
              type="button"
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-5 text-start transition-colors duration-300 hover:text-amber-50 focus-visible:text-amber-50 sm:px-6 sm:py-5"
            >
              <span className="text-[0.9375rem] font-medium leading-snug tracking-tight text-stone-50 sm:text-base">
                {faq.question}
              </span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-amber-500/80 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                  isOpen ? "rotate-180" : ""
                }`}
                aria-hidden
              />
            </button>

            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className="grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <div className="border-t border-white/[0.06] px-5 pb-5 pt-4 sm:px-6 sm:pb-6 sm:pt-5">
                  <p className="text-[0.8125rem] leading-[1.75] text-stone-300/90 sm:text-sm sm:leading-[1.8]">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

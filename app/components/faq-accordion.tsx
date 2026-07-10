"use client";

import { useState } from "react";

type Faq = {
  question: string;
  answer: string;
};

type FaqAccordionProps = {
  faqs: Faq[];
};

export function FaqAccordion({ faqs }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => {
        const isOpen = openIndex === index;

        return (
          <div
            key={faq.question}
            className={`rounded-2xl border bg-gradient-to-br from-white/[0.03] to-transparent transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isOpen
                ? "border-amber-800/20 bg-white/[0.04]"
                : "border-white/[0.05] hover:border-white/10"
            }`}
          >
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="flex w-full cursor-pointer items-center justify-between gap-4 px-7 py-6 text-left text-base font-medium leading-snug text-stone-50 transition-colors duration-300 hover:text-stone-100 md:px-8 md:py-7"
            >
              {faq.question}
              <span
                className={`shrink-0 text-lg text-stone-500 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  isOpen ? "rotate-45 text-amber-500/80" : ""
                }`}
              >
                +
              </span>
            </button>
            <div
              className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <div className="border-t border-white/[0.04] px-7 pb-7 pt-6 md:px-8">
                  <p className="text-sm leading-[1.8] text-stone-400">{faq.answer}</p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

"use client";

import { ArrowRight, Headphones, Mail } from "lucide-react";
import { FaqAccordion, type Faq } from "./faq-accordion";
import { RevealOnScroll } from "./reveal-on-scroll";
import { RippleLink } from "./ripple-link";

type FaqSectionProps = {
  faqs: Faq[];
};

export function FaqSection({ faqs }: FaqSectionProps) {
  return (
    <section
      id="faq"
      className="relative px-5 py-40 sm:px-6 md:px-7 md:py-44 lg:px-8 lg:py-48"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#0a0705] via-[#0a0705]/80 to-transparent"
      />

      <RevealOnScroll>
        <div className="relative mx-auto max-w-6xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-start lg:gap-16 xl:gap-20">
            <div className="lg:sticky lg:top-28">
              <p className="text-[0.8125rem] font-medium uppercase tracking-[0.24em] text-amber-500/90">
                Support
              </p>
              <h2 className="mt-5 text-3xl font-semibold leading-[1.08] tracking-[-0.03em] text-stone-50 sm:text-4xl lg:text-[3.25rem]">
                Frequently Asked Questions
              </h2>
              <p className="mt-7 max-w-md text-lg leading-[1.78] text-stone-400 md:text-xl md:leading-[1.72]">
                Everything you need to know about BrewAtlas memberships, recipes,
                and brewing tools.
              </p>

              <div className="mt-8 rounded-[1.5rem] border border-white/[0.1] bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-white/[0.01] p-5 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.48)] backdrop-blur-2xl sm:p-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-600/25 bg-amber-950/40">
                    <Headphones className="h-4 w-4 text-amber-500/85" aria-hidden />
                  </div>
                  <div>
                    <p className="text-[0.9375rem] font-semibold text-stone-50">
                      Still have questions?
                    </p>
                    <p className="mt-2 text-[0.8125rem] leading-[1.65] text-stone-400">
                      Our barista support team typically responds within one
                      business day.
                    </p>
                  </div>
                </div>

                <div className="mt-5 border-t border-white/[0.06] pt-5">
                  <RippleLink
                    href="#faq"
                    className="group/btn inline-flex h-10 w-full items-center justify-center gap-2 rounded-full border border-white/[0.12] bg-white/[0.06] px-5 text-sm font-medium text-stone-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.09)] backdrop-blur-2xl transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-amber-500/45 hover:bg-white/[0.1] hover:shadow-[0_0_36px_rgba(217,119,6,0.22),0_10px_28px_-10px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.14)] active:scale-[0.98] motion-reduce:hover:translate-y-0 sm:w-auto"
                  >
                    <Mail className="h-3.5 w-3.5 text-amber-500/80" aria-hidden />
                    Contact Support
                    <ArrowRight
                      className="h-3.5 w-3.5 transition-transform duration-300 group-hover/btn:translate-x-0.5 motion-reduce:transform-none"
                      aria-hidden
                    />
                  </RippleLink>
                </div>
              </div>
            </div>

            <div>
              <FaqAccordion faqs={faqs} />
            </div>
          </div>
        </div>
      </RevealOnScroll>
    </section>
  );
}

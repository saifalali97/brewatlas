import { ArrowRight, Headphones, Mail } from "lucide-react";
import { FaqAccordion } from "@/app/components/ui/faq-accordion";
import { RippleLink } from "@/app/components/ui/ripple-link";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { buttons, typography } from "@/lib/constants/styles";
import type { Faq } from "@/types/homepage";

type FaqSectionProps = {
  faqs: Faq[];
};

export function FaqSection({ faqs }: FaqSectionProps) {
  return (
    <SectionFrame id="faq" ariaLabelledBy="faq-heading">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-start lg:gap-16 xl:gap-20">
        <div className="lg:sticky lg:top-28">
          <p className={typography.eyebrow}>Support</p>
          <h2 id="faq-heading" className={typography.sectionTitleModern}>
            Frequently Asked Questions
          </h2>
          <p className="mt-7 max-w-md text-lg leading-[1.78] text-stone-400 md:text-xl md:leading-[1.72]">
            Everything you need to know about BrewAtlas memberships, recipes, and
            brewing tools.
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
                  Our barista support team typically responds within one business
                  day.
                </p>
              </div>
            </div>

            <div className="mt-5 border-t border-white/[0.06] pt-5">
              <RippleLink
                href="/contact"
                className={`${buttons.ghostCta}${buttons.ghostCtaAutoWidth}`}
              >
                <Mail className="h-3.5 w-3.5 text-amber-500/80" aria-hidden />
                Contact Support
                <ArrowRight className={buttons.ghostArrow} aria-hidden />
              </RippleLink>
            </div>
          </div>
        </div>

        <div>
          <FaqAccordion faqs={faqs} headingId="faq-heading" />
        </div>
      </div>
    </SectionFrame>
  );
}

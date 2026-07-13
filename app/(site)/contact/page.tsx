import type { Metadata } from "next";
import { Headphones, Mail } from "lucide-react";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with the BrewAtlas barista support team for questions about memberships, recipes, or brewing tools.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <SectionFrame id="contact-page" ariaLabelledBy="contact-page-heading" padding="compact">
      <PageHeader
        eyebrow="Get in Touch"
        title="Contact BrewAtlas"
        description="Questions about memberships, recipes, or brewing tools? Our barista support team typically responds within one business day."
      />

      <div className="mx-auto grid max-w-4xl gap-10 lg:grid-cols-2 lg:items-start">
        <div className="rounded-[1.5rem] border border-white/[0.1] bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-white/[0.01] p-6 shadow-[0_12px_40px_-16px_rgba(0,0,0,0.48)] backdrop-blur-2xl sm:p-8">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-600/25 bg-amber-950/40">
              <Headphones className="h-4 w-4 text-amber-500/85" aria-hidden />
            </div>
            <div>
              <p className="text-[0.9375rem] font-semibold text-stone-50">
                Barista Support
              </p>
              <p className="mt-2 text-[0.8125rem] leading-[1.65] text-stone-400">
                Our team typically responds within one business day, seven days a
                week.
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2.5 border-t border-white/[0.06] pt-6 text-sm text-stone-400">
            <Mail className="h-4 w-4 text-amber-500/80" aria-hidden />
            support@brewatlas.app
          </div>
        </div>

        <ContactForm />
      </div>
    </SectionFrame>
  );
}

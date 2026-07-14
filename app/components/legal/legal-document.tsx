import { FileText } from "lucide-react";
import { PageHeader } from "@/app/components/ui/page-header";
import { RippleLink } from "@/app/components/ui/ripple-link";

export type LegalDocumentSection = {
  heading: string;
  /** Paragraphs separated by `\n\n`, rendered with `whitespace-pre-line` (same convention as culture articles). */
  body: string;
};

type LegalDocumentProps = {
  eyebrow: string;
  title: string;
  description: string;
  lastUpdatedLabel: string;
  lastUpdatedDate: string;
  sections: LegalDocumentSection[];
  contactPrefix: string;
  contactLinkLabel: string;
  contactSuffix: string;
};

/** Shared long-form layout for `/privacy`, `/terms` and `/cookies` — reuses `PageHeader` and existing card/typography tokens. */
export function LegalDocument({
  eyebrow,
  title,
  description,
  lastUpdatedLabel,
  lastUpdatedDate,
  sections,
  contactPrefix,
  contactLinkLabel,
  contactSuffix,
}: LegalDocumentProps) {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />

      <div className="mb-12 inline-flex items-center gap-2 rounded-full border border-white/[0.09] bg-white/[0.035] px-4 py-2 text-[0.8125rem] text-stone-400">
        <FileText className="h-3.5 w-3.5 text-amber-500/80" aria-hidden />
        <span>
          {lastUpdatedLabel}
          {": "}
          {lastUpdatedDate}
        </span>
      </div>

      <div className="space-y-10">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-xl font-semibold leading-tight tracking-[-0.01em] text-stone-50 sm:text-2xl">
              {section.heading}
            </h2>
            <p className="mt-3 whitespace-pre-line text-base leading-[1.85] text-stone-400">
              {section.body}
            </p>
          </section>
        ))}
      </div>

      <div className="mt-14 rounded-2xl border border-white/[0.09] bg-white/[0.035] px-5 py-6 text-sm leading-[1.8] text-stone-400 shadow-[0_16px_40px_-20px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
        {contactPrefix}{" "}
        <RippleLink href="/contact" className="font-medium text-amber-400/90 underline-offset-4 hover:underline">
          {contactLinkLabel}
        </RippleLink>{" "}
        {contactSuffix}
      </div>
    </div>
  );
}

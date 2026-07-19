import { FileText } from "lucide-react";
import { acTypography } from "@/lib/design-system/atlas-canon";
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
  headingId?: string;
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
  headingId,
}: LegalDocumentProps) {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader eyebrow={eyebrow} title={title} description={description} headingId={headingId} />

      <div className={`mb-12 inline-flex items-center gap-2 rounded-full border border-ac-espresso/10 bg-ac-sand/35 px-4 py-2 ${acTypography.caption}`}>
        <FileText className="h-3.5 w-3.5 text-ac-espresso" aria-hidden />
        <span>
          {lastUpdatedLabel}
          {": "}
          {lastUpdatedDate}
        </span>
      </div>

      <div className="space-y-10">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className={`${acTypography.h3} leading-tight tracking-[-0.01em] sm:text-2xl`}>
              {section.heading}
            </h2>
            <p className={`mt-3 whitespace-pre-line ${acTypography.body} leading-[1.85]`}>
              {section.body}
            </p>
          </section>
        ))}
      </div>

      <div className={`mt-14 rounded-2xl border border-ac-espresso/10 bg-ac-sand/30 px-5 py-6 ${acTypography.body} leading-[1.8] shadow-[0_8px_24px_rgba(0,0,0,0.04)]`}>
        {contactPrefix}{" "}
        <RippleLink href="/contact" className="font-medium text-ac-espresso underline-offset-4 hover:underline">
          {contactLinkLabel}
        </RippleLink>{" "}
        {contactSuffix}
      </div>
    </div>
  );
}

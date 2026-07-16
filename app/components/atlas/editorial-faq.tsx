import { acTypography } from "@/lib/design-system/atlas-canon";
import type { Faq } from "@/types/homepage";

type EditorialFaqProps = {
  faqs: Faq[];
  headingId?: string;
  dark?: boolean;
};

function joinClasses(...parts: Array<string | false | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/** Inline editorial FAQ — prose blocks, no card accordion. */
export function EditorialFaq({ faqs, headingId, dark = false }: EditorialFaqProps) {
  return (
    <dl className="space-y-10" role="region" aria-labelledby={headingId}>
      {faqs.map((faq) => (
        <div key={faq.question} className="ac-folio-divider pb-10 last:pb-0">
          <dt className={dark ? acTypography.h3Dark : acTypography.h3}>{faq.question}</dt>
          <dd className={joinClasses(dark ? acTypography.bodyDark : acTypography.body, "mt-4 max-w-2xl")}>
            {faq.answer}
          </dd>
        </div>
      ))}
    </dl>
  );
}

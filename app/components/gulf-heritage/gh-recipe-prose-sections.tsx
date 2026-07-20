import { ghSurfaces, ghTypography } from "@/app/components/gulf-heritage/shared/gh-styles";

type GhRecipeProseSectionProps = {
  title: string;
  body: string;
};

export function GhRecipeProseSection({ title, body }: GhRecipeProseSectionProps) {
  return (
    <section aria-labelledby={`gh-prose-${title}`}>
      <h4 id={`gh-prose-${title}`} className={ghTypography.sectionTitle}>
        {title}
      </h4>
      <div className={`${ghSurfaces.articlePanel} mt-5 px-6 py-6 sm:px-8`}>
        <p className="text-sm leading-relaxed text-ac-espresso/88 sm:text-[0.9375rem]">{body}</p>
      </div>
    </section>
  );
}

type GhRecipeFaqSectionProps = {
  title: string;
  items: readonly { question: string; answer: string }[];
};

export function GhRecipeFaqSection({ title, items }: GhRecipeFaqSectionProps) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="gh-recipe-faq-heading">
      <h4 id="gh-recipe-faq-heading" className={ghTypography.sectionTitle}>
        {title}
      </h4>
      <dl className={`${ghSurfaces.articlePanel} mt-5 space-y-5 px-6 py-6 sm:px-8`}>
        {items.map((item) => (
          <div key={item.question}>
            <dt className="text-sm font-semibold text-ac-espresso">{item.question}</dt>
            <dd className="mt-2 text-sm leading-relaxed text-ac-espresso/88 sm:text-[0.9375rem]">{item.answer}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

type GhRecipeBulletSectionProps = {
  title: string;
  items: readonly string[];
};

export function GhRecipeBulletSection({ title, items }: GhRecipeBulletSectionProps) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby={`gh-bullet-${title}`}>
      <h4 id={`gh-bullet-${title}`} className={ghTypography.sectionTitle}>
        {title}
      </h4>
      <ul className={`${ghSurfaces.articlePanel} mt-5 space-y-2 px-6 py-6 sm:px-8`}>
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-ac-espresso/88">
            <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ba-bronze/70" />
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

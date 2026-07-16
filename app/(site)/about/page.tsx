import type { Metadata } from "next";
import Link from "next/link";
import { AnimatedStat } from "@/app/components/ui/animated-stat";
import { PageHeader } from "@/app/components/ui/page-header";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { acFocus, acTypography } from "@/lib/design-system/atlas-canon";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";
import { siteConfig } from "@/lib/seo/site";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    pathname: "/about",
    locale,
    title: dictionary.metadata.aboutTitle,
    description: dictionary.metadata.aboutDescription,
  });
}

export default async function AboutPage() {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  const a = dictionary.aboutPage;

  const stats = [
    { label: a.statRecipesLabel, value: "12,400+" },
    { label: a.statRoastersLabel, value: "840+" },
    { label: a.statCountriesLabel, value: "62" },
  ];

  return (
    <SectionFrame id="about-page" ariaLabelledBy="about-page-heading" padding="compact">
      <PageHeader
        headingId="about-page-heading"
        eyebrow={a.eyebrow}
        title={a.title}
        description={siteConfig.description}
      />

      <div className="mx-auto max-w-3xl">
        <p className={acTypography.body}>{a.body}</p>

        <div className="ac-brass-rule my-14" aria-hidden />

        <dl className="grid gap-10 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label}>
              <AnimatedStat value={stat.value} label={stat.label} />
            </div>
          ))}
        </dl>

        <div className="mt-14 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/recipes"
            className={`inline-flex h-12 items-center justify-center rounded-full border border-ac-copper/40 px-8 text-sm font-medium tracking-[0.08em] uppercase text-ac-espresso hover:border-ac-copper/60 hover:bg-ac-espresso/[0.04] ${acFocus.ring}`}
          >
            {a.exploreRecipesCta}
          </Link>
          <Link
            href="/contact"
            className={`inline-flex h-12 items-center justify-center px-8 ${acTypography.nav} text-ac-copper hover:text-ac-espresso ${acFocus.ring}`}
          >
            {a.getInTouchCta} →
          </Link>
        </div>
      </div>
    </SectionFrame>
  );
}

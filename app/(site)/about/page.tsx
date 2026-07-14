import type { Metadata } from "next";
import { AnimatedStat } from "@/app/components/ui/animated-stat";
import { PageHeader } from "@/app/components/ui/page-header";
import { RippleLink } from "@/app/components/ui/ripple-link";
import { SectionFrame } from "@/app/components/ui/section-frame";
import { buttons } from "@/lib/constants/styles";
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
      <PageHeader eyebrow={a.eyebrow} title={a.title} description={siteConfig.description} />

      <div className="mx-auto max-w-3xl text-center">
        <p className="text-base leading-[1.8] text-stone-400">{a.body}</p>

        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-white/[0.09] bg-white/[0.035] px-5 py-6 shadow-[0_16px_40px_-20px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
            >
              <AnimatedStat value={stat.value} label={stat.label} />
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col justify-center gap-3 sm:flex-row">
          <RippleLink href="/recipes" className={`${buttons.primary} w-full sm:w-auto`}>
            {a.exploreRecipesCta}
          </RippleLink>
          <RippleLink href="/contact" className={`${buttons.secondary} w-full sm:w-auto`}>
            {a.getInTouchCta}
          </RippleLink>
        </div>
      </div>
    </SectionFrame>
  );
}

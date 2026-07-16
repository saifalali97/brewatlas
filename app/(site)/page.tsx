import type { Metadata } from "next";
import { HeroSection } from "@/app/components/sections/hero-section";
import { DiscoverSection } from "@/app/components/sections/discover-section";
import { PremiumExperienceSection } from "@/app/components/sections/premium-experience-section";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { createClient } from "@/lib/supabase/server";
import { getMergedHomeContent } from "@/lib/data/homepage-cms";
import { getLocale } from "@/lib/i18n/locale";
import { buildLocalizedMetadata } from "@/lib/seo/localized-metadata";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dictionary = await getDictionary(locale);
  return buildLocalizedMetadata({
    pathname: "/",
    locale,
    title: dictionary.metadata.homeTitle,
    description: dictionary.metadata.homeDescription,
  });
}

export default async function Home() {
  const locale = await getLocale();
  const supabase = await createClient();
  const [dictionary, content] = await Promise.all([
    getDictionary(locale),
    getMergedHomeContent(supabase, locale),
  ]);

  const { heroImage, testimonials } = content;

  return (
    <>
      <HeroSection heroImage={heroImage} />
      <DiscoverSection copy={dictionary.homeDiscover} />
      <PremiumExperienceSection copy={dictionary.homePremiumExperience} testimonials={testimonials} />
    </>
  );
}
